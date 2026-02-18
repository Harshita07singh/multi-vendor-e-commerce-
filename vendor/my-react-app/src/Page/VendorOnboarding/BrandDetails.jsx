import React, { useState, useEffect } from "react";
import { saveVendorStep, getMyVendor } from "../../services/vendorService";

const BrandDetails = () => {
  const [formData, setFormData] = useState({
    brandName: "",
    brandType: "",
    trademarkNumber: "",
    brandWebsite: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load initial data from vendor profile
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        const vendor = await getMyVendor();
        if (vendor?.brandDetails) {
          setFormData((prev) => ({
            ...prev,
            ...vendor.brandDetails,
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
      if (formData.brandName || formData.brandType) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleAutoSave = async () => {
    try {
      setSaving(true);
      setError("");
      await saveVendorStep("brandDetails", formData);
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
      <h1 className="text-3xl font-bold mb-2">Brand Details</h1>
      <p className="text-gray-500 mb-8">
        Enter your brand and trademark information
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
        {/* Brand Name */}
        <div>
          <label className="font-semibold block mb-2">Brand Name *</label>
          <input
            type="text"
            name="brandName"
            value={formData.brandName}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Brand Type */}
        <div>
          <label className="font-semibold block mb-2">Brand Type *</label>
          <input
            type="text"
            name="brandType"
            value={formData.brandType}
            onChange={handleChange}
            placeholder="Manufacturer, Distributor, etc."
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Trademark Number */}
        <div>
          <label className="font-semibold block mb-2">Trademark Number</label>
          <input
            type="text"
            name="trademarkNumber"
            value={formData.trademarkNumber}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Brand Website */}
        <div>
          <label className="font-semibold block mb-2">Brand Website</label>
          <input
            type="url"
            name="brandWebsite"
            value={formData.brandWebsite}
            onChange={handleChange}
            placeholder="https://example.com"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>
      </div>
    </>
  );
};

export default BrandDetails;
