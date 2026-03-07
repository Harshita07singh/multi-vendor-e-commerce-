import Product from "../models/Product.js";
import slugify from "../utils/slugify.js";
import Vendor from "../models/Vendor.js";

async function getCurrentVendor(userId) {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) throw new Error("Vendor profile not found");
  return vendor;
}

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const vendor = await getCurrentVendor(req.user.id);

    const productData = {
      ...req.body,
      slug: slugify(req.body.name),
      vendor: vendor._id,
    };

    if (req.body.tags && typeof req.body.tags === "string") {
      try {
        productData.tags = JSON.parse(req.body.tags);
      } catch {
        productData.tags = [];
      }
    }
    if (req.body.customFields && typeof req.body.customFields === "string") {
      try {
        productData.customFields = JSON.parse(req.body.customFields);
      } catch {
        productData.customFields = [];
      }
    } else {
      productData.customFields = [];
    }
    if (req.files?.images?.length > 0) {
      productData.images = req.files.images.map((file) => ({
        url: `/uploads/${file.filename}`,
        altText: req.body.altText || req.body.name,
      }));
    }
    if (req.files?.video?.length > 0) {
      productData.videoUrl = `/uploads/${req.files.video[0].filename}`;
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PRODUCTS
// ✅ Agar vendor logged in hai → sirf uska data
// ✅ Agar customer/guest hai → sab products (public)
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      subCategory,
      minPrice,
      maxPrice,
      search,
      vendorId,
    } = req.query;

    const query = { isDeleted: false, isActive: true };

    if (vendorId) {
      // Specific vendorId query param
      query.vendor = vendorId;
    } else if (req.user) {
      // Logged-in
      const vendor = await Vendor.findOne({ userId: req.user.id });
      if (vendor) query.vendor = vendor._id;
    }

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };

    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .populate("vendor", "businessDetails.businessName")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE PRODUCT
export const getProduct = async (req, res) => {
  try {
    const { id, slug } = req.params;
    const param = id || slug;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(param);

    let product;
    if (isObjectId) {
      product = await Product.findOne({
        _id: param,
        isDeleted: false,
      }).populate("category subCategory");
    } else {
      product = await Product.findOne({
        slug: param,
        isDeleted: false,
      }).populate("category subCategory");
    }

    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const vendor = await getCurrentVendor(req.user.id);
    const existing = await Product.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });
    if (!existing)
      return res
        .status(404)
        .json({ message: "Product not found or not authorized" });

    const updateData = { ...req.body };
    if (req.body.name) updateData.slug = slugify(req.body.name);
    if (req.body.tags && typeof req.body.tags === "string") {
      try {
        updateData.tags = JSON.parse(req.body.tags);
      } catch {
        updateData.tags = [];
      }
    }
    if (req.body.customFields && typeof req.body.customFields === "string") {
      try {
        updateData.customFields = JSON.parse(req.body.customFields);
      } catch {
        updateData.customFields = [];
      }
    } else if (req.body.customFields === undefined) {
      delete updateData.customFields;
    }

    let images = existing.images || [];
    if (req.files?.images?.length > 0) {
      images = req.files.images.map((file) => ({
        url: `/uploads/${file.filename}`,
        altText: req.body.altText || req.body.name,
      }));
    } else if (req.body.existingImages) {
      try {
        const ids = JSON.parse(req.body.existingImages);
        images = existing.images.filter((img) =>
          ids.includes(img._id.toString()),
        );
      } catch {}
    }
    updateData.images = images;
    if (req.files?.video?.length > 0)
      updateData.videoUrl = `/uploads/${req.files.video[0].filename}`;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const vendor = await getCurrentVendor(req.user.id);
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: vendor._id,
    });
    if (!product)
      return res
        .status(404)
        .json({ message: "Product not found or not authorized" });

    await Product.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      isActive: false,
    });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
