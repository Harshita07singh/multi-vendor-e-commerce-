import React, { useState, useRef, useEffect } from "react";
import { saveVendorStep, getMyVendor } from "../../services/vendorService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/auth/vendor";
const API_ORIGIN = API_BASE_URL.replace(/\/api\/auth\/vendor.*$/, "");
const CAT_API = `${API_ORIGIN}/api/categories`;

const BusinessDetails = ({ setIsStepValid }) => {
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    gstNumber: "",
    panNumber: "",
    businessEmail: "",
    businessPhone: "",
    yearEstablished: "",
    numberOfEmployees: "",
    categories: [],
    onboardingType: [], // ← "retailer" | "wholesaler" | both
  });

  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoriesList, setCategoriesList] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const dropdownRef = useRef(null);

  // ── Fetch active categories ──
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCats(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(CAT_API, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });
        const raw = await res.json();
        const all = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.categories)
              ? raw.categories
              : [];
        const active = all.filter((c) => c.isActive).map((c) => c.name);
        setCategoriesList(active);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  // ── Validate ──
  const validateForm = () => {
    return (
      formData.businessName &&
      formData.businessType &&
      formData.gstNumber &&
      formData.panNumber &&
      formData.businessEmail &&
      formData.businessPhone &&
      formData.yearEstablished &&
      formData.numberOfEmployees &&
      formData.categories.length > 0 &&
      formData.onboardingType.length > 0 // at least one must be checked
    );
  };

  useEffect(() => {
    if (setIsStepValid) setIsStepValid(validateForm());
  }, [formData, setIsStepValid]);

  // ── Load saved vendor data ──
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        const vendor = await getMyVendor();
        if (vendor?.businessDetails) {
          setFormData((prev) => ({
            ...prev,
            ...vendor.businessDetails,
            // ensure array even if old data has none
            onboardingType: vendor.businessDetails.onboardingType || [],
          }));
        }
      } catch (err) {
        console.log("No existing vendor data found");
      }
    };
    loadVendorData();
  }, []);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Auto-save (debounced) ──
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.businessName || formData.businessType || formData.gstNumber)
        handleAutoSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleAutoSave = async () => {
    try {
      setSaving(true);
      setError("");
      await saveVendorStep("businessDetails", formData);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Categories multi-select (max 10)
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

  // Onboarding type toggle (retailer / wholesaler)
  const handleOnboardingType = (value) => {
    setFormData((prev) => {
      const already = prev.onboardingType.includes(value);
      return {
        ...prev,
        onboardingType: already
          ? prev.onboardingType.filter((t) => t !== value)
          : [...prev.onboardingType, value],
      };
    });
  };

  const onboardingOptions = [
    {
      value: "retailer",
      label: "Retailer",
      desc: "Sell directly to end consumers",
    },
    {
      value: "wholesaler",
      label: "Wholesaler",
      desc: "Sell in bulk to businesses",
    },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Business Details</h1>
      <p className="text-gray-500 mb-8">
        Enter the details about your products and sales
      </p>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Product Categories Dropdown */}
        <div className="relative md:col-span-2" ref={dropdownRef}>
          <label className="font-semibold block mb-1">
            Product Categories (Max 10) *
          </label>
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full border rounded-lg px-4 py-3 bg-white cursor-pointer flex justify-between items-center"
          >
            <span className="truncate pr-2">
              {formData.categories.length > 0
                ? formData.categories.join(", ")
                : "Select Categories"}
            </span>
            <span className="shrink-0">{isOpen ? "▲" : "▼"}</span>
          </div>

          {isOpen && (
            <div className="absolute z-10 mt-2 w-full border rounded-lg bg-white shadow-lg p-4 h-64 overflow-y-scroll">
              {loadingCats ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Loading categories...
                </p>
              ) : categoriesList.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No categories available
                </p>
              ) : (
                categoriesList.map((category) => (
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
                ))
              )}
            </div>
          )}
        </div>
        {/* ── Onboarding Type ── */}
        <div className="md:col-span-2">
          <label className="font-semibold block mb-3">
            Onboard As <span className="text-red-500">*</span>
            <span className="text-xs font-normal text-gray-400 ml-2">
              (Select one or both)
            </span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            {onboardingOptions.map(({ value, label, desc, icon }) => {
              const selected = formData.onboardingType.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleOnboardingType(value)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all text-left w-full sm:w-auto
                    ${
                      selected
                        ? "border-[#299E60] bg-[#f0fdf4] shadow-sm"
                        : "border-gray-200 bg-white hover:border-[#299E60]/50"
                    }`}
                >
                  {/* Custom checkbox circle */}
                  <span
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                      ${selected ? "bg-[#299E60] border-[#299E60]" : "border-gray-300"}`}
                  >
                    {selected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="text-xl">{icon}</span>
                  <div>
                    <p
                      className={`text-sm font-bold ${selected ? "text-[#299E60]" : "text-gray-700"}`}
                    >
                      {label}
                    </p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          {formData.onboardingType.length === 0 && (
            <p className="text-xs text-red-400 mt-1.5">
              Please select at least one option
            </p>
          )}
        </div>

        {/* Business Name */}
        <div>
          <label className="font-semibold block mb-2">Business Name *</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
          />
        </div>

        {/* Business Type */}
        <div>
          <label className="font-semibold block mb-2">Business Type *</label>
          <select
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
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
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
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
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
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
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
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
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
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
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
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
            className="w-11/12 border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#299E60] focus:border-[#299E60] transition"
          />
        </div>
      </div>
    </>
  );
};

export default BusinessDetails;
