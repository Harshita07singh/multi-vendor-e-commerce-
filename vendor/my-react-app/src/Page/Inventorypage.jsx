import { useState, useEffect, useCallback } from "react";
import InventoryTable from "./Inventorytable";
import InventoryStatsBar from "./Inventorystatsbar";
import AdjustStockModal from "./Adjuststockmodal";
import AddInventoryModal from "./Addinventorymodal";
import HistoryDrawer from "./Historydrawer";
import { inventoryApi } from "./Inventoryapi";

/**
 * InventoryPage
 * Drop-in replacement page for the vendor dashboard.
 * Props:
 *   showToast(msg, type) — existing toast from Home.jsx
 */
export default function InventoryPage({ showToast }) {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [order, setOrder] = useState("desc");

  // Modals
  const [adjustItem, setAdjustItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await inventoryApi.getSummary();
      if (data.success) setSummary(data.summary);
    } catch {}
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, sortBy, order };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await inventoryApi.getAll(params);
      if (data.success) {
        setItems(data.items);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sortBy, order]);

  useEffect(() => {
    fetchSummary();
  }, []);
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAdjust = (item) => setAdjustItem(item);
  const handleHistory = (item) => setHistoryItem(item);

  const handleAdjustDone = async (id, payload) => {
    try {
      const data = await inventoryApi.adjust(id, payload);
      if (data.success) {
        showToast("Stock adjusted successfully", "success");
        setAdjustItem(null);
        fetchItems();
        fetchSummary();
      }
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleAddDone = async (payload) => {
    try {
      const data = await inventoryApi.create(payload);
      if (data.success) {
        showToast("Inventory record created", "success");
        setAddOpen(false);
        fetchItems();
        fetchSummary();
      }
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this inventory record?")) return;
    try {
      await inventoryApi.delete(id);
      showToast("Inventory record deleted", "success");
      fetchItems();
      fetchSummary();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      const data = await inventoryApi.update(id, payload);
      if (data.success) {
        showToast("Inventory updated", "success");
        fetchItems();
      }
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Stats Bar */}
      <InventoryStatsBar summary={summary} />

      {/* Controls */}
      <InventoryControls
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilter={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortBy={setSortBy}
        order={order}
        onOrder={setOrder}
        onAdd={() => setAddOpen(true)}
        total={total}
      />

      {/* Table */}
      <InventoryTable
        items={items}
        loading={loading}
        onAdjust={handleAdjust}
        onHistory={handleHistory}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
        page={page}
        pages={pages}
        onPage={setPage}
      />

      {/* Modals */}
      {adjustItem && (
        <AdjustStockModal
          item={adjustItem}
          onClose={() => setAdjustItem(null)}
          onSubmit={handleAdjustDone}
        />
      )}
      {addOpen && (
        <AddInventoryModal
          onClose={() => setAddOpen(false)}
          onSubmit={handleAddDone}
          showToast={showToast}
        />
      )}
      {historyItem && (
        <HistoryDrawer
          item={historyItem}
          onClose={() => setHistoryItem(null)}
        />
      )}
    </div>
  );
}

// ── Inline Controls Component ─────────────────────────────────────────────────
const C = {
  green: "#299E60",
  border: "#d8eddf",
  bg: "#f5f9f6",
  bgCard: "#ffffff",
  text: "#5AB748",
  textMuted: "#6b8577",
  danger: "#e53935",
};

function InventoryControls({
  search,
  onSearch,
  statusFilter,
  onStatusFilter,
  sortBy,
  onSortBy,
  order,
  onOrder,
  onAdd,
  total,
}) {
  const inputStyle = {
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "8px 12px",
    fontFamily: "Outfit,sans-serif",
    fontSize: 13,
    color: "#333",
    background: C.bgCard,
    outline: "none",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <input
        placeholder="  Search products, SKU…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        style={{ ...inputStyle, flex: "1 1 200px", minWidth: 160 }}
      />

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilter(e.target.value)}
        style={{ ...inputStyle, minWidth: 130 }}
      >
        <option value="all">All Stock</option>
        <option value="in_stock">In Stock</option>
        <option value="low_stock">Low Stock</option>
        <option value="out_of_stock">Out of Stock</option>
      </select>

      <select
        value={sortBy}
        onChange={(e) => onSortBy(e.target.value)}
        style={{ ...inputStyle, minWidth: 130 }}
      >
        <option value="updatedAt">Last Updated</option>
        <option value="currentStock">Stock Qty</option>
        <option value="costPrice">Cost Price</option>
      </select>

      <button
        onClick={() => onOrder(order === "asc" ? "desc" : "asc")}
        style={{
          ...inputStyle,
          cursor: "pointer",
          padding: "8px 12px",
          background: C.bg,
          minWidth: 40,
          textAlign: "center",
        }}
        title="Toggle sort order"
      >
        {order === "asc" ? "↑" : "↓"}
      </button>

      <div
        style={{
          marginLeft: "auto",
          fontSize: 12,
          color: C.textMuted,
          fontFamily: "Outfit,sans-serif",
          whiteSpace: "nowrap",
        }}
      >
        {total} items
      </div>

      <button
        onClick={onAdd}
        style={{
          background: C.green,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "8px 18px",
          fontFamily: "Outfit,sans-serif",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        + Add Inventory
      </button>
    </div>
  );
}
