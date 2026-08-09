import mongoose from "mongoose";

const heroBannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    buttonText: { type: String, default: "Explore Shop" },
    image: { type: String },
    link: { type: String, default: "#" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("HeroBanner", heroBannerSchema);
