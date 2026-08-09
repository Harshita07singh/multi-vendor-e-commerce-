import { useState, useEffect } from "react";
import {
  Backdrop,
  ModalBox,
  Label,
  inputStyle,
  cancelBtnStyle,
  saveBtnStyle,
} from "./Adjuststockmodal";
import { inventoryApi } from "./Inventoryapi";

const C = {
  green: "#299E60",
  border: "#d8eddf",
  bg: "#f5f9f6",
  bgCard: "#ffffff",
  text: "#5AB748",
  textMuted: "#6b8577",
};

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}
const API_BASE =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

export default function AddInventoryModal({ onClose, onSubmit, showToast }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    productId: "",
    sku: "",
    currentStock: 0,
    lowStockThreshold: 10,
    maxStock: "",
    costPrice: 0,
    sellingPrice: 0,
    variantLabel: "",
    variantSku: "",
    shelf: "",
    bin: "",
    zone: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/api/products?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const data = await res.json();
        setProducts(data.products || []);
      } catch {
        showToast("Could not load products", "error");
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.productId) {
      showToast("Please select a product", "error");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        productId: form.productId,
        sku: form.sku,
        currentStock: Number(form.currentStock),
        lowStockThreshold: Number(form.lowStockThreshold),
        maxStock: form.maxStock ? Number(form.maxStock) : null,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        variantLabel: form.variantLabel || null,
        variantSku: form.variantSku || null,
        warehouseLocation: {
          shelf: form.shelf,
          bin: form.bin,
          zone: form.zone,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Backdrop onClose={onClose}>
      <ModalBox title="Add Inventory Record" onClose={onClose} wide>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 20px",
          }}
        >
          {/* Product */}
          <div style={{ gridColumn: "1 / -1", marginBottom: 14 }}>
            <Label>Product *</Label>
            {loadingProducts ? (
              <div
                style={{
                  ...inputStyle,
                  color: C.textMuted,
                  padding: "9px 12px",
                }}
              >
                Loading products…
              </div>
            ) : (
              <select
                value={form.productId}
                onChange={(e) => set("productId", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">— Select a product —</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* SKU */}
          <div style={{ marginBottom: 14 }}>
            <Label>SKU</Label>
            <input
              value={form.sku}
              onChange={(e) => set("sku", e.target.value)}
              placeholder="e.g. PROD-001"
              style={inputStyle}
            />
          </div>

          {/* Variant Label */}
          <div style={{ marginBottom: 14 }}>
            <Label>Variant Label</Label>
            <input
              value={form.variantLabel}
              onChange={(e) => set("variantLabel", e.target.value)}
              placeholder="e.g. Red / XL"
              style={inputStyle}
            />
          </div>

          {/* Opening Stock */}
          <div style={{ marginBottom: 14 }}>
            <Label>Opening Stock</Label>
            <input
              type="number"
              min="0"
              value={form.currentStock}
              onChange={(e) => set("currentStock", e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Low Stock Threshold */}
          <div style={{ marginBottom: 14 }}>
            <Label>Low Stock Alert At</Label>
            <input
              type="number"
              min="1"
              value={form.lowStockThreshold}
              onChange={(e) => set("lowStockThreshold", e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Cost Price */}
          <div style={{ marginBottom: 14 }}>
            <Label>Cost Price (₹)</Label>
            <input
              type="number"
              min="0"
              value={form.costPrice}
              onChange={(e) => set("costPrice", e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Selling Price */}
          <div style={{ marginBottom: 14 }}>
            <Label>Selling Price (₹)</Label>
            <input
              type="number"
              min="0"
              value={form.sellingPrice}
              onChange={(e) => set("sellingPrice", e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Warehouse */}
          <div style={{ gridColumn: "1 / -1", marginBottom: 6 }}>
            <Label>Warehouse Location</Label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 8,
              }}
            >
              <input
                value={form.shelf}
                onChange={(e) => set("shelf", e.target.value)}
                placeholder="Shelf (e.g. A3)"
                style={inputStyle}
              />
              <input
                value={form.bin}
                onChange={(e) => set("bin", e.target.value)}
                placeholder="Bin (e.g. B12)"
                style={inputStyle}
              />
              <input
                value={form.zone}
                onChange={(e) => set("zone", e.target.value)}
                placeholder="Zone (e.g. Cold)"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={cancelBtnStyle}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.productId}
            style={{
              ...saveBtnStyle,
              background: form.productId ? C.green : "#ccc",
              cursor: form.productId ? "pointer" : "not-allowed",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Creating…" : "✓ Create Inventory Record"}
          </button>
        </div>
      </ModalBox>
    </Backdrop>
  );
}
