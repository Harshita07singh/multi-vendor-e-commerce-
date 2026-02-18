import React, { useState, useEffect } from "react";
import { submitVendor, getMyVendor } from "../../services/vendorService";

const VerifySubmit = () => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // Load vendor data on mount
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        setLoading(true);
        const data = await getMyVendor();
        setVendor(data);
      } catch (err) {
        setError(err.message || "Failed to load vendor data");
      } finally {
        setLoading(false);
      }
    };

    loadVendorData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!confirmSubmit) {
      setError(
        "Please confirm that all information is correct before submitting.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const result = await submitVendor();
      setSuccess(result.message || "Application submitted successfully!");
      setConfirmSubmit(false);
    } catch (err) {
      setError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-gray-600">Loading your information...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Unable to load vendor information. Please go back and fill in the
        required details.
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Verify & Submit</h1>
      <p className="text-gray-500 mb-8">
        Please review all your details before final submission.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {/* Business Details */}
      {vendor.businessDetails && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
              ✓
            </div>
            <h3 className="text-xl font-semibold">Business Details</h3>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="font-semibold">
                {vendor.businessDetails.businessName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold">
                {vendor.businessDetails.businessType}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">GST Number</p>
              <p className="font-semibold">
                {vendor.businessDetails.gstNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">
                {vendor.businessDetails.businessEmail}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Seller Details */}
      {vendor.sellerDetails && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
              ✓
            </div>
            <h3 className="text-xl font-semibold">Seller Details</h3>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Seller Name</p>
              <p className="font-semibold">{vendor.sellerDetails.sellerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">
                {vendor.sellerDetails.sellerEmail}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold">
                {vendor.sellerDetails.sellerPhone}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="font-semibold">{vendor.sellerDetails.city}</p>
            </div>
          </div>
        </div>
      )}

      {/* Brand Details */}
      {vendor.brandDetails && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
              ✓
            </div>
            <h3 className="text-xl font-semibold">Brand Details</h3>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Brand Name</p>
              <p className="font-semibold">{vendor.brandDetails.brandName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="font-semibold">{vendor.brandDetails.brandType}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details */}
      {vendor.bankDetails && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
              ✓
            </div>
            <h3 className="text-xl font-semibold">Bank Details</h3>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Account Holder</p>
              <p className="font-semibold">
                {vendor.bankDetails.accountHolderName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="font-semibold">{vendor.bankDetails.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">IFSC Code</p>
              <p className="font-semibold">{vendor.bankDetails.ifscCode}</p>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Locations */}
      {vendor.shippingLocations && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
              ✓
            </div>
            <h3 className="text-xl font-semibold">Shipping Locations</h3>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Warehouse Address</p>
              <p className="font-semibold">
                {vendor.shippingLocations.warehouseAddress}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="font-semibold">{vendor.shippingLocations.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">State</p>
              <p className="font-semibold">{vendor.shippingLocations.state}</p>
            </div>
          </div>
        </div>
      )}

      {/* Terms Agreement */}
      <form onSubmit={handleSubmit}>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={confirmSubmit}
              onChange={(e) => setConfirmSubmit(e.target.checked)}
              className="mt-1"
              id="confirmCheckbox"
            />
            <label htmlFor="confirmCheckbox" className="text-sm text-gray-700">
              I confirm that all information provided above is true, accurate,
              and complete. I understand that providing false information may
              result in rejection of my application or account termination in
              the future.
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !confirmSubmit}
          className={`w-full py-3 rounded-lg text-white font-semibold ${
            submitting || !confirmSubmit
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </>
  );
};

export default VerifySubmit;
