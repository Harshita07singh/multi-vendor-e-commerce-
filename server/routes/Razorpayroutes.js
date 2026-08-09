/**
 * razorpayRoutes.js
 *
 * Mount in server.js:
 *   import razorpayRoutes from "./routes/razorpayRoutes.js";
 *   app.use("/api/payments", razorpayRoutes);
 */

import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/Razorpaycontroller.js";
import { protect } from "../middleware/authMiddleware.js"; // ← your existing auth guard

const router = express.Router();

// Both endpoints require a logged-in user
router.post("/razorpay/create-order", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);

export default router;
