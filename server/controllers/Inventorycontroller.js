import Inventory from "../models/Inventory.js";
import Vendor from "../models/Vendor.js";
import Product from "../models/Product.js";

// ── Helper: find vendor from req.user ─────────────────────────────────────────
async function getVendorOrThrow(userId, res) {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    res
      .status(404)
      .json({ success: false, message: "Vendor profile not found" });
    return null;
  }
  return vendor;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/inventory/my                    — vendor: list all their inventory
// ─────────────────────────────────────────────────────────────────────────────
export const getMyInventory = async (req, res) => {
  try {
    const vendor = await getVendorOrThrow(req.user.id, res);
    if (!vendor) return;

    const {
      page = 1,
      limit = 20,
      search,
      status, // "low_stock" | "out_of_stock" | "in_stock"
      sortBy = "updatedAt",
      order = "desc",
    } = req.query;

    const query = { vendor: vendor._id };

    if (status === "low_stock") query.isLowStock = true;
    if (status === "out_of_stock") query.isOutOfStock = true;
    if (status === "in_stock")
      ((query.isOutOfStock = false), (query.isLowStock = false));

    let dbQuery = Inventory.find(query)
      .populate("product", "name images slug price")
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    let items = await dbQuery;

    // Client-side search on product name after populate (simple approach)
    if (search) {
      const lower = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.product?.name?.toLowerCase().includes(lower) ||
          i.sku?.toLowerCase().includes(lower) ||
          i.variantLabel?.toLowerCase().includes(lower),
      );
    }

    const total = await Inventory.countDocuments(query);
    const lowStockCount = await Inventory.countDocuments({
      vendor: vendor._id,
      isLowStock: true,
    });
    const outOfStockCount = await Inventory.countDocuments({
      vendor: vendor._id,
      isOutOfStock: true,
    });

    res.json({
      success: true,
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      summary: {
        total,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        inStock: total - lowStockCount - outOfStockCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/inventory/my/:id               — vendor: single inventory item
// ─────────────────────────────────────────────────────────────────────────────
export const getInventoryItem = async (req, res) => {
  try {
    const vendor = await getVendorOrThrow(req.user.id, res);
    if (!vendor) return;

    const item = await Inventory.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    })
      .populate("product", "name images slug price category")
      .populate("adjustments.performedBy", "name email");

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/inventory/my                  — vendor: create inventory record
// Body: { productId, sku, currentStock, lowStockThreshold, maxStock,
//         costPrice, sellingPrice, warehouseLocation, variantLabel, variantSku }
// ─────────────────────────────────────────────────────────────────────────────
export const createInventoryItem = async (req, res) => {
  try {
    const vendor = await getVendorOrThrow(req.user.id, res);
    if (!vendor) return;

    const {
      productId,
      sku,
      currentStock = 0,
      lowStockThreshold = 10,
      maxStock = null,
      costPrice = 0,
      sellingPrice = 0,
      warehouseLocation = {},
      variantLabel = null,
      variantSku = null,
    } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    // Verify product exists (and optionally belongs to this vendor)
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    // If your Product schema has a `vendor` field, enforce ownership
    if (product.vendor && product.vendor.toString() !== vendor._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "This product does not belong to you",
        });
    }

    // Check duplicate
    const exists = await Inventory.findOne({
      vendor: vendor._id,
      product: productId,
      variantLabel,
    });
    if (exists) {
      return res
        .status(409)
        .json({
          success: false,
          message: "Inventory record already exists for this product/variant",
        });
    }

    const item = new Inventory({
      vendor: vendor._id,
      product: productId,
      sku,
      variantLabel,
      variantSku,
      currentStock,
      reservedStock: 0,
      lowStockThreshold,
      maxStock,
      costPrice,
      sellingPrice,
      warehouseLocation,
    });

    // Log initial stock as a restock entry
    if (currentStock > 0) {
      item.adjustments.push({
        type: "restock",
        qty: currentStock,
        stockBefore: 0,
        stockAfter: currentStock,
        note: "Initial stock",
        performedBy: req.user.id,
      });
    }

    await item.save();

    const populated = await item.populate("product", "name images slug price");
    res
      .status(201)
      .json({
        success: true,
        message: "Inventory record created",
        item: populated,
      });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Inventory record already exists" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/inventory/my/:id               — vendor: update settings (not stock)
// Body: { sku, lowStockThreshold, maxStock, costPrice, sellingPrice,
//         warehouseLocation, isActive }
// ─────────────────────────────────────────────────────────────────────────────
export const updateInventoryItem = async (req, res) => {
  try {
    const vendor = await getVendorOrThrow(req.user.id, res);
    if (!vendor) return;

    const item = await Inventory.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });

    const allowed = [
      "sku",
      "lowStockThreshold",
      "maxStock",
      "costPrice",
      "sellingPrice",
      "warehouseLocation",
      "isActive",
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) item[key] = req.body[key];
    });

    await item.save();
    const populated = await item.populate("product", "name images slug price");
    res.json({ success: true, message: "Inventory updated", item: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/inventory/my/:id/adjust       — vendor: adjust stock
// Body: { type, qty, note, referenceId }
//   type: "restock" | "manual_add" | "manual_remove" | "damage" | "return" | "expiry"
//   qty: always POSITIVE (direction inferred from type)
// ─────────────────────────────────────────────────────────────────────────────
export const adjustStock = async (req, res) => {
  try {
    const vendor = await getVendorOrThrow(req.user.id, res);
    if (!vendor) return;

    const item = await Inventory.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });

    const { type, qty, note = "", referenceId = null } = req.body;

    if (!type || qty === undefined || qty === null) {
      return res
        .status(400)
        .json({ success: false, message: "type and qty are required" });
    }

    const parsedQty = Number(qty);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "qty must be a positive number" });
    }

    const REMOVE_TYPES = ["manual_remove", "damage", "expiry", "sale"];
    const isRemoval = REMOVE_TYPES.includes(type);
    const delta = isRemoval ? -parsedQty : parsedQty;

    const stockBefore = item.currentStock;
    const newStock = stockBefore + delta;

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${stockBefore}, Requested removal: ${parsedQty}`,
      });
    }

    item.currentStock = newStock;
    item.adjustments.push({
      type,
      qty: delta,
      stockBefore,
      stockAfter: newStock,
      note,
      referenceId,
      performedBy: req.user.id,
    });

    await item.save();
    const populated = await item.populate("product", "name images slug price");
    res.json({
      success: true,
      message: "Stock adjusted successfully",
      item: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/inventory/my/:id            — vendor: remove inventory record
// ─────────────────────────────────────────────────────────────────────────────
export const deleteInventoryItem = async (req, res) => {
  try {
    const vendor = await getVendorOrThrow(req.user.id, res);
    if (!vendor) return;

    const item = await Inventory.findOneAndDelete({
      _id: req.params.id,
      vendor: vendor._id,
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });

    res.json({ success: true, message: "Inventory record deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/inventory/my/:id/history       — vendor: adjustment history
// ─────────────────────────────────────────────────────────────────────────────
export const getAdjustmentHistory = async (req, res) => {
  try {
    const vendor = await getVendorOrThrow(req.user.id, res);
    if (!vendor) return;

    const item = await Inventory.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    })
      .populate("adjustments.performedBy", "name email")
      .select("adjustments product");

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Inventory item not found" });

    const sorted = [...item.adjustments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    res.json({ success: true, history: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/inventory/my/summary           — vendor: dashboard summary
// ─────────────────────────────────────────────────────────────────────────────
export const getInventorySummary = async (req, res) => {
  try {
    const vendor = await getVendorOrThrow(req.user.id, res);
    if (!vendor) return;

    const [total, lowStock, outOfStock, topStocked] = await Promise.all([
      Inventory.countDocuments({ vendor: vendor._id }),
      Inventory.countDocuments({ vendor: vendor._id, isLowStock: true }),
      Inventory.countDocuments({ vendor: vendor._id, isOutOfStock: true }),
      Inventory.find({ vendor: vendor._id, isOutOfStock: false })
        .sort({ currentStock: -1 })
        .limit(5)
        .populate("product", "name images"),
    ]);

    // Total inventory value
    const agg = await Inventory.aggregate([
      { $match: { vendor: vendor._id } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$currentStock", "$costPrice"] } },
          totalUnits: { $sum: "$currentStock" },
        },
      },
    ]);

    const { totalValue = 0, totalUnits = 0 } = agg[0] || {};

    res.json({
      success: true,
      summary: {
        total,
        inStock: total - lowStock - outOfStock,
        lowStock,
        outOfStock,
        totalValue,
        totalUnits,
        topStocked,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/inventory/admin/all            — admin: all inventory across vendors
// ─────────────────────────────────────────────────────────────────────────────
export const adminGetAllInventory = async (req, res) => {
  try {
    const { page = 1, limit = 30, vendorId } = req.query;
    const query = vendorId ? { vendor: vendorId } : {};

    const items = await Inventory.find(query)
      .populate("vendor", "businessDetails.businessName")
      .populate("product", "name images price")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Inventory.countDocuments(query);
    res.json({
      success: true,
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL helper — called from Order controller to reserve / release stock
// ─────────────────────────────────────────────────────────────────────────────
export const reserveStock = async (productId, vendorId, qty) => {
  const item = await Inventory.findOne({
    product: productId,
    vendor: vendorId,
  });
  if (!item) return false;
  if (item.availableStock < qty) return false;
  item.reservedStock += qty;
  await item.save();
  return true;
};

export const releaseStock = async (productId, vendorId, qty, sold = false) => {
  const item = await Inventory.findOne({
    product: productId,
    vendor: vendorId,
  });
  if (!item) return;
  item.reservedStock = Math.max(0, item.reservedStock - qty);
  if (sold) {
    item.currentStock = Math.max(0, item.currentStock - qty);
    item.adjustments.push({
      type: "sale",
      qty: -qty,
      stockBefore: item.currentStock + qty,
      stockAfter: item.currentStock,
      note: "Order fulfilled",
    });
  }
  await item.save();
};
