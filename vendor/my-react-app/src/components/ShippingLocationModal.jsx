import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { MapPin, Loader2, X } from "lucide-react";
import { saveVendorStep, getMyVendor } from "../services/vendorService";
import { buildApiUrl } from "../config/apiConfig";

const ShippingLocationModal = ({ isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    warehouseAddress: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadVendorData = async () => {
        try {
          const vendor = await getMyVendor();
          if (vendor?.shippingLocations) {
            setFormData((prev) => ({ ...prev, ...vendor.shippingLocations }));
          }
        } catch {
          console.log("No existing vendor data found");
        }
      };
      loadVendorData();
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setGettingLocation(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        }));
        try {
          const res = await fetch(
            buildApiUrl("/api/locations/reverse-geocode") +
              `?lat=${lat}&lng=${lng}`,
          );
          const data = await res.json();
          if (data.success && data.data) {
            const d = data.data;
            setFormData((prev) => ({
              ...prev,
              latitude: lat.toFixed(6),
              longitude: lng.toFixed(6),
              warehouseAddress: d.address || prev.warehouseAddress,
              city: d.city || prev.city,
              state: d.state || prev.state,
              pincode: d.pincode || prev.pincode,
            }));
          }
        } catch {
          // Keep coords even if reverse geocode fails
        }
        setGettingLocation(false);
      },
      (err) => {
        setError(
          err.message || "Could not get your location. Please enter manually.",
        );
        setGettingLocation(false);
      },
    );
  };

  const handleSave = async () => {
    if (
      !formData.warehouseAddress ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      setError("Please fill warehouse address, city, state and pincode.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await saveVendorStep("shippingLocations", formData);
      setSuccess("Location saved successfully");
      onSaved?.();
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // ── Portal renders directly into document.body, escaping any
  //    overflow:hidden or transform ancestor that traps fixed children ────────
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#299E60]" />
            Update Shipping Location
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {saving && (
            <div className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm">
              Saving…
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-100 text-green-700 px-3 py-2 rounded-lg text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warehouse Address *
            </label>
            <input
              type="text"
              name="warehouseAddress"
              value={formData.warehouseAddress}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode *
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              maxLength="6"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60]"
            />
          </div>

          <div className="pt-3 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#299E60]" />
              GPS Location (for nearby products on 3arrow)
            </label>
            <div className="flex flex-wrap gap-3 items-end">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={gettingLocation}
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#299E60] text-white rounded-lg text-sm font-medium hover:bg-[#238b51] transition disabled:opacity-70"
              >
                {gettingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {gettingLocation ? "Getting…" : "Use current location"}
              </button>
              <div className="flex gap-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-0.5">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    placeholder="28.6139"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#299E60]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-0.5">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    placeholder="77.2090"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#299E60]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-[#299E60] text-white rounded-lg text-sm font-medium hover:bg-[#238b51] transition-colors disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save Location"}
          </button>
        </div>
      </div>
    </div>,
    document.body, // ← portal target — renders outside all parent containers
  );
};

export default ShippingLocationModal;
