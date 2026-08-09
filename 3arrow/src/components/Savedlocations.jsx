import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLocations,
  deleteLocation,
  setDefaultLocation,
} from "../redux/Locationslice";
import LocationModal from "./Locationmodal";
import {
  MapPin,
  Home,
  Briefcase,
  Tag,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Star,
  Loader2,
} from "lucide-react";

const LABEL_ICON = { home: Home, work: Briefcase, other: Tag };
const LABEL_COLOR = { home: "#3b82f6", work: "#f59e0b", other: "#8b5cf6" };

export default function SavedLocations() {
  const dispatch = useDispatch();
  const { locations, loading, activeLocation } = useSelector((s) => s.location);
  const [modal, setModal] = useState({ open: false, editData: null });

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Delete this address?")) dispatch(deleteLocation(id));
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "#1a1a1a",
            }}
          >
            Saved Addresses
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
            Manage your delivery locations
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, editData: null })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            background: "#5CB74B",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          <Plus size={17} /> Add New
        </button>
      </div>

      {loading && !locations.length ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader2
            size={28}
            color="#5CB74B"
            style={{ animation: "spin 1s linear infinite" }}
          />
        </div>
      ) : !locations.length ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "#f9f9f9",
            borderRadius: 16,
          }}
        >
          <MapPin size={40} color="#ccc" style={{ marginBottom: 12 }} />
          <p style={{ color: "#999", fontSize: 15, margin: 0 }}>
            No saved addresses yet
          </p>
          <p style={{ color: "#bbb", fontSize: 13, marginTop: 4 }}>
            Add your first delivery address
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {locations.map((loc) => {
            const Icon = LABEL_ICON[loc.label] || Tag;
            const color = LABEL_COLOR[loc.label] || "#8b5cf6";
            const isActive = activeLocation?._id === loc._id;
            return (
              <div
                key={loc._id}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: `2px solid ${loc.isDefault ? "#5CB74B" : "#f0f0f0"}`,
                  padding: "16px 18px",
                  transition: "box-shadow .2s",
                  boxShadow: loc.isDefault
                    ? "0 4px 16px rgba(92,183,75,.12)"
                    : "0 1px 6px rgba(0,0,0,.04)",
                }}
              >
                <div style={{ display: "flex", gap: 14 }}>
                  {/* Icon badge */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#1a1a1a",
                          textTransform: "capitalize",
                        }}
                      >
                        {loc.label === "other" && loc.customLabel
                          ? loc.customLabel
                          : loc.label}
                      </span>
                      {loc.isDefault && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#5CB74B",
                            background: "#f0faf0",
                            padding: "2px 8px",
                            borderRadius: 20,
                            border: "1px solid #c8edc1",
                          }}
                        >
                          Default
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#555",
                        lineHeight: 1.5,
                      }}
                    >
                      {loc.address}
                    </p>
                    {(loc.city || loc.state || loc.pincode) && (
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontSize: 12,
                          color: "#999",
                        }}
                      >
                        {[loc.city, loc.state, loc.pincode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px solid #f5f5f5",
                  }}
                >
                  {!loc.isDefault && (
                    <button
                      onClick={() => dispatch(setDefaultLocation(loc._id))}
                      style={{
                        ...actionBtn,
                        color: "#5CB74B",
                        borderColor: "#5CB74B",
                      }}
                    >
                      <Star size={14} /> Set Default
                    </button>
                  )}
                  <button
                    onClick={() => setModal({ open: true, editData: loc })}
                    style={{
                      ...actionBtn,
                      color: "#555",
                      borderColor: "#e0e0e0",
                    }}
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(loc._id)}
                    style={{
                      ...actionBtn,
                      color: "#e53e3e",
                      borderColor: "#fecaca",
                      marginLeft: "auto",
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LocationModal
        open={modal.open}
        onClose={() => setModal({ open: false, editData: null })}
        editData={modal.editData}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const actionBtn = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 12px",
  borderRadius: 8,
  border: "1.5px solid",
  background: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "background .15s",
};
