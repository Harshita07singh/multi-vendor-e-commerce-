import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  sendOtp,
  verifyOtp,
  requestPasswordReset,
  resetPassword,
  getMe,
  updateProfile,
} from "../controllers/UserController.js";
import { refreshAccessToken } from "../utils/generateToken.js";
import { approveUser } from "../controllers/UserController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

// ✅ NEW: Profile route - login hona zaroori hai
router.get("/me", protect, getMe);

// ✅ NEW: Update profile route
router.put("/update-profile", protect, updateProfile);

// Protected routes
router.get(
  "/admin-dashboard",
  protect,
  authorizeRoles("admin", "superadmin"),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  },
);

router.put(
  "/approve/:userId",
  protect,
  authorizeRoles("admin", "superadmin"),
  approveUser,
);

router.get(
  "/vendor-dashboard",
  protect,
  authorizeRoles("vendor"),
  (req, res) => {
    res.json({ message: "Welcome Vendor" });
  },
);

router.get(
  "/delivery-dashboard",
  protect,
  authorizeRoles("delivery"),
  (req, res) => {
    res.json({ message: "Welcome Delivery Partner" });
  },
);

router.get(
  "/customer-dashboard",
  protect,
  authorizeRoles("customer"),
  (req, res) => {
    res.json({ message: "Welcome Customer" });
  },
);

export default router;
