import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Vendor from "../models/Vendor.js";
import { notifyNearbyDeliveryPartners } from "./Deliverydashboardcontroller.js";
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      deliveryType = "standard",
      deliveryCharge = 0,
      paymentMethod,
      subtotal,
      gst = 0,
      total,
    } = req.body;

    /* ── Basic presence checks ── */
    if (!items?.length) {
      return res
        .status(400)
        .json({ success: false, message: "Order must have at least one item" });
    }
    if (!shippingAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Shipping address is required" });
    }
    if (!paymentMethod) {
      return res
        .status(400)
        .json({ success: false, message: "Payment method is required" });
    }

    /* ── Validate each item against the database and collect vendor IDs ── */
    const validatedItems = [];
    const vendorIds = new Set();

    for (const item of items) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Each item must have a valid productId and quantity ≥ 1",
        });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.product}" not found`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `"${product.name}" only has ${product.stock} unit(s) in stock`,
        });
      }

      // Collect vendor ID for this product
      if (product.vendor) {
        vendorIds.add(product.vendor.toString());
      }

      /* Accept the price sent by the client (already discounted on the frontend).
         As a safety fallback, calculate server-side discounted price. */
      const serverPrice =
        product.discount > 0
          ? Math.round(product.price * (1 - product.discount / 100))
          : product.price;

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: item.price ?? serverPrice,
      });
    }

    /* ── Create the order document ── */
    const order = await Order.create({
      user: req.user._id,
      items: validatedItems,
      shippingAddress,
      deliveryType,
      deliveryCharge,
      paymentMethod,
      subtotal,
      gst,
      total,
      vendors: Array.from(vendorIds), // Store all vendor IDs involved in this order
    });

    /* ── Deduct stock for each product ── */
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    /* ── Auto-confirm non-COD orders (replace with real payment gateway later) ── */
    if (paymentMethod !== "cod") {
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = "confirmed";
      await order.save();
    }

    await order.populate("items.product", "name images price discount slug");

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   GET /api/orders
   Get the logged-in user's own order history (newest first).
   Supports ?page=1&limit=10
═══════════════════════════════════════════════════════════ */
export const getMyOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("items.product", "name images slug price discount brand"),
      Order.countDocuments({ user: req.user._id }),
    ]);

    return res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   GET /api/orders/:id
   Get a single order by ID.
   Users can only access their own; admins can access any.
═══════════════════════════════════════════════════════════ */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product", "name images slug price discount brand")
      .populate("user", "name email phone");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = ["admin", "superadmin"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorised" });
    }

    return res.json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   PUT /api/orders/:id/cancel
   User cancels their own order (only if still pending/confirmed).
   Stock is restored automatically.
═══════════════════════════════════════════════════════════ */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorised" });
    }

    const cancellable = ["pending", "confirmed"];
    if (!cancellable.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is already "${order.status}"`,
      });
    }

    /* Restore stock */
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = "cancelled";
    await order.save();

    return res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   ── ADMIN ONLY ──
═══════════════════════════════════════════════════════════ */

/* GET /api/orders/admin/all
   All orders with optional filters:
   ?status=pending&paymentMethod=cod&from=2024-01-01&to=2024-12-31&page=1&limit=20
*/
export const adminGetAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    if (req.query.userId) filter.user = req.query.userId;

    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email phone")
        .populate("items.product", "name images"),
      Order.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: orders,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* PUT /api/orders/admin/:id/status
   Update order status, tracking number, or notes.
   Body: { status, trackingNumber, notes }
*/
// ADMIN: update any order's status
export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const VALID = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];
    const { status, trackingNumber, notes } = req.body;

    if (status && !VALID.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: `Invalid status "${status}"` });
    }

    // ✅ Fetch ONCE at the top — used by both cancelled and shipped blocks
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const update = {};
    if (status !== undefined) update.status = status;
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
    if (notes !== undefined) update.notes = notes;

    if (status === "delivered") {
      update.isPaid = true;
      update.paidAt = new Date();
    }

    if (status === "cancelled" && existingOrder.status !== "cancelled") {
      for (const item of existingOrder.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    // ✅ Now this works — existingOrder and existingOrder.vendors are available
    if (status === "shipped" && existingOrder.status !== "shipped") {
      try {
        const vendorId = existingOrder.vendors?.[0];
        if (vendorId) {
          const vendor = await Vendor.findById(vendorId).select("location");
          const lat = vendor?.location?.coordinates?.lat || 28.6139;
          const lng = vendor?.location?.coordinates?.lng || 77.209;
          await notifyNearbyDeliveryPartners(existingOrder._id, lat, lng, 15);
        }
      } catch (e) {
        console.error("[Delivery notify] Failed:", e.message);
      }
    }

    const order = await Order.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })
      .populate("user", "name email phone")
      .populate("items.product", "name images");

    return res.json({ success: true, message: "Order updated", data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// VENDOR: update status of orders containing vendor products
export const vendorUpdateOrderStatus = async (req, res) => {
  try {
    const VALID = ["processing", "shipped", "delivered", "cancelled"];
    const { status, trackingNumber, notes } = req.body;

    if (status && !VALID.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}" for vendor`,
      });
    }

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    // Fetch order BEFORE the update so we can compare old vs new status
    const existingOrder = await Order.findById(req.params.id).populate(
      "items.product",
      "vendor",
    );
    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const previousStatus = existingOrder.status; // save BEFORE we change it

    // Authorisation check — vendor must own at least one item in this order
    const hasItem =
      existingOrder.vendors?.some(
        (v) => v.toString() === vendor._id.toString(),
      ) ||
      existingOrder.items.some(
        (item) => item.product?.vendor?.toString() === vendor._id.toString(),
      );

    if (!hasItem) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    // Build the update payload
    const update = {};
    if (status !== undefined) update.status = status;
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
    if (notes !== undefined) update.notes = notes;

    const updated = await Order.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    // ─────────────────────────────────────────────────────────────────────
    // Notify nearby delivery partners when order FIRST becomes "shipped"
    // ─────────────────────────────────────────────────────────────────────
    if (status === "shipped" && previousStatus !== "shipped") {
      try {
        // Use vendor's stored location if available.
        // Falls back to Delhi coords — change to your city if needed.
        // The notify function itself also handles partners with no GPS data.
        const vendorLat =
          vendor?.location?.coordinates?.lat ??
          vendor?.address?.coordinates?.lat ??
          28.6139;
        const vendorLng =
          vendor?.location?.coordinates?.lng ??
          vendor?.address?.coordinates?.lng ??
          77.209;

        const notified = await notifyNearbyDeliveryPartners(
          updated._id,
          vendorLat,
          vendorLng,
          15, // initial search radius in km
        );

        console.log(
          `[Order ${updated._id}] Notified ${notified} delivery partners (status → shipped)`,
        );
      } catch (notifyErr) {
        // Non-fatal — the order status was saved successfully.
        // Log the error but don't fail the API response.
        console.error(
          "[vendorUpdateOrderStatus] Notify error:",
          notifyErr.message,
        );
      }
    }

    res.json({ success: true, message: "Order updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET /api/orders/admin/stats
   Dashboard summary numbers.
*/
export const adminGetStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      revenueAgg,
      todayAgg,
      recentOrders,
      statusBreakdown,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({
        status: { $in: ["pending", "confirmed", "processing"] },
      }),
      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "refunded"] } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart },
            status: { $nin: ["cancelled", "refunded"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .select("total status createdAt paymentMethod shippingAddress"),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    return res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        totalRevenue: revenueAgg[0]?.total || 0,
        todayRevenue: todayAgg[0]?.total || 0,
        recentOrders,
        statusBreakdown: statusBreakdown.reduce((acc, s) => {
          acc[s._id] = s.count;
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ═══════════════════════════════════════════════════════════
   ── VENDOR SPECIFIC ──
   GET /api/orders/vendor/my-orders
   Vendor can see orders containing their products
═══════════════════════════════════════════════════════════ */
export const getVendorOrders = async (req, res) => {
  try {
    // Get vendor profile from user
    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    // Find orders that contain products from this vendor
    // Use the vendor's _id to match against the vendors array in orders
    const filter = { vendors: vendor._id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email phone")
        .populate("items.product", "name images price vendor"),
      Order.countDocuments(filter),
    ]);

    // Filter items to only show vendor's products in each order
    const filteredOrders = orders.map((order) => {
      const vendorItems = order.items.filter(
        (item) => item.product?.vendor?.toString() === vendor._id.toString(),
      );
      return {
        ...order.toObject(),
        items: vendorItems,
        // Calculate vendor's portion of the order
        vendorSubtotal: vendorItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        ),
      };
    });

    return res.json({
      success: true,
      data: filteredOrders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
