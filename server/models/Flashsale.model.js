import mongoose from "mongoose";

const saleProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    stock: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: true, timestamps: true },
);

const vendorParticipantSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["joined", "left"],
      default: "joined",
    },
  },
  { _id: false },
);

const flashSaleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    bannerImage: {
      type: String,
      default: "",
    },
    bannerColor: {
      type: String,
      default: "#e63946",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "notified", "live", "ended", "cancelled"],
      default: "draft",
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
    participants: [vendorParticipantSchema],
    products: [saleProductSchema],
    minDiscountRequired: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    showOnDailySale: {
      type: Boolean,
      default: true,
    },
    displayBannerText: {
      type: String,
      default: "",
    },

    // ─── CATEGORY SALE FEATURE ───────────────────────────────────────────────
    // If populated, this sale is restricted to specific categories only.
    // Vendors can only add products that belong to one of these categories.
    // If empty array → no restriction (all categories allowed — old behaviour).
    targetCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    // ────────────────────────────────────────────────────────────────────────
  },
  { timestamps: true },
);

// Virtual: is this sale currently live?
flashSaleSchema.virtual("isLive").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.status === "live" &&
    now >= this.startDate &&
    now <= this.endDate
  );
});

flashSaleSchema.set("toJSON", { virtuals: true });

export default mongoose.model("FlashSale", flashSaleSchema);
