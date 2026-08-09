// models/SubCategory.js
import { Schema, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    image: {
      type: String,
    },

    description: {
      type: String,
      trim: true,
    },

    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Vendor association
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      // required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Uniqueness should be vendor-scoped and case/format-insensitive.
// We enforce this via the normalized `slug` (lowercased) instead of raw `name`.
subCategorySchema.index({ vendor: 1, category: 1, slug: 1 }, { unique: true });

export default model("SubCategory", subCategorySchema);
