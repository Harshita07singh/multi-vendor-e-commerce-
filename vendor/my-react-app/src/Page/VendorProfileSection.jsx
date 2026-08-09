import React, { useState, useEffect, useRef } from "react";
import { MapPin, Upload, CheckCircle2, XCircle } from "lucide-react";
import ShippingLocationModal from "../components/ShippingLocationModal";

const API_VENDOR_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/auth/vendor";

const SERVER_BASE =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

function resolveImage(src) {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  return SERVER_BASE + (src.startsWith("/") ? src : `/${src}`);
}

const FALLBACK_LOGO = "https://cdn-icons-png.flaticon.com/512/2913/2913133.png";

const VendorProfileSection = ({ onLogoUpdate }) => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Token not found, please login");

        const res = await fetch(`${API_VENDOR_BASE}/my-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Could not load profile (${res.status})`);
        const data = await res.json();
        setVendor(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, []);

  // Auto-clear success/error messages after 4s
  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 4000);
    return () => clearTimeout(t);
  }, [success, error]);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files allowed (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB");
      return;
    }
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
    uploadLogo(file);
  };

  const uploadLogo = async (file) => {
    setUploading(true);
    setSuccess(null);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Token not found");

      const formData = new FormData();
      formData.append("logo", file);

      const res = await fetch(`${API_VENDOR_BASE}/upload-logo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setVendor((prev) => ({
        ...prev,
        brandDetails: {
          ...(prev?.brandDetails || {}),
          brandLogo: data.logoUrl,
        },
      }));
      setPreviewUrl(null);
      setSuccess("Logo updated successfully");
      if (onLogoUpdate) onLogoUpdate(resolveImage(data.logoUrl));
    } catch (err) {
      setError(err.message);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const currentLogo =
    (vendor?.brandDetails?.brandLogo
      ? resolveImage(vendor.brandDetails.brandLogo)
      : null) ||
    previewUrl ||
    FALLBACK_LOGO;

  const vendorName =
    vendor?.businessDetails?.businessName ||
    vendor?.sellerDetails?.sellerName ||
    vendor?.brandDetails?.brandName ||
    "Vendor";

  const vendorCity =
    vendor?.sellerDetails?.city || vendor?.shippingLocations?.city || "";

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded-full w-2/5" />
            <div className="h-3 bg-gray-200 rounded-full w-1/4" />
            <div className="h-8 bg-gray-100 rounded-xl w-full mt-1" />
          </div>
        </div>
      </div>
    );
  }

  // ── Main card ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#f0faf5] to-[#e8f7ef] border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-[#299E60] uppercase">
            Vendor Profile
          </span>
          {vendorCity && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <MapPin className="w-3 h-3" />
              {vendorCity}
            </span>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Avatar + name row */}
          <div className="flex items-center gap-3">
            {/* Logo with upload ring */}
            <div
              className="relative flex-shrink-0 group cursor-pointer"
              onClick={() => !uploading && fileInputRef.current?.click()}
              title="Click to change logo"
            >
              <div
                className={`w-14 h-14 rounded-full border-2 overflow-hidden bg-gray-50 transition-all duration-200 ${
                  uploading
                    ? "border-[#299E60]"
                    : "border-gray-200 group-hover:border-[#299E60]"
                }`}
              >
                <img
                  src={currentLogo}
                  alt={vendorName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    if (e.currentTarget.dataset.fallback) return;
                    e.currentTarget.dataset.fallback = "true";
                    e.currentTarget.src = FALLBACK_LOGO;
                  }}
                />
              </div>

              {/* Spinner overlay while uploading */}
              {uploading && (
                <div className="absolute inset-0 rounded-full bg-white/75 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#299E60] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Camera badge on hover */}
              {!uploading && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#299E60] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                  <Upload className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>

            {/* Name + location button */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-800 truncate leading-tight">
                {vendorName}
              </p>
              <button
                type="button"
                onClick={() => setLocationModalOpen(true)}
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#299E60] hover:text-[#1e7d4a] hover:underline underline-offset-2 transition-colors"
              >
                <MapPin className="w-3 h-3" />
                {vendorCity ? "Update location" : "Add shipping location"}
              </button>
            </div>
          </div>

          {/* Drop zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />

          <div
            className={`relative rounded-xl border border-dashed px-3 py-2.5 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? "border-[#299E60] bg-[#f0faf5] scale-[1.01]"
                : uploading
                  ? "border-[#299E60]/40 bg-[#f0faf5]/60 cursor-not-allowed"
                  : "border-gray-200 hover:border-[#299E60] hover:bg-[#f0faf5]/60"
            }`}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#299E60] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium text-[#299E60]">
                  Uploading…
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-medium text-gray-500">
                    Drag & drop or{" "}
                    <span className="text-[#299E60] underline underline-offset-2">
                      browse
                    </span>
                  </p>
                  <p className="text-[10px] text-gray-400">
                    JPG, PNG, WebP · max 5 MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg px-2.5 py-2">
              <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs rounded-lg px-2.5 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal rendered at root level to avoid z-index / overflow clipping */}
      <ShippingLocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSaved={async () => {
          try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`${API_VENDOR_BASE}/my-profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setVendor(await res.json());
          } catch (err) {
            console.error("Refresh vendor:", err);
          }
        }}
      />
    </>
  );
};

export default VendorProfileSection;
