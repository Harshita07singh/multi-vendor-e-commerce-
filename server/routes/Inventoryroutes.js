import { Router } from "express";
import {
  getMyInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  adjustStock,
  deleteInventoryItem,
  getAdjustmentHistory,
  getInventorySummary,
  adminGetAllInventory,
} from "../controllers/Inventorycontroller.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

// ── Vendor routes (authenticated) ─────────────────────────────────────────────
// GET    /api/inventory/my/summary        → dashboard summary stats
// GET    /api/inventory/my                → paginated list
// POST   /api/inventory/my               → create record
// GET    /api/inventory/my/:id           → single item
// PUT    /api/inventory/my/:id           → update settings
// POST   /api/inventory/my/:id/adjust    → stock adjustment
// GET    /api/inventory/my/:id/history   → adjustment history
// DELETE /api/inventory/my/:id           → delete record

router.get("/my/summary", protect, getInventorySummary);
router.get("/my", protect, getMyInventory);
router.post("/my", protect, createInventoryItem);
router.get("/my/:id", protect, getInventoryItem);
router.put("/my/:id", protect, updateInventoryItem);
router.post("/my/:id/adjust", protect, adjustStock);
router.get("/my/:id/history", protect, getAdjustmentHistory);
router.delete("/my/:id", protect, deleteInventoryItem);

// ── Admin routes ───────────────────────────────────────────────────────────────
// GET /api/inventory/admin/all
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin", "superadmin"),
  adminGetAllInventory,
);

export default router;

// ── Mount in server.js ─────────────────────────────────────────────────────────
// import inventoryRoutes from "./routes/inventoryRoutes.js";
// app.use("/api/inventory", inventoryRoutes);
