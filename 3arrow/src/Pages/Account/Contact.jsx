import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Home,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import FeaturesGrid from "../../components/FeaturesGrid";
import { Truck, Shield, Headphones, CreditCard } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/contact`, formData);
      setSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Truck size={24} className="text-white" />,
      title: "Free Delivery",
      description: "For all orders over $50",
    },
    {
      icon: <Shield size={24} className="text-white" />,
      title: "Secure Payment",
      description: "100% secure transaction",
    },
    {
      icon: <Headphones size={24} className="text-white" />,
      title: "24/7 Support",
      description: "Dedicated customer support",
    },
    {
      icon: <CreditCard size={24} className="text-white" />,
      title: "Easy Returns",
      description: "30-day return policy",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900">Contact</h1>
            <div className="flex items-center space-x-2 text-sm">
              <Home className="w-4 h-4 text-gray-600" />
              <a href="#" className="text-gray-600">
                Home
              </a>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-green-700 font-sm">Contact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Make Custom Request
              </h2>

              {/* Success State */}
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-9 h-9 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Query Submitted!
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Thank you for reaching out. Our team will get back to you as
                    soon as possible.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 bg-[#289C5F] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-[#22874f] transition-all"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-gray-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      placeholder="Type your message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="6"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all resize-none placeholder-gray-400"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#289C5F] hover:bg-[#22874f] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Get a Quote"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Side - Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Get In Touch
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors duration-300">
                    <Phone className="w-5 h-5 text-green-700 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-lg">
                      +00 000 00000
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors duration-300">
                    <Mail className="w-6 h-6 text-green-700 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-lg break-all">
                      support24@threearrow.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors duration-300">
                    <MapPin className="w-6 h-6 text-green-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-lg">
                      abc, abcd, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-between group">
                <span>Get Support On Call</span>
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-5 h-5 text-white" />
                </div>
              </button>

              <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-between group">
                <span>Get Direction</span>
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 lg:mt-10">
          <FeaturesGrid features={features} />
        </div>
      </div>
    </div>
  );
}
