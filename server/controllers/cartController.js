import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Helper: get discounted price from product
const getEffectivePrice = (product) => {
  if (product.discount > 0) {
    return Math.round(product.price * (1 - product.discount / 100));
  }
  return product.price;
};

// ─────────────────────────────────────────────
// GET /api/cart
// ─────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "name price discount images slug stock",
    });

    if (!cart) {
      return res
        .status(200)
        .json({ success: true, data: { items: [], totalPrice: 0 } });
    }

    // Filter out items whose product got deleted
    const validItems = cart.items.filter((item) => item.product !== null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/cart/add
// Body: { productId, quantity }
// ─────────────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.stock < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Product is out of stock" });
    }

    const price = getEffectivePrice(product);

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity, price }],
      });
    } else {
      const existingIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId,
      );

      if (existingIndex > -1) {
        // Item exists — increase quantity
        const newQty = cart.items[existingIndex].quantity + quantity;

        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} units available`,
          });
        }

        cart.items[existingIndex].quantity = newQty;
        cart.items[existingIndex].price = price; // refresh price
      } else {
        // New item
        if (quantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} units available`,
          });
        }
        cart.items.push({ product: productId, quantity, price });
      }

      await cart.save();
    }

    await cart.populate({
      path: "items.product",
      select: "name price discount images slug stock",
    });

    res
      .status(200)
      .json({ success: true, message: "Item added to cart", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// PUT /api/cart/update
// Body: { itemId, quantity }   (itemId = cart item _id)
// ─────────────────────────────────────────────
export const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    if (!itemId || quantity === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "itemId and quantity are required" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId,
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Validate against stock
      const product = await Product.findById(cart.items[itemIndex].product);
      if (product && quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available`,
        });
      }
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate({
      path: "items.product",
      select: "name price discount images slug stock",
    });

    res
      .status(200)
      .json({ success: true, message: "Cart updated", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/cart/remove/:itemId
// ─────────────────────────────────────────────
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId,
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res
      .status(200)
      .json({ success: true, message: "Item removed from cart", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/cart/clear
// ─────────────────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res
        .status(200)
        .json({ success: true, message: "Cart already empty" });
    }

    cart.items = [];
    await cart.save();

    res
      .status(200)
      .json({ success: true, message: "Cart cleared", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
