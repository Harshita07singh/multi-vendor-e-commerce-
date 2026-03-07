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

export default router;
