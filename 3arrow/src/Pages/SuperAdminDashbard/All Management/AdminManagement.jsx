import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Users,
  Store,
  Truck,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  TrendingUp,
  Package,
  RefreshCcw,
  Clock,
  Bell,
  X,
  Pencil,
  Loader2,
} from "lucide-react";
import { adminAPI } from "../../../services/api";
import AddAdminModal from "../AddAdminModal";
import EditAdminModal from "../EditAdminModal";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const G = "linear-gradient(135deg, #22c55e 0%, #10b981 100%)";
const GS = { background: G };

const TABS = [
  { key: "admins", label: "Admins", Icon: ShieldCheck },
  { key: "users", label: "Users", Icon: Users },
  { key: "vendors", label: "Vendors", Icon: Store },
  { key: "delivery", label: "Riders", Icon: Truck },
  { key: "orders", label: "Orders", Icon: Package },
  { key: "refunds", label: "Refunds", Icon: RefreshCcw },
];

// ─────────────────────────────────────────────
// Small reusable components
// ─────────────────────────────────────────────

function Av({ text = "?", size = 36, soft = false }) {
  const initials = text
    ? text
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: soft ? "rgba(255,255,255,0.25)" : G,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size < 32 ? 9 : size < 42 ? 11 : 15,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function Badge({ status, small }) {
  const cfg = {
    Active: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    Inactive: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    Delivered: {
      bg: "bg-green-100",
      text: "text-green-700",
      dot: "bg-green-500",
    },
    Pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      dot: "bg-yellow-400",
    },
    Cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    "In Transit": {
      bg: "bg-blue-100",
      text: "text-blue-700",
      dot: "bg-blue-500",
    },
    Approved: {
      bg: "bg-green-100",
      text: "text-green-700",
      dot: "bg-green-500",
    },
    Rejected: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  }[status] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full whitespace-nowrap
      ${cfg.bg} ${cfg.text}
      ${small ? "text-[9px] px-2 py-0.5" : "text-[11px] px-2.5 py-1"}`}
    >
      <span
        className={`rounded-full shrink-0 ${cfg.dot} ${small ? "w-1 h-1" : "w-1.5 h-1.5"}`}
      />
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon, active, onClick, loading }) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl cursor-pointer overflow-hidden transition-all duration-200
        ${
          active
            ? "shadow-lg shadow-green-200 scale-[1.02]"
            : "bg-white shadow-sm border border-green-50 hover:shadow-md"
        }`}
      style={{ background: active ? G : undefined }}
    >
      <div className="p-2.5 md:p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div
            className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center
            ${active ? "bg-white/20" : "bg-green-50"}`}
          >
            <Icon size={13} color={active ? "#fff" : "#16a34a"} />
          </div>
          <div
            className={`hidden md:flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full
            ${active ? "bg-white/20 text-white" : "bg-green-100 text-green-700"}`}
          >
            <TrendingUp size={8} />
            {sub}
          </div>
        </div>
        {loading ? (
          <Loader2
            size={18}
            className={`animate-spin ${active ? "text-white" : "text-green-500"}`}
          />
        ) : (
          <p
            className={`text-lg md:text-2xl font-extrabold m-0 leading-none
              ${active ? "text-white" : "text-gray-900"}`}
          >
            {value}
          </p>
        )}
        <p
          className={`text-[10px] md:text-[11px] font-semibold mt-1 truncate
          ${active ? "text-white/80" : "text-gray-500"}`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Detail Modal (view-only)
// ─────────────────────────────────────────────
function DetailModal({ item, onClose }) {
  if (!item) return null;
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
          <div className="p-5 pb-6" style={GS}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Av text={item.name} size={52} soft />
                <div>
                  <p className="text-lg font-extrabold text-white m-0">
                    {item.name}
                  </p>
                  <p className="text-xs text-white/75 mt-0.5 mb-1.5">
                    {item.email}
                  </p>
                  <Badge status={item.isActive ? "Active" : "Inactive"} small />
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/20 border-none cursor-pointer flex items-center justify-center"
              >
                <X size={13} color="#fff" />
              </button>
            </div>
          </div>
          <div className="p-5">
            {[
              { label: "Role", value: item.role || "Admin" },
              { label: "Phone", value: item.phone || "—" },
              {
                label: "Joined",
                value: item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center py-2.5 border-b border-green-50 last:border-0"
              >
                <span className="text-xs text-gray-400 font-semibold">
                  {row.label}
                </span>
                <span className="text-sm text-gray-800 font-bold">
                  {row.value}
                </span>
              </div>
            ))}
            <button
              onClick={onClose}
              className="mt-4 w-full py-3 text-sm font-bold rounded-xl border-none cursor-pointer text-white shadow-md"
              style={GS}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────
function DeleteConfirmModal({ admin, onConfirm, onClose, loading }) {
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} color="#ef4444" />
          </div>
          <h3 className="text-base font-extrabold text-gray-800 mb-1">
            Delete Admin?
          </h3>
          <p className="text-sm text-gray-400 mb-5">
            Are you sure you want to delete{" "}
            <strong className="text-gray-700">{admin?.name}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl border-none cursor-pointer bg-gray-100 text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl border-none cursor-pointer bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Admins Table (fully dynamic)
// ─────────────────────────────────────────────
function AdminsTable() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null); // view detail
  const [editTarget, setEditTarget] = useState(null); // edit modal
  const [deleteTarget, setDeleteTarget] = useState(null); // delete modal
  const [deletingId, setDeletingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  // ── Fetch ──
  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAdmins(1, "");
      // Handle: array | { admins } | { data } | { data: { admins } }
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.admins)
          ? data.admins
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.admins)
              ? data.data.admins
              : [];
      setAdmins(list);
    } catch (err) {
      console.error("Failed to fetch admins:", err);
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget._id);
      await adminAPI.deleteAdmin(deleteTarget._id);
      toast.success("Admin deleted successfully");
      setDeleteTarget(null);
      fetchAdmins();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete admin");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Toggle Status ──
  const handleToggleStatus = async (admin) => {
    try {
      const updatedStatus = admin.isActive ? false : true;
      await adminAPI.updateAdmin(admin._id, { isActive: updatedStatus });
      toast.success(`Admin ${updatedStatus ? "activated" : "deactivated"}`);
      fetchAdmins();
    } catch (err) {
      console.error("Toggle status error:", err);
      toast.error(err.message || "Failed to update status");
    }
  };

  // ── Filter ──
  const filtered = admins.filter((a) => {
    const matchSearch =
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All" ||
      (filter === "Active" && a.isActive) ||
      (filter === "Inactive" && !a.isActive);
    return matchSearch && matchFilter;
  });

  // ─ Loading skeleton ─
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 size={32} className="animate-spin text-green-500" />
        <p className="text-sm text-gray-400">Loading admins…</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Desktop Header ── */}
      <div className="hidden md:flex items-center justify-between flex-wrap gap-3 px-5 py-4 border-b border-green-50">
        <div>
          <p className="text-sm font-extrabold text-gray-800 m-0">
            Admins List
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {filtered.length} total records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none w-44 focus:border-green-400 transition-colors"
            />
          </div>
          <div className="flex gap-1 bg-green-50 rounded-xl p-1">
            {["All", "Active", "Inactive"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-none cursor-pointer transition-all
                  ${filter === f ? "text-white shadow-sm" : "bg-transparent text-green-700"}`}
                style={filter === f ? GS : {}}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border-none cursor-pointer text-white shadow-md"
            style={GS}
          >
            <Plus size={12} /> Add Admin
          </button>
        </div>
      </div>

      {/* ── Mobile Header ── */}
      <div className="md:hidden px-3 py-3 border-b border-green-50">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-sm font-extrabold text-gray-800 m-0">
            Admins
            <span className="text-gray-400 font-normal text-xs ml-1">
              ({filtered.length})
            </span>
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border-none cursor-pointer text-white"
            style={GS}
          >
            <Plus size={10} /> Add
          </button>
        </div>
        <div className="flex gap-1.5 mb-2.5">
          {["All", "Active", "Inactive"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-full border-none cursor-pointer transition-all
                ${filter === f ? "text-white" : "bg-green-50 text-green-700"}`}
              style={filter === f ? GS : {}}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            size={11}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-green-400 transition-colors"
          />
        </div>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr
              style={{ background: "linear-gradient(90deg,#f0fdf4,#ecfdf5)" }}
            >
              {["Name", "Email", "Phone", "Status", "Joined", "Actions"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[11px] font-bold text-green-700 uppercase tracking-wide
                  ${i === 5 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((admin, idx) => (
              <tr
                key={admin._id}
                className="hover:bg-green-50/40 transition-colors"
                style={{ borderTop: idx === 0 ? "none" : "1px solid #f0fdf4" }}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Av text={admin.name} />
                    <span className="text-sm font-bold text-gray-800">
                      {admin.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {admin.email}
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {admin.phone || "—"}
                </td>
                <td className="px-5 py-3">
                  <Badge status={admin.isActive ? "Active" : "Inactive"} />
                </td>
                <td className="px-5 py-3 text-sm text-gray-400">
                  {admin.createdAt
                    ? new Date(admin.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View */}
                    <button
                      onClick={() => setSelected(admin)}
                      className="p-1.5 rounded-lg border-none cursor-pointer bg-green-50 hover:bg-green-100 transition-colors"
                      title="View details"
                    >
                      <Eye size={14} color="#16a34a" />
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => setEditTarget(admin)}
                      className="p-1.5 rounded-lg border-none cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                      title="Edit admin"
                    >
                      <Pencil size={14} color="#3b82f6" />
                    </button>
                    {/* Toggle status */}
                    <button
                      onClick={() => handleToggleStatus(admin)}
                      className="p-1.5 rounded-lg border-none cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
                      title={admin.isActive ? "Deactivate" : "Activate"}
                    >
                      {admin.isActive ? (
                        <XCircle size={14} color="#EF4444" />
                      ) : (
                        <CheckCircle size={14} color="#22C55E" />
                      )}
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => setDeleteTarget(admin)}
                      className="p-1.5 rounded-lg border-none cursor-pointer bg-transparent hover:bg-red-50 transition-colors"
                      title="Delete admin"
                    >
                      <Trash2 size={14} color="#EF4444" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="text-3xl mb-2">🔍</div>
                  <p className="text-sm text-gray-400 m-0">No admins found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile List ── */}
      <div className="md:hidden divide-y divide-green-50">
        {filtered.map((admin) => (
          <div key={admin._id} className="px-3 py-3">
            <div className="flex items-center gap-2.5">
              <Av text={admin.name} size={38} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 m-0 truncate">
                  {admin.name}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                  {admin.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] text-gray-400">
                    {admin.phone || "No phone"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge status={admin.isActive ? "Active" : "Inactive"} small />
                <button
                  onClick={() => setSelected(admin)}
                  className="w-7 h-7 rounded-lg border-none cursor-pointer bg-green-50 flex items-center justify-center"
                >
                  <Eye size={12} color="#16a34a" />
                </button>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === admin._id ? null : admin._id);
                    }}
                    className="w-7 h-7 rounded-lg border-none cursor-pointer bg-gray-100 flex items-center justify-center"
                  >
                    <MoreVertical size={12} color="#9CA3AF" />
                  </button>
                  {openMenu === admin._id && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl w-36 overflow-hidden shadow-xl z-20">
                      <div
                        onClick={() => {
                          setEditTarget(admin);
                          setOpenMenu(null);
                        }}
                        className="px-3.5 py-2.5 text-xs text-blue-600 cursor-pointer hover:bg-blue-50 flex items-center gap-2"
                      >
                        <Pencil size={11} /> Edit
                      </div>
                      <div className="h-px bg-green-50" />
                      <div
                        onClick={() => {
                          handleToggleStatus(admin);
                          setOpenMenu(null);
                        }}
                        className="px-3.5 py-2.5 text-xs text-gray-700 cursor-pointer hover:bg-gray-50"
                      >
                        {admin.isActive ? "Deactivate" : "Activate"}
                      </div>
                      <div className="h-px bg-green-50" />
                      <div
                        onClick={() => {
                          setDeleteTarget(admin);
                          setOpenMenu(null);
                        }}
                        className="px-3.5 py-2.5 text-xs text-red-500 cursor-pointer hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={11} /> Delete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-10 text-center">
            <div className="text-2xl mb-1.5">🔍</div>
            <p className="text-xs text-gray-400 m-0">No admins found</p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {selected && (
        <DetailModal item={selected} onClose={() => setSelected(null)} />
      )}
      {showAdd && (
        <AddAdminModal
          close={() => setShowAdd(false)}
          refreshAdmins={fetchAdmins}
        />
      )}
      {editTarget && (
        <EditAdminModal
          admin={editTarget}
          close={() => setEditTarget(null)}
          refreshAdmins={fetchAdmins}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          admin={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={!!deletingId}
        />
      )}
      {openMenu && (
        <div onClick={() => setOpenMenu(null)} className="fixed inset-0 z-10" />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main AdminManagement component
// ─────────────────────────────────────────────
export default function AdminManagement() {
  const [activeTab, setActiveTab] = useState("admins");
  const [adminCount, setAdminCount] = useState(null);

  // Fetch count for stat card
  useEffect(() => {
    adminAPI
      .getAdmins(1, "")
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.admins)
            ? data.admins
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data?.data?.admins)
                ? data.data.admins
                : [];
        setAdminCount(data?.total ?? data?.totalCount ?? list.length);
      })
      .catch(() => setAdminCount(0));
  }, []);

  const stats = [
    {
      key: "admins",
      label: "Admins",
      icon: ShieldCheck,
      value: adminCount ?? "…",
      sub: "total",
    },
    { key: "users", label: "Users", icon: Users, value: "—", sub: "total" },
    { key: "vendors", label: "Vendors", icon: Store, value: "—", sub: "total" },
    { key: "delivery", label: "Riders", icon: Truck, value: "—", sub: "total" },
    { key: "orders", label: "Orders", icon: Package, value: "—", sub: "total" },
    {
      key: "refunds",
      label: "Refunds",
      icon: RefreshCcw,
      value: "—",
      sub: "total",
    },
  ];

  return (
    <div className="p-3 md:p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base md:text-xl font-extrabold text-gray-800 m-0">
            Admin Management
          </h1>
          <p className="hidden md:block text-xs text-gray-400 mt-1">
            Manage admins, users, vendors, riders & orders
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center cursor-pointer">
          <Bell size={16} color="#16a34a" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {stats.map((s) => (
          <StatCard
            key={s.key}
            label={s.label}
            value={s.value}
            sub={s.sub}
            icon={s.icon}
            active={activeTab === s.key}
            loading={s.key === "admins" && adminCount === null}
            onClick={() => setActiveTab(s.key)}
          />
        ))}
      </div>

      {/* Tab Buttons */}
      <div
        className="flex gap-1.5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border-none cursor-pointer shrink-0 transition-all
              ${
                activeTab === tab.key
                  ? "text-white shadow-md shadow-green-200"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            style={activeTab === tab.key ? GS : {}}
          >
            <tab.Icon size={11} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        {activeTab === "admins" && <AdminsTable />}

        {/* Placeholder panels for other tabs — replace with your own dynamic tables */}
        {activeTab !== "admins" && (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400">
            <Package size={32} className="opacity-30" />
            <p className="text-sm font-semibold m-0 capitalize">
              {activeTab} panel coming soon
            </p>
            <p className="text-xs m-0">Integrate your {activeTab} API here</p>
          </div>
        )}
      </div>
    </div>
  );
}
