import React, { useState } from "react";

const DigitalSignature = () => {
  const [formData, setFormData] = useState({
    authorizedSignatory: "",
    designation: "",
    signatureFile: null,
    agreeTerms: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (type === "file") {
      setFormData({
        ...formData,
        signatureFile: files[0],
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.agreeTerms) {
      setError("You must agree to the terms & conditions.");
      return;
    }

    setError("");
    console.log("Digital Signature Submitted:", formData);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Digital signature</h1>
      <p className="text-gray-500 mb-8">
        Confirm your details and provide digital authorization
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authorized Signatory */}
          <div>
            <label className="font-semibold block mb-2">
              Authorized Signatory Name *
            </label>
            <input
              type="text"
              name="authorizedSignatory"
              value={formData.authorizedSignatory}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Designation */}
          <div>
            <label className="font-semibold block mb-2">Designation *</label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Signature Upload */}
          <div className="md:col-span-2">
            <label className="font-semibold block mb-2">
              Upload Signature *
            </label>
            <input
              type="file"
              name="signatureFile"
              accept=".jpg,.jpeg,.png"
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Terms & Conditions */}
          <div className="md:col-span-2 flex items-start gap-3">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-1"
            />
            <label className="text-sm text-gray-600">
              I confirm that all the information provided is accurate and I
              agree to the terms & conditions.
            </label>
          </div>
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </>
  );
};

export default DigitalSignature;
