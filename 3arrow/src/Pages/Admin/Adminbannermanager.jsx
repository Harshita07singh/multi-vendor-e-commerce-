import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  UploadCloud,
  X,
  Check,
  Image as ImageIcon,
  Link,
  AlignLeft,
  Hash,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

// ── Helpers ──────────────────────────────────────────────────────────────────
const toImgUrl = (imgPath) => {
  if (!imgPath) return null;
  return imgPath.startsWith("http") ? imgPath : `${API_BASE}${imgPath}`;
};

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  buttonText: "Explore Shop",
  link: "#",
  order: 0,
  isActive: true,
  image: null, // new File to upload
  existingImage: "", // current saved path (for preview)
};

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3
        rounded-xl shadow-2xl text-white text-sm font-medium
        ${type === "success" ? "bg-green-600" : "bg-red-500"}`}
    >
      {type === "success" ? <Check size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
}

// ── Image Dropzone ────────────────────────────────────────────────────────────
function ImageDropzone({ preview, onChange, error }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handle = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Max 5MB allowed");
      return;
    }
    onChange(file);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files[0]);
        }}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all overflow-hidden
          ${
            error
              ? "border-red-400 bg-red-50"
              : dragging
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-400 bg-gray-50"
          }`}
        style={{ height: 170 }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium flex items-center gap-2">
                <UploadCloud size={15} /> Change Image
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            <UploadCloud size={30} strokeWidth={1.5} />
            <p className="text-sm">
              Drop image or{" "}
              <span className="text-green-600 font-medium">browse</span>
            </p>
            <p className="text-xs">JPG · PNG · WEBP · Max 5MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handle(e.target.files[0])}
      />
    </div>
  );
}

// ── Banner Form ───────────────────────────────────────────────────────────────
function BannerForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(
    initial ? { ...EMPTY_FORM, ...initial } : { ...EMPTY_FORM },
  );
  const [preview, setPreview] = useState(
    initial?.existingImage ? toImgUrl(initial.existingImage) : null,
  );
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleImage = (file) => {
    set("image", file);
    setPreview(URL.createObjectURL(file));
    setErrors((e) => ({ ...e, image: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!preview) e.image = "Banner image is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onSave(form);
  };

  const isEdit = !!initial?._id;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {isEdit ? "Edit Banner" : "New Banner"}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X size={18} />
        </button>
      </div>

      {/* Image */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
          Banner Image {!isEdit && <span className="text-red-400">*</span>}
        </label>
        <ImageDropzone
          preview={preview}
          onChange={handleImage}
          error={errors.image}
        />
        {isEdit && !form.image && (
          <p className="text-xs text-gray-400 mt-1">
            Leave empty to keep existing image
          </p>
        )}
      </div>

      {/* Title + Subtitle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <AlignLeft size={11} /> Title{" "}
            <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Summer Sale"
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition
              ${
                errors.title
                  ? "border-red-400 focus:border-red-400 bg-red-50"
                  : "border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500"
              }`}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <AlignLeft size={11} /> Subtitle
          </label>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
            placeholder="e.g. Up to 50% off"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
          />
        </div>
      </div>

      {/* Button text + Link + Order */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Button Text
          </label>
          <input
            type="text"
            value={form.buttonText}
            onChange={(e) => set("buttonText", e.target.value)}
            placeholder="Explore Shop"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Link size={11} /> Link URL
          </label>
          <input
            type="text"
            value={form.link}
            onChange={(e) => set("link", e.target.value)}
            placeholder="/shop or https://..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Hash size={11} /> Display Order
          </label>
          <input
            type="number"
            min={0}
            value={form.order}
            onChange={(e) => set("order", Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
          />
        </div>
      </div>

      {/* Active toggle */}
      <div
        onClick={() => set("isActive", !form.isActive)}
        className="flex items-center gap-3 cursor-pointer w-fit select-none"
      >
        <div
          className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.isActive ? "left-5" : "left-0.5"}`}
          />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {form.isActive
            ? "Active — visible on storefront"
            : "Inactive — hidden from storefront"}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          {isEdit ? "Save Changes" : "Create Banner"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );
}

// ── Banner Card ───────────────────────────────────────────────────────────────
function BannerCard({ banner, onEdit, onDelete, onToggle, deletingId }) {
  const imgUrl = toImgUrl(banner.image);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={banner.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <ImageIcon size={40} strokeWidth={1} />
          </div>
        )}
        <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-medium">
          #{banner.order}
        </span>
        <span
          className={`absolute top-2 right-2 text-xs px-2.5 py-0.5 rounded-full font-semibold
          ${banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}
        >
          {banner.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Info */}
      <div className="px-4 pt-3 pb-2 flex-1">
        <h4 className="font-semibold text-gray-800 truncate text-sm">
          {banner.title}
        </h4>
        {banner.subtitle && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {banner.subtitle}
          </p>
        )}
        {banner.buttonText && banner.buttonText !== "Explore Shop" && (
          <span className="inline-block mt-1.5 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
            {banner.buttonText}
          </span>
        )}
        {banner.link && banner.link !== "#" && (
          <p className="text-xs text-green-600 mt-1 truncate">{banner.link}</p>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-3 py-2.5 flex items-center gap-1">
        <button
          onClick={() => onEdit(banner)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-green-700 hover:bg-green-50 px-2.5 py-1.5 rounded-lg transition"
        >
          <Edit3 size={12} /> Edit
        </button>
        <button
          onClick={() => onToggle(banner)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition"
        >
          {banner.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
          {banner.isActive ? "Hide" : "Show"}
        </button>
        <button
          onClick={() => onDelete(banner._id)}
          disabled={deletingId === banner._id}
          className="ml-auto flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition disabled:opacity-40"
        >
          {deletingId === banner._id ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Trash2 size={12} />
          )}
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminBannerManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  // ✅ FIX 1: Admin must fetch ALL banners (active + inactive) via ?all=true
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/hero-banners?all=true`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setBanners(
        Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : [],
      );
    } catch (err) {
      notify("Failed to load banners: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Create or update
  const handleSave = async (form) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("subtitle", form.subtitle?.trim() || "");
      fd.append("buttonText", form.buttonText?.trim() || "Explore Shop");
      fd.append("link", form.link?.trim() || "#");
      fd.append("order", String(Number(form.order) || 0));
      fd.append("isActive", String(form.isActive));
      if (form.image instanceof File) fd.append("image", form.image);

      const isEdit = !!editingBanner?._id;
      const url = isEdit
        ? `${API_BASE}/api/hero-banners/${editingBanner._id}`
        : `${API_BASE}/api/hero-banners`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        body: fd,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Save failed");
      }

      notify(
        isEdit
          ? "Banner updated successfully ✓"
          : "Banner created successfully ✓",
      );
      setShowForm(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this banner?",
      )
    )
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/hero-banners/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      notify("Banner deleted successfully");
      setBanners((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle active/inactive
  const handleToggle = async (banner) => {
    try {
      const fd = new FormData();
      // ✅ FIX 2: Always send title when toggling so Mongoose validation passes
      fd.append("title", banner.title);
      fd.append("isActive", String(!banner.isActive));
      const res = await fetch(`${API_BASE}/api/hero-banners/${banner._id}`, {
        method: "PUT",
        body: fd,
      });
      if (!res.ok) throw new Error("Toggle failed");
      notify(
        banner.isActive ? "Banner is now hidden" : "Banner is now visible",
      );
      fetchBanners();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const openCreate = () => {
    setEditingBanner(null);
    setShowForm(true);
  };
  const openEdit = (banner) => {
    setEditingBanner({ ...banner, existingImage: banner.image, image: null });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelForm = () => {
    setShowForm(false);
    setEditingBanner(null);
  };

  const activeCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="space-y-6">
      {/* Stats + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>
            <strong className="text-gray-800">{banners.length}</strong> banners
            total
          </span>
          <span className="text-gray-300">|</span>
          <span>
            <strong className="text-green-600">{activeCount}</strong> active
          </span>
          <span className="text-gray-300">|</span>
          <span>
            <strong className="text-gray-500">
              {banners.length - activeCount}
            </strong>{" "}
            inactive
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBanners}
            title="Refresh"
            className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
          >
            <RefreshCw size={15} />
          </button>
          {!showForm && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition"
            >
              <Plus size={15} /> Add Banner
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <BannerForm
          initial={editingBanner}
          onSave={handleSave}
          onCancel={cancelForm}
          saving={saving}
        />
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <ImageIcon size={44} strokeWidth={1} className="mb-3 text-gray-300" />
          <p className="font-medium text-gray-500 text-base">
            No banners found
          </p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            Click "Add Banner" above to get started
          </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <Plus size={14} /> Add Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner) => (
            <BannerCard
              key={banner._id}
              banner={banner}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
