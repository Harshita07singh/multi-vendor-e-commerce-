import User from "../models/User.js";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { sendEmail } from "../utils/sendEmail.js";

export const sendOTP = async (req, res) => {
  try {
    const { emailOrPhone } = req.body;

    if (!emailOrPhone) {
      return res.status(400).json({ message: "Email or phone required" });
    }

    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
    });

    let user =
      (await User.findOne({ email: emailOrPhone })) ||
      (await User.findOne({ phone: emailOrPhone }));

    if (!user) {
      user = await User.create({
        email: emailOrPhone.includes("@") ? emailOrPhone : undefined,
        phone: !emailOrPhone.includes("@") ? emailOrPhone : undefined,
        role: "vendor",
        password: "pending_otp_verification", // Placeholder password for OTP login
      });
    }

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Send OTP via Email
    if (emailOrPhone.includes("@")) {
      try {
        await sendEmail(
          emailOrPhone,
          "Your SellerHub OTP Code",
          `Your OTP is: ${otp}\n\nThis OTP is valid for 5 minutes.\n\nDo not share this code with anyone.`,
        );
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        console.log("OTP for testing:", otp); // Fallback for testing
      }
    } else {
      console.log("OTP for phone:", otp); // For testing phone OTP
    }

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;

    const user =
      (await User.findOne({ email: emailOrPhone })) ||
      (await User.findOne({ phone: emailOrPhone }));

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpire = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
