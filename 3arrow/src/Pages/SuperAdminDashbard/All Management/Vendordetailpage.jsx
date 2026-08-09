import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Store,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Package,
  Tag,
  Layers,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Grid3X3,
  AlertCircle,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import { vendorAPI } from "../../../services/api";

const API_BASE_UB =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

const G = "linear-gradient(135deg, #22c55e 0%, #10b981 100%)";
const GS = { background: G };

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function displayName(v) {
  return v?.sellerDetails?.sellerName || v?.name || "N/A";
}
function displayShop(v) {
  return v?.businessDetails?.businessName || v?.shopName || "N/A";
}
function displayEmail(v) {
  return v?.businessDetails?.businessEmail || v?.email || "N/A";
}
function displayPhone(v) {
  return v?.businessDetails?.businessPhone || v?.phone || "N/A";
}
function displayCategory(v) {
  return v?.businessDetails?.businessType || v?.category || "N/A";
}
function displayCity(v) {
  return v?.businessDetails?.city || v?.city || "N/A";
}
function displayAddress(v) {
  return v?.businessDetails?.address || v?.address || "N/A";
}
function displayJoined(v) {
  const d = v?.createdAt;
  return d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";
}
function displayInitials(v) {
  const n = displayName(v);
  return n
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─────────────────────────────────────────────
// Badge
// ─────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    approved: {
      bg: "bg-green-100",
      text: "text-green-700",
      dot: "bg-green-500",
      label: "Approved",
    },
    active: {
      bg: "bg-green-100",
      text: "text-green-700",
      dot: "bg-green-500",
      label: "Active",
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "Rejected",
    },
    inactive: {
      bg: "bg-red-100",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "Inactive",
    },
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      dot: "bg-yellow-400",
      label: "Pending",
    },
    draft: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      dot: "bg-gray-400",
      label: "Draft",
    },
  };
  const cfg = map[status?.toLowerCase()] || {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    label: status || "—",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full text-[12px] px-3 py-1 ${cfg.bg} ${cfg.text}`}
    >
      <span className={`rounded-full w-1.5 h-1.5 shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────
function Av({ text = "?", size = 48 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: G,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size < 40 ? 11 : size < 60 ? 15 : 22,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {text}
    </div>
  );
}

// ─────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────
function Section({
  icon: Icon,
  title,
  count,
  children,
  color = "#16a34a",
  emptyMsg = "Nothing added yet",
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-green-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <Icon size={15} color={color} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-gray-800 m-0">
              {title}
            </h2>
            {count !== undefined && (
              <p className="text-[11px] text-gray-400 m-0">
                {count} {count === 1 ? "item" : "items"}
              </p>
            )}
          </div>
        </div>
        {count > 0 && (
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}
          >
            {count} total
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────
function Empty({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
        style={{ background: "rgba(34,197,94,0.08)" }}
      >
        <AlertCircle size={20} color="#86efac" />
      </div>
      <p className="text-sm font-semibold text-gray-400 m-0">{message}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Category Card
// ─────────────────────────────────────────────
function CategoryCard({ cat }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-green-50 bg-green-50/30 hover:bg-green-50/60 transition-colors">
      {cat.image ? (
        <img
          src={`${API_BASE_UB}${cat.image}`}
          alt={cat.name}
          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-green-100"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
          <Grid3X3 size={18} color="#16a34a" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 m-0 truncate">
          {cat.name}
        </p>
        {cat.description && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">
            {cat.description}
          </p>
        )}
        {cat.subcategoriesCount !== undefined && (
          <p className="text-[10px] text-green-600 font-semibold mt-1">
            {cat.subcategoriesCount} sub-categories
          </p>
        )}
      </div>
      <span
        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
          cat.isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-500"
        }`}
      >
        {cat.isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcategory Card
// ─────────────────────────────────────────────
function SubcategoryCard({ sub }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-indigo-50 bg-indigo-50/20 hover:bg-indigo-50/40 transition-colors">
      {sub.image ? (
        <img
          src={`${API_BASE_UB}${sub.image}`}
          alt={sub.name}
          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-indigo-100"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Layers size={18} color="#6366f1" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 m-0 truncate">
          {sub.name}
        </p>
        {sub.category?.name && (
          <p className="text-[11px] mt-0.5 flex items-center gap-1">
            <span className="text-gray-400">Under:</span>
            <span className="font-semibold text-indigo-600 truncate">
              {sub.category.name}
            </span>
          </p>
        )}
      </div>
      <span
        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
          sub.isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-500"
        }`}
      >
        {sub.isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Product Card
// ─────────────────────────────────────────────
function ProductCard({ product }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-orange-50 bg-orange-50/20 hover:bg-orange-50/40 transition-colors">
      {product.images?.[0] ? (
        <img
          src={`${API_BASE_UB}${product.images[0]}`}
          alt={product.name}
          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-orange-100"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={18} color="#f97316" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 m-0 truncate">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11px] font-bold text-orange-600">
            ₹{product.price}
          </span>
          <span className="text-[10px] text-gray-400">·</span>
          <span className="text-[11px] text-gray-500">
            Stock: {product.stock ?? "—"}
          </span>
          {product.category?.name && (
            <>
              <span className="text-[10px] text-gray-400">·</span>
              <span className="text-[10px] font-semibold text-green-600 truncate">
                {product.category.name}
              </span>
            </>
          )}
        </div>
      </div>
      <span
        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
          product.isActive
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-500"
        }`}
      >
        {product.isActive ? "Live" : "Off"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Loading skeleton for a section
// ─────────────────────────────────────────────
function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 animate-pulse"
        >
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1">
            <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
            <div className="h-2.5 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="w-14 h-6 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN — VendorDetailPage
// ─────────────────────────────────────────────
export default function VendorDetailPage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [vendor, setVendor] = useState(null);
  const [vendorLoading, setVendorLoading] = useState(true);

  const [cats, setCats] = useState([]);
  const [subs, setSubs] = useState([]);
  const [products, setProducts] = useState([]);

  const [catsLoading, setCatsLoading] = useState(true);
  const [subsLoading, setSubsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  // Refs for scroll-to-section
  const catsRef = useRef(null);
  const subsRef = useRef(null);
  const productsRef = useRef(null);

  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
  const headers = { Authorization: `Bearer ${token}` };

  // ── Fetch vendor details ──────────────────────
  const fetchVendor = useCallback(async () => {
    try {
      setVendorLoading(true);
      const data = await vendorAPI.getVendorById(vendorId);
      setVendor(data?.vendor || data);
    } catch (err) {
      console.error("Failed to fetch vendor:", err);
      toast.error("Failed to load vendor details");
    } finally {
      setVendorLoading(false);
    }
  }, [vendorId]);

  // ── Fetch categories ──────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      setCatsLoading(true);
      const r = await fetch(
        `${API_BASE_UB}/api/categories?vendorId=${vendorId}`,
        {
          headers,
          credentials: "include",
        },
      );
      const d = await r.json();
      setCats(Array.isArray(d) ? d : d.data || []);
    } catch {
      setCats([]);
    } finally {
      setCatsLoading(false);
    }
  }, [vendorId]);

  // ── Fetch subcategories ───────────────────────
  const fetchSubcategories = useCallback(async () => {
    try {
      setSubsLoading(true);
      const r = await fetch(
        `${API_BASE_UB}/api/subcategories?vendorId=${vendorId}`,
        {
          headers,
          credentials: "include",
        },
      );
      const d = await r.json();
      setSubs(Array.isArray(d) ? d : d.data || []);
    } catch {
      setSubs([]);
    } finally {
      setSubsLoading(false);
    }
  }, [vendorId]);

  // ── Fetch products ────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const r = await fetch(
        `${API_BASE_UB}/api/products?vendorId=${vendorId}&limit=100`,
        {
          headers,
          credentials: "include",
        },
      );
      const d = await r.json();
      setProducts(d.products || d.data || []);
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchVendor();
    fetchCategories();
    fetchSubcategories();
    fetchProducts();
  }, [fetchVendor, fetchCategories, fetchSubcategories, fetchProducts]);

  // ── Scroll to section when arriving via hash link ──────────────────
  // Wait until the loading states settle so the section exists in the DOM
  useEffect(() => {
    const hash = location.hash; // e.g. "#categories" | "#subcategories" | "#products"
    if (!hash) return;

    // If data is still loading, wait — the effect will re-run when loading flags change
    if (catsLoading || subsLoading || productsLoading || vendorLoading) return;

    const refMap = {
      "#categories": catsRef,
      "#subcategories": subsRef,
      "#products": productsRef,
    };
    const target = refMap[hash];
    if (target?.current) {
      // Small timeout so the DOM has painted the section content
      setTimeout(() => {
        target.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [location.hash, catsLoading, subsLoading, productsLoading, vendorLoading]);

  // ── Status change ─────────────────────────────
  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await vendorAPI.updateVendorStatus(vendorId, { status: newStatus });
      toast.success(`Vendor ${newStatus} successfully`);
      await fetchVendor();
    } catch (err) {
      toast.error(err.message || "Failed to update vendor status");
    } finally {
      setUpdating(false);
    }
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  if (vendorLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 size={36} className="animate-spin text-green-500" />
        <p className="text-sm text-gray-400">Loading vendor details…</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-4xl">😕</div>
        <p className="text-sm text-gray-500 font-semibold">Vendor not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-bold rounded-xl border-none cursor-pointer text-white"
          style={GS}
        >
          Go Back
        </button>
      </div>
    );
  }

  const isPending = vendor.status === "pending";
  const isApproved = vendor.status === "approved";
  const isRejected = vendor.status === "rejected";

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto flex flex-col gap-5">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Vendors</span>
          <span className="sm:hidden">Back</span>
        </button>
        <button
          onClick={() => {
            fetchVendor();
            fetchCategories();
            fetchSubcategories();
            fetchProducts();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-600 transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* ── Vendor hero card ── */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {/* Green banner */}
        <div className="p-5 md:p-6" style={GS}>
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Av text={displayInitials(vendor)} size={64} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-extrabold text-white m-0 truncate">
                  {displayShop(vendor)}
                </h1>
                <Badge status={vendor.status} />
              </div>
              <p className="text-white/75 text-sm m-0">{displayName(vendor)}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="flex items-center gap-1.5 text-white/80 text-xs">
                  <Mail size={11} /> {displayEmail(vendor)}
                </span>
                <span className="flex items-center gap-1.5 text-white/80 text-xs">
                  <Phone size={11} /> {displayPhone(vendor)}
                </span>
                <span className="flex items-center gap-1.5 text-white/80 text-xs">
                  <MapPin size={11} /> {displayCity(vendor)}
                </span>
                <span className="flex items-center gap-1.5 text-white/80 text-xs">
                  <Calendar size={11} /> Joined {displayJoined(vendor)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="bg-white grid grid-cols-2 md:grid-cols-4 divide-x divide-green-50 border-t border-green-50">
          {[
            { icon: Tag, label: "Category", value: displayCategory(vendor) },
            { icon: MapPin, label: "Address", value: displayAddress(vendor) },
            {
              icon: Package,
              label: "Products",
              value: productsLoading ? "…" : products.length,
            },
            {
              icon: Grid3X3,
              label: "Categories",
              value: catsLoading ? "…" : cats.length,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-gray-400">
                <Icon size={11} />
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  {label}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-800 m-0 truncate">
                {String(value)}
              </p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="bg-gray-50/60 px-5 py-3.5 border-t border-green-50 flex flex-wrap gap-2.5">
          {isPending && (
            <>
              <button
                onClick={() => handleStatusChange("approved")}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border-none cursor-pointer text-white disabled:opacity-60 shadow-sm"
                style={GS}
              >
                {updating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={14} />
                )}
                Approve Vendor
              </button>
              <button
                onClick={() => handleStatusChange("rejected")}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border-none cursor-pointer bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
              >
                {updating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <XCircle size={14} />
                )}
                Reject Vendor
              </button>
            </>
          )}
          {isApproved && (
            <button
              onClick={() => handleStatusChange("rejected")}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border-none cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60"
            >
              {updating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <XCircle size={14} />
              )}
              Revoke Approval
            </button>
          )}
          {isRejected && (
            <button
              onClick={() => handleStatusChange("approved")}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border-none cursor-pointer disabled:opacity-60 text-white shadow-sm"
              style={GS}
            >
              {updating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle size={14} />
              )}
              Re-approve Vendor
            </button>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Grid3X3,
            label: "Categories",
            value: catsLoading ? "…" : cats.length,
            color: "#16a34a",
            bg: "bg-green-50",
          },
          {
            icon: Layers,
            label: "Sub-categories",
            value: subsLoading ? "…" : subs.length,
            color: "#6366f1",
            bg: "bg-indigo-50",
          },
          {
            icon: Package,
            label: "Products",
            value: productsLoading ? "…" : products.length,
            color: "#f97316",
            bg: "bg-orange-50",
          },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}
            >
              <Icon size={18} color={color} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-800 m-0 leading-none">
                {value}
              </p>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Categories section ── */}
      <div ref={catsRef} id="categories" style={{ scrollMarginTop: "80px" }}>
        <Section
          icon={Grid3X3}
          title="Categories"
          count={catsLoading ? undefined : cats.length}
          color="#16a34a"
        >
          {catsLoading ? (
            <SectionSkeleton />
          ) : cats.length === 0 ? (
            <Empty message="No categories added yet" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cats.map((c) => (
                <CategoryCard key={c._id} cat={c} />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* ── Sub-categories section ── */}
      <div ref={subsRef} id="subcategories" style={{ scrollMarginTop: "80px" }}>
        <Section
          icon={Layers}
          title="Sub-Categories"
          count={subsLoading ? undefined : subs.length}
          color="#6366f1"
        >
          {subsLoading ? (
            <SectionSkeleton />
          ) : subs.length === 0 ? (
            <Empty message="No sub-categories added yet" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subs.map((s) => (
                <SubcategoryCard key={s._id} sub={s} />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* ── Products section ── */}
      <div ref={productsRef} id="products" style={{ scrollMarginTop: "80px" }}>
        <Section
          icon={Package}
          title="Products"
          count={productsLoading ? undefined : products.length}
          color="#f97316"
        >
          {productsLoading ? (
            <SectionSkeleton />
          ) : products.length === 0 ? (
            <Empty message="No products listed yet" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
