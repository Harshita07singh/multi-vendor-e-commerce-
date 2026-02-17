import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LoginModal = ({ setOpenModal }) => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Send OTP
  const handleSendOTP = async () => {
    if (!emailOrPhone) {
      return toast.error("Please enter email or phone");
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:3000/api/auth/vendor/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrPhone }),
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("OTP sent successfully");
      setOtpSent(true);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verify OTP
  //   const handleVerifyOTP = async () => {
  //     if (!otp) return toast.error("Enter OTP");

  //     try {
  //       setLoading(true);

  //       const res = await fetch(
  //         "http://localhost:3000/api/auth/vendor/verify-otp",
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ emailOrPhone, otp }),
  //         },
  //       );

  //       const data = await res.json();

  //       if (!res.ok) throw new Error(data.message);

  //       // ✅ Store token
  //       localStorage.setItem("accessToken", data.token);
  //       localStorage.setItem("user", JSON.stringify(data.user));

  //       toast.success("Login successful 🎉");

  //       setOpenModal(false);

  //       // Optional redirect
  //       navigate("/vendor/onboarding");
  //     } catch (error) {
  //       toast.error(error.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  const handleVerifyOTP = async () => {
    if (!otp) return toast.error("Enter OTP");

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:3000/api/auth/vendor/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailOrPhone, otp }),
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // ✅ Store token
      localStorage.setItem("accessToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful 🎉");

      setOpenModal(false);

      // 🔥 Navigate to onboarding
      navigate("/vendor/onboarding");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Google Login
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/vendor/google";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white w-[90%] max-w-md rounded-xl shadow-xl p-8 relative">
        <button
          onClick={() => setOpenModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-center mb-2">
          seller<span className="text-green-600">hub</span>
        </h2>

        <p className="text-center text-lg font-semibold mb-6">
          Welcome! Please login
        </p>

        {/* Email / Phone Input */}
        <input
          type="text"
          placeholder="Email or phone *"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* OTP Input (Only After Sent) */}
        {otpSent && (
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        )}

        {/* Button */}
        {!otpSent ? (
          <button
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg mb-4 font-semibold hover:bg-green-700"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        ) : (
          <button
            onClick={handleVerifyOTP}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg mb-4 font-semibold hover:bg-green-700"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        )}

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500">Or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        <p className="text-xs text-center text-gray-500 mt-6">
          By continuing, I agree to the{" "}
          <span className="text-green-600 font-medium">
            Terms of Use & Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
