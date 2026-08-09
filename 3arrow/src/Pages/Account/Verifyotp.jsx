import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ShieldCheck,
  Home,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5)
      inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
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
        setError(data.message || "Failed to resend OTP");
        return;
      }
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setCountdown(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
      Swal.fire({
        icon: "success",
        title: "OTP Resent!",
        text: "A new OTP has been sent to your email.",
        confirmButtonColor: "#299E60",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6)
      return setError("Please enter the complete 6-digit OTP");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: otpValue }),
        },
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid OTP");
        return;
      }

      Swal.fire({
        icon: "success",
        title: "OTP Verified!",
        text: "You can now reset your password.",
        confirmButtonColor: "#299E60",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/reset-password", { state: { email, otpVerified: true } });
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
            <h1 className="text-3xl font-bold text-gray-900">Verify OTP</h1>
            <div className="flex items-center space-x-2 text-sm">
              <Home className="w-4 h-4 text-gray-600" />
              <Link to="/" className="text-gray-600 hover:text-green-700">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-green-700 font-medium">Verify OTP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="min-h-[70vh] bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[#299E60]" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Enter OTP
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                We've sent a 6-digit OTP to{" "}
                <span className="text-gray-800 font-semibold">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* OTP Boxes */}
              <div
                className="flex gap-3 justify-center mb-6"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white ${
                      error
                        ? "border-red-400 bg-red-50 text-red-600"
                        : digit
                          ? "border-[#299E60] text-[#299E60]"
                          : "border-gray-300 text-gray-800 focus:border-[#299E60]"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-xs text-center mb-4 flex items-center justify-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                  {error}
                </p>
              )}

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
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </form>

            {/* Resend */}
            <div className="mt-5 text-center">
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="inline-flex items-center gap-2 text-sm text-[#299E60] font-semibold hover:underline disabled:opacity-60"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${resendLoading ? "animate-spin" : ""}`}
                  />
                  {resendLoading ? "Resending..." : "Resend OTP"}
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend OTP in{" "}
                  <span className="text-[#299E60] font-semibold">
                    {countdown}s
                  </span>
                </p>
              )}
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyOtp;
