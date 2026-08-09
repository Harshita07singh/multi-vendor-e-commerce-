import React, { useEffect, useState } from "react";
import axios from "axios";

const VendorDashboard = () => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendor();
  }, []);

  const fetchVendor = async () => {
    try {
      const res = await axios.get("/api/vendor/me");
      setVendor(res.data.vendor);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!vendor) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold">
          You have not started onboarding yet.
        </h2>
      </div>
    );
  }

  //  Calculate Profile Completion
  const completedSections = [
    vendor.businessDetails?.businessName,
    vendor.sellerDetails?.sellerName,
    vendor.brandDetails?.brandName,
    vendor.bankDetails?.accountNumber,
    vendor.shippingLocations?.warehouseAddress,
    vendor.digitalSignature?.signed,
  ].filter(Boolean).length;

  const completionPercentage = Math.round((completedSections / 6) * 100);

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>

      {/* Status Card */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Approval Status</h2>

            {vendor.status === "draft" && (
              <span className="bg-gray-200 text-gray-700 px-4 py-1 rounded-full">
                Draft
              </span>
            )}

            {vendor.status === "pending" && (
              <span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full">
                Pending Approval
              </span>
            )}

            {vendor.status === "approved" && (
              <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full">
                Approved
              </span>
            )}

            {vendor.status === "rejected" && (
              <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full">
                Rejected
              </span>
            )}
          </div>

          <div>
            {vendor.status === "draft" && (
              <button
                onClick={() => (window.location.href = "/vendor-onboarding")}
                className="bg-black text-white px-5 py-2 rounded-lg"
              >
                Continue Onboarding
              </button>
            )}

            {vendor.status === "rejected" && (
              <button
                onClick={() => (window.location.href = "/vendor-onboarding")}
                className="bg-black text-white px-5 py-2 rounded-lg"
              >
                Edit & Resubmit
              </button>
            )}
          </div>
        </div>

        {/* Admin Remark */}
        {vendor.status === "rejected" && vendor.adminRemark && (
          <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-lg">
            <h4 className="font-semibold text-red-600 mb-1">Admin Remark:</h4>
            <p className="text-red-700">{vendor.adminRemark}</p>
          </div>
        )}
      </div>

      {/* Profile Completion */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile Completion</h2>

        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-green-500 h-4 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        <p className="text-sm text-gray-600">
          {completionPercentage}% Completed
        </p>
      </div>

      {/* Quick Stats (After Approval) */}
      {vendor.status === "approved" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 text-sm">Total Products</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 text-sm">Total Orders</h3>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 text-sm">Total Revenue</h3>
            <p className="text-2xl font-bold mt-2">₹0</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
