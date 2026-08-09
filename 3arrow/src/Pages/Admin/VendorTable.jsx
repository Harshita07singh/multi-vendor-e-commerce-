import React from "react";
import StatusBadge from "./StatusBadge";
import { Eye, ClipboardCheck, FileText } from "lucide-react";

const PRIMARY = "#5CB74B";
const PRIMARY_LIGHT = "#EBF7E8";

const VendorTable = ({ vendors, onActionClick }) => {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          {/* Header */}
          <thead>
            <tr
              style={{
                background: "linear-gradient(to right, #f9fafb, #f3fdf0)",
              }}
            >
              {[
                "Business",
                "Owner",
                "Email",
                "Phone",
                "Status",
                "Applied",
                "Action",
              ].map((h, i) => (
                <th
                  key={h}
                  className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{
                    color: PRIMARY,
                    textAlign: i === 6 ? "right" : "left",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-50">
            {vendors.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: PRIMARY_LIGHT }}
                    >
                      <FileText size={24} color={PRIMARY} />
                    </div>
                    <p className="font-semibold text-gray-600">
                      No vendors found
                    </p>
                    <p className="text-sm text-gray-400">
                      Try adjusting your search or filter
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              vendors.map((vendor, idx) => (
                <tr
                  key={vendor._id}
                  className="group transition-colors duration-100"
                  style={{
                    background: idx % 2 === 0 ? "#ffffff" : "#fafafa",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f3fdf0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      idx % 2 === 0 ? "#ffffff" : "#fafafa")
                  }
                >
                  {/* Business */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: PRIMARY }}
                      >
                        {vendor.businessDetails?.businessName?.[0]?.toUpperCase() ||
                          "B"}
                      </div>
                      <span className="font-semibold text-gray-800">
                        {vendor.businessDetails?.businessName || "N/A"}
                      </span>
                    </div>
                  </td>

                  {/* Owner */}
                  <td className="px-6 py-4 text-gray-600 font-medium">
                    {vendor.sellerDetails?.sellerName || "N/A"}
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {vendor.businessDetails?.businessEmail || "N/A"}
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {vendor.businessDetails?.businessPhone || "N/A"}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={vendor.status} />
                  </td>

                  {/* Applied Date */}
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {vendor.createdAt
                      ? new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A"}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    {vendor.status === "pending" && (
                      <button
                        onClick={() => onActionClick(vendor)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
                        style={{ background: PRIMARY }}
                      >
                        <ClipboardCheck size={13} />
                        Review
                      </button>
                    )}

                    {vendor.status === "draft" && (
                      <span className="text-gray-400 text-sm italic">
                        Incomplete
                      </span>
                    )}

                    {(vendor.status === "approved" ||
                      vendor.status === "rejected") && (
                      <button
                        onClick={() => onActionClick(vendor)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
                        style={{ background: "#374151" }}
                      >
                        <Eye size={13} />
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer count row */}
        {vendors.length > 0 && (
          <div
            className="px-6 py-3 border-t border-gray-50 flex items-center justify-between"
            style={{ background: "#fafbfa" }}
          >
            <p className="text-xs text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-600">
                {vendors.length}
              </span>{" "}
              vendor{vendors.length !== 1 ? "s" : ""}
            </p>
            <div
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: PRIMARY_LIGHT, color: PRIMARY }}
            >
              {vendors.filter((v) => v.status === "approved").length} Approved
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorTable;
