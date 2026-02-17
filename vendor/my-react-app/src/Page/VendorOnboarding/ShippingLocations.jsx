import React, { useState } from "react";

const ShippingLocations = () => {
  const [formData, setFormData] = useState({
    warehouseName: "",
    contactPerson: "",
    warehousePhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Shipping Location Submitted:", formData);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Shipping locations</h1>
      <p className="text-gray-500 mb-8">
        Enter your warehouse and shipping address details
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Warehouse Name */}
          <div>
            <label className="font-semibold block mb-2">Warehouse Name *</label>
            <input
              type="text"
              name="warehouseName"
              value={formData.warehouseName}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Contact Person */}
          <div>
            <label className="font-semibold block mb-2">Contact Person *</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Warehouse Phone */}
          <div>
            <label className="font-semibold block mb-2">
              Warehouse Phone *
            </label>
            <input
              type="tel"
              name="warehousePhone"
              value={formData.warehousePhone}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="font-semibold block mb-2">Address Line 1 *</label>
            <input
              type="text"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="font-semibold block mb-2">Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
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
              className="w-full border rounded-lg px-4 py-3"
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
              className="w-full border rounded-lg px-4 py-3"
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
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Country */}
          <div>
            <label className="font-semibold block mb-2">Country *</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 bg-gray-100"
              readOnly
            />
          </div>
        </div>
      </form>
    </>
  );
};

export default ShippingLocations;
