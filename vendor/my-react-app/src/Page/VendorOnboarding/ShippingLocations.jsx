import React, { useState, useEffect } from "react";
import { saveVendorStep, getMyVendor } from "../../services/vendorService";

const ShippingLocations = ({ setIsStepValid }) => {
  const [formData, setFormData] = useState({
    warehouseAddress: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validate form fields
  const validateForm = () => {
    const isValid =
      formData.warehouseAddress &&
      formData.city &&
      formData.state &&
      formData.pincode;
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
        if (vendor?.shippingLocations) {
          setFormData((prev) => ({
            ...prev,
            ...vendor.shippingLocations,
          }));
        }
      } catch (err) {
        console.log("No existing vendor data found");
      }
    };

    loadVendorData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Auto-save when formData changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.warehouseAddress || formData.city) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleAutoSave = async () => {
    try {
      setSaving(true);
      setError("");
      await saveVendorStep("shippingLocations", formData);
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
      <h1 className="text-3xl font-bold mb-2">Shipping Locations</h1>
      <p className="text-gray-500 mb-8">
        Enter your warehouse and shipping address details
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
        {/* Warehouse Address */}
        <div className="md:col-span-2">
          <label className="font-semibold block mb-2">
            Warehouse Address *
          </label>
          <input
            type="text"
            name="warehouseAddress"
            value={formData.warehouseAddress}
            onChange={handleChange}
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
          />
        </div>

        {/* City */}
        <div>
          <label className="font-semibold block mb-2">City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
          />
        </div>

        {/* State */}
        <div>
          <label className="font-semibold block mb-2">State *</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
          />
        </div>

        {/* Pincode */}
        <div>
          <label className="font-semibold block mb-2">Pincode *</label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            maxLength="6"
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
          />
        </div>
      </div>
    </>
  );
};

export default ShippingLocations;
