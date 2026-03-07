import Wishlist from "../models/Wishlist.js";

// GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products.product",
    );
    if (!wishlist) return res.json({ success: true, data: [] });
    res.json({ success: true, data: wishlist.products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/wishlist/add
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId)
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const alreadyExists = wishlist.products.some(
      (p) => p.product.toString() === productId,
    );
    if (alreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "Product already in wishlist" });
    }

    wishlist.products.push({ product: productId });
    await wishlist.save();
    await wishlist.populate("products.product");

    res.json({
      success: true,
      message: "Added to wishlist",
      data: wishlist.products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/wishlist/remove/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist)
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter(
      (p) => p.product.toString() !== productId,
    );

    await wishlist.save();
    await wishlist.populate("products.product");

    res.json({
      success: true,
      message: "Removed from wishlist",
      data: wishlist.products,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/wishlist/clear
export const clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate({ user: req.user._id }, { products: [] });
    res.json({ success: true, message: "Wishlist cleared", data: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
