import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import Vendor from "../models/Vendor.js";

// Helper function to get vendor from user
async function getCurrentVendor(userId) {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) throw new Error("Vendor profile not found");
  return vendor;
}

// ── POST /api/coupons/validate ──────────────
export const validateCoupon = async (req, res) => {
  try {
    const { code, productId, cartTotal = 0 } = req.body;
    const userId = req.user?._id;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon || !coupon.isActive) {
      return res
        .status(404)
        .json({ message: "Invalid or expired coupon code" });
    }

    const now = new Date();
    if (now < coupon.startDate) {
      return res.status(400).json({ message: "This coupon is not active yet" });
    }
    if (now > coupon.expiryDate) {
      return res.status(400).json({ message: "This coupon has expired" });
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res
        .status(400)
        .json({ message: "This coupon has reached its usage limit" });
    }

    if (userId) {
      const userUsage = coupon.usedBy.find(
        (entry) => entry.user.toString() === userId.toString(),
      );
      if (userUsage && userUsage.count >= coupon.perUserLimit) {
        return res.status(400).json({
          message: `You have already used this coupon ${coupon.perUserLimit} time(s)`,
        });
      }
    }

    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
      });
    }

    if (productId) {
      const product = await Product.findById(productId).lean();

      if (coupon.applicableProducts.length > 0) {
        const isApplicable = coupon.applicableProducts
          .map((id) => id.toString())
          .includes(productId.toString());
        if (!isApplicable) {
          return res.status(400).json({
            message: "This coupon is not applicable for this product",
          });
        }
      }

      if (coupon.applicableCategories.length > 0 && product?.category) {
        const isApplicable = coupon.applicableCategories
          .map((id) => id.toString())
          .includes(product.category.toString());
        if (!isApplicable) {
          return res.status(400).json({
            message:
              "This coupon is not applicable for this product's category",
          });
        }
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round(cartTotal * (coupon.discountValue / 100));
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, cartTotal);
    }

    return res.status(200).json({
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        discountAmount,
      },
    });
  } catch (err) {
    console.error("validateCoupon error:", err);
    res.status(500).json({ message: "Server error while validating coupon" });
  }
};

// ── POST /api/coupons/apply ─────────────────
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user?._id;

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    coupon.usageCount += 1;

    if (userId) {
      const userEntry = coupon.usedBy.find(
        (e) => e.user.toString() === userId.toString(),
      );
      if (userEntry) {
        userEntry.count += 1;
      } else {
        coupon.usedBy.push({ user: userId, count: 1 });
      }
    }

    await coupon.save();
    return res.status(200).json({ message: "Coupon usage recorded" });
  } catch (err) {
    console.error("applyCoupon error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/coupons ────────────────────────
// Returns coupons based on user role:
// - Admin: all coupons
// - Vendor: only their own coupons
// - Customer/Guest: only active coupons (for validation)
export const getAllCoupons = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    // If vendor, only show their own coupons
    if (user && user.role === "vendor") {
      const vendor = await Vendor.findOne({ userId: user.id });
      if (vendor) {
        query.vendor = vendor._id;
      }
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    res.status(200).json({ coupons });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/coupons (vendor: create) ───────
export const createCoupon = async (req, res) => {
  try {
    // Get vendor from user
    const vendor = await getCurrentVendor(req.user.id);

    const couponData = {
      ...req.body,
      vendor: vendor._id,
    };

    const coupon = new Coupon(couponData);
    await coupon.save();
    res.status(201).json({ message: "Coupon created", coupon });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── PATCH /api/coupons/:id ───────────────────
export const updateCoupon = async (req, res) => {
  try {
    const user = req.user;

    // If vendor, ensure they can only update their own coupons
    if (user && user.role === "vendor") {
      const vendor = await Vendor.findOne({ userId: user.id });
      if (vendor) {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
          return res.status(404).json({ message: "Coupon not found" });
        }
        if (coupon.vendor.toString() !== vendor._id.toString()) {
          return res
            .status(403)
            .json({ message: "Not authorized to update this coupon" });
        }
      }
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json({ message: "Coupon updated", coupon });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE /api/coupons/:id ──────────────────
export const deleteCoupon = async (req, res) => {
  try {
    const user = req.user;

    // If vendor, ensure they can only delete their own coupons
    if (user && user.role === "vendor") {
      const vendor = await Vendor.findOne({ userId: user.id });
      if (vendor) {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
          return res.status(404).json({ message: "Coupon not found" });
        }
        if (coupon.vendor.toString() !== vendor._id.toString()) {
          return res
            .status(403)
            .json({ message: "Not authorized to delete this coupon" });
        }
      }
    }

    await Coupon.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
