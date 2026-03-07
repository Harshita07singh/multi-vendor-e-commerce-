import express from "express";
import {
  validateCoupon,
  applyCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / soft-auth routes
router.post("/validate", protect, validateCoupon);
router.post("/apply", protect, applyCoupon);

// Admin-only routes
router.get("/", protect, getAllCoupons);
router.post("/", protect, createCoupon);
router.patch("/:id", protect, updateCoupon);
router.delete("/:id", protect, deleteCoupon);

export default router;
