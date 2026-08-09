import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  SquarePen,
  Trash2,
  FolderOpen,
  X,
  Loader2,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  XCircle,
  PlusCircle,
  ExternalLink,
  Store,
  Percent,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { CAT_EMOJIS, API_BASE_UB } from "../All Management/constrants";
import { getToken } from "../All Management/api";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/** Plain JSON fetch — used for DELETE */
async function catFetch(method, path) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "API Error");
  return data;
}

/** Multipart/FormData fetch — used for POST and PUT */
async function catUpload(method, path, formData) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data;
}

/** Normalise response shape */
function toArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  if (raw && Array.isArray(raw.categories)) return raw.categories;
  return [];
}

/** Resolve vendor ID from a category object */
function resolveVendorId(cat) {
  return (
    cat?.vendorId ||
    cat?.vendor?._id ||
    cat?.vendor ||
    cat?.sellerId ||
    cat?.seller?._id ||
    cat?.seller ||
    null
  );
}

/** Resolve vendor display name from a category object */
function resolveVendorName(cat) {
  return (
    cat?.vendor?.businessDetails?.businessName ||
    cat?.vendor?.shopName ||
    cat?.vendor?.sellerDetails?.sellerName ||
    cat?.vendor?.name ||
    null
  );
}

/**
 * Compute the pricing breakdown for a sample product price under this category.
 *
 *   discountPct        = ((mrp - price) / mrp) × 100
 *   platformCommission = price × (categoryMargin / 100)
 *   vendorEarnings     = price − platformCommission
 *   grossProfit        = price − costPrice
 *   netProfit          = grossProfit − platformCommission
 *   netProfitMargin    = (netProfit / price) × 100
 */
function calcBreakdown(mrp, price, costPrice, categoryMargin) {
  const m = Number(mrp) || 0;
  const p = Number(price) || 0;
  const cp = Number(costPrice) || 0;
  const mg = Number(categoryMargin) || 0;

  if (m <= 0 || p <= 0) return null;

  const discountPct = ((m - p) / m) * 100;
  const platformCommission = p * (mg / 100);
  const vendorEarnings = p - platformCommission;
  const grossProfit = p - cp;
  const netProfit = grossProfit - platformCommission;
  const netProfitMargin = p > 0 ? (netProfit / p) * 100 : 0;

  return {
    mrp: m,
    price: p,
    costPrice: cp,
    discountPct: +discountPct.toFixed(2),
    categoryMargin: mg,
    platformCommission: +platformCommission.toFixed(2),
    vendorEarnings: +vendorEarnings.toFixed(2),
    grossProfit: +grossProfit.toFixed(2),
    netProfit: +netProfit.toFixed(2),
    netProfitMargin: +netProfitMargin.toFixed(2),
  };
}

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

// ────────────────────────────────────────────────────────────────────────
const G = "linear-gradient(135deg, #22c55e 0%, #10b981 100%)";
const GS = { background: G };

/* ─── Badge ─── */
function Badge({ active, small }) {
  const cfg = active
    ? {
        bg: "bg-green-100",
        text: "text-green-700",
        dot: "bg-green-500",
        label: "Active",
      }
    : {
        bg: "bg-red-100",
        text: "text-red-700",
        dot: "bg-red-500",
        label: "Inactive",
      };
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full whitespace-nowrap
        ${cfg.bg} ${cfg.text} ${small ? "text-[9px] px-2 py-0.5" : "text-[11px] px-2.5 py-1"}`}
    >
      <span
        className={`rounded-full shrink-0 ${cfg.dot} ${small ? "w-1 h-1" : "w-1.5 h-1.5"}`}
      />
      {cfg.label}
    </span>
  );
}

/* ─── MarginBadge ─── */
function MarginBadge({ margin, small }) {
  if (margin == null) return null;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-bold rounded-full whitespace-nowrap
        bg-amber-100 text-amber-700
        ${small ? "text-[9px] px-2 py-0.5" : "text-[11px] px-2.5 py-1"}`}
    >
      <Percent size={small ? 8 : 9} />
      {margin}% margin
    </span>
  );
}

/* ─── StatCard ─── */
function StatCard({ label, value, sub, icon: Icon, loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-green-50 hover:shadow-md transition-all duration-200">
      <div className="p-2.5 md:p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center bg-green-50">
            <Icon size={13} color="#16a34a" />
          </div>
          <div className="hidden md:flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            <TrendingUp size={8} />
            {sub}
          </div>
        </div>
        {loading ? (
          <Loader2 size={18} className="animate-spin text-green-400" />
        ) : (
          <p className="text-lg md:text-2xl font-extrabold m-0 leading-none text-gray-900">
            {value}
          </p>
        )}
        <p className="text-[10px] md:text-[11px] font-semibold mt-1 truncate text-gray-500">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ─── Modal ─── */
function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="p-5 flex items-center justify-between" style={GS}>
            <p className="text-base font-extrabold text-white m-0">{title}</p>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 border-none cursor-pointer flex items-center justify-center"
            >
              <X size={13} color="#fff" />
            </button>
          </div>
          <div className="p-5 overflow-y-auto flex-1">{children}</div>
          {footer && (
            <div className="px-5 py-4 border-t border-green-50 flex justify-end gap-2.5">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Btn ─── */
function Btn({ children, onClick, variant = "primary", disabled = false }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 font-bold rounded-xl border-none cursor-pointer transition-all disabled:opacity-50 px-4 py-2.5 text-sm";
  const variants = {
    primary: "text-white shadow-md hover:opacity-90",
    secondary: "bg-gray-100 text-gray-600 hover:bg-gray-200",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]}`}
      style={variant === "primary" ? GS : {}}
    >
      {children}
    </button>
  );
}

const Field = ({ label, children, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
      {label}
      {hint && (
        <span title={hint} className="cursor-help">
          <Info size={11} className="text-gray-400" />
        </span>
      )}
    </label>
    {children}
  </div>
);

const Input = ({
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  step,
}) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    type={type}
    min={min}
    max={max}
    step={step}
    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400 transition-colors"
  />
);

const Textarea = ({ value, onChange, placeholder }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={3}
    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400 transition-colors resize-none"
  />
);

const Toggle = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-3">
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full border-none cursor-pointer transition-all ${checked ? "" : "bg-gray-200"}`}
      style={checked ? GS : {}}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? "left-5" : "left-0.5"}`}
      />
    </button>
    {label && <span className="text-xs text-gray-500">{label}</span>}
  </div>
);

/* ─── PricingSimulator (inside modal) ─── */
function PricingSimulator({ categoryMargin }) {
  const [mrp, setMrp] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");

  const bd = calcBreakdown(mrp, price, costPrice, categoryMargin);

  const Row = ({ label, value, accent, sub }) => (
    <div
      className={`flex items-center justify-between py-1.5 text-xs border-b border-gray-50 last:border-0 ${
        accent ? "font-extrabold" : "font-medium"
      }`}
    >
      <span className={accent ? "text-gray-800" : "text-gray-500"}>
        {label}
      </span>
      <span
        className={
          sub
            ? "text-red-500 font-bold"
            : accent
              ? "text-green-700"
              : "text-gray-700"
        }
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      <div className="px-3 py-2 bg-amber-100 flex items-center gap-1.5">
        <IndianRupee size={12} className="text-amber-700" />
        <p className="text-xs font-extrabold text-amber-800 m-0">
          Pricing Simulator — {categoryMargin}% margin applied
        </p>
      </div>
      <div className="p-3 grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500">MRP (₹)</label>
          <input
            type="number"
            min="0"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            placeholder="e.g. 1000"
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 bg-white outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500">
            Sell Price (₹)
          </label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 799"
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 bg-white outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500">
            Cost Price (₹)
          </label>
          <input
            type="number"
            min="0"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="e.g. 500"
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-200 bg-white outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {bd ? (
        <div className="px-3 pb-3">
          {Number(price) > Number(mrp) && (
            <p className="text-[10px] font-bold text-red-500 mb-2">
              ⚠ Selling price cannot exceed MRP
            </p>
          )}
          <div className="bg-white rounded-xl p-2.5 shadow-sm">
            <Row label="MRP" value={fmt(bd.mrp)} />
            <Row
              label={`Discount (${bd.discountPct}%)`}
              value={`− ${fmt(bd.mrp - bd.price)}`}
              sub
            />
            <Row label="Customer Pays" value={fmt(bd.price)} accent />
            <div className="my-1 border-t border-dashed border-gray-200" />
            <Row
              label={`Platform Commission (${bd.categoryMargin}%)`}
              value={`− ${fmt(bd.platformCommission)}`}
              sub
            />
            <Row label="Vendor Earns" value={fmt(bd.vendorEarnings)} accent />
            <div className="my-1 border-t border-dashed border-gray-200" />
            <Row label="Cost Price" value={fmt(bd.costPrice)} />
            <Row label="Gross Profit" value={fmt(bd.grossProfit)} />
            <Row label="Net Profit" value={fmt(bd.netProfit)} accent />
            <Row
              label="Net Profit Margin"
              value={`${bd.netProfitMargin}%`}
              accent
            />
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-gray-400 text-center pb-3">
          Enter MRP & Sell Price above to see breakdown
        </p>
      )}
    </div>
  );
}

/* ─── CatTile ─── */
function CatTile({ cat, emoji, onEdit, onDelete, onViewVendor }) {
  const [hov, setHov] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const vendorId = resolveVendorId(cat);
  const vendorName = resolveVendorName(cat);
  const margin = cat.margin ?? 0;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden relative
        ${hov ? "border-green-300 shadow-lg -translate-y-0.5" : "border-gray-100 shadow-sm"}`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-300 origin-left"
        style={{ ...GS, transform: hov ? "scaleX(1)" : "scaleX(0)" }}
      />

      <div
        className="h-28 flex items-center justify-center relative"
        style={{ background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)" }}
      >
        {cat.image ? (
          <img
            src={`${API_BASE_UB}${cat.image}`}
            alt={cat.name}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">{emoji}</span>
        )}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <Badge active={cat.isActive} small />
          <MarginBadge margin={margin} small />
        </div>
        {/* Vendor chip */}
        {vendorId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewVendor(vendorId);
            }}
            title={vendorName ? `View vendor: ${vendorName}` : "View vendor"}
            className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border-none cursor-pointer shadow-sm transition-all hover:scale-105"
            style={{ background: "rgba(22,163,74,0.9)", color: "#fff" }}
          >
            <Store size={9} />{" "}
            {vendorName
              ? vendorName.slice(0, 12) + (vendorName.length > 12 ? "…" : "")
              : "Vendor"}
          </button>
        )}
      </div>

      <div className="p-3.5">
        <p className="text-sm font-extrabold text-gray-800 m-0 truncate">
          {cat.name}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5 font-mono truncate">
          /{cat.slug}
        </p>
        {cat.description && (
          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
            {cat.description}
          </p>
        )}

        {/* Pricing impact summary */}
        <div className="mt-2 px-2.5 py-2 rounded-xl bg-amber-50 border border-amber-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
              <Percent size={9} /> Platform Margin
            </span>
            <span className="text-[11px] font-extrabold text-amber-800">
              {margin}%
            </span>
          </div>
          {margin > 0 && (
            <p className="text-[9px] text-amber-600 mt-0.5">
              Vendor receives {(100 - margin).toFixed(0)}% of selling price
            </p>
          )}
          {margin === 0 && (
            <p className="text-[9px] text-amber-500 mt-0.5">
              No platform cut — vendor keeps 100%
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={onEdit}
            className="flex-1 py-1.5 text-[11px] font-bold rounded-xl border-none cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 flex items-center justify-center gap-1 transition-colors"
          >
            <SquarePen size={11} /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-1.5 text-[11px] font-bold rounded-xl border-none cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center gap-1 transition-colors"
          >
            <Trash2 size={11} /> Delete
          </button>
        </div>

        {/* Quick pricing calculator toggle */}
        <button
          onClick={() => setShowCalc((v) => !v)}
          className="mt-2 w-full py-1.5 text-[10px] font-bold rounded-xl border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 flex items-center justify-center gap-1 transition-colors"
        >
          <IndianRupee size={10} />
          Pricing Calculator
          {showCalc ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>

        {showCalc && (
          <div className="mt-2 rounded-xl border border-amber-100 bg-amber-50 overflow-hidden">
            <MiniPricingCalc margin={margin} />
          </div>
        )}

        {/* View Vendor button */}
        {vendorId && (
          <button
            onClick={() => onViewVendor(vendorId)}
            className="mt-2 w-full py-1.5 text-[11px] font-bold rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
            style={GS}
          >
            <ExternalLink size={11} color="#fff" />
            <span className="text-white">View in Vendor Page</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── MiniPricingCalc (inside tile) ─── */
function MiniPricingCalc({ margin }) {
  const [mrp, setMrp] = useState("");
  const [price, setPrice] = useState("");

  const bd = calcBreakdown(mrp, price, 0, margin);
  const invalid = Number(price) > Number(mrp) && mrp && price;

  return (
    <div className="p-2">
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        <div>
          <label className="text-[9px] font-bold text-gray-400 block mb-0.5">
            MRP (₹)
          </label>
          <input
            type="number"
            min="0"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            placeholder="1000"
            className="w-full px-2 py-1 text-[10px] rounded-lg border border-gray-200 bg-white outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-gray-400 block mb-0.5">
            Sell (₹)
          </label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="799"
            className="w-full px-2 py-1 text-[10px] rounded-lg border border-gray-200 bg-white outline-none focus:border-amber-400"
          />
        </div>
      </div>
      {invalid && (
        <p className="text-[9px] text-red-500 font-bold mb-1">
          ⚠ Price &gt; MRP
        </p>
      )}
      {bd && !invalid && (
        <div className="space-y-0.5 text-[9px]">
          <div className="flex justify-between font-medium text-gray-500">
            <span>Discount</span>
            <span className="text-red-500 font-bold">{bd.discountPct}%</span>
          </div>
          <div className="flex justify-between font-medium text-gray-500">
            <span>Platform ({margin}%)</span>
            <span className="text-red-500 font-bold">
              − {fmt(bd.platformCommission)}
            </span>
          </div>
          <div className="flex justify-between font-extrabold text-green-700 border-t border-amber-200 pt-0.5 mt-0.5">
            <span>Vendor Gets</span>
            <span>{fmt(bd.vendorEarnings)}</span>
          </div>
        </div>
      )}
      {(!mrp || !price) && (
        <p className="text-[9px] text-gray-400 text-center">
          Enter MRP & Sell Price
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN — CategoriesPage
═══════════════════════════════════════════════════════════════════ */
export default function CategoriesPage({
  categories = [],
  setCategories,
  showToast,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const blank = {
    name: "",
    imageFile: null,
    image: "",
    imagePreview: "",
    description: "",
    isActive: true,
    margin: 0,
    seo: { metaTitle: "", metaDescription: "" },
  };
  const [form, setForm] = useState(blank);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  function goToVendor(vendorId) {
    navigate(`/admin/vendors/${vendorId}#categories`);
  }

  // ── Fetch ──
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await catFetch("GET", "/categories");
      setCategories?.(toArray(raw));
    } catch (e) {
      showToast?.(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditing(null);
    setForm(blank);
    setModal(true);
  }
  function openEdit(c) {
    setEditing(c._id);
    setForm({
      name: c.name || "",
      imageFile: null,
      image: c.image || "",
      imagePreview: c.image ? `${API_BASE_UB}${c.image}` : "",
      description: c.description || "",
      isActive: c.isActive ?? true,
      margin: c.margin ?? 0,
      seo: {
        metaTitle: c.seo?.metaTitle || "",
        metaDescription: c.seo?.metaDescription || "",
      },
    });
    setModal(true);
  }

  // ── Submit ──
  async function submit() {
    if (!form.name.trim()) return showToast?.("Name is required", "error");
    if (!form.imageFile && !form.image)
      return showToast?.("Image is required", "error");

    const marginVal = Number(form.margin);
    if (isNaN(marginVal) || marginVal < 0 || marginVal > 100)
      return showToast?.("Margin must be between 0 and 100", "error");

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description);
      fd.append("isActive", form.isActive);
      fd.append("margin", marginVal);
      fd.append("seo", JSON.stringify(form.seo));
      if (form.imageFile) fd.append("image", form.imageFile);
      const path = editing ? `/categories/${editing}` : "/categories";
      await catUpload(editing ? "PUT" : "POST", path, fd);
      showToast?.(editing ? "Category updated!" : "Category created!");
      setModal(false);
      load();
    } catch (e) {
      showToast?.(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function del(id) {
    if (!confirm("Delete this category?")) return;
    try {
      await catFetch("DELETE", `/categories/${id}`);
      showToast?.("Category deleted");
      load();
    } catch (e) {
      showToast?.(e.message, "error");
    }
  }

  const F = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const FS = (k, v) => setForm((f) => ({ ...f, seo: { ...f.seo, [k]: v } }));
  const handleImg = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    F("imageFile", file);
    const r = new FileReader();
    r.onloadend = () => F("imagePreview", r.result);
    r.readAsDataURL(file);
  };

  const active = categories.filter((c) => c.isActive).length;
  const avgMargin = categories.length
    ? (
        categories.reduce((s, c) => s + (c.margin || 0), 0) / categories.length
      ).toFixed(1)
    : 0;

  const stats = [
    {
      label: "Total Categories",
      value: categories.length,
      sub: "All",
      icon: FolderOpen,
    },
    { label: "Active", value: active, sub: "Live", icon: CheckCircle },
    {
      label: "Avg. Margin",
      value: `${avgMargin}%`,
      sub: "Platform",
      icon: Percent,
    },
    {
      label: "Inactive",
      value: categories.length - active,
      sub: "Hidden",
      icon: XCircle,
    },
  ];

  return (
    <div className="p-3 md:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-xl font-extrabold text-gray-800 m-0">
            Category Management
          </h1>
          <p className="hidden md:block text-xs text-gray-400 mt-1">
            Manage all storefront categories & platform margins
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white rounded-xl border-none cursor-pointer shadow-md hover:opacity-90 transition-all"
          style={GS}
        >
          <PlusCircle size={15} /> Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} loading={loading} />
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div
          className="flex items-center justify-between px-5 py-4 border-b border-green-50"
          style={{ background: "linear-gradient(90deg,#f0fdf4,#ecfdf5)" }}
        >
          <div>
            <p className="text-sm font-extrabold text-gray-800 m-0">
              All Categories
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {categories.length} total
            </p>
          </div>
          <button
            onClick={load}
            className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            title="Refresh"
          >
            <RefreshCw size={13} color="#6b7280" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-green-500" />
            <p className="text-sm text-gray-400">Loading categories…</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">🗂️</div>
            <p className="text-sm font-bold text-gray-700 m-0">
              No Categories Yet
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Create your first category to get started.
            </p>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white rounded-xl border-none cursor-pointer shadow-md hover:opacity-90"
              style={GS}
            >
              <PlusCircle size={14} /> Add Category
            </button>
          </div>
        ) : (
          <div
            className="p-4 md:p-5 grid gap-3 md:gap-4"
            style={{
              gridTemplateColumns: isMobile
                ? "repeat(2,1fr)"
                : "repeat(auto-fill,minmax(220px,1fr))",
            }}
          >
            {categories.map((c, i) => (
              <CatTile
                key={c._id}
                cat={c}
                emoji={CAT_EMOJIS?.[i % (CAT_EMOJIS?.length || 10)] || "📦"}
                onEdit={() => openEdit(c)}
                onDelete={() => del(c._id)}
                onViewVendor={goToVendor}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Category" : "Add Category"}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={submit} disabled={submitting}>
              {submitting && <Loader2 size={13} className="animate-spin" />}
              {submitting ? "Saving…" : "Save Category"}
            </Btn>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div className="col-span-2 md:col-span-1">
            <Field label="Name *">
              <Input
                value={form.name}
                onChange={(e) => F("name", e.target.value)}
                placeholder="e.g. Electronics"
              />
            </Field>
          </div>

          {/* Image */}
          <div className="col-span-2 md:col-span-1">
            <Field label="Image Upload *">
              <input
                type="file"
                accept="image/*"
                onChange={handleImg}
                style={{ display: "none" }}
                id="cat-img"
              />
              <label
                htmlFor="cat-img"
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 cursor-pointer bg-gray-50 hover:border-green-400 hover:bg-green-50 transition-all"
              >
                <div className="text-2xl mb-1.5">📸</div>
                <div className="text-[11px] text-gray-400 font-semibold">
                  {form.imageFile ? form.imageFile.name : "Click to upload"}
                </div>
              </label>
              {form.imagePreview && (
                <div className="mt-2 rounded-xl overflow-hidden border border-gray-100">
                  <img
                    src={form.imagePreview}
                    alt="Preview"
                    crossOrigin="anonymous"
                    className="w-full h-32 object-cover block"
                  />
                </div>
              )}
            </Field>
          </div>

          {/* Description */}
          <div className="col-span-2">
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => F("description", e.target.value)}
                placeholder="Short description…"
              />
            </Field>
          </div>

          {/* ── Margin ── */}
          <div className="col-span-2">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs font-extrabold text-amber-800 m-0 flex items-center gap-1.5">
                    <Percent size={12} /> Platform Margin (Commission)
                  </p>
                  <p className="text-[10px] text-amber-600 mt-0.5">
                    % of selling price deducted as platform fee on every product
                    in this category
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={form.margin}
                    onChange={(e) => F("margin", e.target.value)}
                    className="w-16 px-2 py-1.5 text-sm font-extrabold text-center rounded-lg border border-amber-300 bg-white outline-none focus:border-amber-500 transition-colors"
                  />
                  <span className="text-sm font-extrabold text-amber-700">
                    %
                  </span>
                </div>
              </div>

              {/* Live margin impact preview */}
              {Number(form.margin) > 0 && (
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {[500, 1000, 2000].map((ex) => {
                    const commission = (ex * Number(form.margin)) / 100;
                    return (
                      <div
                        key={ex}
                        className="flex items-center gap-1 bg-white rounded-lg px-2 py-1 border border-amber-200"
                      >
                        <span className="text-gray-500">₹{ex} sell</span>
                        <span className="text-amber-700">→</span>
                        <span className="font-bold text-red-500">
                          − ₹{commission.toFixed(0)} fee
                        </span>
                        <span className="text-amber-700">→</span>
                        <span className="font-bold text-green-700">
                          ₹{(ex - commission).toFixed(0)} to vendor
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {Number(form.margin) === 0 && (
                <p className="text-[10px] text-amber-600">
                  0% — vendor keeps 100% of the selling price. Set a value above
                  to define platform's cut.
                </p>
              )}
            </div>
          </div>

          {/* Pricing Simulator */}
          <div className="col-span-2">
            <PricingSimulator categoryMargin={Number(form.margin) || 0} />
          </div>

          {/* SEO */}
          <div className="col-span-2 md:col-span-1">
            <Field label="Meta Title">
              <Input
                value={form.seo.metaTitle}
                onChange={(e) => FS("metaTitle", e.target.value)}
              />
            </Field>
          </div>
          <div className="col-span-2 md:col-span-1">
            <Field label="Meta Description">
              <Input
                value={form.seo.metaDescription}
                onChange={(e) => FS("metaDescription", e.target.value)}
              />
            </Field>
          </div>

          {/* Active */}
          <div className="col-span-2">
            <Field label="Active">
              <Toggle
                checked={form.isActive}
                onChange={(v) => F("isActive", v)}
                label="Visible in storefront"
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
