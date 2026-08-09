import React, { useEffect, useState } from "react";
import {
  User,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  FileText,
  Car,
  CreditCard,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const PRIMARY = "#5CB74B";
const PRIMARY_LIGHT = "#EBF7E8";

const AdminPendingDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const getToken = () => localStorage.getItem("accessToken");
  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

  const getStatusConfig = (status) => {
    const map = {
      active: {
        label: "Approved",
        bg: "#DCFCE7",
        color: "#15803D",
        dot: "#22C55E",
      },
      pending: {
        label: "Pending",
        bg: "#FEF9C3",
        color: "#A16207",
        dot: "#EAB308",
      },
      suspended: {
        label: "Suspended",
        bg: "#FEE2E2",
        color: "#B91C1C",
        dot: "#EF4444",
      },
    };
    return map[status] || map.pending;
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/auth/delivery/admin/deliveries`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Cache-Control": "no-cache",
          },
        },
      );
      if (!res.ok) {
        setDeliveries([]);
        return;
      }
      const data = await res.json();
      setDeliveries(Array.isArray(data.deliveries) ? data.deliveries : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/auth/delivery/delivery/approve/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (!res.ok) return;
      setDeliveries((prev) =>
        prev.map((d) =>
          d._id === id ? { ...d, isApproved: true, status: "active" } : d,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const reject = async (id) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/auth/delivery/delivery/reject/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (!res.ok) return;
      setDeliveries((prev) => prev.filter((d) => d._id !== id));
      setExpandedRow((cur) => (cur === id ? null : cur));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-gray-100 animate-spin"
          style={{ borderTopColor: PRIMARY }}
        />
        <p className="text-sm text-gray-400 font-medium">
          Loading delivery partners…
        </p>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
          style={{ background: PRIMARY_LIGHT }}
        >
          <Car size={24} color={PRIMARY} />
        </div>
        <p className="font-semibold text-gray-600">
          No delivery partners found
        </p>
        <p className="text-sm text-gray-400">
          New registrations will appear here
        </p>
        <button
          onClick={fetchDeliveries}
          className="mt-2 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition"
          style={{
            borderColor: "#D1EFCC",
            color: PRIMARY,
            background: PRIMARY_LIGHT,
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-bold text-gray-700">
            {deliveries.length} Partner{deliveries.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {deliveries.filter((d) => d.status === "pending").length} pending
            review
          </p>
        </div>
        <button
          onClick={fetchDeliveries}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition"
          style={{
            borderColor: "#D1EFCC",
            color: PRIMARY,
            background: PRIMARY_LIGHT,
          }}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Cards */}
      {deliveries.map((d) => {
        const statusCfg = getStatusConfig(d.status);
        const isOpen = expandedRow === d._id;

        return (
          <div
            key={d._id}
            className="border border-gray-100 rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between p-5 bg-white">
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: PRIMARY }}
                >
                  {d.name?.[0]?.toUpperCase() || "D"}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{d.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Mail size={10} /> {d.email}
                    </span>
                    {d.phone && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Phone size={10} /> {d.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Status Badge */}
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: statusCfg.bg, color: statusCfg.color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: statusCfg.dot }}
                  />
                  {statusCfg.label}
                </span>

                {/* Expand toggle */}
                <button
                  onClick={() => setExpandedRow(isOpen ? null : d._id)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition"
                  style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
                >
                  {isOpen ? (
                    <>
                      Hide <ChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      Details <ChevronDown size={12} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {isOpen && (
              <div className="border-t border-gray-50 p-6 bg-gray-50/50 space-y-5">
                {/* Personal */}
                <DetailSection title="Personal Information" icon={User}>
                  <DetailGrid>
                    <DetailField label="Phone" value={d.phone} />
                    <DetailField label="City" value={d.city} />
                    <DetailField label="Gender" value={d.gender} />
                    <DetailField
                      label="Date of Birth"
                      value={d.dateOfBirth?.slice(0, 10)}
                    />
                  </DetailGrid>
                </DetailSection>

                {/* KYC */}
                <DetailSection title="KYC Details" icon={FileText}>
                  <DetailGrid>
                    <DetailField
                      label="Aadhaar Number"
                      value={d.aadhaarNumber}
                    />
                    <DetailField label="PAN Number" value={d.panNumber} />
                    <DetailField
                      label="Driving License"
                      value={d.drivingLicenseNumber}
                    />
                    <DetailField
                      label="DL Expiry"
                      value={d.dlExpiryDate?.slice(0, 10)}
                    />
                  </DetailGrid>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {[
                      ["Aadhaar Front", d.aadhaarFront],
                      ["Aadhaar Back", d.aadhaarBack],
                      ["PAN Card", d.panImage],
                      ["DL Front", d.dlFront],
                      ["DL Back", d.dlBack],
                    ].map(
                      ([label, url]) =>
                        url && <DocLink key={label} label={label} url={url} />,
                    )}
                  </div>
                </DetailSection>

                {/* Vehicle */}
                <DetailSection title="Vehicle Information" icon={Car}>
                  <DetailGrid>
                    <DetailField label="Vehicle Type" value={d.vehicleType} />
                    <DetailField
                      label="Vehicle Number"
                      value={d.vehicleNumber}
                    />
                    <DetailField label="Vehicle Model" value={d.vehicleModel} />
                    <DetailField label="Year" value={d.vehicleYear} />
                  </DetailGrid>
                  {d.rcImage && (
                    <DocLink label="RC / Insurance" url={d.rcImage} />
                  )}
                </DetailSection>

                {/* Bank */}
                <DetailSection title="Bank Details" icon={CreditCard}>
                  <DetailGrid>
                    <DetailField
                      label="Account Holder"
                      value={d.accountHolderName}
                    />
                    <DetailField
                      label="Account Number"
                      value={d.accountNumber}
                    />
                    <DetailField label="IFSC Code" value={d.ifscCode} />
                    <DetailField label="Bank Name" value={d.bankName} />
                    <DetailField
                      label="Terms Accepted"
                      value={d.termsAccepted ? "Yes" : "No"}
                    />
                  </DetailGrid>
                  {d.bankProofImage && (
                    <DocLink label="Bank Proof" url={d.bankProofImage} />
                  )}
                </DetailSection>

                {/* Actions */}
                {d.status === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => approve(d._id)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
                      style={{ background: PRIMARY }}
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => reject(d._id)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background: "#dc2626" }}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ── Detail Helpers ── */
function DetailSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: "#EBF7E8" }}
        >
          <Icon size={12} color="#5CB74B" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

function DetailGrid({ children }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{children}</div>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-700">
        {value || <span className="text-gray-300 font-normal">—</span>}
      </p>
    </div>
  );
}

function DocLink({ label, url }) {
  const fullUrl = url?.startsWith("/uploads/") ? url : `/uploads/${url}`;
  return (
    <div className="inline-flex items-center gap-2 mt-2">
      <span className="text-xs text-gray-400">{label}:</span>
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold underline"
        style={{ color: "#5CB74B" }}
      >
        View
      </a>
      <a
        href={fullUrl}
        download
        className="text-xs font-semibold underline text-blue-500"
      >
        Download
      </a>
    </div>
  );
}

export default AdminPendingDeliveries;
