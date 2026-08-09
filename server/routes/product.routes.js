import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import upload, { processImages } from "../middleware/uploadMiddleware.js";
import { protect, optionalProtect } from "../middleware/authMiddleware.js";

const router = Router();

const uploadFields = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "video", maxCount: 1 },
]);

// ── PUBLIC with optional auth ────────────────────────────────────
// optionalProtect sets req.user if a valid token is present,
// otherwise sets req.user = null (guest/customer).
// The controller then scopes results accordingly:
//   vendor logged in  → only their products
//   guest / customer  → all active products
router.get("/", optionalProtect, getProducts);
router.get("/id/:id", optionalProtect, getProduct);
router.get("/:slug", optionalProtect, getProduct);

// ── VENDOR ONLY ──────────────────────────────────────────────────
router.post("/", protect, uploadFields, processImages, createProduct);
router.put("/:id", protect, uploadFields, processImages, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
