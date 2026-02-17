import React, { useState } from "react";

const SellerDetails = () => {
  const [formData, setFormData] = useState({
    sellerFullName: "",
    sellerEmail: "",
    sellerPhone: "",
    alternatePhone: "",
    designation: "",
    aadhaarNumber: "",
    panCard: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "panCard") {
      setFormData({
        ...formData,
        panCard: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Seller details</h1>
      <p className="text-gray-500 mb-8">
        Enter the authorized seller information
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="font-semibold block mb-2">Seller Full Name *</label>
          <input
            type="text"
            name="sellerFullName"
            value={formData.sellerFullName}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Email */}
        <div>
          <label className="font-semibold block mb-2">Seller Email *</label>
          <input
            type="email"
            name="sellerEmail"
            value={formData.sellerEmail}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="font-semibold block mb-2">Phone Number *</label>
          <input
            type="tel"
            name="sellerPhone"
            value={formData.sellerPhone}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Alternate Phone */}
        <div>
          <label className="font-semibold block mb-2">Alternate Phone</label>
          <input
            type="tel"
            name="alternatePhone"
            value={formData.alternatePhone}
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
            placeholder="Owner / Manager / Director"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Aadhaar Number */}
        <div>
          <label className="font-semibold block mb-2">Aadhaar Number *</label>
          <input
            type="text"
            name="aadhaarNumber"
            value={formData.aadhaarNumber}
            onChange={handleChange}
            maxLength="12"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* PAN Card Upload */}
        <div className="md:col-span-2">
          <label className="font-semibold block mb-2">Upload PAN Card *</label>
          <input
            type="file"
            name="panCard"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>
      </div>
    </>
  );
};

export default SellerDetails;
