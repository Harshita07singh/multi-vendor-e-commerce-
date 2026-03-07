import Category from "../models/Category.js";
import slugify from "../utils/slugify.js";
import Vendor from "../models/Vendor.js";

async function getCurrentVendor(userId) {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) throw new Error("Vendor profile not found");
  return vendor;
}

// CREATE
export async function createCategory(req, res) {
  try {
    const { name, description, seo, image: imageUrl } = req.body;
    if (!name?.trim())
      return res.status(400).json({ message: "Category name is required" });

    let vendor;
    try {
      vendor = await getCurrentVendor(req.user.id);
    } catch (err) {
      // more explicit 404 instead of 500
      return res.status(404).json({ message: err.message });
    }

    let image;
    if (req.file) image = `/uploads/${req.file.filename}`;
    else if (imageUrl) image = imageUrl;
    else
      return res.status(400).json({ message: "Image file or URL is required" });

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
      vendor: vendor._id,
    });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({
        message: `Category with this ${Object.keys(err.keyPattern)[0]} already exists`,
      });
    if (err.name === "ValidationError")
      return res.status(400).json({
        message: Object.values(err.errors)
          .map((e) => e.message)
          .join(", "),
      });
    res.status(500).json({ message: err.message });
  }
}

// GET ALL
// ✅ Vendor logged in
// ✅ Guest/customer
export async function getCategories(req, res) {
  try {
    const { vendorId } = req.query;
    const query = { isActive: true };

    if (vendorId) {
      query.vendor = vendorId;
    } else if (req.user) {
      const vendor = await Vendor.findOne({ userId: req.user.id });
      if (vendor) query.vendor = vendor._id;
    }
    // Guest — koi filter nahi

    const categories = await Category.find(query).populate(
      "vendor",
      "businessDetails.businessName",
    );
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET SINGLE
export async function getCategory(req, res) {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!category) return res.status(404).json({ message: "Not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// UPDATE
export async function updateCategory(req, res) {
  try {
    const vendor = await getCurrentVendor(req.user.id);
    const existing = await Category.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });
    if (!existing)
      return res
        .status(404)
        .json({ message: "Category not found or not authorized" });

    const updateData = { ...req.body };
    if (req.body.name) updateData.slug = slugify(req.body.name);
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    else if (updateData.image && !req.file) delete updateData.image;

    if (typeof updateData.seo === "string" && updateData.seo.trim()) {
      try {
        updateData.seo = JSON.parse(updateData.seo);
      } catch {
        return res.status(400).json({ message: "Invalid SEO data format" });
      }
    } else if (typeof updateData.seo === "string") delete updateData.seo;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );
    res.json(category);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({
        message: `Category with this ${Object.keys(err.keyPattern)[0]} already exists`,
      });
    if (err.name === "ValidationError")
      return res.status(400).json({
        message: Object.values(err.errors)
          .map((e) => e.message)
          .join(", "),
      });
    res.status(500).json({ message: err.message });
  }
}

// DELETE
export async function deleteCategory(req, res) {
  try {
    const vendor = await getCurrentVendor(req.user.id);
    const existing = await Category.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });
    if (!existing)
      return res
        .status(404)
        .json({ message: "Category not found or not authorized" });

    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Category deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
