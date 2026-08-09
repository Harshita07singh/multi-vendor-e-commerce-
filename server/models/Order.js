import mongoose from "mongoose";

/* ── Embedded sub-schemas ── */
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // discounted unit price at time of order
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

/* ── Main Order schema ── */
const orderSchema = new mongoose.Schema(
  {
    /* who placed it */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* what was ordered */
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: "Order must contain at least one item",
      },
    },

    /* delivery details */
    shippingAddress: { type: shippingAddressSchema, required: true },
    assignedDeliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deliveryPickedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    deliveryEarning: { type: Number, default: 40 },
    deliveryType: {
      type: String,
      enum: ["standard", "express", "sameday"],
      default: "standard",
    },
    deliveryCharge: { type: Number, default: 0, min: 0 },

    /* payment */
    paymentMethod: {
      type: String,
      enum: ["upi", "razorpay", "card", "netbanking", "cod"],
      required: true,
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    /* price snapshot (stored so future price changes don't affect history) */
    subtotal: { type: Number, required: true, min: 0 },
    gst: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    /* lifecycle */
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    /* optional tracking info (set by admin) */
    trackingNumber: { type: String, default: "" },
    notes: { type: String, default: "" },

    /* Vendors involved in this order (products from multiple vendors) */
    vendors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
      },
    ],
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  },
);

/* Fast per-user look-up, newest first */
orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
