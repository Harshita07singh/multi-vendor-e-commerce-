import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Leaf,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { getCategories } from "../redux/categorySlice";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

const CARD_STYLES = [
  { bgColor: "#F4F6E6", accent: "#8BC34A" },
  { bgColor: "#DAF2DB", accent: "#4CAF50" },
  { bgColor: "#F8EAE4", accent: "#FF7043" },
  { bgColor: "#DAE8C4", accent: "#66BB6A" },
  { bgColor: "#EAF4FB", accent: "#29B6F6" },
  { bgColor: "#FDF3E3", accent: "#FFA726" },
  { bgColor: "#F3E5F5", accent: "#AB47BC" },
  { bgColor: "#E8F5E9", accent: "#43A047" },
];

const getCategoryImageUrl = (image) => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return image.startsWith("/") ? `${API_BASE}${image}` : `${API_BASE}/${image}`;
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ─── Product Card ─── */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const imgUrl = getCategoryImageUrl(product.images?.[0] || product.image);
  const price = product.price ?? product.salePrice ?? 0;
  const originalPrice = product.originalPrice ?? product.mrp;
  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer group
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-250 font-sans"
    >
      {/* Image */}
      <div className="relative bg-gray-50 aspect-square overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            📦
          </div>
        )}
        {discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-gray-800 text-xs sm:text-sm font-semibold line-clamp-2 leading-snug mb-1">
          {product.name}
        </p>

        {product.rating && (
          <div className="flex items-center gap-1 mb-1.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] text-gray-500">{product.rating}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-green-700 font-bold text-sm">₹{price}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-gray-400 text-xs line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Subcategory + Products Panel ─── */
const SubcategoryPanel = ({ category, onClose }) => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [activeSubcat, setActiveSubcat] = useState(null);
  const [products, setProducts] = useState([]);
  const [subcatLoading, setSubcatLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(false);
  const [subcatError, setSubcatError] = useState(null);

  // ── Fetch subcategories when category changes ──
  useEffect(() => {
    if (!category) return;
    setSubcategories([]);
    setProducts([]);
    setActiveSubcat(null);
    setSubcatLoading(true);
    setSubcatError(null);

    // Adjust this URL to match your actual API endpoint:
    // Option A: /subcategories?categoryId=:id   ← default used here
    // Option B: /categories/:id/subcategories   ← uncomment below
    fetch(`${API_BASE}/subcategories?categoryId=${category._id}`)
      // fetch(`${API_BASE}/categories/${category._id}/subcategories`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : (data?.subcategories ?? data?.data ?? []);
        setSubcategories(list);
        if (list.length > 0) setActiveSubcat(list[0]);
      })
      .catch(() => setSubcatError("Failed to load subcategories"))
      .finally(() => setSubcatLoading(false));
  }, [category]);

  // ── Fetch products when active subcategory changes ──
  useEffect(() => {
    if (!activeSubcat) return;
    setProdLoading(true);
    setProducts([]);

    // Adjust this URL to match your actual API endpoint:
    // Option A: /products?subcategoryId=:id    ← default used here
    // Option B: /subcategories/:id/products    ← uncomment below
    fetch(`${API_BASE}/products?subcategoryId=${activeSubcat._id}`)
      // fetch(`${API_BASE}/subcategories/${activeSubcat._id}/products`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : (data?.products ?? data?.data ?? []);
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setProdLoading(false));
  }, [activeSubcat]);

  return (
    <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden font-sans">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-green-50/60">
        <div className="flex items-center gap-2">
          {getCategoryImageUrl(category.image) && (
            <img
              src={getCategoryImageUrl(category.image)}
              alt={category.name}
              className="w-7 h-7 rounded-full object-cover"
            />
          )}
          <span className="font-bold text-gray-800 text-sm sm:text-base">
            {category.name}
          </span>
          <span className="text-gray-400 text-xs">/ subcategories</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              navigate(
                `/category/${category._id}/${encodeURIComponent(category.name)}`,
              )
            }
            className="text-green-600 hover:text-green-800 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={12} />
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {/* Subcategory loading */}
        {subcatLoading && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 h-8 w-24 rounded-full bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Subcategory error */}
        {subcatError && (
          <p className="text-red-400 text-sm mb-3">{subcatError}</p>
        )}

        {/* Subcategory tabs */}
        {!subcatLoading && subcategories.length > 0 && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {subcategories.map((sub) => (
              <button
                key={sub._id}
                onClick={() => setActiveSubcat(sub)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold
                  transition-all duration-200 border font-sans
                  ${
                    activeSubcat?._id === sub._id
                      ? "bg-green-600 text-white border-green-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700"
                  }`}
              >
                {getCategoryImageUrl(sub.image) && (
                  <img
                    src={getCategoryImageUrl(sub.image)}
                    alt={sub.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                )}
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* No subcategories */}
        {!subcatLoading && !subcatError && subcategories.length === 0 && (
          <p className="text-gray-400 text-sm mb-4">No subcategories found.</p>
        )}

        {/* Products loading skeleton */}
        {prodLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-gray-100 animate-pulse aspect-square"
              />
            ))}
          </div>
        )}

        {/* Products grid */}
        {!prodLoading && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {products.slice(0, 12).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            {products.length > 12 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() =>
                    navigate(
                      `/subcategory/${activeSubcat._id}/${encodeURIComponent(activeSubcat.name)}`,
                    )
                  }
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white
                    text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-200
                    hover:shadow-md active:scale-95"
                >
                  View all {products.length} products <ArrowRight size={14} />
                </button>
              </div>
            )}
          </>
        )}

        {/* No products */}
        {!prodLoading && activeSubcat && products.length === 0 && (
          <div className="text-center py-10">
            <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">
              No products found in this subcategory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main CategorySlider ─── */
function CategorySlider() {
  const dispatch = useDispatch();
  const {
    categories = [],
    status,
    error,
  } = useSelector((state) => state.categories);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "idle") dispatch(getCategories());
  }, [status, dispatch]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // ── Selected category for subcategory panel ──
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const updateItems = () => {
      if (window.innerWidth < 640) setItemsPerPage(3);
      else if (window.innerWidth < 900) setItemsPerPage(4);
      else if (window.innerWidth < 1200) setItemsPerPage(5);
      else setItemsPerPage(6);
    };
    updateItems();
    window.addEventListener("resize", updateItems);
    return () => window.removeEventListener("resize", updateItems);
  }, []);

  useEffect(() => {
    const max = Math.max(0, categories.length - itemsPerPage);
    if (currentIndex > max) setCurrentIndex(max);
  }, [itemsPerPage, categories.length]);

  const featureCards = useMemo(() => {
    if (categories.length === 0) return [];
    const shuffled = shuffle(categories);
    return shuffled.slice(0, 4).map((cat, i) => ({
      ...cat,
      ...CARD_STYLES[i % CARD_STYLES.length],
    }));
  }, [categories]);

  const maxIndex = Math.max(0, categories.length - itemsPerPage);
  const handlePrevious = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 40) diff > 0 ? handleNext() : handlePrevious();
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory((prev) =>
      prev?._id === category._id ? null : category,
    );
  }, []);

  if (status === "loading")
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-400 tracking-wide">
            Loading categories…
          </span>
        </div>
      </div>
    );

  if (status === "failed")
    return (
      <div className="text-center py-16 text-red-400 text-sm">
        Failed to load categories: {error}
      </div>
    );

  return (
    <section className="mb-0 bg-white pt-0 pb-2 font-sans">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}

        {/* ── SUBCATEGORY + PRODUCTS PANEL ── */}
        {selectedCategory && (
          <SubcategoryPanel
            category={selectedCategory}
            onClose={() => setSelectedCategory(null)}
          />
        )}

        {/* ── FEATURE CARDS ── */}
        <div className="mt-4">
          {featureCards.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-sans">
              {featureCards.map((card, index) => {
                const imgUrl = getCategoryImageUrl(card.image);
                return (
                  <div
                    key={card._id || index}
                    onClick={() =>
                      navigate(
                        `/category/${card._id}/${encodeURIComponent(card.name)}`,
                      )
                    }
                    className="relative rounded-2xl overflow-hidden cursor-pointer group
                      transition-all duration-300 hover:-translate-y-1 hover:shadow-xl font-sans"
                    style={{ backgroundColor: card.bgColor, height: "160px" }}
                  >
                    <div
                      className="absolute -bottom-6 -right-6 w-36 h-36 rounded-full opacity-10"
                      style={{ backgroundColor: card.accent }}
                    />
                    <div
                      className="absolute top-0 left-0 bottom-0 z-10 p-4 flex flex-col justify-between"
                      style={{ width: "55%" }}
                    >
                      <h4 className="font-bold text-gray-800 text-xs sm:text-sm md:text-base leading-snug capitalize font-sans">
                        {card.name}
                      </h4>
                      <button
                        className="flex items-center gap-1.5 text-white text-[10px] sm:text-xs
                          px-3 py-1.5 rounded-full w-fit font-medium
                          transition-all duration-200 hover:gap-2 hover:shadow-md active:scale-95 font-sans"
                        style={{ backgroundColor: card.accent }}
                      >
                        Shop Now <ArrowRight size={12} />
                      </button>
                    </div>
                    {imgUrl && (
                      <div
                        className="absolute right-2 top-1/2 -translate-y-1/2
                          w-20 h-20 sm:w-24 sm:h-24
                          rounded-full overflow-hidden bg-white/40 backdrop-blur-sm
                          flex items-center justify-center shadow-lg border border-white/40
                          transition-transform duration-300 group-hover:scale-110"
                      >
                        <img
                          src={imgUrl}
                          alt={card.name}
                          className="w-[80%] h-[80%] object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {featureCards.length === 0 && status !== "loading" && (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 font-sans">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-gray-100 animate-pulse"
                  style={{ minHeight: "160px" }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CategorySlider;
