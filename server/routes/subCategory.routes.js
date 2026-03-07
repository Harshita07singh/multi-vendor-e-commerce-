import { Router } from "express";
import {
  createSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategory.controller.js";
import upload, { processImages } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// ✅ PUBLIC
router.get("/", getSubCategories);

// ✅ VENDOR ONLY
router.post(
  "/",
  protect,
  upload.single("image"),
  processImages,
  createSubCategory,
);
router.put(
  "/:id",
  protect,
  upload.single("image"),
  processImages,
  updateSubCategory,
);
router.delete("/:id", protect, deleteSubCategory);

export default router;
