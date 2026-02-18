import React, { useState, useRef, useEffect } from "react";
import { saveVendorStep, getMyVendor } from "../../services/vendorService";

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
    categories: [],
    retailChannel: "",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const dropdownRef = useRef(null);

  // Load initial data from vendor profile
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        const vendor = await getMyVendor();
        if (vendor?.businessDetails) {
          setFormData((prev) => ({
            ...prev,
            ...vendor.businessDetails,
          }));
        }
      } catch (err) {
        console.log("No existing vendor data found");
      }
    };

    loadVendorData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-save when formData changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        formData.businessName ||
        formData.businessType ||
        formData.gstNumber
      ) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleAutoSave = async () => {
    try {
      setSaving(true);
      setError("");
      await saveVendorStep("businessDetails", formData);
      setSuccess("Data saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save data");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const categoriesList = [
    "Electronics",
    "Mobile Phones",
    "Laptops",
    "Tablets",
    "Cameras",
    "Television",
    "Audio",
    "Headphones",
    "Smart Watches",
    "Gaming",
    "Video Games",
    "Consoles",
    "Accessories",
    "Fashion",
    "Men Clothing",
    "Women Clothing",
    "Kids Clothing",
    "Shoes",
    "Bags",
    "Jewelry",
    "Watches",
    "Beauty",
    "Skincare",
    "Makeup",
    "Haircare",
    "Health",
    "Supplements",
    "Medical Supplies",
    "Fitness Equipment",
    "Sports",
    "Outdoor",
    "Cycling",
    "Camping",
    "Home",
    "Furniture",
    "Kitchen",
    "Appliances",
    "Home Decor",
    "Bedding",
    "Lighting",
    "Storage",
    "Garden",
    "Tools",
    "Automotive",
    "Car Accessories",
    "Motorbike Accessories",
    "Books",
    "Ebooks",
    "Stationery",
    "Office Supplies",
    "Toys",
    "Baby Products",
    "Pet Supplies",
    "Groceries",
    "Beverages",
    "Snacks",
    "Organic Food",
    "Frozen Food",
    "Bakery",
    "Dairy",
    "Music",
    "Movies",
    "Collectibles",
    "Art",
    "Crafts",
    "Industrial",
    "Hardware",
    "Security",
    "Software",
    "Services",
    "Real Estate",
    "Travel",
    "Luggage",
    "Gift Items",
    "Party Supplies",
    "Seasonal",
    "Christmas",
    "Halloween",
    "Luxury",
    "Handmade",
    "Vintage",
    "Eco Friendly",
    "Smart Home",
    "Networking",
    "Printers",
    "Projectors",
    "Wearables",
    "VR",
    "Drones",
    "Power Banks",
    "Chargers",
    "Solar",
    "Energy",
    "Construction",
    "Plumbing",
    "Electrical",
    "Safety Equipment",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => {
      if (checked && prev.categories.length >= 10) {
        alert("You can select maximum 10 categories");
        return prev;
      }

      return {
        ...prev,
        categories: checked
          ? [...prev.categories, value]
          : prev.categories.filter((item) => item !== value),
      };
    });
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Business Details</h1>
      <p className="text-gray-500 mb-8">
        Enter the details about your products and sales
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
            <option value="Private Limited">Private Limited</option>
            <option value="LLP">LLP</option>
          </select>
        </div>

        {/* GST */}
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

        {/* PAN */}
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

        {/* Email */}
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

        {/* Phone */}
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

        {/* Year */}
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

        {/* Employees */}
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

        {/* Product Categories Dropdown */}
        <div className="relative md:col-span-2" ref={dropdownRef}>
          <label className="font-semibold block mb-2">
            Product Categories (Max 10) *
          </label>

          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full border rounded-lg px-4 py-3 bg-white cursor-pointer flex justify-between items-center"
          >
            <span>
              {formData.categories.length > 0
                ? `${formData.categories} `
                : "Select Categories"}
            </span>
            <span>{isOpen ? "▲" : "▼"}</span>
          </div>

          {isOpen && (
            <div className="absolute z-10 mt-2 w-full border rounded-lg bg-white shadow-lg p-4 h-64 overflow-y-scroll">
              {categoriesList.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 mb-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={category}
                    checked={formData.categories.includes(category)}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          )}
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
