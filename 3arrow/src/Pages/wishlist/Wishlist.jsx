import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCartFromBackend } from "../../redux/cartSlice";
import {
  setWishlistFromBackend,
  removeFromWishlist,
} from "../../redux/wishlistSlice";
import {
  Heart,
  ShoppingCart,
  X,
  Star,
  Truck,
  Shield,
  Headphones,
  CreditCard,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import FeaturesGrid from "../../components/FeaturesGrid";
import { cartAPI, wishlistAPI } from "../../services/api";
import toast from "react-hot-toast";
import { addToCart } from "../../redux/cartSlice"; // ✅ for guest cart

export default function Wishlist() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingIds, setLoadingIds] = useState({});
  const [removingIds, setRemovingIds] = useState({});

  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { isLoggedIn } = useSelector((state) => state.auth);

  const features = [
    {
      icon: <Truck size={24} className="text-white" />,
      title: "Free Delivery",
      description: "For all orders over ₹50",
    },
    {
      icon: <Shield size={24} className="text-white" />,
      title: "Secure Payment",
      description: "100% secure transaction",
    },
    {
      icon: <Headphones size={24} className="text-white" />,
      title: "24/7 Support",
      description: "Dedicated customer support",
    },
    {
      icon: <CreditCard size={24} className="text-white" />,
      title: "Easy Returns",
      description: "30-day return policy",
    },
  ];

  // ── Remove from Wishlist ──
  // Guest: remove from Redux (saved in localStorage)
  // Logged-in: sync with backend
  const handleRemove = async (itemId) => {
    setRemovingIds((prev) => ({ ...prev, [itemId]: true }));
    try {
      if (isLoggedIn) {
        const res = await wishlistAPI.removeFromWishlist(itemId);
        if (res.success) {
          dispatch(removeFromWishlist(itemId));
          toast.success("Removed from wishlist");
        } else {
          toast.error(res.message || "Failed to remove from wishlist");
        }
      } else {
        // ✅ Guest: just remove from Redux/localStorage
        dispatch(removeFromWishlist(itemId));
        toast.success("Removed from wishlist");
      }
    } catch (err) {
      console.error("Remove wishlist error:", err);
      toast.error("Failed to remove from wishlist");
    } finally {
      setRemovingIds((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // ── Move to Cart ──
  // Guest: move to guest cart (localStorage)
  // Logged-in: sync with backend
  const handleMoveToCart = async (item) => {
    const itemId = item._id || item.id;

    // ✅ Guest flow — no login needed, add to local cart
    if (!isLoggedIn) {
      dispatch(
        addToCart({
          id: itemId,
          productId: itemId,
          title: item.title,
          name: item.title,
          image: item.image,
          price: item.price,
          oldPrice: item.oldPrice,
          rating: item.rating,
          reviews: item.reviews,
          stock: item.stock || 99,
          slug: item.slug,
          quantity: 1,
        }),
      );
      dispatch(removeFromWishlist(itemId));
      toast.success("Moved to cart! 🛒");
      return;
    }

    // ✅ Logged-in flow — sync with backend
    try {
      setLoadingIds((prev) => ({ ...prev, [itemId]: true }));

      const token = localStorage.getItem("accessToken");
      const cartRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cart/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ productId: itemId, quantity: 1 }),
        },
      );
      const cartData = await cartRes.json();

      if (!cartRes.ok)
        throw new Error(cartData.message || "Failed to add to cart");

      dispatch(setCartFromBackend(cartData.data));

      const wishRes = await wishlistAPI.removeFromWishlist(itemId);
      if (wishRes.success) {
        dispatch(setWishlistFromBackend(wishRes.data));
      } else {
        dispatch(removeFromWishlist(itemId));
      }

      toast.success("Moved to cart! 🛒");
    } catch (error) {
      console.error("Move to cart error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoadingIds((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // ── Empty State ──
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <Heart size={80} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add products you love to your wishlist!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: "#299D5F" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#228B50")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#299D5F")
              }
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-18">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Wishlist{" "}
          <span className="text-lg font-normal text-gray-400">
            ({wishlistItems.length}{" "}
            {wishlistItems.length === 1 ? "item" : "items"})
          </span>
        </h1>

        {/* ✅ Guest Banner */}
        {!isLoggedIn && (
          <div
            className="flex items-center justify-between gap-3 mb-6 p-3 sm:p-4 rounded-xl border"
            style={{
              backgroundColor: "#fffbeb",
              borderColor: "#fcd34d",
            }}
          >
            <div className="flex items-center gap-3">
              <LogIn size={20} style={{ color: "#d97706" }} />
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Guest mode:</span> Wishlist
                saved locally. Login to sync across devices & checkout.
              </p>
            </div>
            <button
              onClick={() =>
                navigate("/login", { state: { from: "/wishlist" } })
              }
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: "#d97706" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#b45309")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#d97706")
              }
            >
              Login
            </button>
          </div>
        )}

        {/* ── Desktop Table View ── */}
        <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Remove
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Unit Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Stock Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900"></th>
              </tr>
            </thead>
            <tbody>
              {wishlistItems.map((item, index) => {
                const itemId = item._id || item.id;
                return (
                  <tr
                    key={itemId}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      index === wishlistItems.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    {/* Remove */}
                    <td className="px-6 py-6">
                      <button
                        onClick={() => handleRemove(itemId)}
                        disabled={removingIds[itemId]}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        <X size={20} />
                        <span className="text-sm font-medium">
                          {removingIds[itemId] ? "Removing..." : "Remove"}
                        </span>
                      </button>
                    </td>

                    {/* Product Info */}
                    <td className="px-6 py-6">
                      <div
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={() =>
                          item.slug && navigate(`/product/${item.slug}`)
                        }
                      >
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center p-2">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1 hover:text-green-700 transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                            <span className="text-sm font-semibold text-gray-900">
                              {item.rating}
                            </span>
                            <span className="text-sm text-gray-500">
                              | {item.reviews} Reviews
                            </span>
                          </div>
                          {item.category && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-6">
                      <div
                        className="text-xl font-bold"
                        style={{ color: "#505050" }}
                      >
                        {item.newPrice}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-6">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        <span className="text-sm font-semibold text-green-600">
                          In Stock
                        </span>
                      </span>
                    </td>

                    {/* Add to Cart — works for guests too */}
                    <td className="px-6 py-6">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={loadingIds[itemId]}
                        className="px-6 py-2.5 rounded-full font-semibold text-white text-sm transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#299D5F" }}
                        onMouseEnter={(e) =>
                          !loadingIds[itemId] &&
                          (e.currentTarget.style.backgroundColor = "#228B50")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#299D5F")
                        }
                      >
                        {loadingIds[itemId] ? (
                          "Adding..."
                        ) : (
                          <>
                            <ShoppingCart size={16} />
                            Add To Cart
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card View ── */}
        <div className="lg:hidden space-y-4">
          {wishlistItems.map((item) => {
            const itemId = item._id || item.id;
            return (
              <div
                key={itemId}
                className="bg-white rounded-lg shadow p-4 relative"
              >
                <button
                  onClick={() => handleRemove(itemId)}
                  disabled={removingIds[itemId]}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  <X size={20} />
                </button>

                <div
                  className="flex gap-4 mb-4 cursor-pointer"
                  onClick={() => item.slug && navigate(`/product/${item.slug}`)}
                >
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center p-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                      <span className="text-xs font-semibold">
                        {item.rating}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({item.reviews})
                      </span>
                    </div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#505050" }}
                    >
                      {item.newPrice}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  <span className="text-sm font-semibold text-green-600">
                    In Stock
                  </span>
                </div>

                <button
                  onClick={() => handleMoveToCart(item)}
                  disabled={loadingIds[itemId]}
                  className="w-full py-2.5 rounded-full font-semibold text-white text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#299D5F" }}
                  onMouseEnter={(e) =>
                    !loadingIds[itemId] &&
                    (e.currentTarget.style.backgroundColor = "#228B50")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#299D5F")
                  }
                >
                  {loadingIds[itemId] ? (
                    "Adding..."
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      Add To Cart
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 sm:mt-16 lg:mt-10">
          <FeaturesGrid features={features} />
        </div>
      </div>
    </div>
  );
}
