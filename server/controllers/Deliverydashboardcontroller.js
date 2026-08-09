import User from "../models/User.js";
import Order from "../models/Order.js";
import DeliveryNotification from "../models/Deliverynotification.js";
import { getIO } from "../socket/Socketmanager.js";
import {
  scheduleNotificationExpiry,
  clearNotificationTimer,
} from "../socket/Deliverysockethandler.js";

// ─────────────────────────────────────────────────────────────────────────────
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── GET /api/delivery/me ─────────────────────────────────────────────────────
export const getDeliveryProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/delivery/me ─────────────────────────────────────────────────────
export const updateDeliveryProfile = async (req, res) => {
  try {
    const { name, phone, vehicleType, vehicleNumber, zone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ success: false, message: "Not found" });
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (vehicleType) user.vehicleType = vehicleType;
    if (vehicleNumber) user.vehicleNumber = vehicleNumber;
    if (zone) user.zone = zone;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/delivery/toggle-online ───────────────────────────────────────
export const toggleOnlineStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isOnline = !user.isOnline;
    user.isAvailable = user.isOnline;
    await user.save();
    res.json({
      success: true,
      data: { isOnline: user.isOnline, isAvailable: user.isAvailable },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/delivery/location ────────────────────────────────────────────
// Kept as a REST fallback for clients that can't maintain a socket connection.
// Prefer the socket `update_location` event for connected clients.
export const updateDeliveryLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng)
      return res
        .status(400)
        .json({ success: false, message: "lat and lng required" });
    await User.findByIdAndUpdate(req.user._id, {
      "currentLocation.lat": parseFloat(lat),
      "currentLocation.lng": parseFloat(lng),
      "currentLocation.updatedAt": new Date(),
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/delivery/stats ──────────────────────────────────────────────────
export const getDeliveryStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const [todayOrders, weekOrders, allOrders] = await Promise.all([
      Order.find({
        assignedDeliveryPartner: req.user._id,
        status: "delivered",
        deliveredAt: { $gte: today },
      }),
      Order.find({
        assignedDeliveryPartner: req.user._id,
        status: "delivered",
        deliveredAt: { $gte: weekAgo },
      }),
      Order.find({
        assignedDeliveryPartner: req.user._id,
        status: "delivered",
      }),
    ]);

    const chartMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      chartMap[key] = { day: key, earnings: 0, orders: 0 };
    }
    weekOrders.forEach((o) => {
      if (o.deliveredAt) {
        const key = new Date(o.deliveredAt).toISOString().slice(0, 10);
        if (chartMap[key]) {
          chartMap[key].earnings += o.deliveryEarning || 40;
          chartMap[key].orders += 1;
        }
      }
    });

    const user = await User.findById(req.user._id).select(
      "totalDeliveries totalEarnings averageRating ratingCount",
    );
    res.json({
      success: true,
      data: {
        todayEarnings: todayOrders.reduce(
          (s, o) => s + (o.deliveryEarning || 40),
          0,
        ),
        todayOrders: todayOrders.length,
        weekOrders: weekOrders.length,
        totalDeliveries: user?.totalDeliveries || allOrders.length,
        totalEarnings:
          user?.totalEarnings ||
          allOrders.reduce((s, o) => s + (o.deliveryEarning || 40), 0),
        averageRating: user?.averageRating || null,
        ratingCount: user?.ratingCount || 0,
        weekChart: Object.values(chartMap),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/delivery/orders ─────────────────────────────────────────────────
export const getDeliveryOrders = async (req, res) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const orders = await Order.find({ assignedDeliveryPartner: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "name phone email")
      .populate("items.product", "name images");
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/delivery/orders/active ─────────────────────────────────────────
export const getActiveDeliveryOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      assignedDeliveryPartner: req.user._id,
      status: "shipped",
    })
      .populate("user", "name phone email")
      .populate("items.product", "name images");
    res.json({ success: true, data: order || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/delivery/orders/:id/picked ───────────────────────────────────
export const markOrderPickedUp = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      assignedDeliveryPartner: req.user._id,
    });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    order.deliveryPickedAt = new Date();
    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/delivery/orders/:id/delivered ────────────────────────────────
export const markOrderDelivered = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      assignedDeliveryPartner: req.user._id,
    });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.status = "delivered";
    order.deliveredAt = new Date();
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalDeliveries: 1, totalEarnings: order.deliveryEarning || 40 },
      isAvailable: true,
    });

    // ── Socket: let partner's UI know they're now available again ──────────
    try {
      getIO().to(`delivery:${req.user._id}`).emit("order_delivered", {
        orderId: order._id,
        isAvailable: true,
      });
    } catch (_) {
      // Socket not critical — REST response already sent
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/delivery/notifications ─────────────────────────────────────────
export const getDeliveryNotifications = async (req, res) => {
  try {
    const notifs = await DeliveryNotification.find({
      deliveryPartner: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("order", "total shippingAddress status");

    const unreadCount = notifs.filter((n) => !n.isRead).length;
    const data = { notifications: notifs, unreadCount };
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/delivery/notifications/:id/accept ─────────────────────────────
export const acceptDeliveryNotification = async (req, res) => {
  try {
    const notif = await DeliveryNotification.findOne({
      _id: req.params.id,
      deliveryPartner: req.user._id,
      isAccepted: { $in: [null, undefined] },
    }).populate("order");

    if (!notif)
      return res.status(404).json({
        success: false,
        message: "Notification not found or already acted on",
      });

    const order = await Order.findById(notif.order._id);

    // Someone else grabbed it first
    if (
      order.assignedDeliveryPartner &&
      order.assignedDeliveryPartner.toString() !== req.user._id.toString()
    ) {
      notif.isAccepted = false;
      notif.declinedAt = new Date();
      await notif.save();
      clearNotificationTimer(notif._id.toString());
      return res.status(409).json({
        success: false,
        message: "Order already taken by another partner",
      });
    }

    // ── Accept ────────────────────────────────────────────────────────────
    order.assignedDeliveryPartner = req.user._id;
    await order.save();

    notif.isAccepted = true;
    notif.acceptedAt = new Date();
    notif.isRead = true;
    await notif.save();

    // Cancel this partner's auto-decline timer
    clearNotificationTimer(notif._id.toString());

    await User.findByIdAndUpdate(req.user._id, { isAvailable: false });

    // ── Decline all other pending notifications for the same order ────────
    const otherNotifs = await DeliveryNotification.find({
      order: notif.order._id,
      _id: { $ne: notif._id },
      isAccepted: { $in: [null, undefined] },
    }).select("_id deliveryPartner");

    if (otherNotifs.length > 0) {
      const otherIds = otherNotifs.map((n) => n._id);

      await DeliveryNotification.updateMany(
        { _id: { $in: otherIds } },
        { isAccepted: false, declinedAt: new Date() },
      );

      // ── Socket: tell every competing partner the order is gone ──────────
      const io = getIO();
      for (const other of otherNotifs) {
        clearNotificationTimer(other._id.toString());
        io.to(`delivery:${other.deliveryPartner}`).emit("order_taken", {
          notificationId: other._id,
          orderId: notif.order._id,
          takenBy: req.user._id,
        });
      }
    }

    const populated = await Order.findById(order._id)
      .populate("user", "name phone email")
      .populate("items.product", "name images");

    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/delivery/notifications/:id/decline ────────────────────────────
export const declineDeliveryNotification = async (req, res) => {
  try {
    await DeliveryNotification.findOneAndUpdate(
      {
        _id: req.params.id,
        deliveryPartner: req.user._id,
        isAccepted: { $in: [null, undefined] },
      },
      { isAccepted: false, declinedAt: new Date() },
    );

    // Cancel the auto-decline timer — partner already acted
    clearNotificationTimer(req.params.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/delivery/notifications/read-all ──────────────────────────────
export const markAllNotificationsRead = async (req, res) => {
  try {
    await DeliveryNotification.updateMany(
      { deliveryPartner: req.user._id, isRead: false },
      { isRead: true },
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// notifyNearbyDeliveryPartners
// Called from vendorUpdateOrderStatus / adminUpdateOrderStatus when an order
// transitions to "shipped".
// ─────────────────────────────────────────────────────────────────────────────
export const notifyNearbyDeliveryPartners = async (
  orderId,
  vendorLat,
  vendorLng,
  radiusKm = 15,
) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`[Delivery] Order ${orderId} not found`);
      return 0;
    }

    // Idempotency guard
    const existing = await DeliveryNotification.findOne({ order: orderId });
    if (existing) {
      console.log(
        `[Delivery] Notifications already created for order ${orderId}, skipping`,
      );
      return 0;
    }

    const allPartners = await User.find({
      role: "delivery",
      isApproved: true,
      isOnline: true,
      isAvailable: true,
    }).select("_id name currentLocation");

    console.log(
      `[Delivery] Found ${allPartners.length} online+available partners`,
    );

    if (allPartners.length === 0) {
      console.warn(
        `[Delivery] No online+available delivery partners for order ${orderId}`,
      );
      return 0;
    }

    // ── Partition by whether location data exists ─────────────────────────
    const withLocation = allPartners.filter(
      (p) => p.currentLocation?.lat && p.currentLocation?.lng,
    );
    const withoutLocation = allPartners.filter(
      (p) => !p.currentLocation?.lat || !p.currentLocation?.lng,
    );

    let targets = [];

    if (withLocation.length > 0) {
      const ranked = withLocation
        .map((p) => ({
          _id: p._id,
          dist: haversineDistance(
            vendorLat,
            vendorLng,
            p.currentLocation.lat,
            p.currentLocation.lng,
          ),
        }))
        .sort((a, b) => a.dist - b.dist);

      targets = ranked.filter((p) => p.dist <= radiusKm).slice(0, 5);

      if (targets.length === 0) {
        console.log(
          `[Delivery] No partners within ${radiusKm}km, expanding to 50km`,
        );
        targets = ranked.filter((p) => p.dist <= 50).slice(0, 5);
      }

      if (targets.length === 0) {
        targets = ranked.slice(0, 5);
      }
    }

    if (targets.length < 5) {
      const remaining = 5 - targets.length;
      const extra = withoutLocation
        .slice(0, remaining)
        .map((p) => ({ _id: p._id, dist: null }));
      targets = [...targets, ...extra];
    }

    if (targets.length === 0) {
      console.warn(
        `[Delivery] After all fallbacks, still no targets for order ${orderId}`,
      );
      return 0;
    }

    // ── Build and insert notification documents ───────────────────────────
    const notifDocs = targets.map((p) => ({
      deliveryPartner: p._id,
      order: orderId,
      type: "new_order",
      title: "New Delivery Request! 🛵",
      body: `Order #${orderId.toString().slice(-6).toUpperCase()} — ₹${order.total} — Deliver to ${order.shippingAddress?.city || "customer"}`,
      isRead: false,
      isAccepted: null,
      acceptedAt: null,
      declinedAt: null,
    }));

    const inserted = await DeliveryNotification.insertMany(notifDocs);
    console.log(
      `[Delivery] ✅ Created ${inserted.length} notifications for order ${orderId}`,
    );

    // ── Socket: push to each targeted partner's private room ──────────────
    // Each partner gets the full notification payload so the client can
    // render the card immediately without a REST round-trip.
    try {
      const io = getIO();
      for (let i = 0; i < inserted.length; i++) {
        const doc = inserted[i];
        const partnerId = targets[i]._id.toString();

        const payload = {
          notificationId: doc._id,
          orderId,
          title: doc.title,
          body: doc.body,
          type: doc.type,
          orderTotal: order.total,
          deliveryCity: order.shippingAddress?.city || null,
          expiresInMs: 30_000, // hint for client-side countdown UI
          createdAt: doc.createdAt,
        };

        io.to(`delivery:${partnerId}`).emit("new_order", payload);

        // Start 30-second server-side auto-decline timer
        scheduleNotificationExpiry(doc._id.toString(), partnerId, io, 30_000);
      }
    } catch (socketErr) {
      // Socket failure must never break the notification flow
      console.error(
        "[notifyNearbyDeliveryPartners] Socket emit error:",
        socketErr.message,
      );
    }

    return inserted.length;
  } catch (err) {
    console.error("[notifyNearbyDeliveryPartners] ERROR:", err.message);
    return 0;
  }
};
