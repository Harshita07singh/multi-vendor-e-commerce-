import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Shield,
  Truck,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Tag,
  X,
  CheckCircle,
  Loader,
  ArrowRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCartFromBackend, addToCart } from "../redux/cartSlice";
import WishlistButton from "../components/WishlistButton";
import ReviewSection from "../components/ReviewSection";

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

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [activeIsVideo, setActiveIsVideo] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);

  // ── Coupon state ──
  const [couponCode, setCouponCode] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponStatus, setCouponStatus] = useState(null);
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState("");

  // ✅ SCROLL TO TOP on slug change (fixes product page opening mid-scroll)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [slug]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/products/${slug}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return <LoadingScreen />;
  if (error || !product)
    return <ErrorScreen error={error} onBack={() => navigate(-1)} />;

  const images =
    product.images?.length > 0
      ? product.images.map((img) =>
          img.url?.startsWith("/") ? `${BASE_URL}${img.url}` : img.url,
        )
      : [];

  // customerPrice = vendor price + platform margin (what customer actually pays)
  const customerPrice = getCustomerPrice(product);
  const mrp = getMRP(product);
  const discountPct = getDiscountPct(product);
  // Keep discountedPrice alias so nothing else breaks
  const discountedPrice = customerPrice;

  const subtotal = customerPrice * quantity;
  const couponSaving =
    couponData && couponStatus === "valid"
      ? couponData.discountType === "percentage"
        ? Math.round(subtotal * (couponData.discountValue / 100))
        : Math.min(couponData.discountValue, subtotal)
      : 0;
  const finalPrice = subtotal - couponSaving;
  const gstAmount = Math.round(finalPrice * (product.gst / 100));
  const hasMultipleMedia = images.length > 1 || product.videoUrl;

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponStatus("loading");
    setCouponError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/api/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          code,
          productId: product._id,
          cartTotal: discountedPrice * quantity,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponStatus("invalid");
        setCouponError(data.message || "Invalid coupon code");
        setCouponData(null);
      } else {
        setCouponStatus("valid");
        setCouponCode(code);
        setCouponData(data.coupon);
      }
    } catch {
      setCouponStatus("invalid");
      setCouponError("Failed to validate coupon. Please try again.");
      setCouponData(null);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponInput("");
    setCouponStatus(null);
    setCouponData(null);
    setCouponError("");
  };

  const handleAddToCart = async () => {
    // ✅ Guest flow — no login needed
    if (!isLoggedIn) {
      const imageUrl = product.images?.[0]?.url
        ? product.images[0].url.startsWith("/")
          ? `${BASE_URL}${product.images[0].url}`
          : product.images[0].url
        : "";
      dispatch(
        addToCart({
          id: product._id,
          productId: product._id,
          title: product.name,
          name: product.name,
          image: imageUrl,
          price: customerPrice,
          oldPrice: mrp && mrp > customerPrice ? `₹${mrp}` : null,
          rating: product.ratingsAverage ?? 0,
          reviews: product.ratingsCount ?? 0,
          seller: product.brand || "",
          stock: product.stock || 99,
          slug: product.slug || product._id,
          quantity,
        }),
      );
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
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
        body: JSON.stringify({
          productId: product._id,
          quantity,
          couponCode: couponStatus === "valid" ? couponCode : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add to cart");
      dispatch(setCartFromBackend(data.data));
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  const ThumbItem = ({ img, i, isVideo = false }) => (
    <div
      className="thumb-img"
      onClick={() => {
        if (isVideo) setActiveIsVideo(true);
        else {
          setActiveImg(i);
          setActiveIsVideo(false);
        }
      }}
      style={{
        width: 64,
        height: 64,
        borderRadius: 8,
        flexShrink: 0,
        border: `2px solid ${
          isVideo
            ? activeIsVideo
              ? "#299E60"
              : "#d8eddf"
            : !activeIsVideo && activeImg === i
              ? "#299E60"
              : "#d8eddf"
        }`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all .2s",
        background: isVideo ? "#0d1f14" : "#fff",
        position: "relative",
      }}
    >
      {isVideo ? (
        <>
          <video
            src={
              product.videoUrl.startsWith("/")
                ? `${BASE_URL}${product.videoUrl}`
                : product.videoUrl
            }
            muted
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.65,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#fff", fontSize: 14 }}>▶</span>
          </div>
        </>
      ) : (
        <img
          src={img}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
    </div>
  );

  // ── Tab definitions ──
  const tabs = [
    { id: "overview", label: "Overview" },
    {
      id: "reviews",
      label: `Reviews${product.ratingsCount > 0 ? ` (${product.ratingsCount})` : ""}`,
    },
  ];

  return (
    <div
      className="pdp"
      style={{ background: "#f5f9f6", fontFamily: "'Outfit', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;900&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .pdp, .pdp * { box-sizing: border-box; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes cartBounce { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes couponPop { 0% { transform:scale(0.92); opacity:0; } 100% { transform:scale(1); opacity:1; } }
        @keyframes tabFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

        .pdp .thumb-img:hover { border-color: #299E60 !important; transform: scale(1.04); }
        .pdp .add-cart-btn:hover:not(:disabled) { background: #1e7a49 !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(41,158,96,0.4) !important; }
        .pdp .tag-pill:hover { background: rgba(41,158,96,0.15) !important; border-color: #299E60 !important; color: #1e7a49 !important; }
        .pdp .zoom-img { transition: transform 0.4s ease; }
        .pdp .zoom-img:hover { transform: scale(1.06); }
        .pdp .feature-card:hover { border-color: rgba(41,158,96,0.4) !important; background: rgba(41,158,96,0.04) !important; }

        .pdp .wishlist-circle-btn {
          width: 40px !important; height: 40px !important; border-radius: 50% !important;
          background: rgba(255,255,255,0.95) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important;
          border: 1.5px solid #e8f5ee !important; display: flex !important;
          align-items: center !important; justify-content: center !important;
          transition: all 0.2s ease !important; cursor: pointer !important;
        }
        .pdp .wishlist-circle-btn:hover { transform: scale(1.12) !important; background: #fff !important; }

        .pdp .scrollbar-hide::-webkit-scrollbar { display: none; }
        .pdp .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .pdp .coupon-apply-btn:hover:not(:disabled) { background: #1e7a49 !important; }
        .pdp .coupon-apply-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pdp .coupon-success-banner { animation: couponPop 0.3s ease; }

        /* ── Tab styles ── */
        .pdp .tab-btn { position: relative; padding: 12px 20px; font-size: 14px; font-weight: 600; font-family: 'Outfit', sans-serif; background: none; border: none; cursor: pointer; color: #6b8577; transition: color .2s; white-space: nowrap; }
        .pdp .tab-btn:hover { color: #299E60; }
        .pdp .tab-btn.active { color: #299E60; }
        .pdp .tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #299E60; border-radius: 2px 2px 0 0; }
        .pdp .tab-content { animation: tabFadeIn .25s ease; }

        /* ── DESKTOP LAYOUT ── */
        .pdp-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr 340px;
          gap: 28px;
          align-items: start;
          animation: fadeUp .4s ease;
        }
        .pdp-gallery { display: flex; flex-direction: row; gap: 12px; }
        .pdp-thumbs-left { display: flex; flex-direction: column; gap: 8px; max-height: 520px; overflow-y: auto; }
        .pdp-thumbs-bottom { display: none; }

        /* ── MOBILE LAYOUT ── */
        @media (max-width: 768px) {
          .pdp-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .pdp .img-section { position: static !important; }
          .pdp .buy-box { position: static !important; }
          .pdp-gallery { flex-direction: column; gap: 0; }
          .pdp-thumbs-left { display: none !important; }
          .pdp-thumbs-bottom {
            display: flex !important; flex-direction: row;
            gap: 8px; overflow-x: auto; padding: 10px 0 2px;
          }
          .pdp .wishlist-circle-btn { width: 34px !important; height: 34px !important; }
          .pdp-breadcrumb-extra { display: none; }
          .pdp .tab-btn { padding: 10px 14px; font-size: 13px; }
        }

        @media (max-width: 480px) {
          .pdp .product-title { font-size: 20px !important; }
          .pdp .price-main { font-size: 28px !important; }
        }
      `}</style>

      {/* ── Breadcrumb ── */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #d8eddf",
          padding: "10px 0",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontFamily: "JetBrains Mono, monospace",
              color: "#6b8577",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate(-1)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#299E60",
                fontFamily: "Outfit, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                padding: 0,
              }}
            >
              <ArrowLeft size={15} /> Back
            </button>
            <span className="pdp-breadcrumb-extra" style={{ color: "#d8eddf" }}>
              ›
            </span>
            <span className="pdp-breadcrumb-extra" style={{ color: "#a8c4b4" }}>
              {product.category?.name}
            </span>
            <span className="pdp-breadcrumb-extra" style={{ color: "#d8eddf" }}>
              ›
            </span>
            <span className="pdp-breadcrumb-extra" style={{ color: "#a8c4b4" }}>
              {product.subCategory?.name}
            </span>
            <span className="pdp-breadcrumb-extra" style={{ color: "#d8eddf" }}>
              ›
            </span>
            <span
              style={{
                color: "#0d1f14",
                fontWeight: 500,
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div
        style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px 48px" }}
      >
        <div className="pdp-grid">
          {/* ── COL 1: IMAGE GALLERY ── */}
          <div className="img-section" style={{ position: "sticky", top: 20 }}>
            <div className="pdp-gallery">
              {hasMultipleMedia && (
                <div className="pdp-thumbs-left">
                  {images.map((img, i) => (
                    <ThumbItem key={i} img={img} i={i} />
                  ))}
                  {product.videoUrl && <ThumbItem isVideo />}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Main image */}
                <div style={{ position: "relative" }}>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      zIndex: 20,
                    }}
                  >
                    <WishlistButton
                      productId={product._id}
                      product={product}
                      size={20}
                      className="wishlist-circle-btn"
                    />
                  </div>
                  {!activeIsVideo && (
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        zIndex: 20,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {discountPct > 0 && (
                        <span
                          style={{
                            background: "#e53935",
                            color: "#fff",
                            fontSize: 11,
                            fontFamily: "JetBrains Mono, monospace",
                            padding: "4px 10px",
                            borderRadius: 100,
                          }}
                        >
                          -{discountPct}%
                        </span>
                      )}
                      {product.isFeatured && (
                        <span
                          style={{
                            background: "#299E60",
                            color: "#fff",
                            fontSize: 11,
                            fontFamily: "JetBrains Mono, monospace",
                            padding: "4px 10px",
                            borderRadius: 100,
                          }}
                        >
                          ★ FEATURED
                        </span>
                      )}
                    </div>
                  )}
                  <div
                    onClick={() => {
                      if (!activeIsVideo) setZoomed(true);
                    }}
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      background: activeIsVideo ? "#000" : "#fff",
                      border: "1px solid #d8eddf",
                      cursor: activeIsVideo ? "default" : "zoom-in",
                      minHeight: 300,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 16px rgba(41,158,96,0.08)",
                      position: "relative",
                    }}
                  >
                    {activeIsVideo && product.videoUrl ? (
                      <video
                        key={product.videoUrl}
                        src={
                          product.videoUrl.startsWith("/")
                            ? `${BASE_URL}${product.videoUrl}`
                            : product.videoUrl
                        }
                        controls
                        autoPlay
                        style={{
                          width: "100%",
                          height: "100%",
                          maxHeight: 480,
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    ) : images.length > 0 ? (
                      <>
                        <img
                          className="zoom-img"
                          src={images[activeImg]}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            maxHeight: 480,
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: 12,
                            right: 12,
                            background: "rgba(255,255,255,0.9)",
                            borderRadius: 8,
                            padding: "6px 8px",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color: "#6b8577",
                            fontSize: 12,
                            pointerEvents: "none",
                          }}
                        >
                          <ZoomIn size={14} /> Zoom
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 72, opacity: 0.2 }}>📦</div>
                    )}
                    {!activeIsVideo && images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImg((i) => Math.max(0, i - 1));
                          }}
                          style={{
                            position: "absolute",
                            left: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.9)",
                            border: "1px solid #d8eddf",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            opacity: activeImg === 0 ? 0.3 : 1,
                          }}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImg((i) =>
                              Math.min(images.length - 1, i + 1),
                            );
                          }}
                          style={{
                            position: "absolute",
                            right: 8,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.9)",
                            border: "1px solid #d8eddf",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            opacity: activeImg === images.length - 1 ? 0.3 : 1,
                          }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {hasMultipleMedia && (
                  <div className="pdp-thumbs-bottom scrollbar-hide">
                    {images.map((img, i) => (
                      <ThumbItem key={i} img={img} i={i} />
                    ))}
                    {product.videoUrl && <ThumbItem isVideo />}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── COL 2: PRODUCT INFO ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.category?.name && (
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "#299E60",
                    fontFamily: "JetBrains Mono, monospace",
                    background: "rgba(41,158,96,0.1)",
                    padding: "3px 12px",
                    borderRadius: 100,
                  }}
                >
                  {product.category.name}
                </span>
              )}
              {product.subCategory?.name && (
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "#6b8577",
                    fontFamily: "JetBrains Mono, monospace",
                    background: "#f5f9f6",
                    border: "1px solid #d8eddf",
                    padding: "3px 12px",
                    borderRadius: 100,
                  }}
                >
                  {product.subCategory.name}
                </span>
              )}
            </div>

            <h1
              className="product-title"
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: 25,
                fontWeight: 600,
                color: "#0d1f14",
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                margin: 0,
              }}
            >
              {product.name}
            </h1>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {product.brand && (
                <span style={{ fontSize: 14, color: "#6b8577" }}>
                  by{" "}
                  <strong style={{ color: "#299E60" }}>{product.brand}</strong>
                </span>
              )}
              {product.ratingsAverage > 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                  onClick={() => setActiveTab("reviews")}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={16}
                        fill={
                          s <= Math.round(product.ratingsAverage)
                            ? "#f5a623"
                            : "none"
                        }
                        color={
                          s <= Math.round(product.ratingsAverage)
                            ? "#f5a623"
                            : "#d8eddf"
                        }
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#6b8577",
                      fontFamily: "JetBrains Mono, monospace",
                      cursor: "pointer",
                      textDecoration: "underline",
                      textDecorationStyle: "dotted",
                    }}
                  >
                    {product.ratingsAverage.toFixed(1)} · {product.ratingsCount}{" "}
                    {product.ratingsCount === 1 ? "review" : "reviews"}
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveTab("reviews")}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 2 }}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} fill="none" color="#d8eddf" />
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#a8c4b4",
                      fontFamily: "JetBrains Mono, monospace",
                      textDecoration: "underline",
                      textDecorationStyle: "dotted",
                    }}
                  >
                    No reviews yet — be first!
                  </span>
                </div>
              )}
            </div>

            <div
              style={{
                height: 1,
                background: "linear-gradient(90deg, #d8eddf, transparent)",
              }}
            />

            {product.description && (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "#6b8577",
                    fontFamily: "JetBrains Mono, monospace",
                    marginBottom: 8,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Fraunces, serif",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0d1f14",
                      marginBottom: 10,
                    }}
                  >
                    About this product
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "#6b8577",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    margin: 0,
                  }}
                >
                  {product.description}
                </p>
              </div>
            )}

            {product.customFields?.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "#6b8577",
                    fontFamily: "JetBrains Mono, monospace",
                    marginBottom: 8,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "Fraunces, serif",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#0d1f14",
                      marginBottom: 10,
                    }}
                  >
                    Specifications
                  </h3>
                </div>
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #d8eddf",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {product.customFields.map((field, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        borderBottom:
                          i < product.customFields.length - 1
                            ? "1px solid #f0f7f3"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 130,
                          flexShrink: 0,
                          padding: "10px 14px",
                          background: "#f5f9f6",
                          fontSize: 12,
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#6b8577",
                          fontWeight: 500,
                        }}
                      >
                        {field.label}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          padding: "10px 14px",
                          fontSize: 13,
                          color: "#0d1f14",
                        }}
                      >
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.tags?.length > 0 && (
              <div>
                <h3
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0d1f14",
                    marginBottom: 10,
                  }}
                >
                  Tags
                </h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {product.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="tag-pill"
                      style={{
                        padding: "5px 14px",
                        borderRadius: 100,
                        border: "1px solid #d8eddf",
                        fontSize: 12,
                        fontFamily: "JetBrains Mono, monospace",
                        color: "#6b8577",
                        background: "#f5f9f6",
                        cursor: "pointer",
                        transition: "all .2s",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {[
              product.sku && { label: "SKU", value: product.sku },
              product.weight && {
                label: "Weight",
                value: `${product.weight}g`,
              },
            ].filter(Boolean).length > 0 && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #d8eddf",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {[
                  product.sku && { label: "SKU", value: product.sku },
                  product.weight && {
                    label: "Weight",
                    value: `${product.weight}g`,
                  },
                ]
                  .filter(Boolean)
                  .map((row, i, arr) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        borderBottom:
                          i < arr.length - 1 ? "1px solid #f0f7f3" : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 120,
                          flexShrink: 0,
                          padding: "10px 16px",
                          background: "#f5f9f6",
                          fontSize: 11,
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#6b8577",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        {row.label}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          padding: "10px 16px",
                          fontSize: 13,
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#0d1f14",
                        }}
                      >
                        {row.value}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* ── COL 3: BUY BOX ── */}
          <div className="buy-box" style={{ position: "sticky", top: 20 }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #d8eddf",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(41,158,96,0.08)",
              }}
            >
              {/* Price */}
              <div
                style={{
                  padding: "20px 22px",
                  borderBottom: "1px solid #f0f7f3",
                }}
              >
                <div
                  style={{
                    fontFamily: "Fraunces, serif",
                    fontSize: 30,
                    fontWeight: 900,
                    color: "#0d1f14",
                    marginBottom: 2,
                  }}
                >
                  ₹{finalPrice.toLocaleString()}
                </div>
                {couponStatus === "valid" && couponSaving > 0 && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#299E60",
                      fontFamily: "JetBrains Mono, monospace",
                      marginBottom: 2,
                    }}
                  >
                    Coupon saves ₹{couponSaving.toLocaleString()} 🎉
                  </div>
                )}
                {mrp && mrp > customerPrice && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#a8c4b4",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    M.R.P:{" "}
                    <span style={{ textDecoration: "line-through" }}>
                      ₹{mrp.toLocaleString()}
                    </span>
                    {discountPct > 0 && (
                      <span style={{ color: "#e53935", marginLeft: 8 }}>
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                )}
                {product?.pricingBreakdown?.categoryMarginPct > 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#6b8577",
                      fontFamily: "JetBrains Mono, monospace",
                      marginTop: 2,
                    }}
                  >
                    Incl. {product.pricingBreakdown.categoryMarginPct}% platform
                    fee
                  </div>
                )}
              </div>

              {/* Stock */}
              <div
                style={{
                  padding: "14px 22px",
                  borderBottom: "1px solid #f0f7f3",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: product.stock > 0 ? "#299E60" : "#e53935",
                      boxShadow:
                        product.stock > 0
                          ? "0 0 0 3px rgba(41,158,96,0.2)"
                          : "none",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: product.stock > 0 ? "#299E60" : "#e53935",
                    }}
                  >
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                {product.stock > 0 && product.stock < 20 && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#e53935",
                      marginTop: 4,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    Only {product.stock} left!
                  </div>
                )}
                {product.stock > 20 && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b8577",
                      marginTop: 4,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {product.stock} units available
                  </div>
                )}
              </div>

              {/* Quantity */}
              {product.stock > 0 && (
                <div
                  style={{
                    padding: "14px 22px",
                    borderBottom: "1px solid #f0f7f3",
                  }}
                >
                  <label
                    style={{
                      fontSize: 11,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "#6b8577",
                      fontFamily: "JetBrains Mono, monospace",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Quantity
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1px solid #d8eddf",
                      borderRadius: 8,
                      overflow: "hidden",
                      width: "fit-content",
                    }}
                  >
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{
                        width: 36,
                        height: 36,
                        border: "none",
                        background: "#f5f9f6",
                        cursor: "pointer",
                        fontSize: 18,
                        color: "#299E60",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        width: 44,
                        textAlign: "center",
                        fontFamily: "JetBrains Mono, monospace",
                        fontWeight: 600,
                        fontSize: 15,
                        color: "#0d1f14",
                        borderLeft: "1px solid #d8eddf",
                        borderRight: "1px solid #d8eddf",
                        padding: "8px 0",
                      }}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      style={{
                        width: 36,
                        height: 36,
                        border: "none",
                        background: "#f5f9f6",
                        cursor: "pointer",
                        fontSize: 18,
                        color: "#299E60",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Coupon */}
              <div
                style={{
                  padding: "14px 22px",
                  borderBottom: "1px solid #f0f7f3",
                }}
              >
                <label
                  style={{
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "#6b8577",
                    fontFamily: "JetBrains Mono, monospace",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 10,
                  }}
                >
                  <Tag size={12} /> Coupon Code
                </label>
                {couponStatus === "valid" ? (
                  <div
                    className="coupon-success-banner"
                    style={{
                      background: "rgba(41,158,96,0.08)",
                      border: "1px solid rgba(41,158,96,0.3)",
                      borderRadius: 10,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <CheckCircle size={16} color="#299E60" />
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "JetBrains Mono, monospace",
                            color: "#0d1f14",
                          }}
                        >
                          {couponCode}
                        </div>
                        {couponData?.description && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#6b8577",
                              marginTop: 1,
                            }}
                          >
                            {couponData.description}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: 11,
                            color: "#299E60",
                            fontWeight: 600,
                            marginTop: 2,
                          }}
                        >
                          {couponData?.discountType === "percentage"
                            ? `${couponData.discountValue}% off applied`
                            : `₹${couponData?.discountValue} off applied`}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#a8c4b4",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          if (couponStatus === "invalid") {
                            setCouponStatus(null);
                            setCouponError("");
                          }
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleApplyCoupon()
                        }
                        placeholder="Enter coupon code"
                        style={{
                          flex: 1,
                          padding: "9px 12px",
                          border: `1px solid ${couponStatus === "invalid" ? "#e53935" : "#d8eddf"}`,
                          borderRadius: 8,
                          fontSize: 13,
                          fontFamily: "JetBrains Mono, monospace",
                          color: "#0d1f14",
                          background: "#f5f9f6",
                          outline: "none",
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      />
                      <button
                        className="coupon-apply-btn"
                        onClick={handleApplyCoupon}
                        disabled={
                          !couponInput.trim() || couponStatus === "loading"
                        }
                        style={{
                          padding: "9px 16px",
                          background: "#299E60",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 600,
                          fontFamily: "Outfit, sans-serif",
                          cursor: "pointer",
                          transition: "background .2s",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {couponStatus === "loading" ? (
                          <Loader
                            size={14}
                            style={{ animation: "spin .7s linear infinite" }}
                          />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                    {couponError && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#e53935",
                          marginTop: 6,
                          fontFamily: "JetBrains Mono, monospace",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <X size={12} /> {couponError}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              {couponStatus === "valid" && couponSaving > 0 && (
                <div
                  style={{
                    padding: "12px 22px",
                    borderBottom: "1px solid #f0f7f3",
                    background: "#f5f9f6",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: "JetBrains Mono, monospace",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#6b8577",
                      }}
                    >
                      <span>Price</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#299E60",
                      }}
                    >
                      <span>Coupon ({couponCode})</span>
                      <span>-₹{couponSaving.toLocaleString()}</span>
                    </div>
                    <div
                      style={{
                        height: 1,
                        background: "#d8eddf",
                        margin: "4px 0",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#0d1f14",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      <span>Total</span>
                      <span>₹{finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div
                style={{
                  padding: "16px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <button
                  className="add-cart-btn"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: addedToCart ? "#1e7a49" : "#299E60",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: "Outfit, sans-serif",
                    cursor: product.stock === 0 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all .25s",
                    boxShadow: "0 4px 16px rgba(41,158,96,0.25)",
                    animation: addedToCart ? "cartBounce .4s ease" : "none",
                    opacity: product.stock === 0 ? 0.5 : 1,
                  }}
                >
                  <ShoppingCart size={18} />
                  {addedToCart ? "Added to Cart ✓" : "Add to Cart"}
                </button>
                <button
                  onClick={() =>
                    navigate("/buy-now", {
                      state: {
                        product,
                        quantity,
                        couponCode:
                          couponStatus === "valid" ? couponCode : null,
                        finalPrice,
                      },
                    })
                  }
                  className="w-full py-3.5 border-2 border-[#299E60] text-[#299E60] font-bold rounded-xl hover:bg-green-50 transition-colors text-sm"
                >
                  Buy Now
                </button>
              </div>

              {/* Trust badges */}
              <div
                style={{
                  padding: "0 22px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {[
                  {
                    icon: <Truck size={15} />,
                    text: "Free delivery on orders above ₹500",
                  },
                  { icon: <Shield size={15} />, text: "Secure & safe payment" },
                  { icon: <RefreshCw size={15} />, text: "7-day easy returns" },
                  {
                    icon: <Package size={15} />,
                    text: "Genuine product guaranteed",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="feature-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid transparent",
                      transition: "all .2s",
                    }}
                  >
                    <span style={{ color: "#299E60", flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: 12, color: "#6b8577" }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #d8eddf",
              overflowX: "auto",
            }}
            className="scrollbar-hide"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="tab-content"
            key={activeTab}
            style={{ paddingTop: 20 }}
          >
            {activeTab === "overview" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {product.shortDescription && (
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #d8eddf",
                      borderRadius: 12,
                      padding: "16px 18px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: "#299E60",
                        fontFamily: "JetBrains Mono, monospace",
                        marginBottom: 8,
                      }}
                    >
                      Description
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#6b8577",
                        lineHeight: 1.7,
                        margin: 0,
                      }}
                    >
                      {product.shortDescription}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <ReviewSection
                productId={product._id}
                ratingsAverage={product.ratingsAverage}
                ratingsCount={product.ratingsCount}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── RELATED PRODUCTS ── */}
      {product.subCategory && (
        <RelatedProducts
          subCategoryId={product.subCategory?._id ?? product.subCategory}
          subCategoryName={product.subCategory?.name ?? ""}
          currentProductId={product._id}
        />
      )}

      {/* ── ZOOM MODAL ── */}
      {zoomed && images.length > 0 && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            cursor: "zoom-out",
          }}
        >
          <img
            src={images[activeImg]}
            alt={product.name}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 12,
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setZoomed(false)}
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              color: "#fff",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// ── Related Product Card ─────────────────────────────────────────
function RelatedProductCard({ product }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [addedToCart, setAddedToCart] = useState(false);

  const getCustomerPriceLocal = (p) =>
    p?.pricingBreakdown?.customerFacingPrice ?? p?.price ?? 0;
  const getMRPLocal = (p) => p?.mrp ?? null;
  const getDiscountPctLocal = (p) => {
    if (p?.pricingBreakdown?.discountPct != null)
      return +p.pricingBreakdown.discountPct.toFixed(1);
    const cp = getCustomerPriceLocal(p),
      mrp = getMRPLocal(p);
    if (mrp && mrp > cp) return +(((mrp - cp) / mrp) * 100).toFixed(1);
    return null;
  };

  const imageUrl = product.images?.[0]?.url
    ? product.images[0].url.startsWith("/")
      ? `${BASE_URL}${product.images[0].url}`
      : product.images[0].url
    : null;

  const customerPrice = getCustomerPriceLocal(product);
  const mrp = getMRPLocal(product);
  const discountPct = getDiscountPctLocal(product);

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
          price: customerPrice,
          oldPrice: mrp && mrp > customerPrice ? `₹${mrp}` : null,
          rating: product.ratingsAverage ?? 0,
          reviews: product.ratingsCount ?? 0,
          seller: product.brand || "",
          stock: product.stock || 99,
          slug: product.slug || product._id,
          quantity: 1,
        }),
      );
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
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
      if (!res.ok) throw new Error(data.message);
      dispatch(setCartFromBackend(data.data));
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.slug || product._id}`)}
      style={{
        width: 160,
        minWidth: 160,
        flexShrink: 0,
        borderRadius: 12,
        border: "1px solid #d8eddf",
        background: "#fff",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all .2s",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(41,158,96,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          aspectRatio: "4/3",
          background: "#f5f9f6",
          overflow: "hidden",
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingCart size={24} style={{ color: "#d8eddf" }} />
          </div>
        )}
        {discountPct > 0 && (
          <span
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              background: "#e53935",
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: 99,
            }}
          >
            -{discountPct}%
          </span>
        )}
        <div
          style={{ position: "absolute", top: 6, right: 6, zIndex: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <WishlistButton
            productId={product._id}
            size={11}
            className="w-6 h-6 rounded-full shadow-md border border-gray-100 flex items-center justify-center"
          />
        </div>
      </div>

      {/* Info */}
      <div
        style={{
          padding: "8px 10px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#0d1f14",
            marginBottom: 4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
          }}
        >
          {product.name}
        </p>

        {product.ratingsAverage > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              marginBottom: 4,
            }}
          >
            <Star size={10} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontSize: 10, color: "#6b8577" }}>
              {product.ratingsAverage?.toFixed(1)}
            </span>
          </div>
        )}

        <div style={{ marginTop: "auto", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#299E60" }}>
            ₹{customerPrice?.toLocaleString()}
          </span>
          {mrp && mrp > customerPrice && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 2,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: "#9ca3af",
                  textDecoration: "line-through",
                }}
              >
                MRP ₹{mrp?.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          style={{
            width: "100%",
            padding: "5px 0",
            borderRadius: 99,
            border: "none",
            fontSize: 10,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            background: addedToCart ? "#1e7a49" : "#f0faf4",
            color: addedToCart ? "#fff" : "#299E60",
            transition: "all .2s",
            fontFamily: "Outfit, sans-serif",
          }}
        >
          <ShoppingCart size={11} />
          {addedToCart ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// ── Related Products Section ─────────────────────────────────────
function RelatedProducts({ subCategoryId, subCategoryName, currentProductId }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    if (!subCategoryId) return;
    setLoading(true);
    fetch(`${BASE_URL}/api/products?subCategory=${subCategoryId}&limit=20`)
      .then((r) => r.json())
      .then((data) => {
        let list = Array.isArray(data)
          ? data
          : (data?.products ?? data?.data ?? []);
        // Exclude current product
        list = list.filter((p) => p._id !== currentProductId);
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [subCategoryId, currentProductId]);

  const checkScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (el)
      el.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
  };

  if (!loading && products.length === 0) return null;

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 16px 48px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: "1px solid #d8eddf",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#299E60",
              fontFamily: "JetBrains Mono, monospace",
              marginBottom: 4,
            }}
          >
            You May Also Like
          </p>
        </div>
        {subCategoryId && (
          <button
            onClick={() =>
              navigate(
                `/subcategory/${subCategoryId}/${encodeURIComponent(subCategoryName)}`,
              )
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "1px solid #d8eddf",
              borderRadius: 99,
              padding: "7px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: "#299E60",
              cursor: "pointer",
              fontFamily: "Outfit, sans-serif",
              transition: "all .2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f0faf4";
              e.currentTarget.style.borderColor = "#299E60";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.borderColor = "#d8eddf";
            }}
          >
            View all <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Carousel */}
      {loading ? (
        <div style={{ display: "flex", gap: 12, overflow: "hidden" }}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 160,
                minWidth: 160,
                borderRadius: 12,
                border: "1px solid #d8eddf",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  aspectRatio: "4/3",
                  background:
                    "linear-gradient(90deg, #f0faf4 25%, #e8f5ee 50%, #f0faf4 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.2s infinite",
                }}
              />
              <div style={{ padding: 10 }}>
                <div
                  style={{
                    height: 10,
                    background: "#f0faf4",
                    borderRadius: 4,
                    marginBottom: 6,
                  }}
                />
                <div
                  style={{
                    height: 10,
                    background: "#f0faf4",
                    borderRadius: 4,
                    width: "60%",
                    marginBottom: 10,
                  }}
                />
                <div
                  style={{
                    height: 26,
                    background: "#f0faf4",
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              style={{
                position: "absolute",
                left: -16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#fff",
                border: "1px solid #d8eddf",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#299E60",
              }}
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div
            ref={trackRef}
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              scrollBehavior: "smooth",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingBottom: 4,
            }}
          >
            {products.map((p) => (
              <RelatedProductCard key={p._id} product={p} />
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              style={{
                position: "absolute",
                right: -16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#fff",
                border: "1px solid #d8eddf",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#299E60",
              }}
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "60vh",
        background: "#f5f9f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        fontFamily: "Outfit, sans-serif",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "3px solid #d8eddf",
          borderTopColor: "#299E60",
          borderRadius: "50%",
          animation: "spin .7s linear infinite",
        }}
      />
      <span style={{ color: "#6b8577", fontSize: 14 }}>Loading product…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorScreen({ error, onBack }) {
  return (
    <div
      style={{
        minHeight: "60vh",
        background: "#f5f9f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        fontFamily: "Outfit, sans-serif",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div style={{ fontSize: 52, opacity: 0.3 }}>📦</div>
      <h2
        style={{
          fontFamily: "Fraunces, serif",
          fontSize: 24,
          color: "#0d1f14",
        }}
      >
        Product Not Found
      </h2>
      <p style={{ color: "#6b8577", fontSize: 14 }}>
        {error || "This product doesn't exist or has been removed."}
      </p>
      <button
        onClick={onBack}
        style={{
          padding: "10px 24px",
          background: "#299E60",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "Outfit, sans-serif",
        }}
      >
        ← Go Back
      </button>
    </div>
  );
}
