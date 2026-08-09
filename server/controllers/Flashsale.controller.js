import FlashSale from "../models/Flashsale.model.js";
import Product from "../models/Product.js";
import Vendor from "../models/Vendor.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import {
  parsePagination,
  createPaginatedResponse,
} from "../utils/paginationHelper.js";

/* ─────────────────────────────────────────────
   ADMIN — Create a new flash sale
───────────────────────────────────────────── */
export const createFlashSale = async (req, res) => {
  try {
    const title = req.body.title;
    const description = req.body.description || "";
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const bannerColor = req.body.bannerColor || "#e63946";
    const minDiscountRequired = parseInt(req.body.minDiscountRequired) || 10;
    const displayBannerText = req.body.displayBannerText || "";
    const showOnDailySale = req.body.showOnDailySale !== "false";

    // ─── Category sale: parse targetCategories ───────────────────────────
    // FormData sends arrays as repeated fields or JSON string
    let targetCategories = [];
    if (req.body.targetCategories) {
      try {
        targetCategories = JSON.parse(req.body.targetCategories);
      } catch {
        // If it's already an array (multipart form sometimes does this)
        targetCategories = Array.isArray(req.body.targetCategories)
          ? req.body.targetCategories
          : [req.body.targetCategories];
      }
    }
    // ────────────────────────────────────────────────────────────────────

    if (!title?.trim())
      return res.status(400).json({ message: "Title is required" });
    if (!startDate || !endDate)
      return res.status(400).json({ message: "Start and end dates required" });
    if (new Date(startDate) >= new Date(endDate))
      return res
        .status(400)
        .json({ message: "End date must be after start date" });

    let bannerImage = "";
    if (req.file) bannerImage = `/uploads/${req.file.filename}`;
    else if (req.body.bannerImage) bannerImage = req.body.bannerImage;

    const sale = await FlashSale.create({
      title,
      description,
      bannerImage,
      bannerColor,
      startDate,
      endDate,
      minDiscountRequired,
      displayBannerText,
      showOnDailySale,
      targetCategories, // ← save categories
      createdBy: req.user.id,
      status: "draft",
    });

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   ADMIN — Notify all vendors (send "Join Now")
───────────────────────────────────────────── */
export const notifyVendors = async (req, res) => {
  try {
    const sale = await FlashSale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    if (sale.status !== "draft")
      return res
        .status(400)
        .json({ message: "Only draft sales can be notified" });

    const vendors = await Vendor.find({ status: "approved" }).populate(
      "userId",
      "email name",
    );

    sale.status = "notified";
    sale.notifiedAt = new Date();
    await sale.save();

    res.json({
      message: `${vendors.length} vendors notified`,
      notifiedAt: sale.notifiedAt,
      sale,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   ADMIN — Start sale (make it live)
───────────────────────────────────────────── */
export const startFlashSale = async (req, res) => {
  try {
    const sale = await FlashSale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    sale.status = "live";
    await sale.save();

    res.json({ message: "Sale is now LIVE!", sale });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   ADMIN — End / Cancel sale
───────────────────────────────────────────── */
export const endFlashSale = async (req, res) => {
  try {
    const sale = await FlashSale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    sale.status = req.body.cancel ? "cancelled" : "ended";
    await sale.save();

    res.json({ message: `Sale ${sale.status}`, sale });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   ADMIN — Get all flash sales
───────────────────────────────────────────── */
export const getAllFlashSales = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 10, 50);

    const [sales, total] = await Promise.all([
      FlashSale.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("participants.vendor", "businessDetails.businessName")
        .populate("products.vendor", "businessDetails.businessName")
        .populate("products.product", "name images price")
        .populate("targetCategories", "name"), // ← populate category names
      FlashSale.countDocuments(),
    ]);

    res.json(createPaginatedResponse(sales, total, page, limit));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────────────────────
   ADMIN — Get single flash sale detail
───────────────────────────────────────────── */
export const getFlashSaleById = async (req, res) => {
  try {
    const sale = await FlashSale.findById(req.params.id)
      .populate("participants.vendor", "businessDetails.businessName")
      .populate({
        path: "products.product",
        select: "name images price stock category subCategory",
        populate: [
          { path: "category", select: "name" },
          { path: "subCategory", select: "name" },
        ],
      })
      .populate("products.vendor", "businessDetails.businessName")
      .populate("targetCategories", "name"); // ← populate category names

    if (!sale) return res.status(404).json({ message: "Sale not found" });

    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   ADMIN — Update flash sale details
───────────────────────────────────────────── */
export const updateFlashSale = async (req, res) => {
  try {
    const sale = await FlashSale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    const updates = { ...req.body };
    if (req.file) updates.bannerImage = `/uploads/${req.file.filename}`;

    // ─── Parse targetCategories if sent ─────────────────────────────────
    if (updates.targetCategories) {
      try {
        updates.targetCategories = JSON.parse(updates.targetCategories);
      } catch {
        updates.targetCategories = Array.isArray(updates.targetCategories)
          ? updates.targetCategories
          : [updates.targetCategories];
      }
    }
    // ────────────────────────────────────────────────────────────────────

    if (updates.startDate && updates.endDate) {
      if (new Date(updates.startDate) >= new Date(updates.endDate))
        return res
          .status(400)
          .json({ message: "End date must be after start date" });
    }

    const updated = await FlashSale.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).populate("targetCategories", "name");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   ADMIN — Remove a product from sale
───────────────────────────────────────────── */
export const adminRemoveProduct = async (req, res) => {
  try {
    const sale = await FlashSale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    sale.products = sale.products.filter(
      (p) => p._id.toString() !== req.params.productEntryId,
    );
    await sale.save();

    res.json({ message: "Product removed from sale" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   VENDOR — See open/notified sales (to join)
───────────────────────────────────────────── */
export const getOpenSalesForVendors = async (req, res) => {
  try {
    const sales = await FlashSale.find({
      status: { $in: ["notified", "live"] },
      isActive: true,
      endDate: { $gt: new Date() },
    })
      .select(
        "title description startDate endDate bannerImage bannerColor status minDiscountRequired displayBannerText participants notifiedAt targetCategories",
      )
      .populate("targetCategories", "name"); // ← send category names to vendor

    const vendor = await Vendor.findOne({ userId: req.user.id });
    const vendorId = vendor?._id?.toString();

    const salesWithJoinStatus = sales.map((sale) => {
      const saleObj = sale.toJSON();
      saleObj.hasJoined = vendorId
        ? sale.participants.some(
            (p) => p.vendor.toString() === vendorId && p.status === "joined",
          )
        : false;
      return saleObj;
    });

    res.json(salesWithJoinStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   VENDOR — Join a flash sale
───────────────────────────────────────────── */
export const joinFlashSale = async (req, res) => {
  try {
    const sale = await FlashSale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    if (!["notified", "live"].includes(sale.status))
      return res.status(400).json({ message: "This sale is not open to join" });

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    if (vendor.status !== "approved")
      return res
        .status(403)
        .json({ message: "Only approved vendors can join sales" });

    const alreadyJoined = sale.participants.some(
      (p) =>
        p.vendor.toString() === vendor._id.toString() && p.status === "joined",
    );
    if (alreadyJoined)
      return res.status(400).json({ message: "Already joined this sale" });

    sale.participants.push({ vendor: vendor._id, status: "joined" });
    await sale.save();

    res.json({ message: "Successfully joined the sale!", sale });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   VENDOR — Add product to a flash sale
───────────────────────────────────────────── */
export const addProductToSale = async (req, res) => {
  try {
    const { productId, salePrice } = req.body;
    const sale = await FlashSale.findById(req.params.id).populate(
      "targetCategories",
      "_id name",
    );
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    if (!["notified", "live"].includes(sale.status))
      return res
        .status(400)
        .json({ message: "Cannot add products to this sale" });

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    // Check vendor has joined
    const hasJoined = sale.participants.some(
      (p) =>
        p.vendor.toString() === vendor._id.toString() && p.status === "joined",
    );
    if (!hasJoined)
      return res
        .status(403)
        .json({ message: "You must join the sale before adding products" });

    // Validate product belongs to vendor
    const product = await Product.findOne({
      _id: productId,
      vendor: vendor._id,
      isDeleted: false,
      isActive: true,
    }).populate("category", "_id name");

    if (!product)
      return res
        .status(404)
        .json({ message: "Product not found or not yours" });

    // ─── Category restriction check ──────────────────────────────────────
    // If the sale has targetCategories, product's category must be in that list
    if (sale.targetCategories && sale.targetCategories.length > 0) {
      const allowedCategoryIds = sale.targetCategories.map((c) =>
        c._id.toString(),
      );
      const productCategoryId = product.category?._id?.toString();

      if (
        !productCategoryId ||
        !allowedCategoryIds.includes(productCategoryId)
      ) {
        const allowedNames = sale.targetCategories
          .map((c) => c.name)
          .join(", ");
        return res.status(400).json({
          message: `This sale is only for: ${allowedNames}. Your product's category is not eligible.`,
        });
      }
    }
    // ────────────────────────────────────────────────────────────────────

    // Validate sale price
    if (!salePrice || salePrice >= product.price)
      return res
        .status(400)
        .json({ message: "Sale price must be less than original price" });

    const discountPercent = Math.round(
      ((product.price - salePrice) / product.price) * 100,
    );

    if (discountPercent < sale.minDiscountRequired)
      return res.status(400).json({
        message: `Minimum ${sale.minDiscountRequired}% discount required for this sale`,
      });

    // Check if product already added
    const alreadyAdded = sale.products.some(
      (p) => p.product.toString() === productId,
    );
    if (alreadyAdded)
      return res
        .status(400)
        .json({ message: "Product already added to this sale" });

    sale.products.push({
      product: productId,
      vendor: vendor._id,
      salePrice: Number(salePrice),
      originalPrice: product.price,
      discountPercent,
      stock: product.stock,
    });

    await sale.save();

    res.json({ message: "Product added to sale!", sale });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   VENDOR — Remove product from flash sale
───────────────────────────────────────────── */
export const removeProductFromSale = async (req, res) => {
  try {
    const sale = await FlashSale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    if (sale.status === "live")
      return res
        .status(400)
        .json({ message: "Cannot remove products from a live sale" });

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const productEntry = sale.products.find(
      (p) =>
        p._id.toString() === req.params.productEntryId &&
        p.vendor.toString() === vendor._id.toString(),
    );
    if (!productEntry)
      return res
        .status(404)
        .json({ message: "Product entry not found or not yours" });

    sale.products = sale.products.filter(
      (p) => p._id.toString() !== req.params.productEntryId,
    );
    await sale.save();

    res.json({ message: "Product removed from sale" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   VENDOR — Get my products in a sale
───────────────────────────────────────────── */
export const getMyProductsInSale = async (req, res) => {
  try {
    const sale = await FlashSale.findById(req.params.id).populate(
      "products.product",
      "name images price stock",
    );
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    const vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const myProducts = sale.products.filter(
      (p) => p.vendor.toString() === vendor._id.toString(),
    );

    res.json({ saleId: sale._id, title: sale.title, products: myProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   PUBLIC — Get live sales for DailySale page
───────────────────────────────────────────── */
export const getLiveSales = async (req, res) => {
  try {
    const now = new Date();
    const sales = await FlashSale.find({
      status: "live",
      isActive: true,
      showOnDailySale: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate({
        path: "products.product",
        select: "name images price stock category subCategory slug",
        populate: [
          { path: "category", select: "name" },
          { path: "subCategory", select: "name" },
        ],
      })
      .populate("products.vendor", "businessDetails.businessName")
      .populate("targetCategories", "name") // ← for public banner display
      .sort({ startDate: -1 });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   PUBLIC — Get all categories (for admin picker)
   Route: GET /api/categories  (use your existing categories route)
   This is just a helper — no new route needed here.
───────────────────────────────────────────── */
