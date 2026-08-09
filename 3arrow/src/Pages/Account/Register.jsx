import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  CheckCircle,
  Home,
  ChevronRight,
  X,
  AlertCircle,
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "", // success | error
  });

  const showPopup = (message, type = "success") => {
    setPopup({ show: true, message, type });

    setTimeout(() => {
      setPopup({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name) {
      newErrors.name = "Please enter your name";
    }

    if (!formData.email) {
      newErrors.email = "Please enter your email";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Please enter password";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showPopup("Please fix the form errors", "error");
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const API_BASE_UB =
        import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";
      const response = await fetch(`${API_BASE_UB}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        showPopup(data.message || "Registration failed", "error");
        return;
      }

      showPopup("Registration successful!", "success");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(error);
      showPopup("Something went wrong", "error");
    }
  };

  return (
    <>
      {/* Popup Message */}
      {popup.show && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-right duration-300">
          <div
            className={`min-w-[300px] max-w-sm rounded-xl shadow-2xl border p-4 flex items-start gap-3 ${
              popup.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="mt-0.5">
              {popup.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium">{popup.message}</p>
            </div>

            <button
              onClick={() => setPopup({ show: false, message: "", type: "" })}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Page Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-3 lg:px-7">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Register</h1>
            <div className="flex items-center space-x-2 text-sm">
              <Home className="w-4 h-4 text-gray-600" />
              <Link to="/" className="text-gray-600">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-green-700 font-medium">Register</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold text-black mb-1">
                Create Account
              </h2>
              <p className="text-gray-500 text-sm">
                Join us today and get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                  <User className="w-4 h-4 text-green-700" />
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white ${
                      errors.name
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formData.name && !errors.name && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-700" />
                  )}
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-700" />
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white ${
                      errors.email
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="example@email.com"
                  />
                  {formData.email && !errors.email && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-700" />
                  )}
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-700" />
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white pr-12 ${
                      errors.password
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white ${
                    errors.phone
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.phone}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#299E60] text-white font-semibold py-3 rounded-xl transform active:scale-[0.98] transition-all duration-200 shadow-lg mt-4"
              >
                Create Account
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-green-700 font-semibold transition-all"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
