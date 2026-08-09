import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "../redux/authSlice";
import { clearCart } from "../redux/cartSlice";

import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Truck,
  CheckCircle,
  ChevronDown,
  Shield,
  RefreshCw,
  Package,
  Lock,
  Tag,
  Edit2,
  AlertCircle,
  Info,
  CreditCard,
  Zap,
} from "lucide-react";

// ─── Razorpay script loader ───────────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

/**
 * ── Pricing helpers ──────────────────────────────────────────────
 * customerFacingPrice = vendor price + platform margin (added on top)
 *   e.g. vendor sets ₹90, category margin 20% → customer pays ₹108
 * MRP = product.mrp (tag price, shown strikethrough)
 * discountPct = (MRP − customerFacingPrice) / MRP × 100
 * Falls back to product.price if pricingBreakdown is absent.
 */
const getCustomerPrice = (p) =>
  p?.pricingBreakdown?.customerFacingPrice ?? p?.price ?? 0;

const getMRP = (p) => p?.mrp ?? null;

const getDiscountPct = (p) => {
  if (p?.pricingBreakdown?.discountPct != null)
    return +p.pricingBreakdown.discountPct.toFixed(1);
  const cp = getCustomerPrice(p);
  const mrp = getMRP(p);
  if (mrp && mrp > cp) return +(((mrp - cp) / mrp) * 100).toFixed(1);
  return null;
};

const getPlatformPct = (p) => p?.pricingBreakdown?.categoryMarginPct ?? null;
// ─────────────────────────────────────────────────────────────────

/* ─── Indian states ─── */
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Jammu & Kashmir",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar",
  "Chandigarh",
];

/* ─── Delivery options ─── */
const DELIVERY_OPTIONS = [
  {
    id: "standard",
    label: "Standard Delivery",
    days: "5–7 business days",
    price: 0,
    badge: null,
    icon: "🚚",
  },
  {
    id: "express",
    label: "Express Delivery",
    days: "2–3 business days",
    price: 79,
    badge: "Fast",
    icon: "⚡",
  },
  {
    id: "sameday",
    label: "Same Day Delivery",
    days: "Today by 9 PM",
    price: 149,
    badge: "Fastest",
    icon: "🏃",
  },
];

/* ─── Payment methods (Razorpay handles all non-COD natively) ─── */
const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI / GPay / PhonePe",
    icon: "📱",
    subtitle: "Instant · No charges",
    rzpMethod: "upi",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    icon: "💳",
    subtitle: "Visa, Mastercard, RuPay",
    rzpMethod: "card",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    icon: "🏦",
    subtitle: "All major banks",
    rzpMethod: "netbanking",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    icon: "💵",
    subtitle: "Pay on arrival",
    fee: 20,
    rzpMethod: null, // no Razorpay for COD
  },
];

function cn(...c) {
  return c.filter(Boolean).join(" ");
}
function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
  );
}

/* ─── Section accordion card ─── */
function SectionCard({
  step,
  title,
  emoji,
  done,
  collapsed,
  onToggle,
  children,
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl overflow-hidden transition-all duration-200",
        done
          ? "border border-green-200 shadow-sm"
          : "border border-gray-200 shadow-sm",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={!onToggle}
        className={cn(
          "w-full flex items-center gap-3 px-5 py-4 text-left transition-colors",
          done ? "bg-green-50/50" : "bg-white",
          onToggle ? "cursor-pointer hover:bg-green-50/70" : "cursor-default",
        )}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-colors",
            done ? "bg-green-600 text-white" : "bg-[#299E60] text-white",
          )}
        >
          {done ? <CheckCircle size={16} /> : step}
        </div>
        <span className="text-lg leading-none">{emoji}</span>
        <span className="font-semibold text-gray-900 flex-1 text-sm">
          {title}
        </span>
        {done && onToggle && (
          <>
            <span className="flex items-center gap-1 text-[11px] text-green-700 font-semibold bg-green-100 px-2.5 py-0.5 rounded-full mr-1">
              <Edit2 size={9} /> Edit
            </span>
            <ChevronDown
              size={15}
              className={cn(
                "text-gray-400 flex-shrink-0 transition-transform duration-200",
                collapsed ? "" : "rotate-180",
              )}
            />
          </>
        )}
      </button>
      {!collapsed && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100 animate-[fadeIn_.15s_ease]">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, required, error, children, half }) {
  return (
    <div className={cn("flex flex-col gap-1.5", half)}>
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <span className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
          <AlertCircle size={10} /> {error}
        </span>
      )}
    </div>
  );
}

function TInput({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 transition-all outline-none focus:ring-2 focus:ring-green-200 focus:border-[#299E60] focus:bg-white",
        error
          ? "border-red-300 bg-red-50 focus:ring-red-100 focus:border-red-400"
          : "border-gray-200 bg-gray-50",
        className,
      )}
    />
  );
}

function TSelect({ children, error, ...props }) {
  return (
    <select
      {...props}
      className={cn(
        "w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 cursor-pointer transition-all outline-none focus:ring-2 focus:ring-green-200 focus:border-[#299E60] focus:bg-white",
        error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50",
      )}
    >
      {children}
    </select>
  );
}

function PRow({ label, value, green, muted, bold }) {
  return (
    <div className="flex items-center justify-between py-[3px]">
      <span
        className={cn("text-sm", muted ? "text-gray-400" : "text-gray-600")}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-mono",
          green ? "text-green-600 font-semibold" : "",
          bold ? "font-bold text-gray-900" : "text-gray-700",
          muted ? "text-gray-400" : "",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function Buynow() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useSelector((s) => s.auth);
  const { cartItems, totalPrice } = useSelector((s) => s.cart);

  const { product: singleProduct, quantity: initQty = 1 } =
    location.state || {};
  const isCartCheckout = !singleProduct;

  const [qty, setQty] = useState(initQty);
  const [delivId, setDelivId] = useState("standard");
  const [pmId, setPmId] = useState("upi");
  const [placing, setPlacing] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [addr, setAddr] = useState({
    fullName: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    pincode: "",
    state: "",
    landmark: "",
  });
  const [errors, setErrors] = useState({});
  const [addrDone, setAddrDone] = useState(false);
  const [addrCollapsed, setAddrCollapsed] = useState(false);

  const [upiId, setUpiId] = useState(""); // kept only for UPI-ID display (Razorpay takes over input)
  const [razorpayError, setRazorpayError] = useState(null);

  useEffect(() => {
    if (!singleProduct && cartItems.length === 0) navigate(-1);
  }, [singleProduct, cartItems]);
  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    if (t && !user) dispatch(fetchCurrentUser());
  }, [dispatch, user]);
  useEffect(() => {
    if (user) {
      setAddr((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        phone: prev.phone || user.phone || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // ── Delivery / COD fees ──
  const delivOpt = DELIVERY_OPTIONS.find((d) => d.id === delivId);
  const delivFee = delivOpt?.price ?? 0;
  const codFee = pmId === "cod" ? 20 : 0;

  // ── CART mode prices ──
  const cartSubtotal = totalPrice;
  const cartTotal = cartSubtotal + delivFee + codFee;

  // ── SINGLE PRODUCT prices (using customerFacingPrice) ──
  //
  //   customerPrice = vendor price + platform margin  ← what customer actually pays
  //   mrp           = product.mrp                     ← tag price (strikethrough)
  //   discountPct   = (mrp − customerPrice) / mrp × 100
  //
  const customerUnitPrice = getCustomerPrice(singleProduct); // e.g. ₹108 (₹90 + 20%)
  const mrpTag = getMRP(singleProduct); // e.g. ₹100 (tag on packet)
  const discountPct = getDiscountPct(singleProduct); // e.g. −8% if mrp=100, custPrice=108
  const platformPct = getPlatformPct(singleProduct); // e.g. 20
  const vendorPrice =
    singleProduct?.pricingBreakdown?.vendorPrice ?? customerUnitPrice;
  const subtotal = customerUnitPrice * qty;
  const gstPct = singleProduct?.gst || 0;
  const platformFeeAmt =
    Math.round((vendorPrice * (platformPct || 0)) / 100) * qty;
  const gstAmt = Math.round((subtotal * gstPct) / 100);
  const singleTotal = subtotal + platformFeeAmt + gstAmt + delivFee + codFee;

  const finalTotal = isCartCheckout ? cartTotal : singleTotal;

  const imgUrl = (() => {
    const raw = singleProduct?.images?.[0]?.url;
    if (!raw) return null;
    return raw.startsWith("/") ? `${BASE_URL}${raw}` : raw;
  })();

  const A = (k, v) => setAddr((p) => ({ ...p, [k]: v }));

  function validate() {
    const e = {};
    if (!addr.fullName.trim()) e.fullName = "Full name is required";
    if (!/^\d{10}$/.test(addr.phone.trim()))
      e.phone = "Enter a valid 10-digit number";
    if (!addr.line1.trim()) e.line1 = "Address is required";
    if (!addr.city.trim()) e.city = "City is required";
    if (!addr.state) e.state = "Select a state";
    if (!/^\d{6}$/.test(addr.pincode.trim()))
      e.pincode = "Enter a valid 6-digit pincode";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function confirmAddr() {
    if (validate()) {
      setAddrDone(true);
      setAddrCollapsed(true);
    }
  }

  // ── Build order payload (shared by COD and Razorpay verify) ──────────────
  function buildOrderPayload() {
    const items = isCartCheckout
      ? cartItems.map((item) => ({
          product: item.productId || item.id,
          quantity: item.quantity,
          price: item.price,
        }))
      : [
          {
            product: singleProduct._id,
            quantity: qty,
            price: customerUnitPrice,
          },
        ];

    return {
      items,
      shippingAddress: addr,
      deliveryType: delivId,
      deliveryCharge: delivFee,
      paymentMethod: pmId,
      subtotal: isCartCheckout ? cartSubtotal : subtotal,
      gst: isCartCheckout ? 0 : gstAmt,
      total: finalTotal,
    };
  }

  // ── COD: direct order creation (no Razorpay) ─────────────────────────────
  async function placeCodOrder() {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(buildOrderPayload()),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to place order");
    return data.data?._id || data._id || "ORD" + Date.now();
  }

  // ── Razorpay: 3-step flow ─────────────────────────────────────────────────
  async function placeRazorpayOrder() {
    // 1. Load SDK
    const loaded = await loadRazorpayScript();
    if (!loaded)
      throw new Error("Razorpay SDK failed to load. Check your connection.");

    const token = localStorage.getItem("accessToken");

    // 2. Create Razorpay order on backend
    const createRes = await fetch(
      `${BASE_URL}/api/payments/razorpay/create-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: finalTotal, currency: "INR" }),
      },
    );
    const createData = await createRes.json();
    if (!createRes.ok)
      throw new Error(createData.message || "Could not initiate payment");

    const {
      orderId: rzpOrderId,
      amount: rzpAmount,
      currency,
      keyId,
    } = createData;

    // 3. Open Razorpay checkout (returns a Promise so we can await it)
    const selectedMethod = PAYMENT_METHODS.find((p) => p.id === pmId);

    return new Promise((resolve, reject) => {
      const options = {
        key: keyId,
        amount: rzpAmount, // paise
        currency,
        name: "3Arrow",
        description: isCartCheckout
          ? `Cart checkout · ${cartItems.length} items`
          : singleProduct?.name,
        image: imgUrl || undefined,
        order_id: rzpOrderId,

        // Pre-select the payment method tab the user already chose
        config: {
          display: {
            blocks: {
              preferred: {
                name: "Preferred",
                instruments: selectedMethod?.rzpMethod
                  ? [{ method: selectedMethod.rzpMethod }]
                  : [],
              },
            },
            sequence: ["block.preferred"],
            preferences: { show_default_blocks: true },
          },
        },

        prefill: {
          name: addr.fullName,
          email: addr.email || user?.email || "",
          contact: `+91${addr.phone}`,
        },

        notes: {
          deliveryType: delivId,
          address: [addr.line1, addr.city, addr.state]
            .filter(Boolean)
            .join(", "),
        },

        theme: { color: "#299E60" },

        // ── Success: verify on backend then create DB order ────────────────
        handler: async (response) => {
          try {
            const verifyRes = await fetch(
              `${BASE_URL}/api/payments/razorpay/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderData: buildOrderPayload(),
                }),
              },
            );
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok)
              throw new Error(
                verifyData.message || "Payment verification failed",
              );
            resolve(verifyData.orderId);
          } catch (err) {
            reject(err);
          }
        },

        modal: {
          // User closed the Razorpay modal without paying
          ondismiss: () => reject(new Error("__dismissed__")),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        reject(new Error(resp.error?.description || "Payment failed"));
      });
      rzp.open();
    });
  }

  // ── Main checkout entry point ────────────────────────────────────────────
  async function placeOrder() {
    if (!addrDone) {
      setAddrCollapsed(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setRazorpayError(null);
    setPlacing(true);
    try {
      let newOrderId;

      if (pmId === "cod") {
        newOrderId = await placeCodOrder();
      } else {
        newOrderId = await placeRazorpayOrder();
      }

      dispatch(clearCart());
      setOrderId(newOrderId);
      setOrderDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      // Silently cancel if user just closed the modal
      if (err.message !== "__dismissed__") {
        setRazorpayError(err.message);
      }
    } finally {
      setPlacing(false);
    }
  }

  /* ══════════════════════════════════════════
     ORDER SUCCESS SCREEN
  ══════════════════════════════════════════ */
  if (orderDone) {
    return (
      <div className="min-h-screen bg-[#f5f9f6] flex items-center justify-center p-4">
        <style>{`@keyframes popIn { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }`}</style>
        <div className="bg-white rounded-3xl shadow-2xl shadow-green-100 max-w-[460px] w-full p-8 text-center">
          <div
            className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
            style={{
              animation: "popIn .5s cubic-bezier(.34,1.56,.64,1) forwards",
            }}
          >
            <CheckCircle size={52} className="text-[#299E60]" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Order Placed! 🎉
          </h1>
          <p className="text-gray-500 text-sm mb-5 leading-relaxed">
            Your order has been confirmed.
            <br />
            You'll receive updates on{" "}
            <strong className="text-gray-700">
              {addr.email || user?.email}
            </strong>
            .
          </p>
          {orderId && (
            <div className="inline-block bg-green-50 border border-green-200 rounded-2xl px-6 py-3 mb-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-1">
                Order ID
              </p>
              <p className="text-[#299E60] font-black font-mono text-xl tracking-wider">
                #{String(orderId).slice(-8).toUpperCase()}
              </p>
            </div>
          )}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
            {isCartCheckout ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl flex-shrink-0">
                  🛒
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    {cartItems.length} item{cartItems.length > 1 ? "s" : ""}{" "}
                    ordered
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Total:{" "}
                    <span className="font-bold text-gray-800">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    →{" "}
                    {[addr.line1, addr.city, addr.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-start">
                {imgUrl && (
                  <img
                    src={imgUrl}
                    alt={singleProduct.name}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 text-sm leading-snug truncate">
                    {singleProduct.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Qty: {qty} · Total:{" "}
                    <span className="font-bold text-gray-800">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    →{" "}
                    {[addr.line1, addr.city, addr.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}
            <p className="text-xs font-semibold text-[#299E60] mt-3">
              {delivOpt?.icon} {delivOpt?.label} · {delivOpt?.days}
            </p>
          </div>
          <div className="flex items-center gap-1 mb-6 text-xs">
            {[
              ["📦", "Packed"],
              ["🚚", "Shipped"],
              ["🏠", "Delivered"],
            ].map(([ic, lb], i, a) => (
              <React.Fragment key={lb}>
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-base">
                    {ic}
                  </div>
                  <span className="text-gray-500 font-medium">{lb}</span>
                </div>
                {i < a.length - 1 && (
                  <div className="flex-1 h-px bg-green-200 mt-[-14px]" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-3 rounded-xl border-2 border-[#299E60] text-[#299E60] font-bold text-sm hover:bg-green-50 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="flex-1 py-3 rounded-xl bg-[#299E60] hover:bg-[#1e7a49] text-white font-bold text-sm transition-colors shadow-lg shadow-green-200"
            >
              My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     CHECKOUT UI
  ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f5f9f6]">
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} } .fade-in { animation: fadeIn .2s ease; }`}</style>

      {/* TOP BAR */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-[#299E60] font-semibold text-sm transition-colors flex-shrink-0"
          >
            <ArrowLeft size={17} /> Back
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag size={17} className="text-[#299E60]" />
            <span className="font-black text-gray-900 text-sm tracking-wide">
              SECURE CHECKOUT
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
            <Lock size={11} className="text-[#299E60]" /> SSL Secured
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-6 items-start">
          {/* ════ LEFT COLUMN ════ */}
          <div className="space-y-4 fade-in">
            {/* 1. SHIPPING ADDRESS */}
            <SectionCard
              step={1}
              title="Shipping Address"
              emoji="📍"
              done={addrDone}
              collapsed={addrCollapsed}
              onToggle={
                addrDone ? () => setAddrCollapsed(!addrCollapsed) : undefined
              }
            >
              {isLoggedIn && user && (
                <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 text-xs text-blue-700">
                  <Info
                    size={13}
                    className="mt-0.5 flex-shrink-0 text-blue-500"
                  />
                  <span>
                    <strong>Name, phone & email</strong> were prefilled from
                    your{" "}
                    <button
                      onClick={() => navigate("/profile")}
                      className="underline font-bold hover:text-blue-900"
                    >
                      My Profile
                    </button>
                    . Complete the delivery address below.
                  </span>
                </div>
              )}
              {!isLoggedIn && (
                <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-xs text-amber-700">
                  <AlertCircle size={13} className="flex-shrink-0" />
                  <span>
                    <button
                      onClick={() => navigate("/login")}
                      className="underline font-bold"
                    >
                      Login
                    </button>{" "}
                    to prefill details from your profile and save this address.
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" required error={errors.fullName}>
                  <TInput
                    value={addr.fullName}
                    onChange={(e) => A("fullName", e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    error={errors.fullName}
                  />
                </Field>
                <Field label="Phone Number" required error={errors.phone}>
                  <TInput
                    value={addr.phone}
                    onChange={(e) =>
                      A("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    placeholder="10-digit mobile"
                    error={errors.phone}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Email Address">
                    <TInput
                      type="email"
                      value={addr.email}
                      onChange={(e) => A("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address Line 1" required error={errors.line1}>
                    <TInput
                      value={addr.line1}
                      onChange={(e) => A("line1", e.target.value)}
                      placeholder="House/Flat No., Street, Colony…"
                      error={errors.line1}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Address Line 2 (optional)">
                    <TInput
                      value={addr.line2}
                      onChange={(e) => A("line2", e.target.value)}
                      placeholder="Apartment, Floor, Building name…"
                    />
                  </Field>
                </div>
                <Field label="City" required error={errors.city}>
                  <TInput
                    value={addr.city}
                    onChange={(e) => A("city", e.target.value)}
                    placeholder="e.g. Mumbai"
                    error={errors.city}
                  />
                </Field>
                <Field label="Pincode" required error={errors.pincode}>
                  <TInput
                    value={addr.pincode}
                    onChange={(e) =>
                      A(
                        "pincode",
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    placeholder="6-digit pincode"
                    error={errors.pincode}
                  />
                </Field>
                <Field label="State" required error={errors.state}>
                  <TSelect
                    value={addr.state}
                    onChange={(e) => A("state", e.target.value)}
                    error={errors.state}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </TSelect>
                </Field>
                <Field label="Landmark (optional)">
                  <TInput
                    value={addr.landmark}
                    onChange={(e) => A("landmark", e.target.value)}
                    placeholder="Near school / temple…"
                  />
                </Field>
              </div>
              <button
                type="button"
                onClick={confirmAddr}
                className="mt-6 w-full py-3.5 bg-[#299E60] hover:bg-[#1e7a49] active:scale-[.99] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-green-200"
              >
                Confirm Address →
              </button>
            </SectionCard>

            {/* 2. DELIVERY OPTIONS */}
            <SectionCard
              step={2}
              title="Delivery Options"
              emoji="🚚"
              done={true}
              collapsed={false}
            >
              <div className="space-y-2.5 mt-1">
                {DELIVERY_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 rounded-xl border-2 cursor-pointer transition-all",
                      delivId === opt.id
                        ? "border-[#299E60] bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300",
                    )}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={opt.id}
                      checked={delivId === opt.id}
                      onChange={() => setDelivId(opt.id)}
                      className="accent-[#299E60] w-4 h-4 flex-shrink-0"
                    />
                    <span className="text-xl leading-none flex-shrink-0">
                      {opt.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {opt.label}
                        </span>
                        {opt.badge && (
                          <span className="text-[10px] font-black bg-[#299E60] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {opt.days}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "font-black text-sm font-mono flex-shrink-0",
                        opt.price === 0 ? "text-[#299E60]" : "text-gray-800",
                      )}
                    >
                      {opt.price === 0 ? "FREE" : `₹${opt.price}`}
                    </div>
                  </label>
                ))}
              </div>
            </SectionCard>

            {/* 3. PAYMENT METHOD */}
            <SectionCard
              step={3}
              title="Payment Method"
              emoji="💳"
              done={true}
              collapsed={false}
            >
              <div className="space-y-2.5 mt-1">
                {PAYMENT_METHODS.map((pm) => (
                  <div key={pm.id}>
                    <label
                      className={cn(
                        "flex items-center gap-4 px-4 py-4 rounded-xl border-2 cursor-pointer transition-all",
                        pmId === pm.id
                          ? "border-[#299E60] bg-green-50"
                          : "border-gray-200 bg-white hover:border-gray-300",
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={pm.id}
                        checked={pmId === pm.id}
                        onChange={() => setPmId(pm.id)}
                        className="accent-[#299E60] w-4 h-4 flex-shrink-0"
                      />
                      <span className="text-xl leading-none flex-shrink-0">
                        {pm.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-gray-900">
                          {pm.label}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {pm.subtitle}
                        </div>
                      </div>
                      {pm.fee && (
                        <span className="text-[11px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex-shrink-0">
                          +₹{pm.fee}
                        </span>
                      )}
                      {/* Razorpay badge on non-COD options */}
                      {pm.rzpMethod && pmId === pm.id && (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                          <Zap size={9} /> Razorpay
                        </span>
                      )}
                    </label>

                    {/* COD notice */}
                    {pmId === "cod" && pm.id === "cod" && (
                      <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 fade-in">
                        <AlertCircle
                          size={13}
                          className="flex-shrink-0 mt-0.5"
                        />
                        <span>
                          ₹20 extra charge applies for Cash on Delivery. Please
                          keep exact change ready.
                        </span>
                      </div>
                    )}

                    {/* Razorpay info panel for selected non-COD method */}
                    {pm.rzpMethod && pmId === pm.id && (
                      <div className="mt-3 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-800 fade-in">
                        <CreditCard
                          size={14}
                          className="flex-shrink-0 mt-0.5 text-blue-500"
                        />
                        <div>
                          <p className="font-bold mb-0.5">
                            Secure payment via Razorpay
                          </p>
                          <p className="text-blue-600">
                            {pm.id === "upi"
                              ? "You'll be prompted to enter your UPI ID or scan a QR code in the Razorpay window."
                              : pm.id === "card"
                                ? "Enter your card details securely inside the Razorpay checkout window."
                                : "Select your bank and complete login inside the Razorpay checkout window."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Razorpay error */}
              {razorpayError && (
                <div className="flex items-start gap-2 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 fade-in">
                  <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                  <span>{razorpayError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-5 text-[11px] text-gray-400 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <Lock size={11} className="text-[#299E60] flex-shrink-0" />
                All transactions are secured by Razorpay's 256-bit SSL
                encryption. We never store payment details.
              </div>

              {/* Razorpay + bank logos */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {["Visa", "Mastercard", "RuPay", "UPI", "GPay", "PhonePe"].map(
                  (b) => (
                    <span
                      key={b}
                      className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full"
                    >
                      {b}
                    </span>
                  ),
                )}
              </div>
            </SectionCard>
          </div>

          {/* ════ RIGHT: ORDER SUMMARY ════ */}
          <div className="space-y-4 lg:sticky lg:top-20">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Tag size={14} className="text-[#299E60]" />
                <span className="text-[11px] font-black uppercase tracking-[2px] text-gray-500">
                  Order Summary
                </span>
              </div>

              {/* CART MODE: show all items */}
              {isCartCheckout ? (
                <div className="px-5 py-4 border-b border-gray-100 space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {item.title || item.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-gray-800 flex-shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                /* SINGLE PRODUCT — show customerFacingPrice */
                <div className="px-5 py-4 border-b border-gray-100">
                  <div className="flex gap-3 items-start">
                    <div className="w-[82px] h-[82px] rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={singleProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-sm leading-snug line-clamp-2">
                        {singleProduct.name}
                      </p>
                      {singleProduct.brand && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          by {singleProduct.brand}
                        </p>
                      )}

                      {/* ── Price display: customerFacingPrice + MRP strikethrough ── */}
                      <div className="mt-2">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-lg font-black text-gray-900">
                            ₹{customerUnitPrice.toLocaleString()}
                          </span>
                          {mrpTag && mrpTag > customerUnitPrice && (
                            <span className="text-xs line-through text-gray-400">
                              MRP ₹{mrpTag.toLocaleString()}
                            </span>
                          )}
                          {discountPct > 0 && (
                            <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
                              {discountPct}% off
                            </span>
                          )}
                        </div>
                        {/* Platform margin info */}
                        {platformPct > 0 && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Incl. {platformPct}% platform fee
                          </p>
                        )}
                      </div>

                      {/* Qty stepper */}
                      <div className="flex items-center mt-2.5 rounded-lg border border-gray-200 overflow-hidden w-fit">
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="w-8 h-8 flex items-center justify-center text-[#299E60] bg-gray-50 hover:bg-gray-100 font-black text-lg transition-colors"
                        >
                          −
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center text-sm font-black font-mono text-gray-900 border-x border-gray-200">
                          {qty}
                        </span>
                        <button
                          onClick={() =>
                            setQty((q) =>
                              Math.min(singleProduct.stock || 99, q + 1),
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center text-[#299E60] bg-gray-50 hover:bg-gray-100 font-black text-lg transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Price breakdown ── */}
              <div className="px-5 py-4 border-b border-gray-100 space-y-[2px]">
                {isCartCheckout ? (
                  <>
                    <PRow
                      label={`Subtotal (${cartItems.length} items)`}
                      value={`₹${cartSubtotal.toFixed(2)}`}
                    />
                    <PRow
                      label={`Delivery · ${delivOpt?.label}`}
                      value={delivFee === 0 ? "FREE" : `₹${delivFee}`}
                      green={delivFee === 0}
                    />
                    {codFee > 0 && (
                      <PRow label="COD Fee" value={`₹${codFee}`} />
                    )}
                  </>
                ) : (
                  <>
                    {/* Show base price × qty */}
                    <PRow
                      label={`Price × ${qty}`}
                      value={`₹${(customerUnitPrice * qty).toLocaleString()}`}
                    />

                    {/* MRP discount saving */}
                    {mrpTag && mrpTag > customerUnitPrice && (
                      <PRow
                        label={`MRP savings${discountPct > 0 ? ` (${discountPct}%)` : ""}`}
                        value={`-₹${((mrpTag - customerUnitPrice) * qty).toLocaleString()}`}
                        green
                      />
                    )}

                    {/* Platform margin note */}
                    {platformPct > 0 && (
                      <PRow
                        label={`Platform fee (${platformPct}% · incl. in price)`}
                        value={`₹${(
                          Math.round(
                            ((singleProduct?.pricingBreakdown?.vendorPrice ??
                              customerUnitPrice) *
                              platformPct) /
                              100,
                          ) * qty
                        ).toLocaleString()}`}
                        muted
                      />
                    )}

                    {/* GST */}
                    {gstPct > 0 && (
                      <PRow
                        label={`GST (${gstPct}%)`}
                        value={`₹${gstAmt.toLocaleString()}`}
                        muted
                      />
                    )}

                    <PRow
                      label={`Delivery · ${delivOpt?.label}`}
                      value={delivFee === 0 ? "FREE" : `₹${delivFee}`}
                      green={delivFee === 0}
                    />
                    {codFee > 0 && (
                      <PRow label="COD Fee" value={`₹${codFee}`} />
                    )}
                  </>
                )}
              </div>

              {/* Total */}
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-baseline justify-between">
                  <span className="font-black text-gray-900">
                    Total Payable
                  </span>
                  <span className="text-2xl font-black text-gray-900 font-mono">
                    ₹{finalTotal.toLocaleString()}
                  </span>
                </div>
                {/* Savings summary */}
                {!isCartCheckout && mrpTag && (
                  <>
                    {mrpTag > customerUnitPrice ? (
                      <p className="text-xs text-green-600 font-semibold mt-1 text-right">
                        🎉 You save ₹
                        {((mrpTag - customerUnitPrice) * qty).toLocaleString()}{" "}
                        on MRP
                      </p>
                    ) : mrpTag < customerUnitPrice ? (
                      <p className="text-xs text-orange-500 font-semibold mt-1 text-right">
                        ₹{((customerUnitPrice - mrpTag) * qty).toLocaleString()}{" "}
                        above MRP
                      </p>
                    ) : null}
                  </>
                )}
              </div>

              {/* CTA */}
              <div className="px-5 py-4">
                {!addrDone && (
                  <div className="flex items-center gap-2 text-[11px] text-orange-600 bg-orange-50 border border-orange-200 rounded-xl px-3.5 py-2.5 mb-3">
                    <AlertCircle size={12} className="flex-shrink-0" />
                    Please confirm your shipping address first
                  </div>
                )}
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={placing}
                  className={cn(
                    "w-full py-4 rounded-xl font-black text-white flex items-center justify-center gap-2.5 text-sm transition-all",
                    placing
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-[#299E60] hover:bg-[#1e7a49] active:scale-[.98] shadow-xl shadow-green-200",
                  )}
                >
                  {placing ? (
                    <>
                      <Spinner />
                      {pmId === "cod" ? "Placing Order…" : "Opening Payment…"}
                    </>
                  ) : pmId === "cod" ? (
                    <>
                      <Lock size={14} /> Place Order · ₹
                      {finalTotal.toLocaleString()}
                    </>
                  ) : (
                    <>
                      <Zap size={14} /> Pay ₹{finalTotal.toLocaleString()} via
                      Razorpay
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: <Truck size={13} className="text-[#299E60]" />,
                    text: "Free delivery above ₹500",
                  },
                  {
                    icon: <Shield size={13} className="text-[#299E60]" />,
                    text: "Secure & safe payment",
                  },
                  {
                    icon: <RefreshCw size={13} className="text-[#299E60]" />,
                    text: "7-day easy returns",
                  },
                  {
                    icon: <Package size={13} className="text-[#299E60]" />,
                    text: "Genuine product guaranteed",
                  },
                ].map((b) => (
                  <div
                    key={b.text}
                    className="flex items-center gap-2 text-xs text-gray-500 font-medium"
                  >
                    <span className="flex-shrink-0">{b.icon}</span> {b.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Address preview */}
            {addrDone && (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 fade-in">
                <div className="flex items-center gap-2 mb-2.5">
                  <MapPin size={13} className="text-[#299E60]" />
                  <span className="text-[10px] font-black text-[#299E60] uppercase tracking-[2px]">
                    Delivering To
                  </span>
                </div>
                <p className="font-bold text-gray-900 text-sm">
                  {addr.fullName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {addr.landmark && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    📍 Near {addr.landmark}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  📱 +91 {addr.phone}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
