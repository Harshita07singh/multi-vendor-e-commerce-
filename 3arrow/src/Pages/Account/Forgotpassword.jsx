import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Mail, Home, ChevronRight, ArrowLeft, Send } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email");
    if (!validateEmail(email)) return setError("Please enter a valid email");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      Swal.fire({
        icon: "success",
        title: "OTP Sent!",
        text: `A 6-digit OTP has been sent to ${email}`,
        confirmButtonColor: "#299E60",
      }).then(() => {
        navigate("/verify-otp", { state: { email } });
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Forgot Password
            </h1>
            <div className="flex items-center space-x-2 text-sm">
              <Home className="w-4 h-4 text-gray-600" />
              <Link to="/" className="text-gray-600 hover:text-green-700">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-green-700 font-medium">
                Forgot Password
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="min-h-[70vh] bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#299E60]" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                No worries! Enter your registered email and we'll send you a
                6-digit OTP to verify your identity.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#299E60]" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white ${
                    error ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="example@email.com"
                />
                {error && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#299E60] hover:bg-[#22884f] text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send OTP
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
