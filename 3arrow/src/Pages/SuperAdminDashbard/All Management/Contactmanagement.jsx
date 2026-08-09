import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Search,
  Trash2,
  ChevronDown,
  RefreshCw,
  Eye,
} from "lucide-react";
// ContactManagement.jsx ke top pe, imports ke baad
const getAuthAxios = () =>
  axios.create({
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });
const API = import.meta.env.VITE_API_BASE_URL;

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-400",
    icon: Clock,
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-400",
    icon: AlertCircle,
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-400",
    icon: CheckCircle2,
  },
  closed: {
    label: "Closed",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
    icon: XCircle,
  },
};

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Query Detail Modal ────────────────────────────────────────────────────────
function QueryModal({ query, onClose, onUpdate }) {
  const [status, setStatus] = useState(query.status);
  const [adminNote, setAdminNote] = useState(query.adminNote || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await getAuthAxios().patch(
        `${API}/contact/${query._id}`,
        { status, adminNote },
        { withCredentials: true },
      );
      onUpdate(data.data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Query Details</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* User info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-700">
                {query.fullName}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{query.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm col-span-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{query.email}</span>
            </div>
          </div>

          {/* Subject */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
              Subject
            </p>
            <p className="text-gray-800 font-semibold">{query.subject}</p>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
              Message
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
              {query.message}
            </div>
          </div>

          {/* Submitted at */}
          <p className="text-xs text-gray-400">
            Submitted on {new Date(query.createdAt).toLocaleString("en-IN")}
          </p>

          {/* Status Update */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
              Update Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                  <option key={val} value={val}>
                    {cfg.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Admin Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
              Admin Note (internal)
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="Add a note about this query..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#289C5F] hover:bg-[#22874f] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ContactManagement() {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    "in-progress": 0,
    resolved: 0,
    closed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await getAuthAxios().get(`${API}/contact/stats`, {
        withCredentials: true,
      });
      setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter !== "all") params.status = filter;

      const { data } = await getAuthAxios().get(`${API}/contact`, {
        params,
        withCredentials: true,
      });
      setContacts(data.data);
      setTotalPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [fetchContacts, fetchStats]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this query? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await getAuthAxios().delete(`${API}/contact/${id}`, { withCredentials: true });
      setContacts((prev) => prev.filter((c) => c._id !== id));
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdate = (updated) => {
    setContacts((prev) =>
      prev.map((c) => (c._id === updated._id ? updated : c)),
    );
    fetchStats();
  };

  const filtered = contacts.filter(
    (c) =>
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase()),
  );

  const statCards = [
    {
      label: "Total",
      key: "total",
      color: "from-slate-500 to-slate-700",
      icon: MessageSquare,
    },
    {
      label: "Pending",
      key: "pending",
      color: "from-yellow-400 to-orange-500",
      icon: Clock,
    },
    {
      label: "In Progress",
      key: "in-progress",
      color: "from-blue-500 to-blue-700",
      icon: AlertCircle,
    },
    {
      label: "Resolved",
      key: "resolved",
      color: "from-green-500 to-emerald-700",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Queries</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and resolve user queries
          </p>
        </div>
        <button
          onClick={() => {
            fetchContacts();
            fetchStats();
          }}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, key, color, icon: Icon }) => (
          <div
            key={key}
            className={`bg-gradient-to-br ${color} text-white rounded-2xl p-4 shadow-lg`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium opacity-80">{label}</p>
              <Icon className="w-5 h-5 opacity-70" />
            </div>
            <p className="text-3xl font-bold">{stats[key] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "in-progress", "resolved", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                filter === s
                  ? "bg-[#289C5F] text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading queries...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2">
            <MessageSquare className="w-10 h-10 opacity-30" />
            <p className="text-sm">No queries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    User
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Subject
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-gray-50/60 transition"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">
                        {contact.fullName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {contact.email}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-700 font-medium truncate max-w-[160px]">
                        {contact.subject}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">
                        {contact.message}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs hidden md:table-cell">
                      {new Date(contact.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={contact.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedQuery(contact)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition"
                          title="View & Update"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact._id)}
                          disabled={deletingId === contact._id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === contact._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedQuery && (
        <QueryModal
          query={selectedQuery}
          onClose={() => setSelectedQuery(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
