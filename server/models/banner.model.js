import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    linkType: {
      type: String,
      enum: ["category", "vendor", "product_list", "custom"],
      required: true,
    },

    linkValue: {
      type: String, // categoryId / vendorId / custom URL slug
      default: "",
    },
    linkLabel: {
      type: String, // Human-readable label e.g. "Fruits & Veggies"
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Banner", bannerSchema);
