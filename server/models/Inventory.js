import { Schema, model } from "mongoose";

/**
 * Inventory Model
 * Tracks stock per product (and per variant if applicable).
 * Supports low-stock alerts, restock history, and warehouse location.
 */

// ── Restock / Adjustment Log Entry ───────────────────────────────────────────
const adjustmentSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "restock",
        "sale",
        "manual_add",
        "manual_remove",
        "return",
        "damage",
        "expiry",
      ],
      required: true,
    },
    qty: { type: Number, required: true }, // positive = added, negative = removed
    stockBefore: { type: Number, required: true },
    stockAfter: { type: Number, required: true },
    note: { type: String, default: "" },
    referenceId: { type: String, default: null }, // orderId / purchaseOrderId
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// ── Main Inventory Schema ─────────────────────────────────────────────────────
const inventorySchema = new Schema(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // Optional: if the product has variants (size/colour), store per variant
    variantLabel: {
      type: String,
      default: null, // e.g. "Red / XL"
    },
    variantSku: {
      type: String,
      default: null,
    },

    // ── Stock numbers ─────────────────────────────────────────────────────────
    sku: { type: String, default: "" },
    currentStock: { type: Number, default: 0, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 }, // locked by open orders
    availableStock: { type: Number, default: 0 }, // currentStock - reservedStock

    // ── Thresholds ────────────────────────────────────────────────────────────
    lowStockThreshold: { type: Number, default: 10 },
    maxStock: { type: Number, default: null },

    // ── Warehouse / location ──────────────────────────────────────────────────
    warehouseLocation: {
      shelf: { type: String, default: "" },
      bin: { type: String, default: "" },
      zone: { type: String, default: "" },
    },

    // ── Costing ───────────────────────────────────────────────────────────────
    costPrice: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },

    // ── Status flags ──────────────────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isLowStock: { type: Boolean, default: false },
    isOutOfStock: { type: Boolean, default: false },

    // ── Adjustment history ────────────────────────────────────────────────────
    adjustments: [adjustmentSchema],
  },
  { timestamps: true },
);

// ── Compound index: one inventory doc per vendor+product(+variant) ────────────
inventorySchema.index(
  { vendor: 1, product: 1, variantLabel: 1 },
  { unique: true },
);

// ── Pre-save: auto-compute derived fields ─────────────────────────────────────
inventorySchema.pre("save", function () {
  this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
  this.isOutOfStock = this.currentStock <= 0;
  this.isLowStock =
    !this.isOutOfStock && this.currentStock <= this.lowStockThreshold;
});

// Also recompute on findOneAndUpdate paths
inventorySchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  function () {
    const update = this.getUpdate();
    if (
      update?.$set?.currentStock !== undefined ||
      update?.currentStock !== undefined
    ) {
      const current = update?.$set?.currentStock ?? update?.currentStock ?? 0;
      const reserved =
        update?.$set?.reservedStock ?? update?.reservedStock ?? 0;
      const available = Math.max(0, current - reserved);
      this.set({
        availableStock: available,
        isOutOfStock: current <= 0,
        isLowStock:
          current > 0 && current <= (update?.$set?.lowStockThreshold ?? 10),
      });
    }
  },
);

export default model("Inventory", inventorySchema);
