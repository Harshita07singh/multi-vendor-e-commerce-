// routes/flashSale.routes.js
import { Router } from "express";
import {
  createFlashSale,
  notifyVendors,
  startFlashSale,
  endFlashSale,
  getAllFlashSales,
  getFlashSaleById,
  updateFlashSale,
  adminRemoveProduct,
  getOpenSalesForVendors,
  joinFlashSale,
  addProductToSale,
  removeProductFromSale,
  getMyProductsInSale,
  getLiveSales,
} from "../controllers/Flashsale.controller.js";
import upload, { processImages } from "../middleware/uploadMiddleware.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = Router();

// ════════════════════════════════════════
// PUBLIC — DailySale banner page
// ════════════════════════════════════════
router.get("/live", getLiveSales);

// ════════════════════════════════════════
// VENDOR — Join sale & manage products
// ════════════════════════════════════════
router.get("/open", protect, getOpenSalesForVendors);
router.post("/:id/join", protect, joinFlashSale);
router.post("/:id/products", protect, addProductToSale);
router.delete("/:id/products/:productEntryId", protect, removeProductFromSale);
router.get("/:id/my-products", protect, getMyProductsInSale);

// ════════════════════════════════════════
// ADMIN — Full control
// ════════════════════════════════════════
router.get("/", protect, adminOnly, getAllFlashSales);
router.get("/:id", protect, adminOnly, getFlashSaleById);

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("bannerImage"),
  processImages,
  createFlashSale,
);
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.single("bannerImage"),
  processImages,
  updateFlashSale,
);
router.patch("/:id/notify", protect, adminOnly, notifyVendors);
router.patch("/:id/start", protect, adminOnly, startFlashSale);
router.patch("/:id/end", protect, adminOnly, endFlashSale);
router.delete(
  "/:id/products/:productEntryId",
  protect,
  adminOnly,
  adminRemoveProduct,
);

export default router;
