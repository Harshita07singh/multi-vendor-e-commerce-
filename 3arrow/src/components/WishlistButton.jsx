import { useState } from "react";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setWishlistFromBackend,
  addToWishlist,
  removeFromWishlist,
} from "../redux/wishlistSlice"; // ✅ addToWishlist import kiya
import { wishlistAPI } from "../services/api";
import toast from "react-hot-toast";

export default function WishlistButton({
  productId,
  product, // ✅ guest ke liye poora product object chahiye
  size = 20,
  className = "",
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const { isLoggedIn } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
  const isWishlisted = wishlistItems.some(
    (item) => item.id === productId || item._id === productId,
  );

  const toggle = async (e) => {
    e.stopPropagation();

    // ✅ Guest flow — no login needed, direct localStorage mein save
    if (!isLoggedIn) {
      if (isWishlisted) {
        dispatch(removeFromWishlist(productId));
        toast.success("Removed from wishlist");
      } else {
        dispatch(
          addToWishlist({
            id: productId,
            _id: productId,
            title: product?.name || product?.title || "",
            image: product?.image || product?.images?.[0]?.url || "",
            newPrice: product?.price ? `₹${product.price}` : "",
            price: product?.price || 0,
            rating: product?.ratingsAverage ?? product?.rating ?? 0,
            reviews: product?.ratingsCount ?? product?.reviews ?? 0,
            category: product?.category?.name ?? product?.category ?? "",
            slug: product?.slug || "",
            stock: product?.stock || 99,
          }),
        );
        toast.success("Added to wishlist ❤️");
      }
      return;
    }

    // ✅ Logged-in flow — backend sync
    setLoading(true);
    try {
      if (isWishlisted) {
        const res = await wishlistAPI.removeFromWishlist(productId);
        if (res.success) {
          dispatch(removeFromWishlist(productId));
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await wishlistAPI.addToWishlist(productId);
        if (res.success) {
          dispatch(setWishlistFromBackend(res.data));
          toast.success("Added to wishlist ❤️");
        } else {
          toast.error(res.message);
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`transition-transform hover:scale-110 disabled:opacity-50 ${className}`}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={size}
        className={`transition-colors ${
          isWishlisted
            ? "fill-red-500 text-red-500"
            : "text-gray-400 hover:text-red-400"
        }`}
      />
    </button>
  );
}
