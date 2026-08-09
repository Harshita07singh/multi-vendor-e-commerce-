import { useState } from "react";

const C = {
  green: "#299E60",
  greenGlow: "rgba(41,158,96,0.08)",
  greenBorder: "rgba(41,158,96,0.25)",
  border: "#d8eddf",
  bg: "#f5f9f6",
  bgCard: "#ffffff",
  text: "#5AB748",
  textMuted: "#6b8577",
  danger: "#e53935",
  dangerBg: "rgba(229,57,53,0.08)",
  gold: "#f5a623",
  warn: "rgba(245,166,35,0.12)",
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

export default function InventoryTable({
  items,
  loading,
  onAdjust,
  onHistory,
  onDelete,
  onUpdate,
  page,
  pages,
  onPage,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditValues({
      sku: item.sku || "",
      lowStockThreshold: item.lowStockThreshold,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = (item) => {
    onUpdate(item._id, editValues);
    setEditingId(null);
  };

  if (loading) return <TableSkeleton />;
  if (!items.length) return <EmptyState />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          overflowX: "auto",
          borderRadius: 14,
          border: `1px solid ${C.border}`,
          background: C.bgCard,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "Outfit,sans-serif",
            fontSize: 13,
          }}
        >
          <thead>
            <tr
              style={{
                background: C.bg,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {[
                "Product",
                "SKU",
                "Stock",
                "Reserved",
                "Available",
                "Low Alert",
                "Cost ₹",
                "Sell ₹",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: C.textMuted,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const isEditing = editingId === item._id;
              const rowBg = item.isOutOfStock
                ? "rgba(229,57,53,0.03)"
                : item.isLowStock
                  ? "rgba(245,166,35,0.04)"
                  : C.bgCard;

              const imgUrl = item.product?.images?.[0]
                ? `${API_BASE}/uploads/${item.product.images[0]}`
                : null;

              return (
                <tr
                  key={item._id}
                  style={{
                    background: rowBg,
                    borderBottom:
                      idx < items.length - 1 ? `1px solid ${C.border}` : "none",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isEditing)
                      e.currentTarget.style.background = C.greenGlow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = rowBg;
                  }}
                >
                  {/* Product */}
                  <td style={{ padding: "10px 14px", minWidth: 180 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt=""
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            objectFit: "cover",
                            border: `1px solid ${C.border}`,
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: C.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            flexShrink: 0,
                          }}
                        >
                          📦
                        </div>
                      )}
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#222",
                            fontSize: 13,
                            maxWidth: 140,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.product?.name || "—"}
                        </div>
                        {item.variantLabel && (
                          <div
                            style={{
                              fontSize: 10,
                              color: C.textMuted,
                              marginTop: 1,
                            }}
                          >
                            {item.variantLabel}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td style={{ padding: "10px 14px" }}>
                    {isEditing ? (
                      <input
                        value={editValues.sku}
                        onChange={(e) =>
                          setEditValues((v) => ({ ...v, sku: e.target.value }))
                        }
                        style={inputStyle}
                      />
                    ) : (
                      <span
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          fontSize: 11,
                          color: C.textMuted,
                        }}
                      >
                        {item.sku || "—"}
                      </span>
                    )}
                  </td>

                  {/* Current Stock */}
                  <td style={{ padding: "10px 14px" }}>
                    <StockBadge
                      value={item.currentStock}
                      isOut={item.isOutOfStock}
                      isLow={item.isLowStock}
                    />
                  </td>

                  {/* Reserved */}
                  <td
                    style={{
                      padding: "10px 14px",
                      color: C.textMuted,
                      fontFamily: "JetBrains Mono,monospace",
                      fontSize: 12,
                    }}
                  >
                    {item.reservedStock}
                  </td>

                  {/* Available */}
                  <td
                    style={{
                      padding: "10px 14px",
                      fontFamily: "JetBrains Mono,monospace",
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.green,
                    }}
                  >
                    {item.availableStock}
                  </td>

                  {/* Low Threshold */}
                  <td style={{ padding: "10px 14px" }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.lowStockThreshold}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            lowStockThreshold: +e.target.value,
                          }))
                        }
                        style={{ ...inputStyle, width: 60 }}
                      />
                    ) : (
                      <span
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          fontSize: 12,
                          color: C.textMuted,
                        }}
                      >
                        {item.lowStockThreshold}
                      </span>
                    )}
                  </td>

                  {/* Cost Price */}
                  <td style={{ padding: "10px 14px" }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.costPrice}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            costPrice: +e.target.value,
                          }))
                        }
                        style={{ ...inputStyle, width: 70 }}
                      />
                    ) : (
                      <span
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          fontSize: 12,
                        }}
                      >
                        ₹{item.costPrice?.toLocaleString("en-IN") || 0}
                      </span>
                    )}
                  </td>

                  {/* Sell Price */}
                  <td style={{ padding: "10px 14px" }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.sellingPrice}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            sellingPrice: +e.target.value,
                          }))
                        }
                        style={{ ...inputStyle, width: 70 }}
                      />
                    ) : (
                      <span
                        style={{
                          fontFamily: "JetBrains Mono,monospace",
                          fontSize: 12,
                        }}
                      >
                        ₹{item.sellingPrice?.toLocaleString("en-IN") || 0}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "10px 14px" }}>
                    <StatusPill item={item} />
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "10px 14px" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        flexWrap: "nowrap",
                      }}
                    >
                      {isEditing ? (
                        <>
                          <ActionBtn
                            onClick={() => saveEdit(item)}
                            color={C.green}
                            title="Save"
                          >
                            ✓
                          </ActionBtn>
                          <ActionBtn
                            onClick={cancelEdit}
                            color={C.textMuted}
                            title="Cancel"
                          >
                            ✕
                          </ActionBtn>
                        </>
                      ) : (
                        <>
                          <ActionBtn
                            onClick={() => onAdjust(item)}
                            color={C.green}
                            title="Adjust Stock"
                          >
                            ±
                          </ActionBtn>
                          <ActionBtn
                            onClick={() => startEdit(item)}
                            color="#0369a1"
                            title="Edit"
                          >
                            ✏️
                          </ActionBtn>
                          <ActionBtn
                            onClick={() => onHistory(item)}
                            color="#7c3aed"
                            title="History"
                          >
                            📋
                          </ActionBtn>
                          <ActionBtn
                            onClick={() => onDelete(item._id)}
                            color={C.danger}
                            title="Delete"
                          >
                            🗑
                          </ActionBtn>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPage(p)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${p === page ? C.green : C.border}`,
                background: p === page ? C.green : C.bgCard,
                color: p === page ? "#fff" : C.textMuted,
                cursor: "pointer",
                fontFamily: "Outfit,sans-serif",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StockBadge({ value, isOut, isLow }) {
  const color = isOut ? C.danger : isLow ? C.gold : C.green;
  return (
    <span
      style={{
        fontFamily: "JetBrains Mono,monospace",
        fontSize: 13,
        fontWeight: 700,
        color,
      }}
    >
      {value}
    </span>
  );
}

function StatusPill({ item }) {
  let label, bg, color;
  if (item.isOutOfStock) {
    label = "Out of Stock";
    bg = "rgba(229,57,53,0.1)";
    color = C.danger;
  } else if (item.isLowStock) {
    label = "Low Stock";
    bg = "rgba(245,166,35,0.12)";
    color = C.gold;
  } else {
    label = "In Stock";
    bg = "rgba(22,163,74,0.1)";
    color = "#16a34a";
  }
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "Outfit,sans-serif",
        background: bg,
        color,
        whiteSpace: "nowrap",
        textTransform: "uppercase",
        letterSpacing: "0.4px",
      }}
    >
      {label}
    </span>
  );
}

function ActionBtn({ onClick, color, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: `1px solid ${color}20`,
        background: `${color}12`,
        color,
        cursor: "pointer",
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background .15s, transform .1s",
        flexShrink: 0,
        padding: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${color}22`;
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${color}12`;
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </button>
  );
}

const inputStyle = {
  border: "1px solid #d8eddf",
  borderRadius: 6,
  padding: "4px 8px",
  fontFamily: "Outfit,sans-serif",
  fontSize: 12,
  color: "#333",
  background: "#fff",
  outline: "none",
  width: 80,
};

function TableSkeleton() {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid #d8eddf",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 52,
            background: i % 2 === 0 ? "#f9fafb" : "#fff",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#e8e8e8",
              flexShrink: 0,
            }}
          />
          <div
            style={{
              flex: 1,
              height: 12,
              borderRadius: 6,
              background: "#e8e8e8",
            }}
          />
          <div
            style={{
              width: 60,
              height: 12,
              borderRadius: 6,
              background: "#e8e8e8",
            }}
          />
          <div
            style={{
              width: 60,
              height: 12,
              borderRadius: 6,
              background: "#e8e8e8",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid #d8eddf",
        background: "#fff",
        padding: "60px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
      <div
        style={{
          fontFamily: "Fraunces,serif",
          fontSize: 18,
          fontWeight: 700,
          color: "#5AB748",
          marginBottom: 8,
        }}
      >
        No inventory records yet
      </div>
      <div
        style={{
          fontFamily: "Outfit,sans-serif",
          fontSize: 13,
          color: "#6b8577",
        }}
      >
        Click "Add Inventory" to start tracking your stock.
      </div>
    </div>
  );
}
