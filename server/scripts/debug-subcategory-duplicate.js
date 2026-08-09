import mongoose from "mongoose";
import dotenv from "dotenv";
import SubCategory from "../models/SubCategory.js";

dotenv.config();

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error("Usage: node scripts/debug-subcategory-duplicate.js <subCategoryId>");
    process.exit(1);
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Missing MONGO_URI in environment.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  try {
    const existing = await SubCategory.findById(id).lean();
    if (!existing) {
      console.log("SubCategory not found:", id);
      return;
    }

    console.log("Existing:");
    console.log({
      _id: existing._id,
      name: existing.name,
      slug: existing.slug,
      category: existing.category,
      vendor: existing.vendor,
      isActive: existing.isActive,
    });

    const dupes = await SubCategory.find({
      _id: { $ne: existing._id },
      vendor: existing.vendor,
      category: existing.category,
      slug: existing.slug,
    })
      .select("_id name slug category vendor isActive")
      .lean();

    console.log("Duplicates (same vendor+category+slug, excluding current):", dupes.length);
    console.log(dupes);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

