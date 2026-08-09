import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  SquarePen,
  Trash2,
  Layers,
  X,
  Loader2,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  XCircle,
  PlusCircle,
  Search,
  ExternalLink,
  Store,
} from "lucide-react";
import { API_BASE_UB } from "../All Management/constrants";
import { getToken } from "../All Management/api";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/** Plain JSON fetch */
async function subFetch(method, path) {
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

/** Multipart/FormData fetch */
async function subUpload(method, path, formData) {
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
  if (raw && Array.isArray(raw.subcategories)) return raw.subcategories;
  if (raw && Array.isArray(raw.subCategories)) return raw.subCategories;
  return [];
}

/** Resolve vendor ID from a subcategory object */
function resolveVendorId(sub) {
  return (
    sub?.vendorId ||
    sub?.vendor?._id ||
    sub?.vendor ||
    sub?.sellerId ||
    sub?.seller?._id ||
    sub?.seller ||
    null
  );
}

/** Resolve vendor display name from a subcategory object */
function resolveVendorName(sub) {
  return (
    sub?.vendor?.businessDetails?.businessName ||
    sub?.vendor?.shopName ||
    sub?.vendor?.sellerDetails?.sellerName ||
    sub?.vendor?.name ||
    null
  );
}

// ────────────────────────────────────────────────────────────────────────────
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

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-600">{label}</label>
    {children}
  </div>
);
const Input = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
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
const SelectEl = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400 transition-colors"
  >
    {children}
  </select>
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

/* ═══════════════════════════════════════════════════════════════════
   MAIN — SubCategoriesPage
═══════════════════════════════════════════════════════════════════ */
export default function SubCategoriesPage({ categories = [], showToast }) {
  const navigate = useNavigate();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [catFilter, setCatFilter] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const blank = {
    name: "",
    category: "",
    imageFile: null,
    image: "",
    imagePreview: "",
    description: "",
    isActive: true,
  };
  const [form, setForm] = useState(blank);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // ── Navigate to vendor detail page, scrolling to the subcategories section ──
  function goToVendor(vendorId) {
    navigate(`/admin/vendors/${vendorId}#subcategories`);
  }

  // ── Fetch ──
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = catFilter ? `?category=${catFilter}` : "";
      const raw = await subFetch("GET", `/subcategories${qs}`);
      setSubs(toArray(raw));
    } catch (e) {
      showToast?.(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [catFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditing(null);
    setForm(blank);
    setModal(true);
  }
  function openEdit(s) {
    setEditing(s._id);
    setForm({
      name: s.name || "",
      category: s.category?._id || s.category || "",
      imageFile: null,
      image: s.image || "",
      imagePreview: s.image ? `${API_BASE_UB}${s.image}` : "",
      description: s.description || "",
      isActive: s.isActive ?? true,
    });
    setModal(true);
  }

  // ── Submit ──
  async function submit() {
    if (!form.name.trim() || !form.category)
      return showToast?.("Name and Category are required", "error");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("category", form.category);
      fd.append("description", form.description);
      fd.append("isActive", form.isActive);
      if (form.imageFile) fd.append("image", form.imageFile);
      const path = editing ? `/subcategories/${editing}` : "/subcategories";
      await subUpload(editing ? "PUT" : "POST", path, fd);
      showToast?.(editing ? "Sub-category updated!" : "Sub-category created!");
      setModal(false);
      load();
    } catch (e) {
      showToast?.(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Delete ──
  async function del(id) {
    if (!confirm("Delete this sub-category?")) return;
    try {
      await subFetch("DELETE", `/subcategories/${id}`);
      showToast?.("Sub-category deleted");
      load();
    } catch (e) {
      showToast?.(e.message, "error");
    }
  }

  const F = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handleImg = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    F("imageFile", file);
    const r = new FileReader();
    r.onloadend = () => F("imagePreview", r.result);
    r.readAsDataURL(file);
  };

  const filtered = subs.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.slug?.toLowerCase().includes(q) ||
      s.category?.name?.toLowerCase().includes(q)
    );
  });

  const active = subs.filter((s) => s.isActive).length;
  const stats = [
    {
      label: "Total Sub-Categories",
      value: subs.length,
      sub: "All",
      icon: Layers,
    },
    { label: "Active", value: active, sub: "Live", icon: CheckCircle },
    {
      label: "Inactive",
      value: subs.length - active,
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
            Sub-Category Management
          </h1>
          <p className="hidden md:block text-xs text-gray-400 mt-1">
            Manage sub-categories under parent categories
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white rounded-xl border-none cursor-pointer shadow-md hover:opacity-90 transition-all"
          style={GS}
        >
          <PlusCircle size={15} /> Add Sub-Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} loading={loading} />
        ))}
      </div>

      {/* Content card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {/* ── Desktop toolbar ── */}
        <div
          className="hidden md:flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-green-50"
          style={{ background: "linear-gradient(90deg,#f0fdf4,#ecfdf5)" }}
        >
          <div>
            <p className="text-sm font-extrabold text-gray-800 m-0">
              Sub-Category List
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {filtered.length} total
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or slug..."
                className="pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none w-44 focus:border-green-400 transition-colors"
              />
            </div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400 transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={load}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 cursor-pointer transition-colors"
              title="Refresh"
            >
              <RefreshCw size={13} color="#6b7280" />
            </button>
          </div>
        </div>

        {/* ── Mobile toolbar ── */}
        <div className="md:hidden px-3 py-3 border-b border-green-50">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-sm font-extrabold text-gray-800 m-0">
              Sub-Categories{" "}
              <span className="text-gray-400 font-normal text-xs">
                ({filtered.length})
              </span>
            </p>
            <button
              onClick={load}
              className="p-1.5 rounded-lg bg-gray-100 border-none cursor-pointer"
            >
              <RefreshCw size={12} color="#6b7280" />
            </button>
          </div>
          <div className="flex gap-2 mb-2.5">
            <div className="relative flex-1">
              <Search
                size={11}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400 transition-colors"
              />
            </div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-2 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 outline-none"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Body ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-green-500" />
            <p className="text-sm text-gray-400">Loading sub-categories…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">🗃️</div>
            <p className="text-sm font-bold text-gray-700 m-0">
              No Sub-Categories Found
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Add sub-categories under a parent category.
            </p>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white rounded-xl border-none cursor-pointer shadow-md hover:opacity-90"
              style={GS}
            >
              <PlusCircle size={14} /> Add Sub-Category
            </button>
          </div>
        ) : isMobile ? (
          /* ── Mobile list ── */
          <div className="divide-y divide-green-50">
            {filtered.map((s) => {
              const vendorId = resolveVendorId(s);
              const vendorName = resolveVendorName(s);
              return (
                <div key={s._id} className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    {s.image ? (
                      <img
                        src={`${API_BASE_UB}${s.image}`}
                        alt={s.name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-50 shrink-0">
                        <Layers size={16} color="#16a34a" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 m-0 truncate">
                        {s.name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-mono truncate">
                        /{s.slug}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {s.category?.name || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge active={s.isActive} small />
                      <button
                        onClick={() => openEdit(s)}
                        className="w-7 h-7 rounded-lg border-none cursor-pointer bg-green-50 flex items-center justify-center"
                      >
                        <SquarePen size={12} color="#16a34a" />
                      </button>
                      <button
                        onClick={() => del(s._id)}
                        className="w-7 h-7 rounded-lg border-none cursor-pointer bg-red-50 flex items-center justify-center"
                      >
                        <Trash2 size={12} color="#ef4444" />
                      </button>
                      {/* View Vendor button — mobile */}
                      {vendorId && (
                        <button
                          onClick={() => goToVendor(vendorId)}
                          title={
                            vendorName
                              ? `View vendor: ${vendorName}`
                              : "View vendor"
                          }
                          className="w-7 h-7 rounded-lg border-none cursor-pointer flex items-center justify-center"
                          style={{ background: "rgba(22,163,74,0.12)" }}
                        >
                          <ExternalLink size={12} color="#16a34a" />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Vendor chip below row on mobile */}
                  {vendorId && vendorName && (
                    <button
                      onClick={() => goToVendor(vendorId)}
                      className="mt-1.5 ml-11 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border-none cursor-pointer"
                      style={{
                        background: "rgba(22,163,74,0.1)",
                        color: "#16a34a",
                      }}
                    >
                      <Store size={8} /> {vendorName}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Desktop table ── */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr
                  style={{
                    background: "linear-gradient(90deg,#f0fdf4,#ecfdf5)",
                  }}
                >
                  {[
                    "Sub-Category",
                    "Slug",
                    "Parent Category",
                    "Vendor",
                    "Status",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-[11px] font-bold text-green-700 uppercase tracking-wide ${i === 5 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => {
                  const vendorId = resolveVendorId(s);
                  const vendorName = resolveVendorName(s);
                  return (
                    <tr
                      key={s._id}
                      className="hover:bg-green-50/40 transition-colors"
                      style={{
                        borderTop: idx === 0 ? "none" : "1px solid #f0fdf4",
                      }}
                    >
                      {/* Sub-Category */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          {s.image ? (
                            <img
                              src={`${API_BASE_UB}${s.image}`}
                              alt={s.name}
                              className="w-8 h-8 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                              <Layers size={14} color="#16a34a" />
                            </div>
                          )}
                          <span className="text-sm font-bold text-gray-800">
                            {s.name}
                          </span>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-5 py-3 text-sm text-gray-400 font-mono">
                        /{s.slug}
                      </td>

                      {/* Parent Category */}
                      <td className="px-5 py-3">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-700">
                          {s.category?.name || "—"}
                        </span>
                      </td>

                      {/* Vendor — NEW column */}
                      <td className="px-5 py-3">
                        {vendorId ? (
                          <button
                            onClick={() => goToVendor(vendorId)}
                            title="View in Vendor Detail Page"
                            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border-none cursor-pointer transition-all hover:opacity-80"
                            style={{
                              background: "rgba(22,163,74,0.1)",
                              color: "#16a34a",
                            }}
                          >
                            <Store size={11} />
                            {vendorName
                              ? vendorName.slice(0, 16) +
                                (vendorName.length > 16 ? "…" : "")
                              : "View Vendor"}
                            <ExternalLink size={10} />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <Badge active={s.isActive} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(s)}
                            className="p-1.5 rounded-lg border-none cursor-pointer bg-green-50 hover:bg-green-100 transition-colors"
                            title="Edit"
                          >
                            <SquarePen size={14} color="#16a34a" />
                          </button>
                          <button
                            onClick={() => del(s._id)}
                            className="p-1.5 rounded-lg border-none cursor-pointer bg-red-50 hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit Sub-Category" : "Add Sub-Category"}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Btn>
            <Btn onClick={submit} disabled={submitting}>
              {submitting && <Loader2 size={13} className="animate-spin" />}
              {submitting ? "Saving…" : "Save"}
            </Btn>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <Field label="Name *">
              <Input
                value={form.name}
                onChange={(e) => F("name", e.target.value)}
                placeholder="e.g. Laptops"
              />
            </Field>
          </div>

          <div className="col-span-2 md:col-span-1">
            <Field label="Parent Category *">
              <SelectEl
                value={form.category}
                onChange={(e) => F("category", e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </SelectEl>
            </Field>
          </div>

          <div className="col-span-2 md:col-span-1">
            <Field label="Image Upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImg}
                style={{ display: "none" }}
                id="sub-img"
              />
              <label
                htmlFor="sub-img"
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
                    className="w-full h-32 object-cover block"
                  />
                </div>
              )}
            </Field>
          </div>

          <div className="col-span-2 md:col-span-1">
            <Field label="Active">
              <Toggle
                checked={form.isActive}
                onChange={(v) => F("isActive", v)}
                label="Visible in storefront"
              />
            </Field>
          </div>

          <div className="col-span-2">
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => F("description", e.target.value)}
                placeholder="Short description…"
              />
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
}
