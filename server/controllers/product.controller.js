import Product from "../models/Product.js";
import slugify from "../utils/slugify.js";
import Vendor from "../models/Vendor.js";
import { indexDocument, removeDocument } from "../services/SearchService.js";
// ─── Helper: resolve vendor OR bypass for admin/superAdmin ───────
async function resolveActor(user) {
  const isAdmin = user.role === "admin" || user.role === "superadmin";
  if (isAdmin) return { vendor: null, isAdmin: true };

  const vendor = await Vendor.findOne({ userId: user.id });
  if (!vendor) throw new Error("Vendor profile not found");
  return { vendor, isAdmin: false };
}

// ─── Haversine distance (km) ─────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Compute the full pricing breakdown for a product given its category margin.
 *
 * All currency values are in the same unit as price/mrp/costPrice.
 *
 * @param {object} p          – Plain product object (after .toObject() or lean())
 * @param {number} catMargin  – Category margin % (0-100)
 * @returns {object}          – Pricing breakdown
 */
export function computePricingBreakdown(p, catMargin = 0) {
  const mrp = Number(p.mrp) || 0;
  const price = Number(p.price) || 0;
  const costPrice = Number(p.costPrice) || 0;
  const gst = Number(p.gst) || 0;

  const discountPct = mrp > 0 ? ((mrp - price) / mrp) * 100 : 0;
  const platformCommission = price * (catMargin / 100);
  const vendorEarnings = price - platformCommission;
  const gstAmount = price * (gst / 100);
  const priceExcludingGst = price - gstAmount;
  const grossProfit = price - costPrice;
  const netProfit = grossProfit - platformCommission;
  const netProfitMargin = price > 0 ? (netProfit / price) * 100 : 0;

  return {
    mrp: +mrp.toFixed(2),
    price: +price.toFixed(2),
    costPrice: +costPrice.toFixed(2),
    discountPct: +discountPct.toFixed(2),
    categoryMarginPct: +catMargin.toFixed(2),
    platformCommission: +platformCommission.toFixed(2),
    vendorEarnings: +vendorEarnings.toFixed(2),
    gst,
    gstAmount: +gstAmount.toFixed(2),
    priceExcludingGst: +priceExcludingGst.toFixed(2),
    grossProfit: +grossProfit.toFixed(2),
    netProfit: +netProfit.toFixed(2),
    netProfitMargin: +netProfitMargin.toFixed(2),
  };
}

/**
 * Validate that MRP, price, and costPrice are logically consistent.
 * Returns an error message string, or null if valid.
 */
function validatePricing(mrp, price, costPrice) {
  if (mrp == null || isNaN(Number(mrp)) || Number(mrp) < 0)
    return "MRP is required and must be a non-negative number";
  if (price == null || isNaN(Number(price)) || Number(price) < 0)
    return "Price is required and must be a non-negative number";
  if (Number(price) > Number(mrp)) return "Selling price cannot exceed MRP";
  if (costPrice != null && !isNaN(Number(costPrice)) && Number(costPrice) < 0)
    return "Cost price cannot be negative";
  return null;
}

// ════════════════════════════════════════════════════════════════
//  CREATE PRODUCT
// ════════════════════════════════════════════════════════════════
export const createProduct = async (req, res) => {
  try {
    let actor;
    try {
      actor = await resolveActor(req.user);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    // Validate pricing
    const pricingError = validatePricing(
      req.body.mrp,
      req.body.price,
      req.body.costPrice,
    );
    if (pricingError) return res.status(400).json({ message: pricingError });

    // Admin: can pass vendorId in body to attach to a specific vendor
    const vendorId = actor.isAdmin
      ? (req.body.vendorId ?? null)
      : actor.vendor._id;

    // discount is computed by the pre-save hook; strip it from body to avoid conflict
    const { discount: _d, ...bodyWithoutDiscount } = req.body;

    const productData = {
      ...bodyWithoutDiscount,
      slug: slugify(req.body.name),
      vendor: vendorId,
      mrp: Number(req.body.mrp),
      price: Number(req.body.price),
      costPrice: req.body.costPrice != null ? Number(req.body.costPrice) : 0,
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
    indexDocument("product", product).catch(() => {});
    // Populate category so the response includes margin & pricingBreakdown
    const populated = await Product.findById(product._id).populate(
      "category",
      "name slug margin",
    );
    const breakdown = computePricingBreakdown(
      populated.toObject(),
      populated.category?.margin ?? 0,
    );

    res
      .status(201)
      .json({ ...populated.toObject(), pricingBreakdown: breakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
//  GET PRODUCTS
// ════════════════════════════════════════════════════════════════
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
      lat,
      lng,
      radiusKm = 50,
    } = req.query;

    const query = { isDeleted: false, isActive: true };

    if (vendorId) {
      query.vendor = vendorId;
    } else if (req.user) {
      const isAdmin =
        req.user.role === "admin" || req.user.role === "superadmin";

      if (!isAdmin) {
        const vendor = await Vendor.findOne({ userId: req.user.id });
        if (vendor) {
          query.vendor = vendor._id;
        } else {
          return res.json({ total: 0, page: 1, pages: 0, products: [] });
        }
      }
    }

    // ── Geo filter ──
    if (lat != null && lng != null && !query.vendor) {
      const customerLat = parseFloat(lat);
      const customerLng = parseFloat(lng);
      const radius = Math.min(500, Math.max(5, Number(radiusKm) || 50));

      if (!isNaN(customerLat) && !isNaN(customerLng)) {
        const vendors = await Vendor.find({
          status: "approved",
          "shippingLocations.latitude": { $exists: true, $ne: null },
          "shippingLocations.longitude": { $exists: true, $ne: null },
        }).select("_id shippingLocations");

        const nearbyVendorIds = vendors
          .filter((v) => {
            const vLat = parseFloat(v.shippingLocations?.latitude);
            const vLng = parseFloat(v.shippingLocations?.longitude);
            if (isNaN(vLat) || isNaN(vLng)) return false;
            return haversineKm(customerLat, customerLng, vLat, vLng) <= radius;
          })
          .map((v) => v._id);

        query.vendor =
          nearbyVendorIds.length > 0 ? { $in: nearbyVendorIds } : { $in: [] };
      }
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
      .populate("category", "name slug margin") // ← include margin
      .populate("subCategory", "name slug")
      .populate("vendor", "businessDetails.businessName")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    // Attach pricingBreakdown to each product
    const enriched = products.map((p) => {
      const obj = p.toObject();
      obj.pricingBreakdown = computePricingBreakdown(
        obj,
        p.category?.margin ?? 0,
      );
      return obj;
    });

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products: enriched,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
//  GET SINGLE PRODUCT
// ════════════════════════════════════════════════════════════════
export const getProduct = async (req, res) => {
  try {
    const { id, slug } = req.params;
    const param = id || slug;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(param);

    const product = await Product.findOne(
      isObjectId
        ? { _id: param, isDeleted: false }
        : { slug: param, isDeleted: false },
    )
      .populate("category", "name slug margin")
      .populate("subCategory", "name slug");

    if (!product) return res.status(404).json({ message: "Not found" });

    const obj = product.toObject();
    obj.pricingBreakdown = computePricingBreakdown(
      obj,
      product.category?.margin ?? 0,
    );

    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
//  UPDATE PRODUCT
// ════════════════════════════════════════════════════════════════
export const updateProduct = async (req, res) => {
  try {
    let actor;
    try {
      actor = await resolveActor(req.user);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    const lookupQuery = actor.isAdmin
      ? { _id: req.params.id }
      : { _id: req.params.id, vendor: actor.vendor._id };

    const existing = await Product.findOne(lookupQuery);
    if (!existing)
      return res
        .status(404)
        .json({ message: "Product not found or not authorized" });

    // Validate pricing if either mrp or price is being updated
    const newMrp = req.body.mrp !== undefined ? req.body.mrp : existing.mrp;
    const newPrice =
      req.body.price !== undefined ? req.body.price : existing.price;
    const newCostPrice =
      req.body.costPrice !== undefined
        ? req.body.costPrice
        : existing.costPrice;

    const pricingError = validatePricing(newMrp, newPrice, newCostPrice);
    if (pricingError) return res.status(400).json({ message: pricingError });

    // discount is derived; strip it from the update body
    const { discount: _d, ...bodyWithoutDiscount } = req.body;

    const updateData = {
      ...bodyWithoutDiscount,
      ...(req.body.mrp !== undefined && { mrp: Number(req.body.mrp) }),
      ...(req.body.price !== undefined && { price: Number(req.body.price) }),
      ...(req.body.costPrice !== undefined && {
        costPrice: Number(req.body.costPrice),
      }),
    };

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
          ids.includes(img._id?.toString()),
        );
      } catch {}
    }
    updateData.images = images;

    if (req.files?.video?.length > 0)
      updateData.videoUrl = `/uploads/${req.files.video[0].filename}`;

    // Prevent accidentally changing the vendor field
    delete updateData.vendorId;
    delete updateData.vendor;

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("category", "name slug margin");
    indexDocument("product", product).catch(() => {});
    const obj = product.toObject();
    obj.pricingBreakdown = computePricingBreakdown(
      obj,
      product.category?.margin ?? 0,
    );

    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ════════════════════════════════════════════════════════════════
//  DELETE PRODUCT
// ════════════════════════════════════════════════════════════════
export const deleteProduct = async (req, res) => {
  try {
    let actor;
    try {
      actor = await resolveActor(req.user);
    } catch (err) {
      return res.status(404).json({ message: err.message });
    }

    const lookupQuery = actor.isAdmin
      ? { _id: req.params.id }
      : { _id: req.params.id, vendor: actor.vendor._id };

    const product = await Product.findOne(lookupQuery);
    if (!product)
      return res
        .status(404)
        .json({ message: "Product not found or not authorized" });

    await Product.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      isActive: false,
    });
    removeDocument("product", req.params.id).catch(() => {});
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
