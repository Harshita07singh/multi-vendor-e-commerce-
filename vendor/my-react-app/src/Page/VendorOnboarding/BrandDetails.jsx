import React, { useState } from "react";

const BrandDetails = () => {
  const [formData, setFormData] = useState({
    brandName: "",
    brandRegistered: "",
    trademarkNumber: "",
    brandCategory: "",
    brandWebsite: "",
    brandLogo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "brandLogo") {
      setFormData({
        ...formData,
        brandLogo: files[0],
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
      <h1 className="text-3xl font-bold mb-2">Brand details</h1>
      <p className="text-gray-500 mb-8">
        Enter your brand and trademark information
      </p>

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

        {/* Brand Registered */}
        <div>
          <label className="font-semibold block mb-2">
            Is Brand Registered? *
          </label>
          <select
            name="brandRegistered"
            value={formData.brandRegistered}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {/* Trademark Number (Conditional) */}
        {formData.brandRegistered === "Yes" && (
          <div>
            <label className="font-semibold block mb-2">
              Trademark Number *
            </label>
            <input
              type="text"
              name="trademarkNumber"
              value={formData.trademarkNumber}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>
        )}

        {/* Brand Category */}
        <div>
          <label className="font-semibold block mb-2">Brand Category *</label>
          <input
            type="text"
            name="brandCategory"
            value={formData.brandCategory}
            onChange={handleChange}
            placeholder="Electronics, Fashion, Beauty..."
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

        {/* Brand Logo Upload */}
        <div className="md:col-span-2">
          <label className="font-semibold block mb-2">
            Upload Brand Logo *
          </label>
          <input
            type="file"
            name="brandLogo"
            accept=".jpg,.jpeg,.png,.svg"
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>
      </div>
    </>
  );
};

export default BrandDetails;
