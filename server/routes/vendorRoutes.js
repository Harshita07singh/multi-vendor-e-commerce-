import { Router } from "express";
const router = Router();
import {
  saveVendorStep,
  submitVendor,
  updateVendorStatus,
  getAllVendors,
  getVendorById,
  getMyVendor,
} from "../controllers/vendorController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

// Vendor routes
router.post("/save-step", protect, saveVendorStep);
router.post("/submit", protect, submitVendor);
router.get("/my-profile", protect, getMyVendor);

// Admin routes
router.get("/admin/all", protect, authorizeRoles("admin"), getAllVendors);
router.get("/admin/:id", protect, authorizeRoles("admin"), getVendorById);
router.put(
  "/admin/update-status",
  protect,
  authorizeRoles("admin"),
  updateVendorStatus,
);

export default router;
