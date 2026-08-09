import React, { useEffect, useState } from "react";
import VendorTable from "./VendorTable";
import ApprovalModal from "./ApprovalModal";
import { vendorAPI } from "../../services/api";
import AdminPendingDeliveries from "./AdminPendingDeliveries";
import AdminBannerManager from "./Adminbannermanager";
import AdminFlashSaleManager from "./AdminFlashSaleManager";
import {
  Store,
  Truck,
  Image,
  Zap,
  Bell,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  TrendingUp,
} from "lucide-react";

const PRIMARY = "#5CB74B";
const PRIMARY_LIGHT = "#EBF7E8";
const PRIMARY_MED = "#D1EFCC";

const AdminDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("vendors");

  useEffect(() => {
    if (activeTab === "vendors") fetchVendors();
  }, [activeTab]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await vendorAPI.getAllVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch = vendor.businessDetails?.businessName
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: "Total Vendors",
      value: vendors.length,
      icon: Users,
      color: PRIMARY,
      bg: PRIMARY_LIGHT,
      sub: "Registered",
    },
    {
      label: "Approved",
      value: vendors.filter((v) => v.status === "approved").length,
      icon: CheckCircle,
      color: "#16a34a",
      bg: "#dcfce7",
      sub: "Active sellers",
    },
    {
      label: "Pending",
      value: vendors.filter((v) => v.status === "pending").length,
      icon: Clock,
      color: "#d97706",
      bg: "#fef9c3",
      sub: "Awaiting review",
    },
    {
      label: "Rejected",
      value: vendors.filter((v) => v.status === "rejected").length,
      icon: XCircle,
      color: "#dc2626",
      bg: "#fee2e2",
      sub: "Declined",
    },
  ];

  const tabs = [
    { key: "vendors", label: "Vendors", icon: Store },
    { key: "deliveries", label: "Delivery Partners", icon: Truck },
    { key: "banners", label: "Sale Banners", icon: Image },
    { key: "flashsales", label: "Flash Sales", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ── Tab Navigation ── */}
      <div
        className="bg-white border-b border-gray-100  top-16 z-20"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <div className="max-w-screen-xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="relative flex items-center gap-2 px-4 py-4 text-sm font-semibold transition-colors duration-150"
                  style={{ color: active ? PRIMARY : "#6b7280" }}
                >
                  <tab.icon size={15} />
                  {tab.label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                      style={{ background: PRIMARY }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Page Content ── */}
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {/* ══════════════════════ VENDORS TAB ══════════════════════ */}
        {activeTab === "vendors" && (
          <div className="space-y-6">
            {/* Page title */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Vendor Management
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Review, approve, and manage vendor registrations
                </p>
              </div>
              <button
                onClick={fetchVendors}
                className="text-sm font-semibold px-4 py-2 rounded-xl border transition"
                style={{
                  borderColor: PRIMARY_MED,
                  color: PRIMARY,
                  background: PRIMARY_LIGHT,
                }}
              >
                Refresh
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <StatCard key={i} {...s} loading={loading} />
              ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by business name…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none transition"
                  style={{ "--tw-ring-color": PRIMARY }}
                  onFocus={(e) => (e.target.style.borderColor = PRIMARY)}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Status Select */}
              <div className="relative w-full sm:w-44">
                <SlidersHorizontal
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <select
                  className="w-full appearance-none pl-9 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none transition"
                  onFocus={(e) => (e.target.style.borderColor = PRIMARY)}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <LoadingState />
            ) : (
              <VendorTable
                vendors={filteredVendors}
                onActionClick={(vendor) => setSelectedVendor(vendor)}
              />
            )}
          </div>
        )}

        {/* ══════════════════════ DELIVERIES TAB ══════════════════════ */}
        {activeTab === "deliveries" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Delivery Partners
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Review and approve delivery partner registrations
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <AdminPendingDeliveries />
            </div>
          </div>
        )}

        {/* ══════════════════════ BANNERS TAB ══════════════════════ */}
        {activeTab === "banners" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Sale Banners
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Create and manage promotional banners on the storefront
              </p>
            </div>
            <AdminBannerManager />
          </div>
        )}

        {/* ══════════════════════ FLASH SALES TAB ══════════════════════ */}
        {activeTab === "flashsales" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Flash Sales
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Schedule and manage time-limited flash sale events
              </p>
            </div>
            <AdminFlashSaleManager />
          </div>
        )}
      </main>

      {/* Approval Modal */}
      {selectedVendor && (
        <ApprovalModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          refresh={fetchVendors}
        />
      )}
    </div>
  );
};

/* ── Stat Card ── */
function StatCard({ label, value, sub, icon: Icon, color, bg, loading }) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow duration-200"
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: bg }}
      >
        <Icon size={20} color={color} />
      </div>
      <div className="min-w-0">
        {loading ? (
          <div className="h-7 w-12 bg-gray-100 rounded animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-extrabold text-gray-900 leading-none">
            {value}
          </p>
        )}
        <p className="text-xs font-semibold text-gray-500 mt-1 truncate">
          {label}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ── Loading State ── */
function LoadingState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center gap-3">
      <div
        className="w-10 h-10 rounded-full border-2 border-gray-100 animate-spin"
        style={{ borderTopColor: "#5CB74B" }}
      />
      <p className="text-sm text-gray-400 font-medium">Loading vendors…</p>
    </div>
  );
}

export default AdminDashboard;
