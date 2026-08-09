import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      enum: ["home", "work", "other"],
      default: "other",
    },
    customLabel: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    pincode: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "India" },
    coordinates: {
      lat: { type: Number, required: [true, "Latitude is required"] },
      lng: { type: Number, required: [true, "Longitude is required"] },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Location", locationSchema);
