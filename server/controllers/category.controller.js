import Category from "../models/Category.js";
import slugify from "../utils/slugify.js";
import Vendor from "../models/Vendor.js";
import { indexDocument, removeDocument } from "../services/SearchService.js";
// ─── Helper ───────────────────────────────────────────────────────────────────
// Returns { vendor, role }
async function resolveActor(user) {
  const isSuperAdmin = user.role === "superadmin";
  const isAdmin = user.role === "admin";

  if (isSuperAdmin) return { vendor: null, role: "superadmin" };
  if (isAdmin) return { vendor: null, role: "admin" };

  const vendor = await Vendor.findOne({ userId: user.id });
  if (!vendor) throw new Error("Vendor profile not found");

  return { vendor, role: "vendor" };
}

/**
 * Parse and validate the margin value from the request body.
 * Returns a number in [0, 100] or throws a descriptive error.
 */
function parseMargin(raw) {
  if (raw === undefined || raw === null || raw === "") return undefined; // not provided
  const val = Number(raw);
  if (isNaN(val)) throw new Error("Margin must be a valid number");
  if (val < 0 || val > 100) throw new Error("Margin must be between 0 and 100");
  return parseFloat(val.toFixed(2));
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
export async function createCategory(req, res) {
  try {
    const {
      name,
      description,
      seo,
      image: imageUrl,
      margin: rawMargin,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    let margin;
    try {
      margin = parseMargin(rawMargin);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

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

    let image;
    if (req.file) image = `/uploads/${req.file.filename}`;
    else if (imageUrl) image = imageUrl;
    else {
      return res.status(400).json({ message: "Image file or URL is required" });
    }

    let parsedSeo = seo;
    if (typeof seo === "string" && seo.trim()) {
      try {
        parsedSeo = JSON.parse(seo);
      } catch {
        return res.status(400).json({ message: "Invalid SEO data format" });
      }
    }

    const category = await Category.create({
      name,
      slug: slugify(name),
      image,
      description,
      seo: parsedSeo,
      vendor: vendorId,
      // Only set margin if provided; otherwise the schema default (0) applies
      ...(margin !== undefined && { margin }),
    });
    indexDocument("category", category).catch(() => {});
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: `Category with this ${
          Object.keys(err.keyPattern)[0]
        } already exists`,
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(err.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    res.status(500).json({ message: err.message });
  }
}

// ─── GET ALL ──────────────────────────────────────────────────────────────────
export async function getCategories(req, res) {
  try {
    const { vendorId } = req.query;
    const query = { isActive: true };

    if (vendorId) {
      // Storefront scoping
      query.vendor = vendorId;
    } else if (req.user) {
      const actor = await resolveActor(req.user);

      if (actor.role === "vendor") {
        // Vendor sees their own + superadmin's global (vendor: null) categories
        query.$or = [{ vendor: actor.vendor._id }, { vendor: null }];
      }
      // admin & superadmin → no filter (sees everything)
    }

    const categories = await Category.find(query).populate(
      "vendor",
      "businessDetails.businessName",
    );

    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── GET SINGLE ───────────────────────────────────────────────────────────────
export async function getCategory(req, res) {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export async function updateCategory(req, res) {
  try {
    let actor;
    try {
      actor = await resolveActor(req.user);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    // Vendor → only own; Admin / SuperAdmin → any
    const lookupQuery =
      actor.role === "vendor"
        ? { _id: req.params.id, vendor: actor.vendor._id }
        : { _id: req.params.id };

    const existing = await Category.findOne(lookupQuery);

    if (!existing) {
      return res
        .status(404)
        .json({ message: "Category not found or not authorized" });
    }

    const updateData = { ...req.body };

    if (req.body.name) {
      updateData.slug = slugify(req.body.name);
    }

    // ── Margin validation ──
    if (updateData.margin !== undefined) {
      try {
        updateData.margin = parseMargin(updateData.margin);
      } catch (err) {
        return res.status(400).json({ message: err.message });
      }
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (updateData.image && !req.file) {
      delete updateData.image;
    }

    if (typeof updateData.seo === "string" && updateData.seo.trim()) {
      try {
        updateData.seo = JSON.parse(updateData.seo);
      } catch {
        return res.status(400).json({ message: "Invalid SEO data format" });
      }
    } else if (typeof updateData.seo === "string") {
      delete updateData.seo;
    }

    delete updateData.vendorId;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    indexDocument("category", category).catch(() => {});
    res.json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: `Category with this ${
          Object.keys(err.keyPattern)[0]
        } already exists`,
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(err.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    res.status(500).json({ message: err.message });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function deleteCategory(req, res) {
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

    const existing = await Category.findOne(lookupQuery);

    if (!existing) {
      return res
        .status(404)
        .json({ message: "Category not found or not authorized" });
    }

    await Category.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });
    removeDocument("category", req.params.id).catch(() => {});
    res.json({ message: "Category deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
