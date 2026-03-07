import { Router } from "express";
const router = Router();
import {
  saveVendorStep,
  submitVendor,
  updateVendorStatus,
  getAllVendors,
  getVendorById,
  getMyVendor,
  getMyVendorProducts,
  getMyVendorCategories,
  getMyVendorSubCategories,
} from "../controllers/vendorController.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import upload, { processImages } from "../middleware/uploadMiddleware.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

// Vendor routes
router.post("/save-step", protect, saveVendorStep);
router.post("/submit", protect, submitVendor);
router.get("/my-profile", protect, getMyVendor);

// Vendor-specific data routes
router.get("/my-products", protect, getMyVendorProducts);
// Categories and CRUD available under general category routes, but expose helpers here for consistency
router.get("/my-categories", protect, getMyVendorCategories);
// category CRUD
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

// subcategory CRUD
import {
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategory.controller.js";
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
router.get("/my-subcategories", protect, getMyVendorSubCategories);

// Vendor-specific coupon route
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

// Vendor-specific orders route
import { getVendorOrders } from "../controllers/Ordercontroller.js";
router.get("/my-orders", protect, getVendorOrders);

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
