import { Router } from "express";
const router = Router();
import {
  saveVendorStep,
  submitVendor,
  updateVendorStatus,
  getAllVendors,
  getApprovedVendors,
  getVendorById,
  getMyVendor,
  getMyVendorProducts,
  getMyVendorCategories,
  getMyVendorSubCategories,
  uploadVendorLogo, // ← NEW
} from "../controllers/vendorController.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import upload, { processImages } from "../middleware/uploadMiddleware.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

// ── Public routes (no auth required) ──────────────────────────────────────
router.get("/approved", getApprovedVendors);

// ── Vendor routes (authenticated) ─────────────────────────────────────────
router.post("/save-step", protect, saveVendorStep);
router.post("/submit", protect, submitVendor);
router.get("/my-profile", protect, getMyVendor);

// ── Logo upload (NEW) ──────────────────────────────────────────────────────
// POST /api/vendor/upload-logo
// Field name: "logo" (single image)
router.post(
  "/upload-logo",
  protect,
  upload.single("logo"), // multer picks up "logo" field
  processImages, // sharp converts to webp + thumbnail
  uploadVendorLogo, // saves path to vendor.brandDetails.brandLogo
);

// Vendor-specific data routes
router.get("/my-products", protect, getMyVendorProducts);

// Categories CRUD
router.get("/my-categories", protect, getMyVendorCategories);
router.post(
  "/my-categories",
  protect,
  upload.single("image"),
  processImages,
  createCategory,
);
router.put(
  "/my-categories/:id",
  protect,
  upload.single("image"),
  processImages,
  updateCategory,
);
router.delete("/my-categories/:id", protect, deleteCategory);

// Subcategories CRUD
import {
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategory.controller.js";
router.get("/my-subcategories", protect, getMyVendorSubCategories);
router.post(
  "/my-subcategories",
  protect,
  upload.single("image"),
  processImages,
  createSubCategory,
);
router.put(
  "/my-subcategories/:id",
  protect,
  upload.single("image"),
  processImages,
  updateSubCategory,
);
router.delete("/my-subcategories/:id", protect, deleteSubCategory);

// Coupons CRUD
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
router.get("/my-coupons", protect, getAllCoupons);
router.post("/my-coupons", protect, createCoupon);
router.patch("/my-coupons/:id", protect, updateCoupon);
router.delete("/my-coupons/:id", protect, deleteCoupon);

// Orders
import {
  getVendorOrders,
  vendorUpdateOrderStatus,
} from "../controllers/Ordercontroller.js";
router.get("/my-orders", protect, getVendorOrders);
router.put("/orders/vendor/:id/status", protect, vendorUpdateOrderStatus);

// ── Admin routes ───────────────────────────────────────────────────────────
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin", "superadmin"),
  getAllVendors,
);
router.get(
  "/admin/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  getVendorById,
);
router.put(
  "/admin/update-status",
  protect,
  authorizeRoles("admin", "superadmin"),
  updateVendorStatus,
);

export default router;
