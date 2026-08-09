import SubCategory from "../models/SubCategory.js";
import slugify from "../utils/slugify.js";
import Vendor from "../models/Vendor.js";
import mongoose from "mongoose";
import { indexDocument, removeDocument } from "../services/SearchService.js";
// ─── Helper ───────────────────────────────────────────────────────────────────
// Returns { vendor, role }
//   • superadmin → full access
//   • admin      → full access
//   • vendor     → limited to own data
async function resolveActor(user) {
  const isSuperAdmin = user.role === "superadmin";
  const isAdmin = user.role === "admin";

  if (isSuperAdmin) return { vendor: null, role: "superadmin" };
  if (isAdmin) return { vendor: null, role: "admin" };

  const vendor = await Vendor.findOne({ userId: user.id });
  if (!vendor) throw new Error("Vendor profile not found");

  return { vendor, role: "vendor" };
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
export async function createSubCategory(req, res) {
  try {
    const rawName = req.body?.name ?? "";
    const name = typeof rawName === "string" ? rawName.trim() : rawName;
    const { category } = req.body;

    let actor;
    try {
      actor = await resolveActor(req.user);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    // Vendor → only own
    // Admin / SuperAdmin → can assign vendor or leave null
    const vendorId =
      actor.role === "vendor" ? actor.vendor._id : (req.body.vendorId ?? null);

    let image = req.body.image || "";
    if (req.file) image = `/uploads/${req.file.filename}`;

    const sub = await SubCategory.create({
      ...req.body,
      name,
      slug: slugify(name),
      category,
      image,
      vendor: vendorId,
    });
    indexDocument("subcategory", sub).catch(() => {});
    const populated = await sub.populate("category", "name slug");
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message:
          "A sub-category with this name already exists in this category",
      });
    }
    res.status(500).json({ message: err.message });
  }
}

// ─── GET ALL ──────────────────────────────────────────────────────────────────
export async function getSubCategories(req, res) {
  try {
    const { category, vendorId } = req.query;
    const filter = { isActive: true };

    if (vendorId) {
      filter.vendor = vendorId;
    } else if (req.user) {
      const actor = await resolveActor(req.user);

      if (actor.role === "vendor") {
        // ✅ Vendor ki apni + global superadmin subcategories
        filter.$or = [{ vendor: actor.vendor._id }, { vendor: null }];
      }
    }

    if (category) filter.category = category;

    const subs = await SubCategory.find(filter)
      .populate("category", "name slug")
      .populate("vendor", "businessDetails.businessName");

    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateSubCategory(req, res) {
  try {
    res.set("X-SubCategory-Update", "role-based-v4");

    let actor;
    try {
      actor = await resolveActor(req.user);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    // Vendor → only own
    // Admin / SuperAdmin → any
    const lookupQuery =
      actor.role === "vendor"
        ? { _id: req.params.id, vendor: actor.vendor._id }
        : { _id: req.params.id };

    const existing = await SubCategory.findOne(lookupQuery);
    if (!existing) {
      return res
        .status(404)
        .json({ message: "SubCategory not found or not authorized" });
    }

    const rawName = req.body?.name ?? existing.name;
    const newName = typeof rawName === "string" ? rawName.trim() : rawName;
    const newSlug = slugify(newName);

    const newCategory = req.body.category
      ? new mongoose.Types.ObjectId(req.body.category)
      : existing.category;

    const nameChanged =
      req.body.name !== undefined && existing.name !== newName;

    const categoryChanged =
      req.body.category &&
      req.body.category.toString() !== existing.category.toString();

    // Duplicate check
    if (nameChanged || categoryChanged) {
      const dupQuery = {
        _id: { $ne: new mongoose.Types.ObjectId(req.params.id) },
        slug: newSlug,
        category: newCategory,
      };

      if (actor.role === "vendor") {
        dupQuery.vendor = actor.vendor._id;
      }

      const duplicate = await SubCategory.findOne(dupQuery);

      if (duplicate) {
        return res.status(400).json({
          message: `A sub-category named "${newName}" already exists in this category`,
        });
      }
    }

    const updateData = { ...req.body };

    if (updateData.isActive !== undefined) {
      updateData.isActive =
        updateData.isActive === "true" || updateData.isActive === true;
    }

    if (req.body.name !== undefined) {
      updateData.name = newName;
      updateData.slug = newSlug;
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    delete updateData.vendorId;

    const sub = await SubCategory.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: "after",
    }).populate("category", "name slug");
    indexDocument("subCategory", SubCategory).catch(() => {});
    res.json(sub);
  } catch (err) {
    console.error("updateSubCategory error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message:
          "A sub-category with this name already exists in this category",
      });
    }

    res.status(500).json({ message: err.message });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function deleteSubCategory(req, res) {
  try {
    let actor;
    try {
      actor = await resolveActor(req.user);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    const lookupQuery =
      actor.role === "vendor"
        ? { _id: req.params.id, vendor: actor.vendor._id }
        : { _id: req.params.id };

    const existing = await SubCategory.findOne(lookupQuery);

    if (!existing) {
      return res
        .status(404)
        .json({ message: "SubCategory not found or not authorized" });
    }

    await SubCategory.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });
    removeDocument("subCategory", req.params.id).catch(() => {});
    res.json({ message: "SubCategory deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
