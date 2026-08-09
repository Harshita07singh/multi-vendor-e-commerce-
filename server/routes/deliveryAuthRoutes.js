import express from "express";
import {
  registerDeliveryPartner,
  loginDeliveryPartner,
  sendDeliveryOTP,
  verifyDeliveryOTP,
} from "../controllers/deliveryController.js";
import {
  getPendingDeliveries,
  approveDelivery,
  rejectDelivery,
} from "../controllers/AdminController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import User from "../models/User.js";
const router = express.Router();

// OTP routes for delivery partner verification
router.post("/send-otp", sendDeliveryOTP);
router.post("/verify-otp", verifyDeliveryOTP);

router.post(
  "/register",
  upload.fields([
    { name: "aadhaarFront" },
    { name: "aadhaarBack" },
    { name: "panImage" },
    { name: "dlFront" },
    { name: "dlBack" },
    { name: "bankProofImage" },
    { name: "rcImage" },
  ]),
  registerDeliveryPartner,
);
router.post("/login", loginDeliveryPartner);
router.get(
  "/admin/deliveries",
  protect,
  authorizeRoles("admin", "superadmin"),
  getPendingDeliveries,
);

router.put(
  "/delivery/approve/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  approveDelivery,
);
router.put(
  "/delivery/reject/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  rejectDelivery,
);
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;
