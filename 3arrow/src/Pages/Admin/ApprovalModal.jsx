import React, { useState } from "react";
import { vendorAPI } from "../../services/api";
import {
  X,
  Building2,
  User,
  CreditCard,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const PRIMARY = "#5CB74B";
const PRIMARY_LIGHT = "#EBF7E8";
const PRIMARY_MED = "#D1EFCC";

const ApprovalModal = ({ vendor, onClose, refresh }) => {
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("business");

  const handleAction = async (status) => {
    try {
      setLoading(true);
      setError("");
      await vendorAPI.updateVendorStatus(vendor._id, {
        vendorId: vendor._id,
        status,
        remark,
      });
      refresh();
      onClose();
    } catch (err) {
      setError(err.message || "Error performing action");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "business", label: "Business", icon: Building2 },
    { key: "seller", label: "Seller", icon: User },
    { key: "bank", label: "Bank", icon: CreditCard },
    { key: "shipping", label: "Shipping", icon: MapPin },
  ];

  const labelCls =
    "text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1";
  const valueCls = "text-sm font-semibold text-gray-800";

  const renderTabContent = () => {
    switch (activeTab) {
      case "business":
        return (
          <div className="grid grid-cols-2 gap-5">
            {[
              ["Business Name", vendor.businessDetails?.businessName],
              ["Type", vendor.businessDetails?.businessType],
              ["GST Number", vendor.businessDetails?.gstNumber],
              ["PAN Number", vendor.businessDetails?.panNumber],
              ["Email", vendor.businessDetails?.businessEmail],
              ["Phone", vendor.businessDetails?.businessPhone],
              ["Year Established", vendor.businessDetails?.yearEstablished],
              ["Employees", vendor.businessDetails?.numberOfEmployees],
            ].map(([label, value]) => (
              <InfoField key={label} label={label} value={value} />
            ))}
          </div>
        );

      case "seller":
        return (
          <div className="grid grid-cols-2 gap-5">
            {[
              ["Seller Name", vendor.sellerDetails?.sellerName],
              ["Email", vendor.sellerDetails?.sellerEmail],
              ["Phone", vendor.sellerDetails?.sellerPhone],
              ["City", vendor.sellerDetails?.city],
            ].map(([label, value]) => (
              <InfoField key={label} label={label} value={value} />
            ))}
            <div className="col-span-2">
              <InfoField
                label="Address"
                value={vendor.sellerDetails?.address}
              />
            </div>
          </div>
        );

      case "bank":
        return (
          <div className="grid grid-cols-2 gap-5">
            {[
              ["Account Holder", vendor.bankDetails?.accountHolderName],
              ["Bank Name", vendor.bankDetails?.bankName],
              ["IFSC Code", vendor.bankDetails?.ifscCode],
            ].map(([label, value]) => (
              <InfoField key={label} label={label} value={value} />
            ))}
            <div>
              <p className={labelCls}>Account Number</p>
              <p className={valueCls}>
                ••••••{vendor.bankDetails?.accountNumber?.slice(-4)}
              </p>
            </div>
          </div>
        );

      case "shipping":
        return (
          <div className="space-y-5">
            <InfoField
              label="Warehouse Address"
              value={vendor.shippingLocations?.warehouseAddress}
            />
            <div className="grid grid-cols-3 gap-5">
              {[
                ["City", vendor.shippingLocations?.city],
                ["State", vendor.shippingLocations?.state],
                ["Pincode", vendor.shippingLocations?.pincode],
              ].map(([label, value]) => (
                <InfoField key={label} label={label} value={value} />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
      >
        {/* Header */}
        <div
          className="px-7 py-5 flex items-start justify-between shrink-0"
          style={{ background: PRIMARY }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 size={20} color="#fff" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white leading-tight">
                {vendor.businessDetails?.businessName || "Vendor"}
              </h2>
              <p className="text-white/70 text-xs mt-0.5">
                {vendor.sellerDetails?.sellerName} · {vendor.status}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
          >
            <X size={15} color="#fff" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0 bg-white">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative flex-1 flex flex-col items-center gap-1 py-3.5 text-xs font-semibold transition-colors"
                style={{ color: active ? PRIMARY : "#9ca3af" }}
              >
                <tab.icon size={15} />
                {tab.label}
                {active && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: PRIMARY }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-7 overflow-y-auto flex-1">
          {/* Tab content */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            {renderTabContent()}
          </div>

          {/* Remark — editable for pending */}
          {vendor.status === "pending" && (
            <div className="mt-5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
                Admin Remark{" "}
                <span className="normal-case font-normal">(optional)</span>
              </label>
              <textarea
                placeholder="Add notes or reason for decision…"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none transition"
                style={{ "--tw-ring-color": PRIMARY }}
                onFocus={(e) => (e.target.style.borderColor = PRIMARY)}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                rows={3}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
          )}

          {/* Existing remark (non-pending) */}
          {vendor.status !== "pending" && vendor.adminRemark && (
            <div
              className="mt-5 rounded-xl p-4 flex gap-3 border"
              style={{ background: "#fffbeb", borderColor: "#fde68a" }}
            >
              <AlertCircle
                size={16}
                color="#d97706"
                className="shrink-0 mt-0.5"
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 mb-1">
                  Admin Remark
                </p>
                <p className="text-sm text-gray-700">{vendor.adminRemark}</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="mt-4 rounded-xl px-4 py-3 flex items-center gap-2 border"
              style={{ background: "#fef2f2", borderColor: "#fecaca" }}
            >
              <AlertCircle size={14} color="#dc2626" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {vendor.status === "pending" && (
              <>
                <button
                  onClick={() => handleAction("approved")}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 shadow-sm"
                  style={{ background: PRIMARY }}
                >
                  <CheckCircle size={15} />
                  {loading ? "Processing…" : "Approve Vendor"}
                </button>
                <button
                  onClick={() => handleAction("rejected")}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "#dc2626" }}
                >
                  <XCircle size={15} />
                  {loading ? "Processing…" : "Reject Vendor"}
                </button>
              </>
            )}
            {vendor.status !== "pending" && (
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800">
        {value || (
          <span className="text-gray-400 font-normal italic">Not provided</span>
        )}
      </p>
    </div>
  );
}

export default ApprovalModal;
