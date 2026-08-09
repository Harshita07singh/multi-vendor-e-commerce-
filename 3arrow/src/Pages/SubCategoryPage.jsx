import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProducts, resetProducts } from "../redux/productSlice";
import {
  fetchBrowserLocation,
  selectCustomerCoords,
  selectCustomerCoordsKey,
} from "../redux/Locationslice";
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  SlidersHorizontal,
  Star,
  ChevronDown,
  X,
  ArrowUpDown,
  BadgePercent,
  Check,
} from "lucide-react";
import WishlistButton from "../components/WishlistButton";
import { setCartFromBackend, addToCart } from "../redux/cartSlice";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

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

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "discount", label: "Best Discount" },
  { value: "newest", label: "Newest First" },
];

const RATING_OPTIONS = [
  { value: 4, label: "4★ & above" },
  { value: 3, label: "3★ & above" },
  { value: 2, label: "2★ & above" },
];

const DISCOUNT_OPTIONS = [
  { value: 10, label: "10% or more" },
  { value: 25, label: "25% or more" },
  { value: 50, label: "50% or more" },
];

const DEFAULT_FILTERS = {
  sort: "relevance",
  minRating: null,
  minDiscount: null,
  priceMin: 0,
  priceMax: Infinity,
  inStockOnly: false,
};

function activeFilterCount(f) {
  let n = 0;
  if (f.minRating) n++;
  if (f.minDiscount) n++;
  if (f.priceMax !== Infinity || f.priceMin > 0) n++;
  if (f.inStockOnly) n++;
  return n;
}

function PriceRangeSlider({ min, max, value, onChange }) {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(
    value[1] === Infinity ? max : value[1],
  );

  useEffect(() => {
    setLocalMin(value[0]);
    setLocalMax(value[1] === Infinity ? max : value[1]);
  }, [value, max]);

  const pct = (v) => Math.round(((v - min) / (max - min)) * 100);

  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-3">
        <span>₹{localMin.toLocaleString()}</span>
        <span>₹{localMax.toLocaleString()}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-gray-200 mx-1">
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${pct(localMin)}%`,
            right: `${100 - pct(localMax)}%`,
            background: "#5CB74B",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={Math.max(1, Math.floor((max - min) / 100))}
          value={localMin}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), localMax - 1);
            setLocalMin(v);
            onChange([v, localMax]);
          }}
          className="absolute w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: localMin > max * 0.9 ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={Math.max(1, Math.floor((max - min) / 100))}
          value={localMax}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), localMin + 1);
            setLocalMax(v);
            onChange([localMin, v]);
          }}
          className="absolute w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />
        {[{ val: localMin }, { val: localMax }].map(({ val }, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow -translate-y-1/2 -translate-x-1/2 top-1/2 pointer-events-none"
            style={{ left: `${pct(val)}%`, background: "#5CB74B" }}
          />
        ))}
      </div>
    </div>
  );
}

function FilterDrawer({ open, onClose, filters, onChange, products }) {
  const ref = useRef(null);

  const { priceFloor, priceCeil } = useMemo(() => {
    if (!products.length) return { priceFloor: 0, priceCeil: 10000 };
    const prices = products.map(getCustomerPrice);
    return {
      priceFloor: Math.floor(Math.min(...prices)),
      priceCeil: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const set = (key, val) => onChange({ ...filters, [key]: val });
  const effectiveMax =
    filters.priceMax === Infinity ? priceCeil : filters.priceMax;

  const Section = ({ title, children }) => (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </p>
      {children}
    </div>
  );

  const Chip = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        active
          ? "bg-green-700 text-white border-green-700"
          : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
      }`}
    >
      {active && <Check className="w-3 h-3 flex-shrink-0" />}
      {children}
    </button>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <div
        ref={ref}
        className={`fixed z-50 bg-white flex flex-col transition-transform duration-300 ease-out
          bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh]
          sm:bottom-auto sm:top-0 sm:left-auto sm:right-0 sm:w-80 sm:h-full sm:rounded-none sm:rounded-l-2xl
          ${open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal
              className="w-4 h-4"
              style={{ color: "#5CB74B" }}
            />
            <h2 className="font-bold text-gray-800 text-sm">Filters</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                onChange({
                  ...DEFAULT_FILTERS,
                  sort: filters.sort,
                  priceMin: priceFloor,
                  priceMax: priceCeil,
                })
              }
              className="text-xs font-semibold"
              style={{ color: "#5CB74B" }}
            >
              Reset all
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          <Section title="Price Range">
            <PriceRangeSlider
              min={priceFloor}
              max={priceCeil}
              value={[filters.priceMin, effectiveMax]}
              onChange={([lo, hi]) =>
                onChange({
                  ...filters,
                  priceMin: lo,
                  priceMax: hi >= priceCeil ? Infinity : hi,
                })
              }
            />
          </Section>
          <Section title="Customer Rating">
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  active={filters.minRating === opt.value}
                  onClick={() =>
                    set(
                      "minRating",
                      filters.minRating === opt.value ? null : opt.value,
                    )
                  }
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {opt.label}
                </Chip>
              ))}
            </div>
          </Section>
          <Section title="Discount">
            <div className="flex flex-wrap gap-2">
              {DISCOUNT_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  active={filters.minDiscount === opt.value}
                  onClick={() =>
                    set(
                      "minDiscount",
                      filters.minDiscount === opt.value ? null : opt.value,
                    )
                  }
                >
                  <BadgePercent className="w-3 h-3" />
                  {opt.label}
                </Chip>
              ))}
            </div>
          </Section>
          <Section title="Availability">
            <button
              onClick={() => set("inStockOnly", !filters.inStockOnly)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div
                className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors ${filters.inStockOnly ? "bg-green-600" : "bg-gray-200"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${filters.inStockOnly ? "translate-x-5" : "translate-x-0"}`}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                In stock only
              </span>
            </button>
          </Section>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full text-sm font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: "#5CB74B" }}
          >
            Show results
          </button>
        </div>
      </div>
    </>
  );
}

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const label = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Sort";

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-full px-3 py-1.5 hover:border-green-400 hover:text-green-700 transition-colors min-h-[32px] whitespace-nowrap"
      >
        <ArrowUpDown className="w-3 h-3" />
        {label}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 min-w-[180px] overflow-hidden">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2 ${
                value === opt.value
                  ? "text-green-700 bg-green-50 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {value === opt.value && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ActiveFilterPills({ filters, onChange, priceFloor, priceCeil }) {
  const pills = [];
  const effectiveMax =
    filters.priceMax === Infinity ? priceCeil : filters.priceMax;

  if (filters.minRating)
    pills.push({
      key: "r",
      label: `${filters.minRating}★ & above`,
      clear: () => onChange({ ...filters, minRating: null }),
    });
  if (filters.minDiscount)
    pills.push({
      key: "d",
      label: `${filters.minDiscount}%+ off`,
      clear: () => onChange({ ...filters, minDiscount: null }),
    });
  if (filters.priceMin > priceFloor || effectiveMax < priceCeil)
    pills.push({
      key: "p",
      label: `₹${filters.priceMin.toLocaleString()} – ₹${effectiveMax.toLocaleString()}`,
      clear: () =>
        onChange({ ...filters, priceMin: priceFloor, priceMax: Infinity }),
    });
  if (filters.inStockOnly)
    pills.push({
      key: "s",
      label: "In stock",
      clear: () => onChange({ ...filters, inStockOnly: false }),
    });

  if (!pills.length) return null;

  return (
    <div
      className="flex gap-2 overflow-x-auto py-2 px-3 sm:px-4"
      style={{ scrollbarWidth: "none" }}
    >
      {pills.map((pill) => (
        <button
          key={pill.key}
          onClick={pill.clear}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border text-green-700 border-green-300 bg-green-50 hover:bg-green-100 transition-colors"
        >
          {pill.label}
          <X className="w-3 h-3" />
        </button>
      ))}
    </div>
  );
}

export default function SubCategoryPage() {
  const { subCategoryId, subCategoryName } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [addedToCartId, setAddedToCartId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const { products, status } = useSelector((s) => s.products);
  const { isLoggedIn } = useSelector((s) => s.auth);
  const customerCoords = useSelector(selectCustomerCoords);
  const customerCoordsKey = useSelector(selectCustomerCoordsKey);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    dispatch(resetProducts());
    setFilters(DEFAULT_FILTERS);
  }, [dispatch, subCategoryId]);

  useEffect(() => {
    const params = { subCategory: subCategoryId };
    if (searchQuery) params.search = searchQuery;
    if (customerCoords) {
      params.lat = customerCoords.lat;
      params.lng = customerCoords.lng;
      params.radiusKm = 50;
    }
    dispatch(getProducts(params));
  }, [dispatch, subCategoryId, searchQuery, customerCoordsKey]);

  const { priceFloor, priceCeil } = useMemo(() => {
    if (!products.length) return { priceFloor: 0, priceCeil: 10000 };
    const prices = products.map(getCustomerPrice);
    return {
      priceFloor: Math.floor(Math.min(...prices)),
      priceCeil: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    list = list.filter((p) => {
      const cp = getCustomerPrice(p);
      return (
        cp >= filters.priceMin &&
        (filters.priceMax === Infinity || cp <= filters.priceMax)
      );
    });
    if (filters.minRating)
      list = list.filter((p) => (p.ratingsAverage ?? 0) >= filters.minRating);
    if (filters.minDiscount)
      list = list.filter(
        (p) => (getDiscountPct(p) ?? 0) >= filters.minDiscount,
      );
    if (filters.inStockOnly)
      list = list.filter((p) => (p.stock ?? p.countInStock ?? 1) > 0);
    if (filters.sort === "price_asc")
      list.sort((a, b) => getCustomerPrice(a) - getCustomerPrice(b));
    else if (filters.sort === "price_desc")
      list.sort((a, b) => getCustomerPrice(b) - getCustomerPrice(a));
    else if (filters.sort === "rating")
      list.sort((a, b) => (b.ratingsAverage ?? 0) - (a.ratingsAverage ?? 0));
    else if (filters.sort === "discount")
      list.sort((a, b) => (getDiscountPct(b) ?? 0) - (getDiscountPct(a) ?? 0));
    else if (filters.sort === "newest")
      list.sort(
        (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0),
      );
    return list;
  }, [products, filters]);

  const filterCount = activeFilterCount(filters);

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    const imageUrl = product.images?.[0]?.url
      ? product.images[0].url.startsWith("/")
        ? `${BASE_URL}${product.images[0].url}`
        : product.images[0].url
      : "";

    if (!isLoggedIn) {
      dispatch(
        addToCart({
          id: product._id,
          productId: product._id,
          title: product.name,
          name: product.name,
          image: imageUrl,
          price: getCustomerPrice(product),
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
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          {/* Row 1: Back + title + count */}
          <div className="flex items-center gap-2 py-2 border-b border-gray-100">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-gray-600 hover:text-green-700 transition-colors flex-shrink-0 -ml-1 px-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Back</span>
            </button>
            <h1 className="text-sm font-bold text-gray-800 capitalize truncate flex-1">
              {decodeURIComponent(subCategoryName || "")}
            </h1>
            {status === "succeeded" && (
              <span className="text-[10px] text-gray-400 flex-shrink-0">
                {filteredProducts.length}
                {filteredProducts.length !== products.length
                  ? ` / ${products.length}`
                  : ""}{" "}
                items
              </span>
            )}
          </div>

          {/* Row 2: Filter + Sort */}
          <div
            className="flex items-center gap-2 py-1.5 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <button
              onClick={() => setDrawerOpen(true)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold border transition-all ${
                filterCount > 0
                  ? "bg-green-700 text-white border-green-700"
                  : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700"
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filters
              {filterCount > 0 && (
                <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white text-green-700 text-[9px] font-bold">
                  {filterCount}
                </span>
              )}
            </button>

            <div className="w-px h-4 bg-gray-200 flex-shrink-0" />

            <SortDropdown
              value={filters.sort}
              onChange={(v) => setFilters((f) => ({ ...f, sort: v }))}
            />

            {/* Quick-sort chips — desktop only */}
            <div className="hidden sm:flex items-center gap-1.5">
              {["price_asc", "price_desc", "rating", "discount"].map((s) => {
                const opt = SORT_OPTIONS.find((o) => o.value === s);
                const active = filters.sort === s;
                return (
                  <button
                    key={s}
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        sort: active ? "relevance" : s,
                      }))
                    }
                    className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium border transition-all ${
                      active
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white text-gray-500 border-gray-200 hover:border-green-400"
                    }`}
                  >
                    {opt?.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filterCount > 0 && (
          <ActiveFilterPills
            filters={filters}
            onChange={setFilters}
            priceFloor={priceFloor}
            priceCeil={priceCeil}
          />
        )}
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        products={products}
      />

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-2 sm:px-3 pb-16 pt-2">
        {/* Loading skeleton */}
        {status === "loading" && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-2">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-1.5 animate-pulse">
                <div className="w-full aspect-square bg-gray-200 rounded-lg mb-1.5" />
                <div className="h-2 bg-gray-200 rounded mb-1" />
                <div className="h-2 bg-gray-200 rounded w-2/3 mb-1.5" />
                <div className="h-5 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty — no API results */}
        {status === "succeeded" && products.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No products found</p>
          </div>
        )}

        {/* Empty — filters too strict */}
        {status === "succeeded" &&
          products.length > 0 &&
          filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <SlidersHorizontal className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">
                No products match your filters
              </p>
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold text-white"
                style={{ background: "#5CB74B" }}
              >
                Clear filters
              </button>
            </div>
          )}

        {/* ── Product grid ── */}
        {status === "succeeded" && filteredProducts.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-2">
            {filteredProducts.map((product) => {
              const imageUrl = product.images?.[0]?.url
                ? product.images[0].url.startsWith("/")
                  ? `${BASE_URL}${product.images[0].url}`
                  : product.images[0].url
                : null;
              const discountPct = getDiscountPct(product);
              const mrp = getMRP(product);
              const cp = getCustomerPrice(product);

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-xl p-1.5 hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
                  onClick={() =>
                    navigate(`/product/${product.slug || product._id}`)
                  }
                >
                  {/* Image */}
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-1.5 flex-shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-50 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-green-200" />
                      </div>
                    )}

                    {discountPct > 0 && (
                      <span className="absolute top-1 left-1 bg-red-500 text-white text-[7px] font-bold px-1 py-0.5 rounded-full leading-none">
                        -{discountPct}%
                      </span>
                    )}

                    <div
                      className="absolute top-1 right-1 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <WishlistButton
                        productId={product._id}
                        product={product}
                        size={9}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-semibold text-[9px] sm:text-[10px] text-gray-800 line-clamp-2 leading-tight mb-0.5">
                      {product.name}
                    </h3>

                    {product.ratingsAverage > 0 && (
                      <div className="flex items-center gap-0.5 mb-0.5">
                        <Star className="w-2 h-2 fill-amber-400 text-amber-400 flex-shrink-0" />
                        <span className="text-[8px] text-gray-500">
                          {product.ratingsAverage?.toFixed(1)}
                          {product.ratingsCount > 0 && (
                            <span className="text-gray-400">
                              {" "}
                              ({product.ratingsCount})
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    <div className="mt-auto mb-1">
                      <span className="text-green-700 font-bold text-[10px] sm:text-[11px]">
                        ₹{cp?.toLocaleString()}
                      </span>
                      {mrp && mrp > cp && (
                        <span className="text-[8px] text-gray-400 line-through ml-1">
                          ₹{mrp?.toLocaleString()}
                        </span>
                      )}
                      {product.unit && (
                        <span className="text-[8px] text-gray-400 ml-0.5">
                          /{product.unit}
                        </span>
                      )}
                    </div>

                    <button
                      className={`w-full py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-semibold rounded-full transition-all flex items-center justify-center gap-0.5 active:scale-95 ${
                        addedToCartId === product._id
                          ? "bg-green-700 text-white"
                          : "bg-green-50 hover:bg-green-700 text-green-700 hover:text-white"
                      }`}
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      <ShoppingCart className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" />
                      {addedToCartId === product._id ? "Added ✓" : "Add"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
