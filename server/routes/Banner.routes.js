import { Router } from "express";
import {
  createBanner,
  getBanners,
  getBanner,
  updateBanner,
  deleteBanner,
  toggleBanner,
} from "../controllers/Banner.controller.js";
import upload, { processImages } from "../middleware/uploadMiddleware.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = Router();

// ✅ PUBLIC — live banners for DailySales / homepage
router.get("/", getBanners);
router.get("/:id", getBanner);

// ✅ ADMIN ONLY
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  processImages,
  createBanner,
);
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("image"),
  processImages,
  updateBanner,
);
router.patch("/:id/toggle", protect, adminOnly, toggleBanner);
router.delete("/:id", protect, adminOnly, deleteBanner);

export default router;
