import { useState } from "react";

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

const ADJUST_TYPES = [
  {
    value: "restock",
    label: "Restock",
    icon: "📥",
    dir: "in",
    color: "#16a34a",
  },
  {
    value: "manual_add",
    label: "Manual Add",
    icon: "➕",
    dir: "in",
    color: C.green,
  },
  {
    value: "manual_remove",
    label: "Manual Remove",
    icon: "➖",
    dir: "out",
    color: C.gold,
  },
  {
    value: "return",
    label: "Customer Return",
    icon: "↩️",
    dir: "in",
    color: "#0369a1",
  },
  {
    value: "damage",
    label: "Damaged",
    icon: "💥",
    dir: "out",
    color: C.danger,
  },
  {
    value: "expiry",
    label: "Expired",
    icon: "🗓",
    dir: "out",
    color: "#9333ea",
  },
];

export default function AdjustStockModal({ item, onClose, onSubmit }) {
  const [type, setType] = useState("restock");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedType = ADJUST_TYPES.find((t) => t.value === type);
  const isRemoval = selectedType?.dir === "out";

  const newStock = qty
    ? Math.max(0, item.currentStock + (isRemoval ? -Number(qty) : Number(qty)))
    : null;

  const handleSubmit = async () => {
    if (!qty || Number(qty) <= 0) return;
    setSaving(true);
    try {
      await onSubmit(item._id, { type, qty: Number(qty), note });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Backdrop onClose={onClose}>
      <ModalBox title="Adjust Stock" onClose={onClose}>
        {/* Product info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            background: C.bg,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 28 }}>📦</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>
              {item.product?.name}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
              Current Stock:{" "}
              <strong
                style={{
                  color: C.green,
                  fontFamily: "JetBrains Mono,monospace",
                }}
              >
                {item.currentStock}
              </strong>
              {item.variantLabel && (
                <span style={{ marginLeft: 8 }}>· {item.variantLabel}</span>
              )}
            </div>
          </div>
        </div>

        {/* Type selector */}
        <Label>Adjustment Type</Label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {ADJUST_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              style={{
                border: `2px solid ${type === t.value ? t.color : C.border}`,
                borderRadius: 10,
                padding: "8px 4px",
                background: type === t.value ? `${t.color}12` : C.bgCard,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "Outfit,sans-serif",
                  fontWeight: 600,
                  color: type === t.value ? t.color : C.textMuted,
                }}
              >
                {t.label}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: "Outfit,sans-serif",
                  color: t.dir === "in" ? "#16a34a" : C.danger,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {t.dir === "in" ? "▲ IN" : "▼ OUT"}
              </span>
            </button>
          ))}
        </div>

        {/* Quantity */}
        <Label>Quantity</Label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="Enter quantity…"
            style={inputStyle}
            autoFocus
          />
          {newStock !== null && (
            <div
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 11,
                fontFamily: "JetBrains Mono,monospace",
                color: isRemoval ? C.danger : "#16a34a",
              }}
            >
              → {newStock}
            </div>
          )}
        </div>

        {/* Preview */}
        {qty && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 16,
              background: isRemoval
                ? "rgba(229,57,53,0.06)"
                : "rgba(22,163,74,0.06)",
              border: `1px solid ${isRemoval ? "rgba(229,57,53,0.2)" : "rgba(22,163,74,0.2)"}`,
            }}
          >
            <span
              style={{
                fontFamily: "Outfit,sans-serif",
                fontSize: 12,
                color: C.textMuted,
              }}
            >
              New Stock Preview
            </span>
            <span
              style={{
                fontFamily: "JetBrains Mono,monospace",
                fontSize: 15,
                fontWeight: 700,
                color: isRemoval ? C.danger : "#16a34a",
              }}
            >
              {item.currentStock} {isRemoval ? "−" : "+"} {qty} ={" "}
              <strong>{newStock}</strong>
            </span>
          </div>
        )}

        {/* Note */}
        <Label>Note (optional)</Label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Reason for adjustment, reference number…"
          rows={2}
          style={{ ...inputStyle, resize: "vertical", height: 60 }}
        />

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={cancelBtnStyle}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!qty || Number(qty) <= 0 || saving}
            style={{
              ...saveBtnStyle,
              background: !qty ? "#ccc" : selectedType?.color || C.green,
              cursor: !qty ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving
              ? "Saving…"
              : `Apply ${selectedType?.icon} ${selectedType?.label}`}
          </button>
        </div>
      </ModalBox>
    </Backdrop>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
export function Backdrop({ onClose, children }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: 20,
        animation: "fadeIn .2s ease",
      }}
    >
      {children}
    </div>
  );
}

export function ModalBox({ title, onClose, children, wide = false }) {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        width: "100%",
        maxWidth: wide ? 680 : 500,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          background: C.bgCard,
          zIndex: 1,
        }}
      >
        <h2
          style={{
            fontFamily: "Fraunces,serif",
            fontSize: 19,
            fontWeight: 700,
            color: C.text,
            margin: 0,
          }}
        >
          {title}
        </h2>
        <button
          onClick={onClose}
          style={{
            width: 30,
            height: 30,
            border: "none",
            background: "none",
            cursor: "pointer",
            borderRadius: 6,
            fontSize: 18,
            color: C.textMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
      </div>
      <div style={{ padding: "20px 24px 24px" }}>{children}</div>
    </div>
  );
}

export function Label({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: C.textMuted,
        fontFamily: "Outfit,sans-serif",
        marginBottom: 6,
        textTransform: "uppercase",
        letterSpacing: "0.4px",
      }}
    >
      {children}
    </div>
  );
}

export const inputStyle = {
  width: "100%",
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: "9px 12px",
  fontFamily: "Outfit,sans-serif",
  fontSize: 13,
  color: "#333",
  background: C.bgCard,
  outline: "none",
  boxSizing: "border-box",
  marginBottom: 0,
};

export const cancelBtnStyle = {
  flex: 1,
  padding: "10px 0",
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  background: C.bgCard,
  color: C.textMuted,
  fontFamily: "Outfit,sans-serif",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

export const saveBtnStyle = {
  flex: 2,
  padding: "10px 0",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontFamily: "Outfit,sans-serif",
  fontSize: 13,
  fontWeight: 600,
  transition: "opacity .2s",
};
