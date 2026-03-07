import fs from "fs";
import path from "path";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

export const uploadsCompat = (req, res, next) => {
  // req.path here is everything after "/uploads", e.g. "/foo.webp"
  const requestedPath = req.path; // e.g. "/foo.webp" or "/images/foo.webp"

  // If path already has a subfolder prefix, let express.static handle it
  if (
    requestedPath.startsWith("/images/") ||
    requestedPath.startsWith("/videos/") ||
    requestedPath.startsWith("/temp/")
  ) {
    return next();
  }

  // Bare filename — try to find it in images/ or videos/ subfolder
  const filename = requestedPath.replace(/^\//, ""); // strip leading slash
  const ext = path.extname(filename).toLowerCase();

  const videoExts = [".mp4", ".webm", ".mov", ".avi", ".mkv"];
  const isVideo = videoExts.includes(ext);

  const subFolder = isVideo ? "videos" : "images";
  const candidatePath = path.join(UPLOADS_ROOT, subFolder, filename);

  if (fs.existsSync(candidatePath)) {
    // Rewrite the URL and let express.static serve the correct file
    req.url = `/${subFolder}/${filename}`;
  }

  next();
};
