import React, { useState, useEffect } from "react";
import { saveVendorStep, getMyVendor } from "../../services/vendorService";

const DigitalSignature = ({ setIsStepValid }) => {
  const [formData, setFormData] = useState({
    signed: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validate form fields
  const validateForm = () => {
    return formData.signed === true;
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
        if (vendor?.digitalSignature) {
          setFormData((prev) => ({
            ...prev,
            ...vendor.digitalSignature,
          }));
        }
      } catch (err) {
        console.log("No existing vendor data found");
      }
    };

    loadVendorData();
  }, []);

  const handleChange = (e) => {
    const { name, checked, type } = e.target;
    const value = type === "checkbox" ? checked : e.target.value;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Auto-save when formData changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleAutoSave = async () => {
    try {
      setSaving(true);
      setError("");
      await saveVendorStep("digitalSignature", formData);
      //setSuccess("Data saved successfully");
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
      <h1 className="text-3xl font-bold mb-2">Digital Signature</h1>
      <p className="text-gray-500 mb-8">
        Confirm your details and authorize the submission
      </p>

      {/* Status Messages */}
      {/* {saving && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
          Saving...
        </div>
      )} */}
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

      <div className="bg-gray-50 p-6 rounded-lg border mb-6">
        <h3 className="font-semibold text-lg mb-3">Before you submit:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Ensure all information provided is accurate and truthful</li>
          <li>Review all documents and details in previous steps</li>
          <li>You are responsible for the truth of the information</li>
          <li>False information may lead to rejection</li>
        </ul>
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          name="signed"
          checked={formData.signed}
          onChange={handleChange}
          className="mt-1 w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-[#299E60] cursor-pointer accent-[#299E60]"
        />
        <label className="text-sm text-gray-700 cursor-pointer">
          I confirm that all the information provided is accurate and correct. I
          understand that submitting false information may result in rejection
          of my application.
        </label>
      </div>
    </>
  );
};

export default DigitalSignature;
