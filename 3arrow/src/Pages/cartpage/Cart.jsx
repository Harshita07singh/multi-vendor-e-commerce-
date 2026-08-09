import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  setCartFromBackend,
} from "../../redux/cartSlice";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Star,
  Tag,
  ChevronRight,
  Home,
  Truck,
  Shield,
  Headphones,
  CreditCard,
  LogIn,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import FeaturesGrid from "../../components/FeaturesGrid";
import { cartAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(null);
  const [isRemovingItem, setIsRemovingItem] = useState(null);

  const { cartItems, totalQuantity, totalPrice } = useSelector(
    (state) => state.cart,
  );
  const { isLoggedIn } = useSelector((state) => state.auth);

  // Features data
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

  // ✅ Load cart from backend only if logged in
  // Guest cart already lives in localStorage via Redux
  useEffect(() => {
    const loadCart = async () => {
      if (!isLoggedIn) {
        setIsLoadingCart(false);
        return;
      }
      try {
        setIsLoadingCart(true);
        const response = await cartAPI.getCart();
        if (response.success && response.data) {
          dispatch(setCartFromBackend(response.data));
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsLoadingCart(false);
      }
    };
    loadCart();
  }, [isLoggedIn]);

  // Apply Voucher Handler
  const handleApplyVoucher = () => {
    if (!isLoggedIn) {
      toast.error("Please login to apply vouchers");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    if (voucherCode.trim() === "") {
      toast.error("Please enter a voucher code");
      return;
    }
    if (voucherCode.toUpperCase() === "SAVE10") {
      setAppliedDiscount(totalPrice * 0.1);
      toast.success("Voucher applied! 10% discount added");
    } else if (voucherCode.toUpperCase() === "SAVE20") {
      setAppliedDiscount(totalPrice * 0.2);
      toast.success("Voucher applied! 20% discount added");
    } else {
      toast.error("Invalid voucher code");
      setAppliedDiscount(0);
    }
  };

  // ✅ Remove from Cart
  // - Guest: remove from Redux (persisted in localStorage)
  // - Logged-in: sync with backend
  const handleRemoveFromCart = async (itemId) => {
    try {
      setIsRemovingItem(itemId);
      dispatch(removeFromCart(itemId)); // optimistic / guest remove

      if (isLoggedIn) {
        const response = await cartAPI.removeFromCart(itemId);
        if (!response.success) {
          // Rollback
          const fresh = await cartAPI.getCart();
          dispatch(setCartFromBackend(fresh.data));
          toast.error(response.message || "Failed to remove item");
          return;
        }
      }
      toast.success("Item removed");
    } catch (error) {
      console.error("Remove error:", error);
    } finally {
      setIsRemovingItem(null);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      setIsUpdatingQuantity(itemId);

      // Optimistic update (works for both guest & logged-in)
      if (newQuantity <= 0) {
        dispatch(removeFromCart(itemId));
      } else {
        const currentItem = cartItems.find((i) => i.id === itemId);
        if (!currentItem) return;
        newQuantity > currentItem.quantity
          ? dispatch(increaseQuantity(itemId))
          : dispatch(decreaseQuantity(itemId));
      }

      if (isLoggedIn) {
        const response = await cartAPI.updateQuantity(itemId, newQuantity);
        if (!response.success) {
          const fresh = await cartAPI.getCart();
          dispatch(setCartFromBackend(fresh.data));
          toast.error(response.message || "Failed to update");
          return;
        }
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsUpdatingQuantity(null);
    }
  };

  // ✅ Clear Cart
  const handleClearCart = async () => {
    try {
      dispatch(clearCart()); // clears localStorage too
      if (isLoggedIn) {
        const response = await cartAPI.clearCart();
        if (!response.success) toast.error("Failed to clear cart on server");
      }
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Clear cart error:", error);
    }
  };

  // ✅ Checkout — redirect to login if guest
  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast("Please login to proceed to checkout", { icon: "🔐" });
      // Pass current route so after login we redirect back to cart
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    navigate("/buy-now");
  };

  const finalTotal = totalPrice - appliedDiscount;

  // ─── Empty Cart ───
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div
          style={{
            backgroundColor: "#f0fdf4",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <Link
                  to="/"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    color: "#4b5563",
                    textDecoration: "none",
                  }}
                >
                  <Home size={16} />
                  <span>Home</span>
                </Link>
                <ChevronRight size={16} style={{ color: "#9ca3af" }} />
                <span style={{ color: "#f97316", fontWeight: "500" }}>
                  Cart
                </span>
              </div>
              <h1
                className="hidden sm:block"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                Cart
              </h1>
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-center px-4"
          style={{ minHeight: "calc(100vh - 200px)" }}
        >
          <div className="text-center">
            <ShoppingBag size={80} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some products to get started!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: "#299E60" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#228B50")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#299E60")
              }
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div
        style={{
          backgroundColor: "#f0fdf4",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
              }}
            >
              <Link
                to="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  color: "#4b5563",
                  textDecoration: "none",
                }}
              >
                <Home size={16} />
                <span>Home</span>
              </Link>
              <ChevronRight size={16} style={{ color: "#9ca3af" }} />
              <span style={{ color: "#f97316", fontWeight: "500" }}>Cart</span>
            </div>
            <h1
              className="hidden sm:block"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              Cart
            </h1>
          </div>
        </div>
      </div>

      <div className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft size={20} />
            <span>Back to Shopping</span>
          </button>

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
                  <span className="font-semibold">Guest mode:</span> Your cart
                  is saved locally. Login to sync across devices & checkout.
                </p>
              </div>
              <button
                onClick={() => navigate("/login", { state: { from: "/cart" } })}
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

          {/* Header */}
          <div className="flex justify-between items-center mb-4 sm:mb-8">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
              Shopping Cart ({totalQuantity} items)
            </h2>
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-medium text-sm sm:text-base"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm p-3 sm:p-4"
                >
                  {/* Mobile View */}
                  <div className="block lg:hidden">
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={item.image}
                        alt={item.title || item.name}
                        className="w-20 h-20 object-contain rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                          {item.title || item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {item.seller}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-gray-900">
                              {item.rating}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({item.reviews})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        disabled={isRemovingItem === item.id}
                        className="text-red-500 hover:text-red-700 flex-shrink-0 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-base sm:text-lg font-bold"
                            style={{ color: "#299E60" }}
                          >
                            ₹{item.price?.toLocaleString()}
                          </span>
                          {item.oldPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              {item.oldPrice}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Subtotal: ₹
                          {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div
                        className="flex items-center gap-1 border-2 border-green-500 rounded-lg px-2 py-1"
                        style={{ backgroundColor: "#d1f4e0" }}
                      >
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={isUpdatingQuantity === item.id}
                          className="text-gray-700 hover:text-gray-900 w-5 h-5 flex items-center justify-center disabled:opacity-50"
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          className="text-sm font-bold w-6 text-center"
                          style={{ color: "#299E60" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={isUpdatingQuantity === item.id}
                          className="text-gray-700 hover:text-gray-900 w-5 h-5 flex items-center justify-center disabled:opacity-50"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden lg:flex gap-4">
                    <img
                      src={item.image}
                      alt={item.title || item.name}
                      className="w-24 h-24 object-contain rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {item.title || item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.seller}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-gray-900">
                            {item.rating}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({item.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-lg font-bold"
                          style={{ color: "#299E60" }}
                        >
                          ₹{item.price?.toLocaleString()}
                        </span>
                        {item.oldPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {item.oldPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Subtotal: ₹
                        {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        disabled={isRemovingItem === item.id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 size={20} />
                      </button>
                      <div
                        className="flex items-center gap-2 border-2 border-green-500 rounded-lg px-2 py-1"
                        style={{ backgroundColor: "#d1f4e0" }}
                      >
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={isUpdatingQuantity === item.id}
                          className="text-gray-700 hover:text-gray-900 w-6 h-6 flex items-center justify-center disabled:opacity-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={isUpdatingQuantity === item.id}
                          className="text-gray-700 hover:text-gray-900 w-6 h-6 flex items-center justify-center disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm sm:text-base text-gray-600">
                    <span>Items ({totalQuantity})</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-sm sm:text-base text-green-600 font-medium">
                      <span>Discount</span>
                      <span>-₹{appliedDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm sm:text-base text-gray-600">
                    <span>Shipping</span>
                    <span style={{ color: "#299E60" }}>Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-base sm:text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* ✅ Checkout Button — redirects to login if guest */}
                <button
                  onClick={handleCheckout}
                  className="w-full text-white py-2.5 sm:py-3 rounded-full font-medium mb-3 transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#299E60" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#228B50")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#299E60")
                  }
                >
                  {!isLoggedIn && <LogIn size={16} />}
                  {isLoggedIn ? "Proceed to Checkout" : "Login to Proceed"}
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Voucher Section */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Have a voucher?
                </h3>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <button
                    onClick={handleApplyVoucher}
                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-white transition-colors whitespace-nowrap text-sm"
                    style={{ backgroundColor: "#299E60" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#228B50")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#299E60")
                    }
                  >
                    Apply
                  </button>
                </div>
                {appliedDiscount > 0 && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p
                      className="text-xs sm:text-sm font-medium"
                      style={{ color: "#299E60" }}
                    >
                      ✓ Voucher applied! You saved ₹{appliedDiscount.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 lg:mt-20">
            <FeaturesGrid features={features} />
          </div>
        </div>
      </div>
    </div>
  );
}
