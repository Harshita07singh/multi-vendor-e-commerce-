import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { flashSaleAPI } from "../services/api";
import { Zap, Clock, ShoppingCart, ArrowLeft, Tag } from "lucide-react";

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

/* ─── Countdown Timer ─── */
const Countdown = ({ endDate }) => {
  const calc = () => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return { h: 0, m: 0, s: 0 };
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc());
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endDate]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-red-300" />
      <span className="text-lg font-mono font-bold text-white">
        {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
      </span>
      <span className="text-sm text-white/60">remaining</span>
    </div>
  );
};

/* ─── Product Card ─── */
const SaleProductCard = ({ item }) => {
  const [hov, setHov] = useState(false);
  const p = item.product;
  if (!p) return null;
  const navigate = useNavigate();

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => navigate(`/product/${p.slug}`)}
      className={`bg-white rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer ${
        hov
          ? "shadow-xl border-red-200 -translate-y-1"
          : "shadow-sm border-gray-100"
      }`}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden bg-gray-50"
        style={{ height: 200 }}
      >
        <img
          src={
            p.images?.[0]?.url || "https://placehold.co/300x200?text=Product"
          }
          alt={p.name}
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: hov ? "scale(1.04)" : "scale(1)" }}
          onError={(e) => {
            e.target.src = "https://placehold.co/300x200?text=No+Image";
          }}
        />
        {/* Discount badge */}
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
          -{item.discountPercent}%
        </div>
        {/* Vendor */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
          {item.vendor?.businessDetails?.businessName || "Vendor"}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
          {p.category?.name}
          {p.subCategory ? ` · ${p.subCategory.name}` : ""}
        </p>
        <h3 className="font-semibold text-gray-800 text-sm mb-3 line-clamp-2 leading-snug">
          {p.name}
        </h3>

        {/* Pricing — salePrice is already customer-facing for flash sales */}
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-500">
              ₹{item.salePrice?.toLocaleString()}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ₹{item.originalPrice?.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Save ₹{(item.originalPrice - item.salePrice)?.toLocaleString()}
            </span>
            {/* If product has MRP (platform's tag price) show it too */}
            {getMRP(item.product) && getMRP(item.product) > item.salePrice && (
              <span className="text-[10px] text-gray-400">
                MRP{" "}
                <span className="line-through">
                  ₹{getMRP(item.product)?.toLocaleString()}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Stock + Add */}
        <div className="flex items-center justify-between">
          <div className="text-xs">
            {item.stock > 0 ? (
              <span className="text-green-600 font-medium">
                ● {item.stock} in stock
              </span>
            ) : (
              <span className="text-red-400">● Out of stock</span>
            )}
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            disabled={item.stock === 0}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          >
            <ShoppingCart className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Skeleton Loader ─── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-4 bg-gray-100 rounded w-2/3" />
      <div className="h-4 bg-gray-100 rounded w-1/2" />
    </div>
  </div>
);

/* ─── Sale Products Page ─── */
const SaleProductsPage = () => {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const data = await flashSaleAPI.getLiveSales();
        const found = (Array.isArray(data) ? data : []).find(
          (s) => s._id === saleId,
        );
        setSale(found || null);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, [saleId]);

  const approvedProducts = sale?.products?.filter((p) => p.isApproved) || [];

  const sortedProducts = [...approvedProducts].sort((a, b) => {
    if (sortBy === "price_asc") return a.salePrice - b.salePrice;
    if (sortBy === "price_desc") return b.salePrice - a.salePrice;
    if (sortBy === "discount") return b.discountPercent - a.discountPercent;
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-red-600 to-orange-500 h-48 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-400 mb-2">
            Sale Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            This sale may have ended or doesn't exist.
          </p>
          <button
            onClick={() => navigate("/daily-sale")}
            className="flex items-center gap-2 mx-auto bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sales
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
        {sale.bannerImage ? (
          <>
            <img
              src={sale.bannerImage}
              alt={sale.title}
              className="w-full h-full object-cover absolute inset-0"
              style={{ minHeight: 220 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ backgroundColor: sale.bannerColor || "#e63946" }}
          />
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {/* Back button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-0.5 rounded-full animate-pulse">
                🔴 LIVE SALE
              </span>
              <span className="text-white/60 text-xs">
                {approvedProducts.length} products
              </span>
            </div>
            <h1 className="text-white text-4xl font-extrabold mb-1">
              {sale.title}
            </h1>
            {sale.displayBannerText && (
              <p className="text-white/80 text-lg">{sale.displayBannerText}</p>
            )}
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <Countdown endDate={sale.endDate} />
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <Tag className="w-4 h-4" />
              {approvedProducts.length} deals available
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Sort bar */}
        {approvedProducts.length > 0 && (
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-gray-500 text-sm">
              Showing{" "}
              <strong className="text-gray-800">
                {approvedProducts.length}
              </strong>{" "}
              products
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition"
              >
                <option value="default">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>
        )}

        {/* Grid */}
        {approvedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-400 mb-1">
              No Products Yet
            </h3>
            <p className="text-gray-400 text-sm">
              Products will appear here once vendors add them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedProducts.map((item) => (
              <SaleProductCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleProductsPage;
