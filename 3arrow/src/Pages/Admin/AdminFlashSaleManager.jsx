// AdminFlashSaleManager.jsx
import React, { useEffect, useState, useRef } from "react";
import { flashSaleAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Bell,
  Play,
  StopCircle,
  X,
  ImageIcon,
  Calendar,
  Users,
  ShoppingBag,
  Zap,
  ChevronDown,
  ChevronUp,
  Eye,
  Tag,
} from "lucide-react";

/* ─── Status Badge ─── */
const StatusBadge = ({ status }) => {
  const map = {
    draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft" },
    notified: { bg: "bg-blue-100", text: "text-blue-600", label: "Notified" },
    live: { bg: "bg-green-100", text: "text-green-600", label: "🔴 Live" },
    ended: { bg: "bg-red-100", text: "text-red-500", label: "Ended" },
    cancelled: {
      bg: "bg-orange-100",
      text: "text-orange-500",
      label: "Cancelled",
    },
  };
  const s = map[status] || map.draft;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
};

const EMPTY_FORM = {
  title: "",
  description: "",
  bannerImage: null,
  bannerImagePreview: "",
  bannerColor: "#e63946",
  startDate: "",
  endDate: "",
  minDiscountRequired: 10,
  displayBannerText: "",
  showOnDailySale: true,
  targetCategories: [], // ← NEW: selected category IDs
};

/* ─── Category Multi-Select Dropdown ─── */
const CategorySelector = ({ categories, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectedNames = categories
    .filter((c) => selected.includes(c._id))
    .map((c) => c.name);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-left flex items-center justify-between outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition bg-white"
      >
        <span
          className={selectedNames.length ? "text-gray-800" : "text-gray-400"}
        >
          {selectedNames.length
            ? selectedNames.join(", ")
            : "All categories (no restriction)"}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {/* Clear all option */}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full px-4 py-2 text-xs text-red-500 hover:bg-red-50 text-left font-medium border-b border-gray-100"
            >
              ✕ Clear all (allow all categories)
            </button>
          )}
          {categories.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400">
              No categories found
            </p>
          ) : (
            categories.map((cat) => (
              <label
                key={cat._id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(cat._id)}
                  onChange={() => toggle(cat._id)}
                  className="w-4 h-4 accent-red-500 rounded"
                />
                <span className="text-sm text-gray-700">{cat.name}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Products Panel (unchanged logic, kept as-is) ─── */
const SaleProductsPanel = ({ sale }) => {
  const [expanded, setExpanded] = useState(false);
  const products = sale.products || [];
  if (products.length === 0) return null;
  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition font-medium"
      >
        <Eye className="w-3.5 h-3.5" />
        {expanded ? "Hide" : "Show"} {products.length} product
        {products.length !== 1 ? "s" : ""}
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>
      {expanded && (
        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
          {products.map((entry) => {
            const p = entry.product;
            if (!p) return null;
            return (
              <div
                key={entry._id}
                className="flex items-center gap-3 bg-gray-50 rounded-lg p-2"
              >
                {p.images?.[0]?.url && (
                  <img
                    src={p.images[0].url}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    ₹{entry.salePrice}{" "}
                    <span className="line-through text-gray-300">
                      ₹{entry.originalPrice}
                    </span>{" "}
                    · {entry.discountPercent}% off
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${entry.isApproved ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
                >
                  {entry.isApproved ? "✓" : "✗"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─── Create/Edit Modal ─── */
const SaleFormModal = ({ sale, categories, onClose, onSaved }) => {
  const [form, setForm] = useState(
    sale
      ? {
          title: sale.title,
          description: sale.description || "",
          bannerImage: null,
          bannerImagePreview: sale.bannerImage || "",
          bannerColor: sale.bannerColor || "#e63946",
          startDate: sale.startDate?.slice(0, 10) || "",
          endDate: sale.endDate?.slice(0, 10) || "",
          minDiscountRequired: sale.minDiscountRequired ?? 10,
          displayBannerText: sale.displayBannerText || "",
          showOnDailySale: sale.showOnDailySale !== false,
          targetCategories: (sale.targetCategories || []).map((c) =>
            typeof c === "object" ? c._id : c,
          ),
        }
      : { ...EMPTY_FORM },
  );
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({
      ...f,
      bannerImage: file,
      bannerImagePreview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.startDate || !form.endDate)
      return toast.error("Start and end dates are required");
    if (new Date(form.startDate) >= new Date(form.endDate))
      return toast.error("End date must be after start date");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("bannerColor", form.bannerColor);
    fd.append("startDate", form.startDate);
    fd.append("endDate", form.endDate);
    fd.append("minDiscountRequired", form.minDiscountRequired);
    fd.append("displayBannerText", form.displayBannerText);
    fd.append("showOnDailySale", form.showOnDailySale);
    // ← Send as JSON string so backend can parse the array
    fd.append("targetCategories", JSON.stringify(form.targetCategories));
    if (form.bannerImage) fd.append("bannerImage", form.bannerImage);

    try {
      setSaving(true);
      if (sale) {
        await flashSaleAPI.updateSale(sale._id, fd);
        toast.success("Sale updated!");
      } else {
        await flashSaleAPI.createSale(fd);
        toast.success("Sale created!");
      }
      onSaved();
      onClose();
    } catch (err) {
      if (
        err.message.includes("Authentication") ||
        err.message.includes("401")
      ) {
        toast.error("Authentication failed. Please log in again.");
      } else if (err.message.includes("Network")) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(err.message || "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {sale ? "Edit Flash Sale" : "🔥 Create Flash Sale"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Sale Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Diwali Flash Sale 🎉"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Tell vendors and customers about this sale..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition resize-none"
            />
          </div>

          {/* Banner Image */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Banner Image
            </label>
            <div
              onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-red-400 transition group"
            >
              {form.bannerImagePreview ? (
                <div className="relative">
                  <img
                    src={form.bannerImagePreview}
                    alt="Preview"
                    className="w-full h-36 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      Change Image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-5 text-gray-400">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <p className="text-sm">Click to upload banner image</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Banner Color */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Banner Color (fallback)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.bannerColor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bannerColor: e.target.value }))
                }
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <span className="text-sm text-gray-500">{form.bannerColor}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
          </div>

          {/* Min Discount */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Minimum Discount Required (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.minDiscountRequired}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  minDiscountRequired: Number(e.target.value),
                }))
              }
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
          </div>

          {/* ─── TARGET CATEGORIES ─────────────────────────────────────────── */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Restrict to Categories
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Select specific categories to restrict this sale. Leave empty to
              allow all categories.
            </p>
            <CategorySelector
              categories={categories}
              selected={form.targetCategories}
              onChange={(val) =>
                setForm((f) => ({ ...f, targetCategories: val }))
              }
            />
            {form.targetCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {categories
                  .filter((c) => form.targetCategories.includes(c._id))
                  .map((c) => (
                    <span
                      key={c._id}
                      className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium border border-red-100"
                    >
                      <Tag className="w-3 h-3" />
                      {c.name}
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            targetCategories: f.targetCategories.filter(
                              (id) => id !== c._id,
                            ),
                          }))
                        }
                        className="ml-0.5 text-red-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
          {/* ──────────────────────────────────────────────────────────────── */}

          {/* Banner Text */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Banner Display Text
            </label>
            <input
              type="text"
              value={form.displayBannerText}
              onChange={(e) =>
                setForm((f) => ({ ...f, displayBannerText: e.target.value }))
              }
              placeholder="e.g. Up to 70% OFF — Today Only!"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
          </div>

          {/* Show on Daily Sale */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.showOnDailySale}
                onChange={(e) =>
                  setForm((f) => ({ ...f, showOnDailySale: e.target.checked }))
                }
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition ${form.showOnDailySale ? "bg-red-500" : "bg-gray-300"}`}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition ${form.showOnDailySale ? "translate-x-5" : ""}`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Show on Daily Sale page
              </p>
              <p className="text-xs text-gray-400">
                Displays this sale's banner on the public Daily Sales banner
              </p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm text-gray-600 border border-gray-200 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50"
          >
            {saving ? "Saving…" : sale ? "Update Sale" : "Create Sale"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Admin Component ─── */
const AdminFlashSaleManager = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]); // ← NEW: all categories

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await flashSaleAPI.getAllSales();
      setSales(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch all categories for the selector ─────────────────────────────
  // GET /api/categories is PUBLIC (no protect middleware on this route)
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // getCategories may return: plain array  OR  { categories: [...] }
      // OR  { data: [...] }  — handle all shapes safely
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.categories)
          ? data.categories
          : Array.isArray(data.data)
            ? data.data
            : [];
      setCategories(list);
    } catch (err) {
      // Non-critical — selector will just be empty, sale still works
      console.warn("Could not load categories:", err.message);
    }
  };
  // ────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchSales();
    fetchCategories();
  }, []);

  const handleNotify = async (id) => {
    try {
      await flashSaleAPI.notifyVendors(id);
      toast.success("Vendors notified!");
      fetchSales();
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const handleStart = async (id) => {
    try {
      await flashSaleAPI.startSale(id);
      toast.success("Sale is now LIVE! 🔴");
      fetchSales();
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const handleEnd = async (id, cancel = false) => {
    try {
      await flashSaleAPI.endSale(id, cancel);
      toast.success(cancel ? "Sale cancelled" : "Sale ended");
      fetchSales();
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      {/* Create button */}
      <div className="flex justify-end mb-5">
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Flash Sale
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Sales", val: sales.length, icon: "🔥" },
          {
            label: "Live Now",
            val: sales.filter((s) => s.status === "live").length,
            icon: "🔴",
          },
          {
            label: "Notified",
            val: sales.filter((s) => s.status === "notified").length,
            icon: "📢",
          },
          {
            label: "Drafts",
            val: sales.filter((s) => s.status === "draft").length,
            icon: "📝",
          },
        ].map(({ label, val, icon }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <div className="text-2xl font-bold text-gray-800">{val}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales list */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <p className="text-gray-400 animate-pulse">Loading flash sales…</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No flash sales yet</p>
            <p className="text-sm mt-1">
              Create your first flash sale to get started!
            </p>
          </div>
        ) : (
          sales.map((sale) => (
            <div
              key={sale._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Banner */}
              {sale.bannerImage ? (
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={sale.bannerImage}
                    alt={sale.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center px-6">
                    <div>
                      <h3 className="text-white text-lg font-bold">
                        {sale.title}
                      </h3>
                      {sale.displayBannerText && (
                        <p className="text-white/80 text-sm">
                          {sale.displayBannerText}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={sale.status} />
                  </div>
                </div>
              ) : (
                <div
                  className="h-16 flex items-center justify-between px-5"
                  style={{ backgroundColor: sale.bannerColor || "#e63946" }}
                >
                  <h3 className="text-white text-lg font-bold">{sale.title}</h3>
                  <StatusBadge status={sale.status} />
                </div>
              )}

              {/* Body */}
              <div className="p-5">
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(sale.startDate)} → {formatDate(sale.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {sale.participants?.filter((p) => p.status === "joined")
                      .length || 0}{" "}
                    vendors
                  </span>
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {sale.products?.length || 0} products
                  </span>
                  <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                    Min {sale.minDiscountRequired}% off
                  </span>
                </div>

                {/* ─── Category Badges ─────────────────────────────────────── */}
                {sale.targetCategories && sale.targetCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Category restricted:
                    </span>
                    {sale.targetCategories.map((cat) => (
                      <span
                        key={typeof cat === "object" ? cat._id : cat}
                        className="text-xs bg-purple-50 text-purple-600 px-2.5 py-0.5 rounded-full font-medium border border-purple-100"
                      >
                        {typeof cat === "object" ? cat.name : cat}
                      </span>
                    ))}
                  </div>
                )}
                {/* ──────────────────────────────────────────────────────────── */}

                <SaleProductsPanel sale={sale} />

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  {["draft", "notified"].includes(sale.status) && (
                    <button
                      onClick={() => {
                        setEditing(sale);
                        setModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                  {sale.status === "draft" && (
                    <button
                      onClick={() => handleNotify(sale._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white transition"
                    >
                      <Bell className="w-3.5 h-3.5" /> Notify Vendors
                    </button>
                  )}
                  {["draft", "notified"].includes(sale.status) && (
                    <button
                      onClick={() => handleStart(sale._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 hover:bg-green-600 text-white transition"
                    >
                      <Play className="w-3.5 h-3.5" /> Go Live
                    </button>
                  )}
                  {sale.status === "live" && (
                    <button
                      onClick={() => handleEnd(sale._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition"
                    >
                      <StopCircle className="w-3.5 h-3.5" /> End Sale
                    </button>
                  )}
                  {["draft", "notified"].includes(sale.status) && (
                    <button
                      onClick={() => handleEnd(sale._id, true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <SaleFormModal
          sale={editing}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSaved={fetchSales}
        />
      )}
    </>
  );
};

export default AdminFlashSaleManager;
