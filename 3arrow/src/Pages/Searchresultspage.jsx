/**
 * SearchResultsPage.jsx
 *
 * Reads ?q= from the URL, hits GET /api/search, and renders
 * three sections: Categories · Sub-categories · Products
 *
 * Styling: Tailwind + inline (matches HomeCategorySection & Navbar patterns)
 * Brand green: #5CB74B
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, setCartFromBackend } from "../redux/cartSlice";
import WishlistButton from "../components/WishlistButton";
import {
  Search,
  ShoppingCart,
  Star,
  Grid,
  Layers,
  Package,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  Loader2,
  X,
  ArrowUpDown,
  TrendingUp,
  BadgePercent,
  Coffee,
  Home,
  Smartphone,
  Sparkles,
  Shirt,
  Gamepad2,
  Leaf,
} from "lucide-react";

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

// ─── Pricing helpers (mirrors HomeCategorySection) ────────────────────────────

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

// ─── Image helper ─────────────────────────────────────────────────────────────

const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === "string") {
    if (img.startsWith("http")) return img;
    return img.startsWith("/") ? `${BASE_URL}${img}` : `${BASE_URL}/${img}`;
  }
  return null;
};

// ─── Category icon map (mirrors Navbar) ───────────────────────────────────────

const CATEGORY_ICONS = {
  cafe: Coffee,
  home: Home,
  toys: Gamepad2,
  fresh: Leaf,
  electronics: Smartphone,
  beauty: Sparkles,
  fashion: Shirt,
  default: Package,
};

function getCategoryIcon(name = "") {
  const key = name.toLowerCase();
  for (const [k, Icon] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return Icon;
  }
  return CATEGORY_ICONS.default;
}

// ─── Highlight matched text ───────────────────────────────────────────────────

function Highlight({ text = "", query = "" }) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded"
            style={{
              background: "#fff3b0",
              color: "#1a1a1a",
              padding: "0 1px",
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 animate-pulse w-28 flex-shrink-0">
      <div className="w-14 h-14 rounded-xl bg-gray-200" />
      <div className="h-3 w-16 rounded bg-gray-200" />
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-gray-100 overflow-hidden animate-pulse flex-shrink-0"
      style={{ width: 160, minWidth: 160 }}
    >
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-2 space-y-1.5">
        <div className="h-2.5 rounded bg-gray-200 w-4/5" />
        <div className="h-2.5 rounded bg-gray-200 w-3/5" />
        <div className="h-4 rounded-full bg-gray-200 mt-2" />
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product, query }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((s) => s.auth);
  const [addedId, setAddedId] = useState(null);

  const imageUrl = product.images?.[0]?.url
    ? getImageUrl(product.images[0].url)
    : getImageUrl(product.images?.[0] || product.image);

  const handleAddToCart = async (e) => {
    e.stopPropagation();

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
          rating: product.ratingsAverage ?? 0,
          reviews: product.ratingsCount ?? 0,
          seller: product.brand || "",
          stock: product.stock || 99,
          slug: product.slug || product._id,
          quantity: 1,
        }),
      );
      setAddedId(product._id);
      setTimeout(() => setAddedId(null), 2000);
      return;
    }

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
      if (!res.ok) throw new Error(data.message || "Failed");
      dispatch(setCartFromBackend(data.data));
      setAddedId(product._id);
      setTimeout(() => setAddedId(null), 2000);
    } catch (err) {
      console.error("Cart error:", err.message);
    }
  };

  const discountPct = getDiscountPct(product);
  const mrp = getMRP(product);
  const cp = getCustomerPrice(product);

  return (
    <div
      onClick={() => navigate(`/product/${product.slug || product._id}`)}
      className="rounded-xl border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
      style={{ width: 160, minWidth: 160, maxWidth: 160, flexShrink: 0 }}
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

        {discountPct > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
            -{discountPct}%
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

      {/* Body */}
      <div className="p-2 flex flex-col flex-1">
        <h3 className="text-[10px] font-semibold text-gray-800 line-clamp-2 mb-1 leading-tight">
          <Highlight text={product.name} query={query} />
        </h3>

        {product.brand && (
          <p className="text-[9px] text-gray-400 mb-0.5 truncate">
            {product.brand}
          </p>
        )}

        {product.ratingsAverage > 0 && (
          <div className="flex items-center gap-0.5 mb-1">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 flex-shrink-0" />
            <span className="text-[10px] text-gray-500">
              {product.ratingsAverage?.toFixed(1)}
            </span>
          </div>
        )}

        <div className="flex flex-col mt-auto mb-1.5 gap-0.5">
          <span className="text-green-700 font-bold text-[12px]">
            ₹{cp?.toLocaleString()}
          </span>
          {mrp && mrp > cp && (
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-[9px] line-through">
                MRP ₹{mrp?.toLocaleString()}
              </span>
              {discountPct > 0 && (
                <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1 rounded">
                  {discountPct}% off
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className={`w-full py-1 text-[9px] font-semibold rounded-full transition-all flex items-center justify-center gap-1 ${
            addedId === product._id
              ? "bg-green-700 text-white"
              : "bg-green-50 hover:bg-green-700 text-green-700 hover:text-white"
          }`}
        >
          <ShoppingCart className="w-3 h-3" />
          {addedId === product._id ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// ─── Category Chip ────────────────────────────────────────────────────────────

function CategoryChip({ cat, query }) {
  const Icon = getCategoryIcon(cat.name);
  const imgUrl = cat.image ? getImageUrl(cat.image) : null;

  return (
    <Link
      to={cat.url}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 hover:border-green-300 hover:shadow-sm transition-all group cursor-pointer no-underline"
      style={{ width: 110, minWidth: 110 }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{ background: "#f0faf0" }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={cat.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <Icon size={24} color="#5CB74B" />
        )}
      </div>
      <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight line-clamp-2">
        <Highlight text={cat.name} query={query} />
      </span>
    </Link>
  );
}

// ─── SubCategory Chip ─────────────────────────────────────────────────────────

function SubCategoryChip({ sub, query }) {
  const imgUrl = sub.image ? getImageUrl(sub.image) : null;

  return (
    <Link
      to={sub.url}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 hover:border-green-300 hover:shadow-sm transition-all group cursor-pointer no-underline"
      style={{ width: 110, minWidth: 110 }}
    >
      <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center overflow-hidden flex-shrink-0">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={sub.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <Layers size={22} color="#5CB74B" />
        )}
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-gray-700 leading-tight line-clamp-1">
          <Highlight text={sub.name} query={query} />
        </p>
        {sub.categoryName && (
          <p className="text-[9px] text-gray-400 mt-0.5">{sub.categoryName}</p>
        )}
      </div>
    </Link>
  );
}

// ─── Sort / Filter bar ────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "discount", label: "Best Discount" },
];

function SortBar({ sort, onSort, total }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const label = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <p className="text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{total}</span>{" "}
        {total === 1 ? "product" : "products"} found
      </p>

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-full px-3 py-1.5 hover:border-green-400 hover:text-green-700 transition-colors"
        >
          <ArrowUpDown size={12} />
          {label}
          <ChevronDown
            size={12}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 min-w-[170px] overflow-hidden">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onSort(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-green-50 hover:text-green-700 transition-colors ${
                  sort === opt.value
                    ? "text-green-700 bg-green-50 font-semibold"
                    : "text-gray-600"
                }`}
              >
                {opt.value === sort && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 mb-0.5" />
                )}
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const q = (searchParams.get("q") || "").trim();

  const [results, setResults] = useState(null); // null = not yet loaded
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("relevance");
  const [localQuery, setLocalQuery] = useState(q);
  const inputRef = useRef(null);

  // ── Fetch search results ──────────────────────────────────────────
  useEffect(() => {
    if (!q) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError(null);

    fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(q)}&size=20`)
      .then((r) => {
        if (!r.ok) throw new Error("Search failed");
        return r.json();
      })
      .then((data) => setResults(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [q]);

  // ── Sync local input if URL changes (e.g. browser back) ──────────
  useEffect(() => {
    setLocalQuery(q);
    setSort("relevance"); // reset sort on new query
  }, [q]);

  // ── Handle search form submit ────────────────────────────────────
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const val = localQuery.trim();
      if (!val) return;
      setSearchParams({ q: val });
    },
    [localQuery, setSearchParams],
  );

  // ── Apply client-side sort to products ───────────────────────────
  const sortedProducts = useCallback(() => {
    if (!results?.products) return [];
    let list = [...results.products];
    if (sort === "price_asc")
      list.sort((a, b) => getCustomerPrice(a) - getCustomerPrice(b));
    if (sort === "price_desc")
      list.sort((a, b) => getCustomerPrice(b) - getCustomerPrice(a));
    if (sort === "rating")
      list.sort((a, b) => (b.ratingsAverage ?? 0) - (a.ratingsAverage ?? 0));
    if (sort === "discount")
      list.sort((a, b) => (getDiscountPct(b) ?? 0) - (getDiscountPct(a) ?? 0));
    return list;
  }, [results, sort]);

  const hasCategories = results?.categories?.length > 0;
  const hasSubCategories = results?.subCategories?.length > 0;
  const hasProducts = results?.products?.length > 0;
  const hasAny = hasCategories || hasSubCategories || hasProducts;

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      {/* ── Search bar header ── */}
      {/* <div
        className="sticky top-0 z-30 bg-white border-b border-gray-100"
        style={{ boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div
              className="flex flex-1 items-center gap-2 rounded-full border px-4 py-2 transition-all"
              style={{ borderColor: "#5CB74B", background: "#f8fff8" }}
            >
              <Search size={16} color="#5CB74B" className="flex-shrink-0" />
              <input
                ref={inputRef}
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search products, categories…"
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
              />
              {localQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalQuery("");
                    inputRef.current?.focus();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#5CB74B" }}
            >
              Search
            </button>
          </form>
        </div>
      </div> */}

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* No query state */}
        {!q && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Search size={48} color="#d1d5db" />
            <p className="text-lg font-semibold text-gray-400">
              What are you looking for?
            </p>
            <p className="text-sm text-gray-400">
              Type something in the search box above
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-8">
            {/* Category skeletons */}
            <div>
              <div className="h-4 w-24 rounded bg-gray-200 animate-pulse mb-4" />
              <div className="flex gap-3 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <CategoryCardSkeleton key={i} />
                ))}
              </div>
            </div>
            {/* Product skeletons */}
            <div>
              <div className="h-4 w-20 rounded bg-gray-200 animate-pulse mb-4" />
              <div className="flex gap-3 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <Package size={40} color="#f87171" />
            <p className="text-base font-semibold text-red-500">
              Something went wrong
            </p>
            <p className="text-sm text-gray-400">{error}</p>
            <button
              onClick={() => setSearchParams({ q })}
              className="mt-2 px-5 py-2 rounded-full text-sm font-semibold text-white"
              style={{ background: "#5CB74B" }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && q && results && (
          <>
            {/* Did-you-mean */}
            {results.suggestion &&
              results.suggestion.toLowerCase() !== q.toLowerCase() && (
                <div
                  className="mb-4 px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: "#fffbe6", color: "#666" }}
                >
                  Did you mean:{" "}
                  <button
                    onClick={() => setSearchParams({ q: results.suggestion })}
                    className="font-semibold underline underline-offset-2"
                    style={{ color: "#5CB74B" }}
                  >
                    {results.suggestion}
                  </button>
                </div>
              )}

            {/* Empty state */}
            {!hasAny && (
              <div className="flex flex-col items-center py-24 gap-4 text-center">
                <Search size={48} color="#d1d5db" />
                <p className="text-lg font-semibold text-gray-500">
                  No results for &ldquo;{q}&rdquo;
                </p>
                <p className="text-sm text-gray-400">
                  Try different keywords or browse our categories
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-2 px-5 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ background: "#5CB74B" }}
                >
                  Go Home
                </button>
              </div>
            )}

            {/* ── Categories ── */}
            {hasCategories && (
              <section className="mb-8">
                <SectionHeader
                  icon={<Grid size={14} color="#5CB74B" />}
                  title="Categories"
                  count={results.categories.length}
                />
                <div
                  className="flex gap-3 overflow-x-auto pb-2"
                  style={{ scrollbarWidth: "none" }}
                >
                  {results.categories.map((cat) => (
                    <CategoryChip key={cat._id} cat={cat} query={q} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Sub-categories ── */}
            {hasSubCategories && (
              <section className="mb-8">
                <SectionHeader
                  icon={<Layers size={14} color="#5CB74B" />}
                  title="Sub-categories"
                  count={results.subCategories.length}
                />
                <div
                  className="flex gap-3 overflow-x-auto pb-2"
                  style={{ scrollbarWidth: "none" }}
                >
                  {results.subCategories.map((sub) => (
                    <SubCategoryChip key={sub._id} sub={sub} query={q} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Products ── */}
            {hasProducts && (
              <section className="mb-8">
                <SectionHeader
                  icon={<Package size={14} color="#5CB74B" />}
                  title="Products"
                  count={results.products.length}
                />

                <SortBar
                  sort={sort}
                  onSort={setSort}
                  total={results.products.length}
                />

                {/* Responsive grid — wraps on tablet+, scrolls on mobile */}
                <div className="flex flex-wrap gap-3" style={{ minWidth: 0 }}>
                  {sortedProducts().map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      query={q}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Small helper: section header ────────────────────────────────────────────

function SectionHeader({ icon, title, count }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-green-50">
        {icon}
      </span>
      <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={{ background: "#f0faf0", color: "#5CB74B" }}
      >
        {count}
      </span>
    </div>
  );
}
