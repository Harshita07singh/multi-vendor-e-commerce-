import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import upload, { processImages } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// ✅ PUBLIC
router.get("/", getCategories);
router.get("/:slug", getCategory);

// ✅ VENDOR ONLY
router.post(
  "/",
  protect,
  upload.single("image"),
  processImages,
  createCategory,
);
router.put(
  "/:id",
  protect,
  upload.single("image"),
  processImages,
  updateCategory,
);
router.delete("/:id", protect, deleteCategory);

export default router;
