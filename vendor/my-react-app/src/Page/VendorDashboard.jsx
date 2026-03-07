import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import StatusBadge from "../component/StatusBadge";
import { vendorAPI } from "../services/api";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await vendorAPI.getMyVendor();
      setVendor(response);
    } catch (err) {
      setError(err.message || "Failed to fetch vendor profile");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate("/vendor/onboarding");
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      draft:
        "Your application is incomplete. Please fill in all sections before submitting.",
      pending:
        "Your application is under review by our admin team. We'll notify you once a decision is made.",
      approved:
        "Congratulations! Your vendor application has been approved. You can now start selling.",
      rejected:
        "Unfortunately, your application was rejected. Please review the remarks and try again.",
    };
    return descriptions[status] || "Unknown status";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600 text-lg">
            Loading your vendor profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start md:items-center mb-8 flex-col mt-2 md:flex-row gap-4">
          {/* <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Vendor Dashboard
          </h1> */}

          {/* {vendor && vendor.status !== "approved" && (
            <button
              onClick={handleEditProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              {vendor.status === "draft" ? "Complete Profile" : "Edit Profile"}
            </button>
          )} */}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Status Card */}
        {vendor && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            {/* Status Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 md:p-8">
              <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Application Status
                  </h2>
                  <p className="text-blue-100 text-sm md:text-base">
                    {vendor.businessDetails?.businessName || "Your Business"}
                  </p>
                </div>
                <StatusBadge status={vendor.status} />
              </div>
            </div>

            {/* Status Content */}
            <div className="p-6 md:p-8">
              <p className="text-gray-700 leading-relaxed mb-6">
                {getStatusDescription(vendor.status)}
              </p>

              {/* Timeline */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <span className="text-green-600 text-lg">✓</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Submitted</h3>
                    <p className="text-gray-600 text-sm">
                      {vendor.createdAt
                        ? new Date(vendor.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {vendor.status !== "draft" && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                        <span className="text-blue-600 text-lg">
                          {vendor.status === "approved" ? "✓" : "⏳"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {vendor.status === "approved"
                          ? "Approved"
                          : vendor.status === "rejected"
                            ? "Reviewed"
                            : "Under Review"}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {vendor.status === "pending"
                          ? "Your application is being reviewed"
                          : vendor.status === "approved"
                            ? "Your vendor account is now active!"
                            : "Your application has been reviewed by admin"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Remark */}
              {vendor.adminRemark && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    Admin Remark
                  </h3>
                  <p className="text-yellow-700">{vendor.adminRemark}</p>
                </div>
              )}

              {/* Business Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Business Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Business Name
                    </label>
                    <p className="text-gray-800">
                      {vendor.businessDetails?.businessName || "Not provided"}
                    </p>
                  </div>

                  {/* Business Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Business Type
                    </label>
                    <p className="text-gray-800">
                      {vendor.businessDetails?.businessType || "Not provided"}
                    </p>
                  </div>

                  {/* Business Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Business Email
                    </label>
                    <p className="text-gray-800">
                      {vendor.businessDetails?.businessEmail || "Not provided"}
                    </p>
                  </div>

                  {/* Business Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Business Phone
                    </label>
                    <p className="text-gray-800">
                      {vendor.businessDetails?.businessPhone || "Not provided"}
                    </p>
                  </div>

                  {/* GST Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      GST Number
                    </label>
                    <p className="text-gray-800">
                      {vendor.businessDetails?.gstNumber || "Not provided"}
                    </p>
                  </div>

                  {/* PAN Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      PAN Number
                    </label>
                    <p className="text-gray-800">
                      {vendor.businessDetails?.panNumber || "Not provided"}
                    </p>
                  </div>

                  {/* Categories */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Categories
                    </label>
                    <p className="text-gray-800">
                      {vendor.businessDetails?.categories?.length > 0
                        ? vendor.businessDetails.categories.join(", ")
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              {vendor.sellerDetails && (
                <div className="border-t mt-6 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Seller Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Seller Name
                      </label>
                      <p className="text-gray-800">
                        {vendor.sellerDetails.sellerName || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Seller Email
                      </label>
                      <p className="text-gray-800">
                        {vendor.sellerDetails.sellerEmail || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Seller Phone
                      </label>
                      <p className="text-gray-800">
                        {vendor.sellerDetails.sellerPhone || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        City
                      </label>
                      <p className="text-gray-800">
                        {vendor.sellerDetails.city || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        State
                      </label>
                      <p className="text-gray-800">
                        {vendor.sellerDetails.state || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Pincode
                      </label>
                      <p className="text-gray-800">
                        {vendor.sellerDetails.pincode || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t mt-6 pt-6 flex gap-4 flex-col sm:flex-row">
                <button
                  onClick={fetchVendorProfile}
                  className="flex-1 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                >
                  Refresh
                </button>

                {vendor.status === "draft" && (
                  <button
                    onClick={handleEditProfile}
                    className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    Continue to Complete
                  </button>
                )}

                {vendor.status === "rejected" && (
                  <button
                    onClick={handleEditProfile}
                    className="flex-1 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition"
                  >
                    Reapply
                  </button>
                )}

                {vendor.status === "approved" && (
                  <button
                    onClick={() => navigate("/product/home")}
                    className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold transition"
                  >
                    Proceed
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!vendor && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No vendor profile found</p>
            <button
              onClick={handleEditProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Start Vendor Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
