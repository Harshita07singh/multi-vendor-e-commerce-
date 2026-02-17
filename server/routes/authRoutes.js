import express from "express";
import passport from "../config/passport.js";
import { sendOTP, verifyOTP } from "../controllers/authController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// OTP
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Google Login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.redirect(`http://localhost:5174/login-success?token=${token}`);
  },
);

export default router;
