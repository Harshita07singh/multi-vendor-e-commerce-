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

    price: {
      type: Number,
      required: true,
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

    discount: {
      type: Number,
      default: 0,
      min: 0,
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

    price: {
      type: Number,
      required: true,
    },

    compareAtPrice: Number,

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
  },
);

productSchema.index({
  name: "text",
  description: "text",
  tags: "text",
  brand: "text",
});

export default model("Product", productSchema);
