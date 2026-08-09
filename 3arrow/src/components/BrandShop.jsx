import React, { useState, useEffect, useRef } from "react";
import { Star, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCartFromBackend, addToCart } from "../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import WishlistButton from "./WishlistButton";
import Logo1 from "../assets/Logo1.png";
import Logo2 from "../assets/Logo2.png";
import Logo3 from "../assets/Logo3.png";
import Logo4 from "../assets/Logo4.png";
import Logo5 from "../assets/Logo5.png";
import Logo6 from "../assets/Logo6.png";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

/**
 * ── Pricing helpers ─────────────────────────────────────────────
 * customerFacingPrice = vendor's price + platform margin (added on top)
 * MRP = product.mrp (strikethrough tag price)
 * discountPct = (MRP − customerFacingPrice) / MRP × 100
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
// ────────────────────────────────────────────────────────────────

const brands = [
  { id: 21, name: "Organic Quality", image: Logo1 },
  { id: 22, name: "Organic Shop", image: Logo2 },
  { id: 23, name: "Healthy Food", image: Logo3 },
  { id: 24, name: "The Best Organic", image: Logo4 },
  { id: 25, name: "Passion For Life", image: Logo5 },
  { id: 26, name: "Fresh World", image: Logo6 },
];

const FALLBACK_LOGO = "https://cdn-icons-png.flaticon.com/512/2913/2913133.png";

function resolveImage(src) {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  return BASE_URL + (src.startsWith("/") ? src : `/${src}`);
}

const Brands = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const productContainerRef = useRef(null);
  const productScrollRef = useRef(null);
  const [isProductDragging, setIsProductDragging] = useState(false);
  const [productStartXDrag, setProductStartXDrag] = useState(0);
  const [productScrollLeftDrag, setProductScrollLeftDrag] = useState(0);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToCartId, setAddedToCartId] = useState(null);
  const [cartLoading, setCartLoading] = useState(null);

  // Vendor logos state
  const [vendorLogos, setVendorLogos] = useState([]);

  // ── Fetch products ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${BASE_URL}/api/products?limit=12&sort=-createdAt`,
        );
        const data = await res.json();
        const prods =
          data.data?.products ||
          data.data ||
          data.products ||
          (Array.isArray(data) ? data : []);
        setProducts(prods);
      } catch (err) {
        console.error("Failed to fetch new arrivals:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ── Fetch vendor logos ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/vendor/approved`);
        if (!res.ok) return;
        const data = await res.json();

        const logos = data
          .map((v) => ({
            id: v._id,
            name:
              v.businessDetails?.businessName ||
              v.sellerDetails?.sellerName ||
              v.brandDetails?.brandName ||
              "Vendor",
            logo:
              resolveImage(v.brandDetails?.brandLogo) ||
              resolveImage(v.logo) ||
              FALLBACK_LOGO,
          }))
          .filter(Boolean);

        setVendorLogos(logos);
      } catch (err) {
        console.error("Failed to fetch vendor logos:", err);
      }
    };
    fetchVendors();
  }, []);

  // ── Auto scroll products ──────────────────────────────────────────────────
  useEffect(() => {
    if (!productContainerRef.current || products.length === 0) return;
    const container = productContainerRef.current;
    const interval = setInterval(() => {
      if (isProductDragging) return;
      const cardWidth = getCardWidth() + productGap;
      container.scrollBy({ left: cardWidth, behavior: "smooth" });
      if (
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth - cardWidth
      ) {
        setTimeout(
          () => container.scrollTo({ left: 0, behavior: "auto" }),
          600,
        );
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [products, isProductDragging]);

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (cartLoading === product._id) return;

    if (!isLoggedIn) {
      const imageUrl = getImageUrl(product);
      const customerPrice = getCustomerPrice(product);
      const mrp = getMRP(product);
      dispatch(
        addToCart({
          id: product._id,
          productId: product._id,
          title: product.name,
          name: product.name,
          image: imageUrl || "",
          price: customerPrice,
          oldPrice: mrp ? `₹${mrp}` : null,
          rating: product.ratingsAverage ?? 0,
          reviews: product.ratingsCount ?? 0,
          seller: product.brand || "",
          stock: product.stock || 99,
          slug: product.slug || product._id,
          quantity: 1,
        }),
      );
      setAddedToCartId(product._id);
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setAddedToCartId(null), 2000);
      return;
    }

    try {
      setCartLoading(product._id);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        credentials: "include",
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add to cart");
      if (data.data) dispatch(setCartFromBackend(data.data));
      setAddedToCartId(product._id);
      toast.success(`${product.name} added to cart!`);
      setTimeout(() => setAddedToCartId(null), 2000);
    } catch (err) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setCartLoading(null);
    }
  };

  const allProducts = products.length > 0 ? [...products, ...products] : [];

  const getCardWidth = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    if (w < 640) return (w - 48) / 2.5;
    if (w < 1024) return (w - 80) / 4;
    return (Math.min(w - 64, 1400) - 80) / 6;
  };

  const productGap =
    typeof window !== "undefined"
      ? window.innerWidth < 640
        ? 6
        : window.innerWidth < 1024
          ? 10
          : 12
      : 12;

  const onProductMouseDown = (e) => {
    setIsProductDragging(true);
    setProductStartXDrag(e.pageX - productContainerRef.current.offsetLeft);
    setProductScrollLeftDrag(productContainerRef.current.scrollLeft);
    productContainerRef.current.style.cursor = "grabbing";
  };
  const onProductTouchStart = (e) => {
    setIsProductDragging(true);
    setProductStartXDrag(
      e.touches[0].pageX - productContainerRef.current.offsetLeft,
    );
    setProductScrollLeftDrag(productContainerRef.current.scrollLeft);
  };
  const onProductMouseMove = (e) => {
    if (!isProductDragging) return;
    e.preventDefault();
    productContainerRef.current.scrollLeft =
      productScrollLeftDrag -
      (e.pageX - productContainerRef.current.offsetLeft - productStartXDrag) *
        2;
  };
  const onProductTouchMove = (e) => {
    if (!isProductDragging) return;
    productContainerRef.current.scrollLeft =
      productScrollLeftDrag -
      (e.touches[0].pageX -
        productContainerRef.current.offsetLeft -
        productStartXDrag) *
        2;
  };
  const onProductEnd = () => {
    setIsProductDragging(false);
    if (productContainerRef.current)
      productContainerRef.current.style.cursor = "grab";
  };

  const getImageUrl = (product) => {
    const raw = product.images?.[0]?.url || product.image || "";
    if (!raw) return null;
    if (raw.startsWith("http")) return raw;
    return raw.startsWith("/") ? `${BASE_URL}${raw}` : `${BASE_URL}/${raw}`;
  };

  const SkeletonCard = () => (
    <div
      className="flex-shrink-0 animate-pulse"
      style={{ width: `${getCardWidth()}px` }}
    >
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="w-full h-24 sm:h-32 bg-gray-200" />
        <div className="p-2">
          <div className="h-2.5 bg-gray-200 rounded mb-1.5 w-1/3" />
          <div className="h-2.5 bg-gray-200 rounded mb-1" />
          <div className="h-2.5 bg-gray-200 rounded mb-2 w-3/4" />
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );

  // Combine static brands + vendor logos for the marquee
  const allMarqueeItems = [
    ...brands,
    ...vendorLogos.map((v) => ({ id: v.id, name: v.name, image: v.logo })),
  ];

  return (
    <div className="w-full">
      {/* ── Shop by Brands + Vendor Logos marquee ── */}
      <section className="py-4 sm:py-6 bg-gradient-to-b rounded-3xl mb-6 overflow-hidden">
        <div className="px-4 md:px-8 lg:px-10">
          <div className="max-w-9xl mx-auto">
            {vendorLogos.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-400 tracking-wide uppercase">
                    Shop by Brands
                  </h3>
                </div>
              </>
            )}
          </div>
        </div>

        {vendorLogos.length > 0 && (
          <div className="vendors-marquee">
            <div className="vendors-marquee-track">
              {[...vendorLogos, ...vendorLogos, ...vendorLogos].map((v, i) => (
                <div
                  key={`vendor-${v.id}-${i}`}
                  className="vendors-marquee-item"
                  title={v.name}
                >
                  <div className="w-full h-full rounded-full bg-white shadow-md border border-gray-100 overflow-hidden flex items-center justify-center p-1">
                    <img
                      src={v.logo}
                      alt={v.name}
                      className="w-full h-full object-contain rounded-full"
                      draggable="false"
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.dataset.fallback) return;
                        e.currentTarget.dataset.fallback = "true";
                        e.currentTarget.src = FALLBACK_LOGO;
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-center text-gray-500 mt-1 truncate w-full">
                    {v.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── New Arrivals ── */}
      <section className="py-4 sm:py-6 px-4 md:px-8 lg:px-8 bg-white">
        <div className="max-w-9xl mx-auto">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-500">
              New Arrivals
            </h2>
          </div>

          {loading && (
            <div className="flex gap-1.5 sm:gap-2.5 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No products available</p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div
              ref={productContainerRef}
              className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
              style={{
                scrollBehavior: isProductDragging ? "auto" : "smooth",
                WebkitOverflowScrolling: "touch",
              }}
              onMouseDown={onProductMouseDown}
              onMouseMove={onProductMouseMove}
              onMouseUp={onProductEnd}
              onMouseLeave={onProductEnd}
              onTouchStart={onProductTouchStart}
              onTouchMove={onProductTouchMove}
              onTouchEnd={onProductEnd}
            >
              <div
                ref={productScrollRef}
                className="flex gap-1.5 sm:gap-2.5 md:gap-3"
              >
                {allProducts.map((product, index) => {
                  const imageUrl = getImageUrl(product);
                  const customerPrice = getCustomerPrice(product);
                  const mrp = getMRP(product);
                  const discountPct = getDiscountPct(product);
                  const isAdded = addedToCartId === product._id;
                  const isLoading = cartLoading === product._id;

                  return (
                    <article
                      key={`${product._id}-${index}`}
                      className="flex-shrink-0 select-none"
                      style={{ width: `${getCardWidth()}px` }}
                    >
                      <div
                        className="group bg-white rounded-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:border-green-400 hover:shadow-md h-full flex flex-col cursor-pointer"
                        onClick={() =>
                          navigate(`/product/${product.slug || product._id}`)
                        }
                      >
                        <div className="relative w-full overflow-hidden bg-gray-50 h-20 sm:h-28 md:h-32 flex items-center justify-center flex-shrink-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              draggable="false"
                            />
                          ) : (
                            <div className="w-full h-full bg-green-50 flex items-center justify-center">
                              <ShoppingCart className="w-6 h-6 text-green-200" />
                            </div>
                          )}
                          {product.discount > 0 && (
                            <span className="absolute top-1 left-1 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
                              -{product.discount}%
                            </span>
                          )}
                          <div
                            className="absolute top-1 right-1 z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <WishlistButton
                              productId={product._id}
                              product={product}
                              size={10}
                              className="w-5 h-5 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform"
                            />
                          </div>
                        </div>

                        <div className="p-1.5 sm:p-2 flex flex-col flex-1">
                          {product.ratingsAverage > 0 && (
                            <div className="flex items-center gap-0.5 mb-1">
                              <div className="flex items-center gap-0.5 bg-gray-100 px-1 py-0.5 rounded">
                                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-900">
                                  {product.ratingsAverage.toFixed(1)}
                                </span>
                                <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-orange-400 text-orange-400" />
                              </div>
                              {product.ratingsCount > 0 && (
                                <span className="text-[8px] sm:text-[9px] text-gray-500">
                                  ({product.ratingsCount})
                                </span>
                              )}
                            </div>
                          )}

                          <h3 className="text-[9px] sm:text-[10px] md:text-xs font-medium text-gray-900 mb-1.5 line-clamp-2 flex-1 leading-tight">
                            {product.name}
                          </h3>

                          <div className="flex items-center justify-between mt-auto gap-1">
                            <div className="flex flex-col min-w-0">
                              {mrp && mrp > customerPrice && (
                                <span className="text-[8px] sm:text-[9px] text-gray-400 line-through leading-none">
                                  MRP ₹{mrp?.toLocaleString()}
                                </span>
                              )}
                              <span className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                                ₹{customerPrice?.toLocaleString()}
                              </span>
                            </div>
                            <button
                              onClick={(e) => handleAddToCart(e, product)}
                              disabled={isLoading}
                              className={`flex-shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[8px] sm:text-[10px] font-semibold transition-all flex items-center gap-0.5 disabled:opacity-60 disabled:cursor-not-allowed ${
                                isAdded
                                  ? "bg-green-600 text-white"
                                  : "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white"
                              }`}
                            >
                              {isLoading ? (
                                <svg
                                  className="w-2.5 h-2.5 animate-spin"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                  />
                                </svg>
                              ) : (
                                <>
                                  <span className="whitespace-nowrap">
                                    {isAdded ? "✓" : "Add"}
                                  </span>
                                  <ShoppingCart className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.vendors-marquee {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  overflow: hidden;
  padding: 4px 0;
}

.vendors-marquee-track {
  display: flex;
  align-items: flex-start;
  width: max-content;
  gap: 16px;
  animation: vendors-scroll 22s linear infinite;
  will-change: transform;
  padding: 0;
  margin: 0;
}

  .vendors-marquee-track:hover {
    animation-play-state: paused;
  }

  .vendors-marquee-item {
    flex: 0 0 auto;
    width: 72px;
    cursor: pointer;
    transition: transform 0.3s ease;
    user-select: none;
  }

  .vendors-marquee-item > div {
    width: 72px;
    height: 72px;
  }

  .vendors-marquee-item:hover {
    transform: scale(1.08);
  }

  @keyframes vendors-scroll {
    from {
      transform: translate3d(0, 0, 0);
    }
    to {
      transform: translate3d(-33.333%, 0, 0);
    }
  }

  @media (max-width: 1023px) {
    .vendors-marquee-item { width: 60px; }
    .vendors-marquee-item > div { width: 60px; height: 60px; }
  }

  @media (max-width: 639px) {
    .vendors-marquee-item { width: 52px; }
    .vendors-marquee-item > div { width: 52px; height: 52px; }
    .vendors-marquee-track { gap: 12px; }
  }
`}</style>
    </div>
  );
};

export default Brands;
