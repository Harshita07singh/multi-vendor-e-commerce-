import React, { useState, useEffect } from "react";
import { saveVendorStep, getMyVendor } from "../../services/vendorService";

const BankDetails = ({ setIsStepValid }) => {
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branch: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validate form fields
  const validateForm = () => {
    const isValid =
      formData.accountHolderName &&
      formData.accountNumber &&
      formData.ifscCode &&
      formData.bankName &&
      formData.branch;
    return isValid;
  };

  // Update validation when formData changes
  useEffect(() => {
    if (setIsStepValid) {
      setIsStepValid(validateForm());
    }
  }, [formData, setIsStepValid]);

  // Load initial data from vendor profile
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        const vendor = await getMyVendor();
        if (vendor?.bankDetails) {
          setFormData((prev) => ({
            ...prev,
            ...vendor.bankDetails,
          }));
        }
      } catch (err) {
        console.log("No existing vendor data found");
      }
    };

    loadVendorData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Auto-save when formData changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.accountHolderName || formData.accountNumber) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleAutoSave = async () => {
    try {
      setSaving(true);
      setError("");
      await saveVendorStep("bankDetails", formData);
      setSuccess("Data saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save data");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Bank Details</h1>
      <p className="text-gray-500 mb-8">
        Enter your bank account details for settlement
      </p>

      {/* Status Messages */}
      {saving && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
          Saving...
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Holder Name */}
        <div>
          <label className="font-semibold block mb-2">
            Account Holder Name *
          </label>
          <input
            type="text"
            name="accountHolderName"
            value={formData.accountHolderName}
            onChange={handleChange}
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
          />
        </div>

        {/* Bank Name */}
        <div>
          <label className="font-semibold block mb-2">Bank Name *</label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
          />
        </div>

        {/* Account Number */}
        <div>
          <label className="font-semibold block mb-2">Account Number *</label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
          />
        </div>

        {/* IFSC Code */}
        <div>
          <label className="font-semibold block mb-2">IFSC Code *</label>
          <input
            type="text"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleChange}
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 uppercase focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
          />
        </div>

        {/* Branch */}
        <div>
          <label className="font-semibold block mb-2">Branch *</label>
          <input
            type="text"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
          />
        </div>
      </div>
    </>
  );
};

export default BankDetails;
