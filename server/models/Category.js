// models/Category.js
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
  },
);

export default model("Category", categorySchema);
