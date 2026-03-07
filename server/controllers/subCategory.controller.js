import SubCategory from "../models/SubCategory.js";
import slugify from "../utils/slugify.js";
import Vendor from "../models/Vendor.js";

async function getCurrentVendor(userId) {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) throw new Error("Vendor profile not found");
  return vendor;
}

export async function createSubCategory(req, res) {
  try {
    const { name, category } = req.body;
    const vendor = await getCurrentVendor(req.user.id);

    let image = req.body.image || "";
    if (req.file) image = `/uploads/${req.file.filename}`;

    const sub = await SubCategory.create({
      ...req.body,
      slug: slugify(name),
      category,
      image,
      vendor: vendor._id,
    });
    const populated = await sub.populate("category", "name slug");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET ALL
// ✅ Vendor logged in → sirf uski subcategories
// ✅ Guest/customer → sab subcategories
export async function getSubCategories(req, res) {
  try {
    const { category, vendorId } = req.query;
    const filter = { isActive: true };

    if (vendorId) {
      filter.vendor = vendorId;
    } else if (req.user) {
      const vendor = await Vendor.findOne({ userId: req.user.id });
      if (vendor) filter.vendor = vendor._id;
    }
    // Guest — koi filter nahi

    if (category) filter.category = category;

    const subs = await SubCategory.find(filter)
      .populate("category", "name slug")
      .populate("vendor", "businessDetails.businessName");
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateSubCategory(req, res) {
  try {
    const vendor = await getCurrentVendor(req.user.id);
    const existing = await SubCategory.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });
    if (!existing)
      return res
        .status(404)
        .json({ message: "SubCategory not found or not authorized" });

    const updateData = { ...req.body };
    if (req.body.name) updateData.slug = slugify(req.body.name);
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const sub = await SubCategory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("category", "name slug");
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteSubCategory(req, res) {
  try {
    const vendor = await getCurrentVendor(req.user.id);
    const existing = await SubCategory.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });
    if (!existing)
      return res
        .status(404)
        .json({ message: "SubCategory not found or not authorized" });

    await SubCategory.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "SubCategory deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
