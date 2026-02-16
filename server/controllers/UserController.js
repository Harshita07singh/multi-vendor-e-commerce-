import User from "../models/User.js";
import { generateAccessToken } from "../utils/generateToken.js";
import { generateRefreshToken } from "../utils/generateToken.js";
import OTP from "../models/otp.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

const handleError = (error, res) => {
  // Log full error for debugging
  console.error(error && error.stack ? error.stack : error);

  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }
  if (error.code && error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0];
    return res.status(400).json({ message: `${field} already exists` });
  }
  return res.status(500).json({ message: error.message });
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required" });
    }

    // Superadmin can only be created once
    if (role === "superadmin") {
      const existingSuperAdmin = await User.findOne({ role: "superadmin" });
      if (existingSuperAdmin) {
        return res.status(400).json({
          message: "SuperAdmin already exists",
        });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      status: role === "vendor" || role === "delivery" ? "pending" : "active",
      isApproved: role === "vendor" || role === "delivery" ? false : true,
    });

    res.status(201).json({
      message: "Registered successfully",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isApproved || user.status !== "active")
      return res.status(403).json({ message: "Not approved" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    return handleError(error, res);
  }
};

//LOGOUT
export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.sendStatus(204);

    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    return handleError(error, res);
  }
};

//ADMIN APPROVAL CONTROLLER
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!["vendor", "delivery", "admin"].includes(user.role))
      return res.status(400).json({ message: "Cannot approve this role" });

    user.isApproved = true;
    user.status = "active";
    await user.save();

    res.json({ message: `${user.role} approved successfully` });
  } catch (error) {
    return handleError(error, res);
  }
};

//send otp
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = crypto.randomInt(100000, 999999).toString();

    await OTP.create({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendEmail(email, "Your OTP Code", `Your OTP is ${otp}`);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    return handleError(error, res);
  }
};

//verify otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const record = await OTP.findOne({ email, otp });

    if (!record) return res.status(400).json({ message: "Invalid OTP" });

    if (record.expiresAt < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    await OTP.deleteMany({ email });

    res.json({ message: "OTP verified" });
  } catch (error) {
    return handleError(error, res);
  }
};

//password reset request
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    await sendEmail(email, "Reset Password", resetLink);

    res.json({ message: "Reset link sent" });
  } catch (error) {
    return handleError(error, res);
  }
};

//reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password)
      return res
        .status(400)
        .json({ message: "Token and new password required" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    return handleError(error, res);
  }
};
