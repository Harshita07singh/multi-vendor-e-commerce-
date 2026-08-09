import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // ✅ useSelector add kiya
import { setCartFromBackend, addToCart } from "../redux/cartSlice"; // ✅ addToCart add kiya
import {
  fetchBrowserLocation,
  selectCustomerCoords,
  selectCustomerCoordsKey,
} from "../redux/Locationslice";
import WishlistButton from "./WishlistButton";
import {
  ShoppingCart,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";

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

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return img.startsWith("/") ? `${BASE_URL}${img}` : `${BASE_URL}/${img}`;
};

/* ─── Product Card ─── */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth); // ✅ login check
  const [addedToCartId, setAddedToCartId] = useState(null);

  const imageUrl = product.images?.[0]?.url
    ? product.images[0].url.startsWith("/")
      ? `${BASE_URL}${product.images[0].url}`
      : product.images[0].url
    : getImageUrl(product.images?.[0] || product.image);

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : null;

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    // ✅ Guest flow — no API call, directly Redux mein add karo
    if (!isLoggedIn) {
      dispatch(
        addToCart({
          id: product._id,
          productId: product._id,
          title: product.name,
          name: product.name,
          image: imageUrl || "",
          price: getCustomerPrice(product),
          oldPrice: getMRP(product) ? `₹${getMRP(product)}` : null,
          rating: product.ratingsAverage ?? product.rating ?? 0,
          reviews: product.ratingsCount ?? 0,
          seller: product.brand || "",
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

  return (
    <div
      onClick={() => navigate(`/product/${product.slug || product._id}`)}
      className="rounded-xl border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
      style={{
        width: "140px",
        minWidth: "140px",
        maxWidth: "140px",
        flexShrink: 0,
      }}
    >
      {/* Image */}
      <div className="relative bg-gray-50 aspect-[4/3] overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-50">
            <ShoppingCart className="w-6 h-6 text-green-200" />
          </div>
        )}

        {getDiscountPct(product) > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
            -{getDiscountPct(product)}%
          </span>
        )}

        <div
          className="absolute top-1.5 right-1.5 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <WishlistButton
            productId={product._id}
            size={11}
            className="w-6 h-6 rounded-full shadow-md border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-2 flex flex-col flex-1">
        <h3 className="text-[9px] sm:text-[10px] font-semibold text-gray-800 line-clamp-2 mb-1 leading-tight">
          {product.name}
        </h3>

        {product.rating || product.ratingsAverage ? (
          <div className="flex items-center gap-0.5 mb-1">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 flex-shrink-0" />
            <span className="text-[10px] text-gray-500">
              {(product.ratingsAverage ?? product.rating)?.toFixed?.(1) ??
                product.rating}
            </span>
          </div>
        ) : null}

        <div className="flex flex-col mt-auto mb-1.5 gap-0.5">
          <span className="text-green-700 font-bold text-[11px]">
            ₹{getCustomerPrice(product)?.toLocaleString()}
          </span>
          {(() => {
            const mrp = getMRP(product);
            const cp = getCustomerPrice(product);
            const pct = getDiscountPct(product);
            return mrp && mrp > cp ? (
              <div className="flex items-center gap-1">
                <span className="text-gray-400 text-[9px] line-through">
                  MRP ₹{mrp?.toLocaleString()}
                </span>
                {pct > 0 && (
                  <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1 rounded">
                    {pct}% off
                  </span>
                )}
              </div>
            ) : null;
          })()}
        </div>

        <div className="truncate mb-1.5">
          <span className="text-gray-500 text-[9px]">
            {product.description}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className={`w-full py-1 text-[9px] font-semibold rounded-full transition-all flex items-center justify-center gap-1 ${
            addedToCartId === product._id
              ? "bg-green-700 text-white"
              : "bg-green-50 hover:bg-green-700 text-green-700 hover:text-white"
          }`}
        >
          <ShoppingCart className="w-3 h-3 flex-shrink-0" />
          <span className="whitespace-nowrap">
            {addedToCartId === product._id ? "Added ✓" : "Add to Cart"}
          </span>
        </button>
      </div>
    </div>
  );
};

/* ─── SubCategory Section with Sliding Carousel ─── */
const SubCategorySection = ({
  subCategory,
  filters,
  customerCoords,
  customerCoordsKey,
}) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loadingProd, setLoadingProd] = useState(false);
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
  }, [products]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    setLoadingProd(true);
    let url = `${BASE_URL}/api/products?subCategory=${subCategory._id}&limit=10`;
    if (filters.sort === "price_asc") url += "&sort=price&order=asc";
    if (filters.sort === "price_desc") url += "&sort=price&order=desc";
    if (filters.sort === "rating") url += "&sort=rating";
    if (filters.sort === "newest") url += "&sort=createdAt&order=desc";
    if (filters.priceRange[1] < 5000)
      url += `&maxPrice=${filters.priceRange[1]}`;
    if (filters.rating) url += `&minRating=${filters.rating}`;
    if (customerCoords) {
      url += `&lat=${customerCoords.lat}&lng=${customerCoords.lng}&radiusKm=50`;
    }

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        let list = Array.isArray(data)
          ? data
          : (data?.products ?? data?.data ?? []);

        // ✅ Sirf is subcategory ke products
        list = list.filter((p) => {
          const subId =
            p.subCategory?._id ||
            p.subCategory ||
            p.subCategoryId ||
            p.sub_category;
          return String(subId) === String(subCategory._id);
        });

        if (filters.sort === "price_asc")
          list = [...list].sort((a, b) => a.price - b.price);
        if (filters.sort === "price_desc")
          list = [...list].sort((a, b) => b.price - a.price);
        if (filters.rating)
          list = list.filter((p) => (p.rating ?? 0) >= filters.rating);
        if (filters.priceRange[1] < 5000)
          list = list.filter((p) => p.price <= filters.priceRange[1]);

        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoadingProd(false));
  }, [subCategory._id, filters, customerCoordsKey]);

  if (!loadingProd && products.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex pl-2 sm:pl-3 items-center justify-between mb-3">
        <h2 className="text-xl sm:text-base font-bold text-gray-800 capitalize leading-tight">
          {subCategory.name}
        </h2>
        <button
          onClick={() =>
            navigate(
              `/subcategory/${subCategory._id}/${encodeURIComponent(subCategory.name)}`,
            )
          }
          className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-semibold transition-colors flex-shrink-0"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loadingProd ? (
        <div className="flex gap-2 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-100 overflow-hidden animate-pulse flex-shrink-0"
              style={{ width: "140px", minWidth: "140px" }}
            >
              <div className="aspect-[4/3]" />
              <div className="p-2">
                <div className="h-2 rounded mb-1.5" />
                <div className="h-2 rounded w-2/3 mb-2" />
                <div className="h-5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative group/carousel">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-7 h-7 rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-green-700 hover:border-green-300 transition-all opacity-0 group-hover/carousel:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div
            ref={trackRef}
            onScroll={checkScroll}
            className="flex pl-2 sm:pl-3 gap-2 overflow-x-auto scroll-smooth pb-1"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              flexWrap: "nowrap",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-7 h-7 rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-green-700 hover:border-green-300 transition-all opacity-0 group-hover/carousel:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </section>
  );
};

/* ─── Main HomeCategorySection ─── */
export default function HomeCategorySection() {
  const dispatch = useDispatch();
  const customerCoords = useSelector(selectCustomerCoords);
  const customerCoordsKey = useSelector(selectCustomerCoordsKey);
  const [subCategories, setSubCategories] = useState([]);
  const [status, setStatus] = useState("idle");
  const [filters] = useState({
    priceRange: [0, 5000],
    rating: null,
    subCategory: null,
    sort: "default",
  });

  useEffect(() => {
    setStatus("loading");
    fetch(`${BASE_URL}/api/subcategories`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : (data?.subCategories ?? data?.data ?? []);
        setSubCategories(list);
        setStatus("success");
      })
      .catch(() => {
        setSubCategories([]);
        setStatus("error");
      });
  }, []);

  const visibleSubCategories = filters.subCategory
    ? subCategories.filter((sc) => sc._id === filters.subCategory)
    : subCategories;

  return (
    <div className="max-w-9xl mx-auto min-h-screen">
      <div className="px-4 sm:px-6 py-1 sm:py-6">
        {!customerCoords && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => dispatch(fetchBrowserLocation())}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 transition"
            >
              <MapPin className="w-4 h-4" />
              Show nearby products
            </button>
          </div>
        )}
        {status === "loading" && (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-4 rounded w-32 animate-pulse" />
                </div>
                <div className="flex gap-2 overflow-hidden">
                  {[...Array(6)].map((_, k) => (
                    <div
                      key={k}
                      className="rounded-xl overflow-hidden animate-pulse flex-shrink-0"
                      style={{ width: "140px", minWidth: "140px" }}
                    >
                      <div className="aspect-[4/3]" />
                      <div className="p-2">
                        <div className="h-2 rounded mb-1" />
                        <div className="h-2 rounded w-2/3 mb-2" />
                        <div className="h-4 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {status !== "loading" && visibleSubCategories.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No subcategories found</p>
          </div>
        )}

        {status !== "loading" &&
          visibleSubCategories.map((subCategory) => (
            <SubCategorySection
              key={subCategory._id}
              subCategory={subCategory}
              filters={filters}
              customerCoords={customerCoords}
              customerCoordsKey={customerCoordsKey}
            />
          ))}
      </div>
    </div>
  );
}
