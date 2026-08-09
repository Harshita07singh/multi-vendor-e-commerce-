import React, { useState } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Home,
  ChevronRight,
  ArrowLeft,
  KeyRound,
} from "lucide-react";

const passwordStrength = (password) => {
  if (!password) return { label: "", color: "", width: "0%" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", color: "bg-red-400", width: "25%" };
  if (score === 2)
    return { label: "Fair", color: "bg-yellow-400", width: "50%" };
  if (score === 3) return { label: "Good", color: "bg-blue-400", width: "75%" };
  return { label: "Strong", color: "bg-[#299E60]", width: "100%" };
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams(); // for email link flow: /reset-password/:token

  // OTP flow passes email via state
  const email = location.state?.email || "";
  const otpVerified = location.state?.otpVerified || false;

  // Determine flow: token in URL = email-link flow; email in state = OTP flow
  const isOtpFlow = !token && email && otpVerified;

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Please enter a new password";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      let res, data;

      if (isOtpFlow) {
        // OTP flow: use a dedicated endpoint or requestPasswordReset + resetPassword
        // Here we call requestPasswordReset first to get a token, then reset.
        // But since OTP is already verified, we can call a direct password update.
        // Using the token-based reset with the email by first requesting reset:
        const resetReq = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/auth/request-password-reset`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          },
        );
        // NOTE: This sends another email with token. For a cleaner OTP-only flow,
        // your backend should expose a direct /reset-password-otp endpoint.
        // This is a workaround — see integration note below.
        const resetData = await resetReq.json();
        if (!resetReq.ok) {
          setErrors({
            general: resetData.message || "Failed to reset password",
          });
          return;
        }
        // Inform user to check email for the reset link
        Swal.fire({
          icon: "info",
          title: "Check Your Email",
          html: `OTP verified! We've sent a password reset link to <b>${email}</b>. Please use that link to set your new password.`,
          confirmButtonColor: "#299E60",
        }).then(() => navigate("/login"));
        return;
      }

      // Token-based flow (email link)
      res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: formData.password }),
        },
      );
      data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.message || "Failed to reset password" });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Password Reset!",
        text: "Your password has been reset successfully. Please login.",
        confirmButtonColor: "#299E60",
      }).then(() => navigate("/login"));
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
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
            <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
            <div className="flex items-center space-x-2 text-sm">
              <Home className="w-4 h-4 text-gray-600" />
              <Link to="/" className="text-gray-600 hover:text-green-700">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-green-700 font-medium">Reset Password</span>
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
                <KeyRound className="w-8 h-8 text-[#299E60]" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                New Password
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Create a strong password that you haven't used before.
              </p>
            </div>

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#299E60]" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white pr-12 ${
                      errors.password
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Strength Meter */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: strength.width }}
                      />
                    </div>
                    <p className="text-xs mt-1 text-gray-500">
                      Strength:{" "}
                      <span className="font-semibold text-gray-700">
                        {strength.label}
                      </span>
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#299E60]" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white pr-12 ${
                      errors.confirmPassword
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  {formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 text-[#299E60]" />
                    )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full inline-block"></span>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Tips */}
              <ul className="text-xs text-gray-400 space-y-1 bg-gray-50 rounded-xl p-3">
                <li
                  className={
                    formData.password.length >= 8 ? "text-[#299E60]" : ""
                  }
                >
                  {formData.password.length >= 8 ? "✓" : "○"} At least 8
                  characters
                </li>
                <li
                  className={
                    /[A-Z]/.test(formData.password) ? "text-[#299E60]" : ""
                  }
                >
                  {/[A-Z]/.test(formData.password) ? "✓" : "○"} One uppercase
                  letter
                </li>
                <li
                  className={
                    /[0-9]/.test(formData.password) ? "text-[#299E60]" : ""
                  }
                >
                  {/[0-9]/.test(formData.password) ? "✓" : "○"} One number
                </li>
                <li
                  className={
                    /[^A-Za-z0-9]/.test(formData.password)
                      ? "text-[#299E60]"
                      : ""
                  }
                >
                  {/[^A-Za-z0-9]/.test(formData.password) ? "✓" : "○"} One
                  special character
                </li>
              </ul>

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
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
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

export default ResetPassword;
