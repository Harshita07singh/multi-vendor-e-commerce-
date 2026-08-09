import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Package,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  MapPin,
  CreditCard,
  RotateCcw,
  Search,
  Filter,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

/* ── helpers ── */
const cn = (...c) => c.filter(Boolean).join(" ");

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "#3b82f6",
    bg: "#eff6ff",
    border: "#bfdbfe",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    icon: RefreshCw,
  },
  shipped: {
    label: "Shipped",
    color: "#0ea5e9",
    bg: "#f0f9ff",
    border: "#bae6fd",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "#299E60",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
    bg: "#fef2f2",
    border: "#fecaca",
    icon: XCircle,
  },
  refunded: {
    label: "Refunded",
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
    icon: RotateCcw,
  },
};

const DELIVERY_LABEL = {
  standard: "Standard (5–7 days)",
  express: "Express (2–3 days)",
  sameday: "Instant (Same day)",
};
const PAYMENT_LABEL = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  cod: "Cash on Delivery",
};

const FILTERS = [
  "All",
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function imgSrc(product) {
  if (!product?.images?.length) return null;
  const url = product.images[0]?.url || "";
  return url.startsWith("/") ? `${BASE_URL}${url}` : url;
}

/* ── StatusBadge ── */
function StatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const small = size === "sm";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: small ? 4 : 6,
        padding: small ? "3px 10px" : "5px 14px",
        borderRadius: 100,
        border: `1px solid ${cfg.border}`,
        background: cfg.bg,
        color: cfg.color,
        fontSize: small ? 11 : 13,
        fontFamily: "JetBrains Mono, monospace",
        fontWeight: 600,
        letterSpacing: 0.3,
      }}
    >
      <Icon size={small ? 11 : 13} />
      {cfg.label}
    </span>
  );
}

/* ── Order timeline ── */
const STEPS = [
  { key: "pending", label: "Ordered", icon: ShoppingBag },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];
const STEP_ORDER = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function OrderTimeline({ status }) {
  if (["cancelled", "refunded"].includes(status)) return null;
  const currentIdx = STEP_ORDER.indexOf(status);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "16px 0 4px",
      }}
    >
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        const Icon = step.icon;
        return (
          <div
            key={step.key}
            style={{
              display: "flex",
              alignItems: "center",
              flex: i < STEPS.length - 1 ? 1 : undefined,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: done
                    ? active
                      ? "#299E60"
                      : "#d8eddf"
                    : "#f3f4f6",
                  border: `2px solid ${done ? "#299E60" : "#e5e7eb"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all .3s",
                  boxShadow: active ? "0 0 0 4px rgba(41,158,96,0.15)" : "none",
                }}
              >
                <Icon
                  size={13}
                  color={done ? (active ? "#fff" : "#299E60") : "#9ca3af"}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: done ? "#299E60" : "#9ca3af",
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: done ? 600 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: i < currentIdx ? "#299E60" : "#e5e7eb",
                  margin: "0 4px",
                  marginBottom: 20,
                  transition: "background .3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── OrderCard ── */
function OrderCard({ order, onCancelOrder }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const firstItem = order.items[0];
  const product = firstItem?.product;
  const extraCount = order.items.length - 1;
  const canCancel = ["pending", "confirmed"].includes(order.status);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        transition: "box-shadow .2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 16px rgba(41,158,96,0.1)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)")
      }
    >
      {/* ── Card header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid #f3f4f6",
          background: "#fafafa",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "JetBrains Mono, monospace",
                marginBottom: 2,
              }}
            >
              ORDER ID
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#0d1f14",
                fontFamily: "JetBrains Mono, monospace",
                letterSpacing: 0.5,
              }}
            >
              #{order._id.slice(-8).toUpperCase()}
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: "#e5e7eb" }} />
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "JetBrains Mono, monospace",
                marginBottom: 2,
              }}
            >
              PLACED ON
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
              {formatDate(order.createdAt)}
            </div>
          </div>
          <div style={{ width: 1, height: 28, background: "#e5e7eb" }} />
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "JetBrains Mono, monospace",
                marginBottom: 2,
              }}
            >
              TOTAL
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#0d1f14",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              ₹{order.total.toLocaleString()}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge status={order.status} />
          {canCancel && (
            <button
              onClick={() => onCancelOrder(order._id)}
              style={{
                fontSize: 11,
                color: "#ef4444",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "4px 10px",
                cursor: "pointer",
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── Main product preview ── */}
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Product image */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
              background: "#f9fafb",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {imgSrc(product) ? (
              <img
                src={imgSrc(product)}
                alt={product?.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 28, opacity: 0.3 }}>📦</span>
            )}
          </div>

          {/* Product info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#0d1f14",
                marginBottom: 3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {product?.name || "Product"}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
              Qty: {firstItem?.quantity} · ₹{firstItem?.price?.toLocaleString()}{" "}
              each
              {product?.brand && ` · ${product.brand}`}
            </div>
            {extraCount > 0 && (
              <div
                style={{
                  fontSize: 11,
                  color: "#299E60",
                  fontWeight: 600,
                  fontFamily: "JetBrains Mono, monospace",
                  background: "#f0fdf4",
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 6,
                }}
              >
                +{extraCount} more item{extraCount > 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            {expanded ? "Less" : "Details"}
            <ChevronDown
              size={13}
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform .2s",
              }}
            />
          </button>
        </div>

        {/* ── Timeline ── */}
        <OrderTimeline status={order.status} />
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid #f3f4f6",
            animation: "fadeDown .2s ease",
          }}
        >
          <style>{`@keyframes fadeDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }`}</style>

          {/* All items */}
          {order.items.length > 1 && (
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  fontFamily: "JetBrains Mono, monospace",
                  marginBottom: 12,
                }}
              >
                All Items
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 6,
                        border: "1px solid #e5e7eb",
                        overflow: "hidden",
                        background: "#f9fafb",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {imgSrc(item.product) ? (
                        <img
                          src={imgSrc(item.product)}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 16, opacity: 0.3 }}>📦</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0d1f14",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.product?.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>
                        Qty: {item.quantity} · ₹{item.price?.toLocaleString()}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#0d1f14",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3-column info grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 0,
            }}
          >
            {/* Shipping address */}
            <div
              style={{ padding: "16px 20px", borderRight: "1px solid #f3f4f6" }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  fontFamily: "JetBrains Mono, monospace",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <MapPin size={10} /> Delivery Address
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0d1f14",
                  marginBottom: 2,
                }}
              >
                {order.shippingAddress?.fullName}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
                {order.shippingAddress?.line1}
                {order.shippingAddress?.line2
                  ? `, ${order.shippingAddress.line2}`
                  : ""}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} –{" "}
                {order.shippingAddress?.pincode}
                <br />
                {order.shippingAddress?.phone}
              </div>
            </div>

            {/* Payment + delivery */}
            <div
              style={{ padding: "16px 20px", borderRight: "1px solid #f3f4f6" }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  fontFamily: "JetBrains Mono, monospace",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <CreditCard size={10} /> Payment & Delivery
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  [
                    "Method",
                    PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod,
                  ],
                  ["Status", order.isPaid ? "✅ Paid" : "⏳ Pending"],
                  [
                    "Delivery",
                    DELIVERY_LABEL[order.deliveryType] || order.deliveryType,
                  ],
                  order.trackingNumber && ["Tracking", order.trackingNumber],
                ]
                  .filter(Boolean)
                  .map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "#9ca3af" }}>{label}</span>
                      <span
                        style={{
                          color: "#374151",
                          fontWeight: 600,
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div style={{ padding: "16px 20px" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  fontFamily: "JetBrains Mono, monospace",
                  marginBottom: 10,
                }}
              >
                Price Breakdown
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  ["Subtotal", `₹${order.subtotal?.toLocaleString()}`],
                  order.gst > 0 && ["GST", `₹${order.gst?.toLocaleString()}`],
                  order.deliveryCharge > 0 && [
                    "Delivery",
                    `₹${order.deliveryCharge}`,
                  ],
                ]
                  .filter(Boolean)
                  .map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "#9ca3af" }}>{label}</span>
                      <span style={{ color: "#374151" }}>{value}</span>
                    </div>
                  ))}
                <div
                  style={{ height: 1, background: "#f3f4f6", margin: "4px 0" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#0d1f14" }}>
                    Total
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#299E60",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    ₹{order.total?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* View detail button */}
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #f3f4f6",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => navigate(`/orders/${order._id}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                background: "#f0fdf4",
                color: "#299E60",
                border: "1px solid #bbf7d0",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              View Full Details <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function Orders() {
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((s) => s.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  /* Redirect if not logged in */
  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn]);

  /* Fetch orders */
  const fetchOrders = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/api/orders?page=${p}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Failed to fetch orders");
      setOrders(data.data);
      setPagination(data.pagination);
      setPage(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* Cancel handler */
  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(orderId);
    setCancelError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${BASE_URL}/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: "cancelled" } : o,
        ),
      );
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(null);
    }
  };

  /* Filter + search client-side */
  const filtered = orders.filter((o) => {
    const matchFilter =
      activeFilter === "All" || o.status === activeFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o._id.toLowerCase().includes(q) ||
      o.items.some((i) => i.product?.name?.toLowerCase().includes(q)) ||
      o.shippingAddress?.city?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  /* ── Render ── */
  return (
    <div
      style={{
        background: "#f5f9f6",
        minHeight: "100vh",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        button { font-family: 'Outfit', sans-serif; }
        input  { font-family: 'Outfit', sans-serif; }
      `}</style>

      {/* ── Top bar ── */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "0",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ flex: 1 }} />
          <ShoppingBag size={18} color="#299E60" />
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#0d1f14",
              letterSpacing: "-0.3px",
            }}
          >
            My Orders
          </span>
          {pagination?.total > 0 && (
            <span
              style={{
                fontSize: 12,
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#299E60",
                padding: "2px 10px",
                borderRadius: 100,
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 600,
              }}
            >
              {pagination.total}
            </span>
          )}
        </div>
      </div>

      <div
        style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 60px" }}
      >
        {/* ── Search + filter bar ── */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or product name…"
              style={{
                width: "100%",
                padding: "10px 12px 10px 34px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#fff",
                fontSize: 13,
                color: "#0d1f14",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#299E60";
                e.target.style.boxShadow = "0 0 0 3px rgba(41,158,96,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all .15s",
                  background: activeFilter === f ? "#299E60" : "#fff",
                  color: activeFilter === f ? "#fff" : "#6b7280",
                  border: `1px solid ${activeFilter === f ? "#299E60" : "#e5e7eb"}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Cancel error toast */}
        {cancelError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 10,
              marginBottom: 16,
              color: "#ef4444",
              fontSize: 13,
            }}
          >
            <AlertCircle size={15} /> {cancelError}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 0",
              gap: 16,
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
            <span style={{ color: "#6b7280", fontSize: 14 }}>
              Loading your orders…
            </span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>
              ⚠️
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0d1f14",
                marginBottom: 8,
              }}
            >
              Couldn't load orders
            </h3>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
              {error}
            </p>
            <button
              onClick={() => fetchOrders()}
              style={{
                padding: "10px 24px",
                background: "#299E60",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                background: "linear-gradient(135deg, #f0fdf4, #d8eddf)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 4px 16px rgba(41,158,96,0.12)",
              }}
            >
              <ShoppingBag size={32} color="#299E60" />
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#0d1f14",
                marginBottom: 8,
              }}
            >
              {search || activeFilter !== "All"
                ? "No orders found"
                : "No orders yet"}
            </h3>
            <p
              style={{
                color: "#6b7280",
                fontSize: 14,
                maxWidth: 300,
                margin: "0 auto 24px",
              }}
            >
              {search || activeFilter !== "All"
                ? "Try a different search or filter."
                : "You haven't placed any orders yet. Start shopping!"}
            </p>
            {activeFilter === "All" && !search && (
              <button
                onClick={() => navigate("/")}
                style={{
                  padding: "12px 28px",
                  background: "#299E60",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(41,158,96,0.3)",
                }}
              >
                Shop Now
              </button>
            )}
            {(search || activeFilter !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                }}
                style={{
                  padding: "10px 20px",
                  background: "#f0fdf4",
                  color: "#299E60",
                  border: "1px solid #bbf7d0",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ── Order list ── */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onCancelOrder={handleCancel}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination &&
          pagination.pages > 1 &&
          !search &&
          activeFilter === "All" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 32,
              }}
            >
              <button
                onClick={() => fetchOrders(page - 1)}
                disabled={page <= 1}
                style={{
                  padding: "8px 18px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: page <= 1 ? "#f9fafb" : "#fff",
                  color: page <= 1 ? "#9ca3af" : "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                }}
              >
                ← Prev
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() => fetchOrders(p)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: "1px solid",
                      borderColor: p === page ? "#299E60" : "#e5e7eb",
                      background: p === page ? "#299E60" : "#fff",
                      color: p === page ? "#fff" : "#374151",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => fetchOrders(page + 1)}
                disabled={page >= pagination.pages}
                style={{
                  padding: "8px 18px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: page >= pagination.pages ? "#f9fafb" : "#fff",
                  color: page >= pagination.pages ? "#9ca3af" : "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: page >= pagination.pages ? "not-allowed" : "pointer",
                }}
              >
                Next →
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
