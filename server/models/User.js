import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null, // Optional - users can add name later
    },

    email: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
      lowercase: true,
      default: null,
    },

    phone: {
      type: String,
    },

    password: {
      type: String,
      default: null, // Optional for OTP/Google login
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "vendor", "delivery", "customer"],
      default: "customer",
    },
    googleId: String,

    otp: String,
    otpExpire: Date,

    status: {
      type: String,
      enum: ["pending", "approved", "active", "suspended"],
      default: "active",
    },

    refreshToken: {
      type: String,
      default: null,
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "customer" || this.role === "superadmin";
      },
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    isOnline: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: false },
    zone: { type: String, trim: true, default: "" },
    vehicleNumber: { type: String, trim: true, default: "" },
    vehicleModel: { type: String, trim: true, default: "" },
    vehicleYear: { type: String, trim: true, default: "" },
    bankName: { type: String, trim: true, default: "" },
    totalDeliveries: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageRating: { type: Number, default: null },
    ratingCount: { type: Number, default: 0 },
    currentLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },

    // =========================
    // Delivery-partner KYC data
    // =========================
    // Note: backend registration controller already sets these fields.
    // They must exist in the schema so Mongoose persists them.
    aadhaarNumber: String,
    aadhaarFront: String,
    aadhaarBack: String,

    panNumber: String,
    panImage: String,

    drivingLicenseNumber: String,
    dlFront: String,
    dlBack: String,
    dlExpiryDate: String,

    dateOfBirth: String,
    gender: String,
    city: String,

    vehicleType: String,
    vehicleNumber: String,
    vehicleModel: String,
    vehicleYear: String,

    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    bankProofImage: String,
    termsAccepted: Boolean,

    rcImage: String,
  },

  { timestamps: true },
);

// 🔐 Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
