import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import HeroBanner from "../models/HeroBanner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Image processor ──────────────────────────────────────────────────────────
const processImage = async (buffer, filename) => {
  // Save to uploads/images/ — consistent with uploadMiddleware.js and uploadsCompat
  const outputDir = path.join(__dirname, "../uploads/images");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, filename);
  await sharp(buffer)
    .resize(1200, 500, { fit: "cover", position: "center" })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return `/uploads/images/${filename}`;
};

// ── GET — banners
// Public:  GET /api/hero-banners          → sirf isActive: true
// Admin:   GET /api/hero-banners?all=true → saare banners (active + inactive)
const getAllBanners = async (req, res) => {
  try {
    const showAll = req.query.all === "true";
    if (showAll) {
      const banners = await HeroBanner.find({}).sort({ order: 1 });
      return res.json(banners);
    }

    // Return active banners; if none are active, return all (so storefront is never empty)
    let banners = await HeroBanner.find({ isActive: true }).sort({ order: 1 });
    if (banners.length === 0) {
      banners = await HeroBanner.find({}).sort({ order: 1 });
    }
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET — banner by ID ───────────────────────────────────────────────────────
const getBannerById = async (req, res) => {
  try {
    const banner = await HeroBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST — create banner ─────────────────────────────────────────────────────
const createBanner = async (req, res) => {
  try {
    let imagePath = "";
    if (req.file) {
      const filename = `banner-${Date.now()}.webp`;
      imagePath = await processImage(req.file.buffer, filename);
    }

    const banner = new HeroBanner({
      title: req.body.title,
      subtitle: req.body.subtitle || "",
      buttonText: req.body.buttonText || "Explore Shop",
      link: req.body.link || "#",
      order: Number(req.body.order) || 0,
      // Default to true so banners are visible immediately after upload
      isActive:
        req.body.isActive === undefined
          ? true
          : req.body.isActive === "true" || req.body.isActive === true,
      image: imagePath,
    });

    const saved = await banner.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PUT — update banner ──────────────────────────────────────────────────────
const updateBanner = async (req, res) => {
  try {
    const updateData = {};

    // Only update fields that were actually sent
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.subtitle !== undefined)
      updateData.subtitle = req.body.subtitle;
    if (req.body.buttonText !== undefined)
      updateData.buttonText = req.body.buttonText;
    if (req.body.link !== undefined) updateData.link = req.body.link;
    if (req.body.order !== undefined) updateData.order = Number(req.body.order);
    if (req.body.isActive !== undefined) {
      updateData.isActive =
        req.body.isActive === "true" || req.body.isActive === true;
    }

    // New image uploaded → process it, delete old one
    if (req.file) {
      const existing = await HeroBanner.findById(req.params.id);
      if (existing?.image) {
        const oldPath = path.join(__dirname, "..", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const filename = `banner-${Date.now()}.webp`;
      updateData.image = await processImage(req.file.buffer, filename);
    }
    // ✅ FIX 3: No new image uploaded → keep existing image untouched
    // (do NOT set updateData.image at all, so $set won't overwrite it)

    const updated = await HeroBanner.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, // ✅ Using $set ensures only sent fields are updated
      { new: true, runValidators: false }, // ✅ runValidators: false allows partial updates (e.g. toggle only isActive)
    );

    if (!updated) return res.status(404).json({ message: "Banner not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
const deleteBanner = async (req, res) => {
  try {
    const banner = await HeroBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    if (banner.image) {
      const imgPath = path.join(__dirname, "..", banner.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await HeroBanner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
};
