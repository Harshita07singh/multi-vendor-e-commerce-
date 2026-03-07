// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Ensure uploads directory exists
// if (!fs.existsSync("./uploads")) {
//   fs.mkdirSync("./uploads", { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: "./uploads",
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname),
//     );
//   },
// });

// const fileFilter = (req, file, cb) => {
//   // Accept image and video files
//   const allowedMimes = [
//     // Images
//     "image/jpeg",
//     "image/png",
//     "image/gif",
//     "image/webp",
//     // Videos
//     "video/mp4",
//     "video/webm",
//     "video/quicktime",
//     "video/x-msvideo",
//     "video/x-matroska",
//   ];
//   if (allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image and video files are allowed"));
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
// });

// export default upload;
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
  // Product images — high quality, convert to webp
  product: {
    width: 1200,
    height: 1200,
    quality: 85,
    format: "webp",
  },
  // Category/thumbnail — smaller size
  category: {
    width: 600,
    height: 600,
    quality: 80,
    format: "webp",
  },
  // Thumbnail generation for every image
  thumbnail: {
    width: 300,
    height: 300,
    quality: 70,
    format: "webp",
  },
};

// ── Sharp optimizer function ──────────────────────────────────────────────────
export async function optimizeImage(inputPath, outputPath, type = "product") {
  const config = IMAGE_CONFIG[type] || IMAGE_CONFIG.product;

  await sharp(inputPath)
    .resize(config.width, config.height, {
      fit: "inside", // never upscale, keep aspect ratio
      withoutEnlargement: true,
    })
    .webp({ quality: config.quality, effort: 4 }) // effort 0-6, higher = smaller file but slower
    .toFile(outputPath);

  // Delete the original temp file after optimization
  fs.unlinkSync(inputPath);
}

// ── Also generate a thumbnail ─────────────────────────────────────────────────
export async function generateThumbnail(inputPath, outputDir, filename) {
  const thumbName = `thumb_${filename}`;
  const thumbPath = path.join(outputDir, thumbName);

  await sharp(inputPath)
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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export default upload;

// ── Middleware: auto-optimize images after multer saves them ──────────────────
// Drop this after any upload route to auto-process all uploaded images.
// Usage: router.post("/products", upload.array("images"), processImages, handler)

export const processImages = async (req, res, next) => {
  try {
    if (!req.files && !req.file) return next();

    const files = req.files
      ? Array.isArray(req.files)
        ? req.files // upload.array()
        : Object.values(req.files).flat() // upload.fields()
      : [req.file]; // upload.single()

    await Promise.all(
      files.map(async (file) => {
        const isImage = file.mimetype.startsWith("image/");
        if (!isImage) {
          // Move video straight to /videos, no processing needed
          const dest = path.join("./uploads/videos", file.filename);
          fs.renameSync(file.path, dest);
          file.path = dest;
          file.filename = `videos/${file.filename}`; // ← include subfolder
          return;
        }

        // Determine image type from fieldname
        const imageType = file.fieldname === "image" ? "category" : "product";

        // Output as .webp
        const webpName = file.filename.replace(/\.[^.]+$/, ".webp");
        const outputPath = path.join("./uploads/images", webpName);

        // Optimize + save
        await optimizeImage(file.path, outputPath, imageType);

        // Generate thumbnail (reads from the already-optimized webp)
        await generateThumbnail(outputPath, "./uploads/images", webpName);

        // Update file object so req.files reflects the new path/name
        file.filename = `images/${webpName}`; // ← include subfolder
        file.path = outputPath;
        file.mimetype = "image/webp";

        // Log size savings
        const outputStats = fs.statSync(outputPath);
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
