// models/Product.js
import { Schema, model } from "mongoose";

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    altText: { type: String },
  },
  { _id: false },
);

const variantSchema = new Schema(
  {
    color: { type: String },
    size: { type: String },

    sku: {
      type: String,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * Variant-level MRP (Maximum Retail Price).
     * The variant selling price is stored in `price`.
     * discount% = ((mrp - price) / mrp) × 100
     */
    mrp: {
      type: Number,
      required: true,
      min: [0, "MRP cannot be negative"],
    },

    price: {
      type: Number,
      required: true,
      validate: {
        validator(v) {
          // Selling price must not exceed MRP
          return v <= this.mrp;
        },
        message: "Variant price cannot exceed its MRP",
      },
    },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
    },

    shortDescription: String,

    brand: {
      type: String,
      index: true,
    },

    sku: {
      type: String,
      unique: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
      index: true,
    },

    images: [imageSchema],

    videoUrl: String,

    gst: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    tags: [
      {
        type: String,
        index: true,
      },
    ],

    customFields: [
      {
        label: String,
        value: String,
      },
    ],

    weight: {
      type: Number,
    },

    /**
     * MRP — Maximum Retail Price.
     * The highest price at which the product can legally be sold.
     * Printed on packaging; used as the baseline for discount calculation.
     *
     * discount% = ((mrp - price) / mrp) × 100
     */
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: [0, "MRP cannot be negative"],
    },

    /**
     * Selling price — what the customer actually pays.
     * Must be ≤ MRP.
     *
     * After applying category margin:
     *   platformCommission = price × (category.margin / 100)
     *   vendorEarnings     = price − platformCommission
     */
    price: {
      type: Number,
      required: true,
      validate: {
        validator(v) {
          return v <= this.mrp;
        },
        message: "Selling price cannot exceed MRP",
      },
    },

    /**
     * Vendor's cost / purchase price (what the vendor paid to source the product).
     * Used to calculate gross profit and net profit after category margin.
     *
     *   grossProfit  = price − costPrice
     *   netProfit    = price − costPrice − platformCommission
     *   profitMargin = (netProfit / price) × 100
     */
    costPrice: {
      type: Number,
      min: [0, "Cost price cannot be negative"],
      default: 0,
    },

    /**
     * Stored discount percentage (convenience field).
     * Always derived from MRP and price; do NOT set manually.
     *
     *   discount = ((mrp - price) / mrp) × 100   (rounded to 2 dp)
     *
     * Kept in sync via pre-save hook below.
     */
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    stock: {
      type: Number,
      default: 0,
    },

    variants: [variantSchema],

    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingsCount: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Vendor association
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    // Expose virtual fields (like pricingBreakdown) when converting to JSON / Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Pre-save: auto-compute discount from MRP & price ────────────────────────

productSchema.pre("save", async function () {
  if (this.mrp > 0) {
    this.discount = parseFloat(
      (((this.mrp - this.price) / this.mrp) * 100).toFixed(2),
    );
  } else {
    this.discount = 0;
  }
});

// ─── Pre-findOneAndUpdate: keep discount in sync on updates ──────────────────
productSchema.pre("findOneAndUpdate", async function () {
  const upd = this.getUpdate();
  const mrp = upd?.mrp ?? upd?.$set?.mrp;
  const price = upd?.price ?? upd?.$set?.price;

  if (mrp != null && price != null && mrp > 0) {
    const discount = parseFloat((((mrp - price) / mrp) * 100).toFixed(2));
    if (upd.$set) upd.$set.discount = discount;
    else upd.discount = discount;
  }
});

// ─── Virtual: pricingBreakdown (populated AFTER category is joined) ──────────
/**
 * Returns a pricing breakdown object when the category has been populated
 * (i.e., product.category is a Category document, not just an ObjectId).
 *
 * Usage (controller):
 *   const product = await Product.findById(id).populate("category");
 *   product.pricingBreakdown  // → { mrp, price, discount, ... }
 */
productSchema.virtual("pricingBreakdown").get(function () {
  const categoryMargin =
    this.populated("category") && this.category?.margin != null
      ? this.category.margin
      : 0;

  const mrp = this.mrp ?? 0;
  const price = this.price ?? 0;
  const costPrice = this.costPrice ?? 0;
  const gst = this.gst ?? 0;

  const discount = mrp > 0 ? ((mrp - price) / mrp) * 100 : 0;
  const platformCommission = price * (categoryMargin / 100);
  const vendorEarnings = price - platformCommission;
  const gstAmount = price * (gst / 100);
  const priceExcludingGst = price - gstAmount;
  const grossProfit = price - costPrice;
  const netProfit = grossProfit - platformCommission;
  const netProfitMargin = price > 0 ? (netProfit / price) * 100 : 0;

  return {
    mrp: +mrp.toFixed(2),
    price: +price.toFixed(2),
    costPrice: +costPrice.toFixed(2),
    discount: +discount.toFixed(2),
    categoryMarginPct: categoryMargin,
    platformCommission: +platformCommission.toFixed(2),
    vendorEarnings: +vendorEarnings.toFixed(2),
    gst,
    gstAmount: +gstAmount.toFixed(2),
    priceExcludingGst: +priceExcludingGst.toFixed(2),
    grossProfit: +grossProfit.toFixed(2),
    netProfit: +netProfit.toFixed(2),
    netProfitMargin: +netProfitMargin.toFixed(2),
  };
});

productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
  brand: "text",
});

export default model("Product", productSchema);
