import React, { useState } from "react";

const BusinessDetails = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    gstNumber: "",
    panNumber: "",
    businessEmail: "",
    businessPhone: "",
    website: "",
    yearEstablished: "",
    numberOfEmployees: "",
    categories: "",
    retailChannel: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Business details</h1>
      <p className="text-gray-500 mb-8">
        Enter the details about your products and sales
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Name */}
        <div>
          <label className="font-semibold block mb-2">Business Name *</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Business Type */}
        <div>
          <label className="font-semibold block mb-2">Business Type *</label>
          <select
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="">Select Type</option>
            <option value="Proprietorship">Proprietorship</option>
            <option value="Partnership">Partnership</option>
            <option value="Pvt Ltd">Private Limited</option>
            <option value="LLP">LLP</option>
          </select>
        </div>

        {/* GST Number */}
        <div>
          <label className="font-semibold block mb-2">GST Number *</label>
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* PAN Number */}
        <div>
          <label className="font-semibold block mb-2">PAN Number *</label>
          <input
            type="text"
            name="panNumber"
            value={formData.panNumber}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Business Email */}
        <div>
          <label className="font-semibold block mb-2">Business Email *</label>
          <input
            type="email"
            name="businessEmail"
            value={formData.businessEmail}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Business Phone */}
        <div>
          <label className="font-semibold block mb-2">Business Phone *</label>
          <input
            type="tel"
            name="businessPhone"
            value={formData.businessPhone}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Website */}
        <div>
          <label className="font-semibold block mb-2">Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Year Established */}
        <div>
          <label className="font-semibold block mb-2">Year Established *</label>
          <input
            type="number"
            name="yearEstablished"
            value={formData.yearEstablished}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Number of Employees */}
        <div>
          <label className="font-semibold block mb-2">
            Number of Employees *
          </label>
          <input
            type="number"
            name="numberOfEmployees"
            value={formData.numberOfEmployees}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="font-semibold block mb-2">
            Product Categories (Upto 10) *
          </label>
          <input
            type="text"
            name="categories"
            value={formData.categories}
            onChange={handleChange}
            placeholder="Electronics, Fashion, Home..."
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        {/* Retail Channel */}
        <div>
          <label className="font-semibold block mb-2">Retail Channel *</label>
          <select
            name="retailChannel"
            value={formData.retailChannel}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="">Select Channel</option>
            <option value="Amazon">Amazon</option>
            <option value="Flipkart">Flipkart</option>
            <option value="Meesho">Meesho</option>
            <option value="Own Website">Own Website</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default BusinessDetails;
