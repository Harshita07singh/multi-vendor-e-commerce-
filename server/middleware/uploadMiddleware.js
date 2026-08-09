import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

// ── Ensure directories exist ──────────────────────────────────────────────────
const DIRS = [
  "./uploads",
  "./uploads/images",
  "./uploads/videos",
  "./uploads/temp",
];
DIRS.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Image optimization config ─────────────────────────────────────────────────
const IMAGE_CONFIG = {
  product: { width: 1200, height: 1200, quality: 85, format: "webp" },
  category: { width: 600, height: 600, quality: 80, format: "webp" },
  thumbnail: { width: 300, height: 300, quality: 70, format: "webp" },
};

// ── Safe async unlink with retry (handles Windows/OneDrive file locks) ────────
async function safeUnlink(filePath, retries = 5, delayMs = 150) {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.promises.unlink(filePath);
      return;
    } catch (err) {
      if (err.code === "EBUSY" && i < retries - 1) {
        await new Promise((res) => setTimeout(res, delayMs * (i + 1)));
      } else if (err.code === "ENOENT") {
        return; // already deleted, that's fine
      } else {
        throw err;
      }
    }
  }
}

// ── Sharp optimizer function ──────────────────────────────────────────────────
export async function optimizeImage(inputPath, outputPath, type = "product") {
  const config = IMAGE_CONFIG[type] || IMAGE_CONFIG.product;

  // Read into buffer first — releases the file handle immediately on Windows
  const inputBuffer = await fs.promises.readFile(inputPath);

  await sharp(inputBuffer)
    .resize(config.width, config.height, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: config.quality, effort: 4 })
    .toFile(outputPath);

  // Now safe to delete — handle is fully released
  await safeUnlink(inputPath);
}

// ── Also generate a thumbnail ─────────────────────────────────────────────────
export async function generateThumbnail(inputPath, outputDir, filename) {
  const thumbName = `thumb_${filename}`;
  const thumbPath = path.join(outputDir, thumbName);

  // Read optimized webp into buffer to avoid any lock issues
  const inputBuffer = await fs.promises.readFile(inputPath);

  await sharp(inputBuffer)
    .resize(IMAGE_CONFIG.thumbnail.width, IMAGE_CONFIG.thumbnail.height, {
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: IMAGE_CONFIG.thumbnail.quality })
    .toFile(thumbPath);

  return thumbName;
}

// ── Multer: store everything to /temp first, then process ─────────────────────
const storage = multer.diskStorage({
  destination: "./uploads/temp",
  filename: (req, file, cb) => {
    const unique = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export default upload;

// ── Middleware: auto-optimize images after multer saves them ──────────────────
export const processImages = async (req, res, next) => {
  try {
    if (!req.files && !req.file) return next();

    const files = req.files
      ? Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat()
      : [req.file];

    await Promise.all(
      files.map(async (file) => {
        const isImage = file.mimetype.startsWith("image/");
        if (!isImage) {
          const dest = path.join("./uploads/videos", file.filename);
          await fs.promises.rename(file.path, dest);
          file.path = dest;
          file.filename = `videos/${file.filename}`;
          return;
        }

        const imageType = file.fieldname === "image" ? "category" : "product";
        const webpName = file.filename.replace(/\.[^.]+$/, ".webp");
        const outputPath = path.join("./uploads/images", webpName);

        await optimizeImage(file.path, outputPath, imageType);
        await generateThumbnail(outputPath, "./uploads/images", webpName);

        file.filename = `images/${webpName}`;
        file.path = outputPath;
        file.mimetype = "image/webp";

        const outputStats = await fs.promises.stat(outputPath);
        console.log(
          `✓ ${file.originalname} → ${webpName} | ${(outputStats.size / 1024).toFixed(1)} KB`,
        );
      }),
    );

    next();
  } catch (err) {
    console.error("Image processing error:", err);
    next(err);
  }
};
