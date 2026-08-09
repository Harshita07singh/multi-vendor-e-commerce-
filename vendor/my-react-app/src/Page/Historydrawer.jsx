import { useState, useEffect } from "react";
import { inventoryApi } from "./Inventoryapi";

const C = {
  green: "#299E60",
  border: "#d8eddf",
  bg: "#f5f9f6",
  bgCard: "#ffffff",
  text: "#5AB748",
  textMuted: "#6b8577",
  danger: "#e53935",
  gold: "#f5a623",
};

const TYPE_META = {
  restock: { icon: "📥", label: "Restock", color: "#16a34a" },
  manual_add: { icon: "➕", label: "Manual Add", color: C.green },
  manual_remove: { icon: "➖", label: "Manual Remove", color: C.gold },
  return: { icon: "↩️", label: "Customer Return", color: "#0369a1" },
  damage: { icon: "💥", label: "Damaged", color: C.danger },
  expiry: { icon: "🗓", label: "Expired", color: "#9333ea" },
  sale: { icon: "🛒", label: "Sale", color: "#0891b2" },
};

export default function HistoryDrawer({ item, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await inventoryApi.getHistory(item._id);
        if (data.success) setHistory(data.history);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [item._id]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(3px)",
          zIndex: 250,
          animation: "fadeIn .2s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(400px,100vw)",
          background: C.bgCard,
          zIndex: 260,
          boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          animation: "slideRight .3s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 16px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "Fraunces,serif",
                fontSize: 18,
                fontWeight: 700,
                color: C.text,
              }}
            >
              Stock History
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.textMuted,
                marginTop: 3,
                fontFamily: "Outfit,sans-serif",
              }}
            >
              {item.product?.name}
              {item.variantLabel && (
                <span style={{ marginLeft: 6 }}>· {item.variantLabel}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              border: "none",
              background: C.bg,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 16,
              color: C.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {/* Current Stock Badge */}
        <div
          style={{
            margin: "14px 20px 4px",
            padding: "10px 14px",
            background: C.bg,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "Outfit,sans-serif",
              fontSize: 12,
              color: C.textMuted,
            }}
          >
            Current Stock
          </span>
          <span
            style={{
              fontFamily: "JetBrains Mono,monospace",
              fontSize: 18,
              fontWeight: 700,
              color: C.green,
            }}
          >
            {item.currentStock}
          </span>
        </div>

        {/* History list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingTop: 8,
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 64,
                    borderRadius: 10,
                    background: "#f0f0f0",
                  }}
                />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: C.textMuted,
                fontFamily: "Outfit,sans-serif",
                fontSize: 13,
              }}
            >
              No adjustments recorded yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((entry, idx) => {
                const meta = TYPE_META[entry.type] || {
                  icon: "•",
                  label: entry.type,
                  color: C.textMuted,
                };
                const isPositive = entry.qty > 0;
                return (
                  <div
                    key={entry._id || idx}
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      background: C.bgCard,
                      borderLeft: `3px solid ${meta.color}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{meta.icon}</span>
                        <span
                          style={{
                            fontFamily: "Outfit,sans-serif",
                            fontSize: 12,
                            fontWeight: 600,
                            color: meta.color,
                          }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          fontSize: 13,
                          fontWeight: 700,
                          color: isPositive ? "#16a34a" : C.danger,
                        }}
                      >
                        {isPositive ? "+" : ""}
                        {entry.qty}
                      </span>
                    </div>

                    {/* Stock before → after */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          fontSize: 11,
                          color: C.textMuted,
                        }}
                      >
                        {entry.stockBefore}
                      </span>
                      <span style={{ fontSize: 10, color: C.textMuted }}>
                        →
                      </span>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#222",
                        }}
                      >
                        {entry.stockAfter}
                      </span>
                    </div>

                    {entry.note && (
                      <div
                        style={{
                          fontSize: 11,
                          color: C.textMuted,
                          fontFamily: "Outfit,sans-serif",
                          fontStyle: "italic",
                          marginBottom: 2,
                        }}
                      >
                        "{entry.note}"
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: 10,
                        color: "#b0b0b0",
                        fontFamily: "JetBrains Mono,monospace",
                        marginTop: 4,
                      }}
                    >
                      {new Date(entry.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {entry.performedBy?.name && (
                        <span style={{ marginLeft: 8 }}>
                          · {entry.performedBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
