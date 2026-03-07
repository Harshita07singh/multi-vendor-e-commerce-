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
      enum: ["pending", "active", "suspended"],
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
