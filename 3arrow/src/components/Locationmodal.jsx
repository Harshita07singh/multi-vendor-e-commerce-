import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addLocation,
  updateLocation,
  clearLocationError,
} from "../redux/Locationslice";
import { useGPS } from "../hooks/Usegps";
import {
  MapPin,
  Navigation,
  X,
  Home,
  Briefcase,
  Tag,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const LABELS = [
  { value: "home", icon: Home, text: "Home" },
  { value: "work", icon: Briefcase, text: "Work" },
  { value: "other", icon: Tag, text: "Other" },
];

const EMPTY = {
  label: "home",
  customLabel: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  coordinates: { lat: "", lng: "" },
  isDefault: false,
};

export default function LocationModal({ open, onClose, editData = null }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.location);
  const {
    locate,
    loading: gpsLoading,
    error: gpsError,
    result: gpsResult,
  } = useGPS();

  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(false);
  const [showManual, setShowManual] = useState(false);
  useEffect(() => {
    if (!open) return;
    setSaved(false);
    dispatch(clearLocationError());
    setForm(editData ? { ...EMPTY, ...editData } : EMPTY);
  }, [open, editData]);

  // Auto-fill form when GPS resolves
  useEffect(() => {
    if (!gpsResult) return;
    setForm((f) => ({
      ...f,
      address: gpsResult.address || f.address,
      city: gpsResult.city || f.city,
      state: gpsResult.state || f.state,
      pincode: gpsResult.pincode || f.pincode,
      country: gpsResult.country || f.country,
      coordinates: gpsResult.coordinates,
    }));
  }, [gpsResult]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setCoord = (k, v) =>
    setForm((f) => ({ ...f, coordinates: { ...f.coordinates, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      coordinates: {
        lat: parseFloat(form.coordinates.lat),
        lng: parseFloat(form.coordinates.lng),
      },
    };
    const action = editData
      ? updateLocation({ id: editData._id, ...payload })
      : addLocation(payload);
    const res = await dispatch(action);
    if (!res.error) {
      setSaved(true);
      setTimeout(() => {
        onClose();
        setSaved(false);
      }, 900);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 500,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 60px rgba(0,0,0,.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: "#1a1a1a",
              }}
            >
              {editData ? "Edit Location" : "Add New Address"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
              {editData
                ? "Update your saved address"
                : "Save a delivery address"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f5f5f5",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} color="#555" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {/* GPS Button */}
          <button
            type="button"
            onClick={locate}
            disabled={gpsLoading}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: "2px dashed #5CB74B",
              background: gpsLoading ? "#f0faf0" : "#f6fff4",
              color: "#5CB74B",
              fontWeight: 600,
              fontSize: 14,
              cursor: gpsLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 16,
              transition: "all .2s",
            }}
          >
            {gpsLoading ? (
              <>
                <Loader2
                  size={17}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Detecting your location…
              </>
            ) : (
              <>
                <Navigation size={17} /> Use Current Location (GPS)
              </>
            )}
          </button>
          {gpsError && (
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                color: "#e53e3e",
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              <AlertCircle size={15} /> {gpsError}
            </div>
          )}
          {/* Manual Address Dropdown */}
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setShowManual((s) => !s)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1.5px solid #e8e8e8",
                background: "#fafafa",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#5CB74B",
              }}
            >
              Set Location Manually
              <span>{showManual ? "▲" : "▼"}</span>
            </button>
          </div>
          {showManual && (
            <>
              {/* Label Dropdown */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Label</label>
                <select
                  value={form.label}
                  onChange={(e) => set("label", e.target.value)}
                  style={inputStyle}
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {form.label === "other" && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Custom Label</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Mom's place"
                    value={form.customLabel}
                    onChange={(e) => set("customLabel", e.target.value)}
                  />
                </div>
              )}

              {/* Full Address */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Full Address *</label>
                <textarea
                  required
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="House/flat no., street, area…"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>

              {/* City + State */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <input
                  style={inputStyle}
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
                <input
                  style={inputStyle}
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                />
              </div>

              {/* Pincode + Country */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <input
                  style={inputStyle}
                  placeholder="pincode"
                  value={form.pincode}
                  onChange={(e) => set("pincode", e.target.value)}
                />
                <input
                  style={inputStyle}
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                />
              </div>

              {/* Latitude + Longitude */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 14,
                }}
              ></div>
            </>
          )}
          {/* Set as default */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              color: "#333",
              cursor: "pointer",
              marginBottom: 20,
            }}
          >
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => set("isDefault", e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "#5CB74B" }}
            />
            Set as default delivery address
          </label>

          {error && (
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                color: "#e53e3e",
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || saved}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: saved ? "#4aa33a" : "#5CB74B",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background .2s",
            }}
          >
            {saved ? (
              <>
                <CheckCircle2 size={18} /> Saved!
              </>
            ) : loading ? (
              <>
                <Loader2
                  size={18}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Saving…
              </>
            ) : (
              <>
                <MapPin size={18} />{" "}
                {editData ? "Update Address" : "Save Address"}
              </>
            )}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#555",
  display: "block",
  marginBottom: 6,
};
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1.5px solid #e8e8e8",
  fontSize: 14,
  color: "#1a1a1a",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .2s",
  onFocus: undefined,
};
