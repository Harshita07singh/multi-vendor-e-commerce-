import { Router } from "express";
import {
  getMyPlan,
  createOrder,
  verifyPayment,
  cancelPlan,
  adminSetPlan,
  adminRevokePlan,
  razorpayWebhook,
} from "../controllers/Subscription.controller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

// ── Webhook — no auth, raw body ───────────────────────────────────
router.post("/webhook", razorpayWebhook);

// ── Vendor routes ─────────────────────────────────────────────────
router.get("/my-plan", protect, getMyPlan);
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/cancel", protect, cancelPlan); // ← NEW: vendor cancels own plan

// ── Admin / SuperAdmin routes ─────────────────────────────────────
router.put(
  "/admin/set-plan",
  protect,
  authorizeRoles("admin", "superadmin"),
  adminSetPlan,
);
router.put(
  "/admin/revoke",
  protect,
  authorizeRoles("admin", "superadmin"),
  adminRevokePlan,
);

export default router;
