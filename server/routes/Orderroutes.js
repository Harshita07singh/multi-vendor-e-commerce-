import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  adminGetAllOrders,
  adminUpdateOrderStatus,
  vendorUpdateOrderStatus,
  adminGetStats,
  getVendorOrders,
} from "../controllers/Ordercontroller.js";

const router = express.Router();

/* ────────────────────────────────────────────
   Customer routes  (require login)
──────────────────────────────────────────── */
router.post("/", protect, createOrder); // POST   /api/orders
router.get("/", protect, getMyOrders); // GET    /api/orders
router.get("/vendor/my-orders", protect, getVendorOrders);
router.put("/:id/cancel", protect, cancelOrder); // PUT    /api/orders/:id/cancel

/* ────────────────────────────────────────────
   Vendor routes  (require login + vendor role)
──────────────────────────────────────────── */
router.get("/:id", protect, getOrderById);
router.put("/vendor/:id/status", protect, vendorUpdateOrderStatus); // PUT /api/orders/vendor/:id/status

/* ────────────────────────────────────────────
   Admin routes  (require login + admin role)
   NOTE: must be declared BEFORE /:id routes to
   avoid Express matching "admin" as an :id param
──────────────────────────────────────────── */
router.get("/admin/stats", protect, adminGetStats); // GET  /api/orders/admin/stats
router.get("/admin/all", protect, adminGetAllOrders); // GET  /api/orders/admin/all
router.put("/admin/:id/status", protect, adminUpdateOrderStatus); // PUT  /api/orders/admin/:id/status

export default router;
