import express from "express";
import multer from "multer";
import {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/heroBannerController.js";

const router = express.Router();

// ✅ Multer — memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Sirf image files allowed hain!"));
    }
  },
});

// ── Routes ──
router.get("/", getAllBanners);
router.get("/:id", getBannerById);
router.post("/", upload.single("image"), createBanner);
router.put("/:id", upload.single("image"), updateBanner);
router.delete("/:id", deleteBanner);

export default router;
