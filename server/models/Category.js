import { Schema, model } from "mongoose";

const seoSchema = new Schema(
  {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
  },
  { _id: false },
);

const categorySchema = new Schema(
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
      lowercase: true,
      index: true,
    },

    image: {
      type: String, // File path or URL
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    seo: seoSchema,

    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Platform margin (commission) percentage for this category.
     *
     * Every product listed under this category incurs this margin.
     * It is deducted from the selling price (price) to determine
     * the amount the vendor actually receives.
     *
     * Calculation applied on the product level:
     *   platformCommission = product.price × (margin / 100)
     *   vendorEarnings     = product.price − platformCommission
     *
     * Range: 0 – 100  (percent)
     * Default: 0  (no platform cut)
     */
    margin: {
      type: Number,
      default: 0,
      min: [0, "Margin cannot be negative"],
      max: [100, "Margin cannot exceed 100%"],
    },

    // Vendor association
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      // required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model("Category", categorySchema);
