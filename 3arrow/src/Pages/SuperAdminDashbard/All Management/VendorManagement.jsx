import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Store,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  TrendingUp,
  Package,
  Star,
  ShoppingBag,
  Bell,
  X,
  Phone,
  Mail,
  MapPin,
  Tag,
  Loader2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { vendorAPI } from "../../../services/api";

const API_BASE_UB =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";
const G = "linear-gradient(135deg, #22c55e 0%, #10b981 100%)";
const GS = { background: G };

const STATUS_FILTERS = ["All", "approved", "pending", "rejected", "draft"];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function displayName(v) {
  return v.sellerDetails?.sellerName || v.name || "N/A";
}
function displayShop(v) {
  return v.businessDetails?.businessName || v.shopName || "N/A";
}
function displayEmail(v) {
  return v.businessDetails?.businessEmail || v.email || "N/A";
}
function displayPhone(v) {
  return v.businessDetails?.businessPhone || v.phone || "N/A";
}
function displayCategory(v) {
  return v.businessDetails?.businessType || v.category || "N/A";
}
function displayCity(v) {
  return v.businessDetails?.city || v.city || "N/A";
}
function displayJoined(v) {
  const d = v.createdAt;
  return d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
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

function resolveVendorId(obj) {
  if (!obj) return null;
  return (
    obj.vendorId ||
    obj.vendor?._id ||
    obj.vendor ||
    obj.sellerId ||
    obj.seller?._id ||
    obj.seller ||
    null
  );
}

// ─────────────────────────────────────────────
// Small reusable UI components
// ─────────────────────────────────────────────
function Av({ text = "?", size = 36, soft = false }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: soft ? "rgba(255,255,255,0.25)" : G,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size < 32 ? 9 : size < 42 ? 11 : 15,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {text}
    </div>
  );
}

function Badge({ status, small }) {
  const map = {
    approved: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Approved" },
    active: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", label: "Active" },
    rejected: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Rejected" },
    inactive: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Inactive" },
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-400", label: "Pending" },
    draft: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: "Draft" },
  };
  const cfg = map[status?.toLowerCase()] || {
    bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: status || "—",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full whitespace-nowrap
      ${cfg.bg} ${cfg.text} ${small ? "text-[9px] px-2 py-0.5" : "text-[11px] px-2.5 py-1"}`}
    >
      <span className={`rounded-full shrink-0 ${cfg.dot} ${small ? "w-1 h-1" : "w-1.5 h-1.5"}`} />
      {cfg.label}
    </span>
  );
}

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

// ─────────────────────────────────────────────
// Vendor Table
// ─────────────────────────────────────────────
function VendorTable({ vendors, loading, onRefresh, onStatusChange, updating }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [matchMap, setMatchMap] = useState(null);
  const debounceRef = useRef(null);

  // ── Deep search ──────────────────────────────
  useEffect(() => {
    clearTimeout(debounceRef.current);
    const q = search.trim();

    if (!q) {
      setMatchMap(null);
      setDeepLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setDeepLoading(true);
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
      const headers = { Authorization: `Bearer ${token}` };
      const encoded = encodeURIComponent(q);

      try {
        const [catRes, subRes, prodRes] = await Promise.allSettled([
          fetch(`${API_BASE_UB}/api/categories?search=${encoded}&limit=200`, {
            headers, credentials: "include",
          }).then((r) => r.json()),
          fetch(`${API_BASE_UB}/api/subcategories?search=${encoded}&limit=200`, {
            headers, credentials: "include",
          }).then((r) => r.json()),
          fetch(`${API_BASE_UB}/api/products?search=${encoded}&limit=200`, {
            headers, credentials: "include",
          }).then((r) => r.json()),
        ]);

        const reasons = {};
        const add = (rawVendorId, label, priority) => {
          if (!rawVendorId) return;
          const id = String(rawVendorId);
          if (!reasons[id] || reasons[id].priority > priority) {
            reasons[id] = { label, priority };
          }
        };

        if (catRes.status === "fulfilled") {
          const cats = Array.isArray(catRes.value)
            ? catRes.value
            : catRes.value?.data || catRes.value?.categories || [];
          cats.forEach((c) => add(resolveVendorId(c), `Category: ${c.name}`, 1));
        }
        if (subRes.status === "fulfilled") {
          const subs = Array.isArray(subRes.value)
            ? subRes.value
            : subRes.value?.data || subRes.value?.subcategories || [];
          subs.forEach((s) => add(resolveVendorId(s), `Sub-cat: ${s.name}`, 2));
        }
        if (prodRes.status === "fulfilled") {
          const prods =
            prodRes.value?.products ||
            prodRes.value?.data ||
            (Array.isArray(prodRes.value) ? prodRes.value : []);
          prods.forEach((p) => add(resolveVendorId(p), `Product: ${p.name}`, 3));
        }

        const flat = {};
        Object.entries(reasons).forEach(([id, { label }]) => {
          flat[id] = label;
        });
        setMatchMap(flat);
      } catch (err) {
        console.error("[VendorSearch] deep search failed:", err);
        setMatchMap({});
      } finally {
        setDeepLoading(false);
      }
    }, 420);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // ── Filtering ─────────────────────────────────
  const filtered = vendors.filter((v) => {
    const q = search.trim().toLowerCase();
    const localMatch =
      !q ||
      [displayName(v), displayShop(v), displayEmail(v), displayPhone(v), displayCategory(v), displayCity(v)]
        .some((field) => field.toLowerCase().includes(q));
    const deepMatch = matchMap ? !!matchMap[String(v._id)] : false;
    const matchSearch = localMatch || deepMatch;
    const matchFilter = filter === "All" || v.status === filter;
    return matchSearch && matchFilter;
  });

  function MatchPill({ vendorId }) {
    const reason = matchMap?.[String(vendorId)];
    if (!reason) return null;
    let cls = "bg-blue-50 text-blue-700";
    if (reason.startsWith("Category:")) cls = "bg-purple-50 text-purple-700";
    else if (reason.startsWith("Sub-cat:")) cls = "bg-indigo-50 text-indigo-700";
    else if (reason.startsWith("Product:")) cls = "bg-orange-50 text-orange-700";
    const label = reason.length > 30 ? reason.slice(0, 28) + "…" : reason;
    return (
      <span
        className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}
        title={reason}
      >
        {label}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={32} className="animate-spin text-green-500" />
        <p className="text-sm text-gray-400">Loading vendors…</p>
      </div>
    );
  }

  function SearchBox({ mobile }) {
    return (
      <div className="relative">
        {deepLoading ? (
          <Loader2
            size={mobile ? 11 : 13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-green-500 animate-spin"
          />
        ) : (
          <Search
            size={mobile ? 11 : 13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
        )}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, product, category, city…"
          className={`pl-8 pr-7 py-2 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400 transition-colors
            ${mobile ? "w-full text-xs" : "w-60 text-sm"}`}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer p-0"
          >
            <X size={mobile ? 11 : 12} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-green-50">
        <div>
          <p className="text-sm font-extrabold text-gray-800 m-0">Vendor List</p>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} vendors</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <SearchBox />
          <div className="flex gap-1 bg-green-50 rounded-xl p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all capitalize
                  ${filter === f ? "text-white shadow-sm" : "bg-transparent text-green-700"}`}
                style={filter === f ? GS : {}}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
            title="Refresh"
          >
            <RefreshCw size={13} color="#6b7280" />
          </button>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden px-3 py-3 border-b border-green-50">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-sm font-extrabold text-gray-800 m-0">
            Vendors{" "}
            <span className="text-gray-400 font-normal text-xs">({filtered.length})</span>
          </p>
          <button onClick={onRefresh} className="p-1.5 rounded-lg bg-gray-100 border-none cursor-pointer">
            <RefreshCw size={12} color="#6b7280" />
          </button>
        </div>
        <div className="flex gap-1.5 mb-2.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-full border-none cursor-pointer shrink-0 transition-all capitalize
                ${filter === f ? "text-white" : "bg-green-50 text-green-700"}`}
              style={filter === f ? GS : {}}
            >
              {f}
            </button>
          ))}
        </div>
        <SearchBox mobile />
        {!search && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {["product", "category", "sub-category", "city"].map((hint) => (
              <span
                key={hint}
                className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400"
              >
                Search by {hint}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: "linear-gradient(90deg,#f0fdf4,#ecfdf5)" }}>
              {["Business", "Owner", "Email", "Phone", "Category", "Status", "Applied", "Action"].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-3 text-[11px] font-bold text-green-700 uppercase tracking-wide ${i === 7 ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((vendor, idx) => (
              <tr
                key={vendor._id}
                className="hover:bg-green-50/40 transition-colors"
                style={{ borderTop: idx === 0 ? "none" : "1px solid #f0fdf4" }}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Av text={displayInitials(vendor)} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-gray-800 leading-tight">{displayShop(vendor)}</span>
                      <MatchPill vendorId={vendor._id} />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600 font-medium">{displayName(vendor)}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{displayEmail(vendor)}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{displayPhone(vendor)}</td>
                <td className="px-5 py-3">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-700">
                    {displayCategory(vendor)}
                  </span>
                </td>
                <td className="px-5 py-3"><Badge status={vendor.status} /></td>
                <td className="px-5 py-3 text-sm text-gray-400">{displayJoined(vendor)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Details — navigates to dedicated page */}
                    <button
                      onClick={() => navigate(`/admin/vendors/${vendor._id}`)}
                      className="p-1.5 rounded-lg border-none cursor-pointer bg-green-50 hover:bg-green-100 transition-colors"
                      title="View full details"
                    >
                      <Eye size={14} color="#16a34a" />
                    </button>
                    {vendor.status === "pending" && (
                      <button
                        onClick={() => navigate(`/admin/vendors/${vendor._id}`)}
                        className="px-3 py-1.5 text-[11px] font-bold rounded-lg border-none cursor-pointer text-white shadow-sm"
                        style={GS}
                      >
                        Review
                      </button>
                    )}
                    {vendor.status === "approved" && (
                      <button
                        onClick={() => onStatusChange(vendor._id, "rejected")}
                        disabled={updating === vendor._id}
                        className="px-3 py-1.5 text-[11px] font-bold rounded-lg border-none cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        {updating === vendor._id ? <Loader2 size={12} className="animate-spin" /> : "Revoke"}
                      </button>
                    )}
                    {vendor.status === "rejected" && (
                      <button
                        onClick={() => onStatusChange(vendor._id, "approved")}
                        disabled={updating === vendor._id}
                        className="px-3 py-1.5 text-[11px] font-bold rounded-lg border-none cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                      >
                        {updating === vendor._id ? <Loader2 size={12} className="animate-spin" /> : "Re-approve"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !deepLoading && (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm text-gray-400 m-0">No vendors found for "{search}"</p>
                  <p className="text-xs text-gray-300 mt-1">Try a product name, category, or sub-category</p>
                </td>
              </tr>
            )}
            {filtered.length === 0 && deepLoading && (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <Loader2 size={24} className="animate-spin text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 m-0">Searching products & categories…</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile List ── */}
      <div className="md:hidden divide-y divide-green-50">
        {filtered.map((vendor) => (
          <div key={vendor._id} className="px-3 py-3">
            <div className="flex items-center gap-2.5">
              <Av text={displayInitials(vendor)} size={38} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 m-0 truncate">{displayShop(vendor)}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{displayName(vendor)}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-700">
                    {displayCategory(vendor)}
                  </span>
                  <span className="text-[9px] text-gray-400">· {displayCity(vendor)}</span>
                  <MatchPill vendorId={vendor._id} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge status={vendor.status} small />
                <button
                  onClick={() => navigate(`/admin/vendors/${vendor._id}`)}
                  className="w-7 h-7 rounded-lg border-none cursor-pointer bg-green-50 flex items-center justify-center"
                >
                  <Eye size={12} color="#16a34a" />
                </button>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === vendor._id ? null : vendor._id);
                    }}
                    className="w-7 h-7 rounded-lg border-none cursor-pointer bg-gray-100 flex items-center justify-center"
                  >
                    <MoreVertical size={12} color="#9CA3AF" />
                  </button>
                  {openMenu === vendor._id && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl w-36 overflow-hidden shadow-xl z-20">
                      {vendor.status === "pending" && (
                        <>
                          <div
                            onClick={() => { onStatusChange(vendor._id, "approved"); setOpenMenu(null); }}
                            className="px-3.5 py-2.5 text-xs text-green-600 cursor-pointer hover:bg-green-50 flex items-center gap-2"
                          >
                            <CheckCircle size={11} /> Approve
                          </div>
                          <div className="h-px bg-gray-100" />
                          <div
                            onClick={() => { onStatusChange(vendor._id, "rejected"); setOpenMenu(null); }}
                            className="px-3.5 py-2.5 text-xs text-red-500 cursor-pointer hover:bg-red-50 flex items-center gap-2"
                          >
                            <XCircle size={11} /> Reject
                          </div>
                        </>
                      )}
                      {vendor.status === "approved" && (
                        <div
                          onClick={() => { onStatusChange(vendor._id, "rejected"); setOpenMenu(null); }}
                          className="px-3.5 py-2.5 text-xs text-red-500 cursor-pointer hover:bg-red-50"
                        >
                          Revoke
                        </div>
                      )}
                      {vendor.status === "rejected" && (
                        <div
                          onClick={() => { onStatusChange(vendor._id, "approved"); setOpenMenu(null); }}
                          className="px-3.5 py-2.5 text-xs text-green-600 cursor-pointer hover:bg-green-50"
                        >
                          Re-approve
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center">
            {deepLoading ? (
              <Loader2 size={20} className="animate-spin text-green-400 mx-auto mb-2" />
            ) : (
              <div className="text-2xl mb-1.5">🔍</div>
            )}
            <p className="text-xs text-gray-400 m-0">
              {deepLoading ? "Searching products & categories…" : `No vendors found for "${search}"`}
            </p>
          </div>
        )}
      </div>

      {openMenu && <div onClick={() => setOpenMenu(null)} className="fixed inset-0 z-10" />}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN — VendorManagement
// ─────────────────────────────────────────────
export default function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vendorAPI.getAllVendors();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.vendors)
          ? data.vendors
          : Array.isArray(data?.data)
            ? data.data
            : [];
      setVendors(list);
    } catch (err) {
      console.error("Failed to fetch vendors:", err);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleStatusChange = async (vendorId, newStatus) => {
    try {
      setUpdating(vendorId);
      await vendorAPI.updateVendorStatus(vendorId, { status: newStatus });
      toast.success(
        `Vendor ${newStatus === "approved" ? "approved" : newStatus === "rejected" ? "rejected" : "updated"} successfully`,
      );
      await fetchVendors();
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(err.message || "Failed to update vendor status");
    } finally {
      setUpdating(null);
    }
  };

  const approved = vendors.filter((v) => v.status === "approved").length;
  const pending = vendors.filter((v) => v.status === "pending").length;
  const rejected = vendors.filter((v) => v.status === "rejected").length;
  const draft = vendors.filter((v) => v.status === "draft").length;

  const stats = [
    { label: "Total Vendors", value: loading ? "…" : vendors.length, sub: "All", icon: Store },
    { label: "Approved", value: loading ? "…" : approved, sub: "Active", icon: CheckCircle },
    { label: "Pending", value: loading ? "…" : pending, sub: "Review", icon: ShoppingBag },
    { label: "Rejected", value: loading ? "…" : rejected, sub: "Revoked", icon: XCircle },
    { label: "Draft", value: loading ? "…" : draft, sub: "Incomplete", icon: Package },
    { label: "Avg Rating", value: "—", sub: "⭐", icon: Star },
  ];

  return (
    <div className="p-3 md:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-xl font-extrabold text-gray-800 m-0">
            Vendor Management
          </h1>
          <p className="hidden md:block text-xs text-gray-400 mt-1">
            Manage vendor applications & approvals
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center cursor-pointer">
          <Bell size={16} color="#16a34a" />
        </div>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {stats.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} sub={s.sub} icon={s.icon} loading={loading} />
        ))}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <VendorTable
          vendors={vendors}
          loading={loading}
          onRefresh={fetchVendors}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      </div>
    </div>
  );
}