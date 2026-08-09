import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCartFromBackend, addToCart } from "../redux/cartSlice"; // ✅ addToCart added
import WishlistButton from "./WishlistButton";
import banner from "../assets/banner.webp";
import powered from "../assets/powered.webp";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

/**
 * ── Pricing helpers ─────────────────────────────────────────────
 * customerFacingPrice = vendor's price + platform margin (added on top)
 * MRP = product.mrp (strikethrough tag price)
 * discountPct = (MRP − customerFacingPrice) / MRP × 100
 * Falls back to product.price if pricingBreakdown is absent.
 */
const getCustomerPrice = (p) =>
  p?.pricingBreakdown?.customerFacingPrice ?? p?.price ?? 0;
const getMRP = (p) => p?.mrp ?? null;
const getDiscountPct = (p) => {
  if (p?.pricingBreakdown?.discountPct != null)
    return +p.pricingBreakdown.discountPct.toFixed(1);
  const cp = getCustomerPrice(p),
    mrp = getMRP(p);
  if (mrp && mrp > cp) return +(((mrp - cp) / mrp) * 100).toFixed(1);
  return null;
};
const getPlatformPct = (p) => p?.pricingBreakdown?.categoryMarginPct ?? null;
// ────────────────────────────────────────────────────────────────

export default function HotDealsSection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth); // ✅ guest check

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const scrollRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [visibleCards, setVisibleCards] = useState(2);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToCartId, setAddedToCartId] = useState(null);

  // ── Responsive: how many cards are visible at once ──
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1280) setVisibleCards(6);
      else if (window.innerWidth >= 1024) setVisibleCards(5);
      else if (window.innerWidth >= 768) setVisibleCards(4);
      else if (window.innerWidth >= 640) setVisibleCards(3);
      else setVisibleCards(2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/products?limit=50`);
        const data = await res.json();
        const prods =
          data.data || data.products || (Array.isArray(data) ? data : []);
        const shuffled = [...prods]
          .sort(() => Math.random() - 0.5)
          .slice(0, 12);
        setProducts(shuffled);
      } catch (err) {
        console.error("Failed to fetch hot deals:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    const imageUrl = product.images?.[0]?.url
      ? product.images[0].url.startsWith("/")
        ? `${BASE_URL}${product.images[0].url}`
        : product.images[0].url
      : null;

    const discountedPrice =
      product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price;

    // ✅ Guest flow — no login needed
    if (!isLoggedIn) {
      dispatch(
        addToCart({
          id: product._id,
          productId: product._id,
          title: product.name,
          name: product.name,
          image: imageUrl || "",
          price: discountedPrice,
          oldPrice: product.discount > 0 ? `₹${product.price}` : null,
          rating: product.ratingsAverage ?? 0,
          reviews: product.ratingsCount ?? 0,
          stock: product.stock || 99,
          slug: product.slug || product._id,
          quantity: 1,
        }),
      );
      setAddedToCartId(product._id);
      setTimeout(() => setAddedToCartId(null), 2000);
      return;
    }

    // ✅ Logged-in flow — backend sync
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add to cart");
      dispatch(setCartFromBackend(data.data));
      setAddedToCartId(product._id);
      setTimeout(() => setAddedToCartId(null), 2000);
    } catch (err) {
      console.error("Add to cart error:", err.message);
      alert(err.message);
    }
  };

  const allProducts = [...products, ...products, ...products];

  // ── Countdown Timer ──
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0)
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0)
          return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Measure card width after render ──
  useEffect(() => {
    const updateCardWidth = () => {
      if (scrollRef.current) {
        const firstCard = scrollRef.current.querySelector(".hot-deal-card");
        if (firstCard) {
          const gap = 8;
          setCardWidth(firstCard.offsetWidth + gap);
        }
      }
    };
    updateCardWidth();
    window.addEventListener("resize", updateCardWidth);
    const timeout = setTimeout(updateCardWidth, 300);
    return () => {
      window.removeEventListener("resize", updateCardWidth);
      clearTimeout(timeout);
    };
  }, [products, visibleCards]);

  // ── Auto slide ──
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || cardWidth === 0) return;
    const slideTimer = setInterval(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 50) {
        container.scrollTo({ left: 0, behavior: "auto" });
        setTimeout(
          () => container.scrollBy({ left: cardWidth, behavior: "smooth" }),
          100,
        );
      } else {
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3000);
    return () => clearInterval(slideTimer);
  }, [cardWidth]);

  const handlePrev = () =>
    scrollRef.current?.scrollBy({ left: -cardWidth, behavior: "smooth" });
  const handleNext = () =>
    scrollRef.current?.scrollBy({ left: cardWidth, behavior: "smooth" });

  const gap = 8;
  const cardWidthStyle = `calc(${100 / visibleCards}% - ${gap}px)`;

  return (
    <div className="max-w-9xl bg-white">
      {/* ── Hot Deals Section ── */}
      <div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-9xl mx-auto">
          {/* ── Banner ── */}
          <div className="mb-4 sm:mb-6">
            <img
              src={banner}
              alt="Ramadan Delicacies – Up to 70% Off"
              className="w-full h-auto block rounded-xl object-cover"
              style={{ maxHeight: "320px", objectPosition: "center" }}
            />
            <img src={powered} alt="" />
          </div>
          {/* ── Header ── */}
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-500">
              Hot Deals Today
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[#299E60] font-semibold hover:underline cursor-pointer text-xs sm:text-sm">
                View All
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={handlePrev}
                  className="p-1 sm:p-1.5 rounded-full border border-gray-300 hover:border-[#299E60] hover:text-[#299E60] transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 sm:p-1.5 rounded-full border border-gray-300 hover:border-[#299E60] hover:text-[#299E60] transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            {/* Loading skeleton */}
            {loading && (
              <div className="flex gap-2">
                {[...Array(visibleCards)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 animate-pulse"
                    style={{ width: cardWidthStyle }}
                  >
                    <div className="bg-white rounded-xl p-2 border border-gray-100">
                      <div className="w-full aspect-[4/3] bg-gray-200 rounded-lg mb-2" />
                      <div className="h-2.5 bg-gray-200 rounded mb-1.5" />
                      <div className="h-2.5 bg-gray-200 rounded w-2/3 mb-2" />
                      <div className="h-6 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Product scroll */}
            {!loading && products.length > 0 && (
              <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide"
                style={{ scrollBehavior: "smooth" }}
              >
                {allProducts.map((product, index) => {
                  const imageUrl = product.images?.[0]?.url
                    ? product.images[0].url.startsWith("/")
                      ? `${BASE_URL}${product.images[0].url}`
                      : product.images[0].url
                    : null;

                  const customerPrice = getCustomerPrice(product);
                  const mrp = getMRP(product);
                  const discountPct = getDiscountPct(product);

                  return (
                    <div
                      key={`${product._id}-${index}`}
                      className="hot-deal-card flex-shrink-0 cursor-pointer group"
                      style={{ width: cardWidthStyle }}
                      onClick={() => navigate(`/product/${product.slug}`)}
                    >
                      <div className="bg-white rounded-xl p-2 border border-gray-100 hover:shadow-md transition-all h-full flex flex-col">
                        {/* Image */}
                        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 mb-2 flex-shrink-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-green-50 flex items-center justify-center">
                              <ShoppingCart className="w-5 h-5 text-green-200" />
                            </div>
                          )}

                          {/* Discount badge */}
                          {discountPct > 0 && (
                            <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                              -{discountPct}%
                            </span>
                          )}

                          {/* Wishlist */}
                          <div
                            className="absolute top-1.5 right-1.5 z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <WishlistButton
                              productId={product._id}
                              product={product}
                              size={11}
                              className="w-6 h-6 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform"
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1">
                          <h3 className="font-semibold text-[10px] sm:text-xs text-gray-800 line-clamp-2 mb-0.5 leading-tight">
                            {product.name}
                          </h3>

                          {/* Stars */}
                          {product.ratingsAverage > 0 && (
                            <div className="flex items-center gap-0.5 mb-1">
                              <Star className="w-2.5 h-2.5 fill-orange-400 text-orange-400 flex-shrink-0" />
                              <span className="text-[10px] text-gray-600 font-medium">
                                {product.ratingsAverage.toFixed(1)}
                              </span>
                              {product.ratingsCount > 0 && (
                                <span className="text-[9px] text-gray-400">
                                  ({product.ratingsCount})
                                </span>
                              )}
                            </div>
                          )}

                          {/* Price */}
                          <div className="flex flex-col mb-1.5 mt-auto">
                            <span className="text-green-700 font-bold text-xs leading-tight">
                              ₹{customerPrice.toLocaleString()}
                            </span>
                            {mrp && mrp > customerPrice && (
                              <span className="text-gray-400 text-[9px] line-through leading-tight">
                                MRP ₹{mrp.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Add to Cart */}
                          <button
                            className={`w-full py-1.5 text-[10px] font-semibold rounded-full transition-all flex items-center justify-center gap-1 ${
                              addedToCartId === product._id
                                ? "bg-green-700 text-white"
                                : "bg-green-50 hover:bg-green-700 text-green-700 hover:text-white"
                            }`}
                            onClick={(e) => handleAddToCart(e, product)}
                          >
                            <ShoppingCart className="w-3 h-3 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              {addedToCartId === product._id
                                ? "Added ✓"
                                : "Add to Cart"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {!loading && products.length === 0 && (
              <div className="flex items-center justify-center min-h-[180px] text-gray-400">
                <div className="text-center">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No deals available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
