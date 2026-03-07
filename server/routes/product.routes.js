import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import upload, { processImages } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

const uploadFields = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "video", maxCount: 1 },
]);

// ✅ PUBLIC — customer bhi dekh sake (no protect)
router.get("/", getProducts);
router.get("/id/:id", getProduct);
router.get("/:slug", getProduct);

// ✅ VENDOR ONLY — sirf logged-in vendor
router.post("/", protect, uploadFields, processImages, createProduct);
router.put("/:id", protect, uploadFields, processImages, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
