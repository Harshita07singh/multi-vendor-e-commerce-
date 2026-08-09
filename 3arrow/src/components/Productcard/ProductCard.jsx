import React, { useState } from "react";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import {
  setWishlistFromBackend,
  removeFromWishlist,
} from "../../redux/wishlistSlice";
import { useNavigate } from "react-router-dom";
import { cartAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { isLoggedIn } = useSelector((state) => state.auth);

  const isInWishlist = wishlistItems.some((item) => item.id === product.id);

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      const response = await cartAPI.addToCart(product.id || product._id, 1);

      if (response.success) {
        dispatch(addToCart(product));
        toast.success("Product added to cart!");
        navigate("/cart");
      } else {
        toast.error(response.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      dispatch(addToCart(product));
      toast.success("Product added to cart!");
      navigate("/cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(setWishlistFromBackend([product]));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-green-600 transition-all cursor-pointer relative">
      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className={`absolute top-1.5 left-1.5 lg:top-2 lg:left-2 w-6 h-6 lg:w-7 lg:h-7 rounded-full shadow-md flex items-center justify-center z-20 transition-all 
        ${
          isInWishlist
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-white text-gray-600 hover:bg-gray-100"
        }`}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`w-3 h-3 lg:w-3.5 lg:h-3.5 transition-all ${isInWishlist ? "fill-white" : ""}`}
        />
      </button>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 bg-green-500 text-white p-1 lg:px-2 lg:py-1 rounded-md flex items-center gap-0.5 text-[9px] lg:text-xs font-medium transition-colors z-20 shadow-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Add to cart"
      >
        <span className="hidden lg:inline">
          {isLoading ? "Adding..." : "Add"}
        </span>
        <ShoppingCart className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
      </button>

      {/* Product Image */}
      <div className="relative p-1 lg:p-2">
        <div className="flex justify-center items-center h-16 lg:h-32 mb-1 lg:mb-2 rounded-md overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-contain p-0.5 lg:p-1"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="px-1.5 lg:px-3 pb-1.5 lg:pb-3 space-y-0.5 lg:space-y-1">
        {/* Price */}
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-gray-400 line-through text-[9px] lg:text-xs">
            {product.oldPrice}
          </span>
          <span className="text-xs lg:text-base font-bold text-gray-900">
            {product.newPrice}
          </span>
          <span className="text-gray-500 text-[9px] lg:text-xs">/Qty</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-0.5">
          <span className="text-gray-900 font-semibold text-[9px] lg:text-xs">
            {product.rating}
          </span>
          <Star className="w-2 h-2 lg:w-3 lg:h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-gray-500 text-[9px] lg:text-xs">
            ({product.reviews})
          </span>
        </div>

        {/* Title */}
        <h3 className="text-gray-900 font-medium text-[10px] lg:text-sm leading-tight line-clamp-2 min-h-[1.5rem] lg:min-h-[2rem]">
          {product.title}
        </h3>
      </div>
    </div>
  );
}
