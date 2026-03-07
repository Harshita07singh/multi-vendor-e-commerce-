import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { id: 1, label: "Personal", icon: "👤" },
  { id: 2, label: "Documents", icon: "🪪" },
  { id: 3, label: "Vehicle", icon: "🛵" },
  { id: 4, label: "Bank", icon: "🏦" },
];

const DeliveryPartner = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("error");

  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});

  const [emailOTPVerified, setEmailOTPVerified] = useState(false);
  const [phoneOTPVerified, setPhoneOTPVerified] = useState(false);
  const [otpSent, setOtpSent] = useState({ email: false, phone: false });
  const [otpLoading, setOtpLoading] = useState({ email: false, phone: false });
  const [otp, setOtp] = useState("");

  const showMsg = (text, type = "error") => {
    setMessage(text);
    setMsgType(type);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSendEmailOTP = async () => {
    if (!formData.email) {
      showMsg("Please enter your email first");
      return;
    }
    setOtpLoading({ ...otpLoading, email: true });
    setMessage("");
    try {
      const res = await fetch("/api/auth/delivery/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent({ ...otpSent, email: true });
        showMsg("OTP sent to your email!", "success");
      } else showMsg(data.message || "Failed to send OTP");
    } catch {
      showMsg("Error sending OTP");
    } finally {
      setOtpLoading({ ...otpLoading, email: false });
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!otp) {
      showMsg("Please enter the OTP");
      return;
    }
    try {
      const res = await fetch("/api/auth/delivery/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailOTPVerified(true);
        setOtpSent({ ...otpSent, email: false });
        showMsg("Email verified!", "success");
      } else showMsg(data.message || "Invalid OTP");
    } catch {
      showMsg("Error verifying OTP");
    }
  };

  const handleSendPhoneOTP = async () => {
    if (!formData.phone) {
      showMsg("Please enter your phone number first");
      return;
    }
    setOtpLoading({ ...otpLoading, phone: true });
    setMessage("");
    try {
      const res = await fetch("/api/auth/delivery/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent({ ...otpSent, phone: true });
        showMsg("OTP sent to your phone!", "success");
      } else showMsg(data.message || "Failed to send OTP");
    } catch {
      showMsg("Error sending OTP");
    } finally {
      setOtpLoading({ ...otpLoading, phone: false });
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (!otp) {
      showMsg("Please enter the OTP");
      return;
    }
    try {
      const res = await fetch("/api/auth/delivery/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setPhoneOTPVerified(true);
        setOtpSent({ ...otpSent, phone: false });
        showMsg("Phone verified!", "success");
      } else showMsg(data.message || "Invalid OTP");
    } catch {
      showMsg("Error verifying OTP");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/auth/delivery/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showMsg(data.message);
      return;
    }
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("deliveryUser", JSON.stringify(data.user));
    navigate("/delivery/dashboard");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!emailOTPVerified) {
      showMsg("Please verify your email with OTP first");
      return;
    }
    if (!phoneOTPVerified) {
      showMsg("Please verify your phone number with OTP first");
      return;
    }
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    Object.keys(files).forEach((key) => data.append(key, files[key]));
    const res = await fetch("/api/auth/delivery/register", {
      method: "POST",
      body: data,
    });
    const result = await res.json();
    if (!res.ok) {
      showMsg(result.message);
      return;
    }
    showMsg("Registration submitted for admin review.", "success");
    setIsLogin(true);
  };

  const nextStep = () => {
    setMessage("");
    setStep((s) => Math.min(s + 1, 4));
  };
  const prevStep = () => {
    setMessage("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.name &&
          formData.phone &&
          phoneOTPVerified &&
          formData.email &&
          emailOTPVerified &&
          formData.password &&
          formData.dateOfBirth &&
          formData.gender &&
          formData.city
        );

      case 2:
        return (
          formData.aadhaarNumber &&
          formData.panNumber &&
          formData.drivingLicenseNumber &&
          formData.dlExpiryDate &&
          files.aadhaarFront &&
          files.aadhaarBack &&
          files.panImage &&
          files.dlFront &&
          files.dlBack
        );

      case 3:
        return (
          formData.vehicleType &&
          formData.vehicleNumber &&
          formData.vehicleModel &&
          formData.vehicleYear &&
          files.rcImage
        );

      case 4:
        return (
          formData.accountHolderName &&
          formData.accountNumber &&
          formData.ifscCode &&
          formData.bankName &&
          files.bankProofImage &&
          formData.termsAccepted
        );

      default:
        return false;
    }
  };
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dp-root {
          height: 100vh;
          display: flex;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #060d04;
          overflow: hidden;
        }

        /* LEFT */
        .dp-left {
          display: none;
          width: 44%;
          position: relative;
          overflow: hidden;
        }
        @media (min-width: 1024px) { .dp-left { display: flex; flex-direction: column; } }

        .dp-left-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          filter: brightness(0.38) saturate(1.1);
        }

        .dp-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(160deg, rgba(4,28,4,0.5) 0%, rgba(6,13,4,0.88) 100%);
        }

        .dp-left-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          justify-content: flex-end;
          height: 100%;
          padding: 48px 44px;
          gap: 20px;
        }

        .dp-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(74,222,128,0.12);
          border: 1px solid rgba(74,222,128,0.3);
          border-radius: 100px;
          padding: 5px 14px;
          font-size: 11px; font-weight: 700;
          color: #4ade80; letter-spacing: 0.08em;
          text-transform: uppercase; width: fit-content;
        }

        .dp-pill-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

        .dp-left-title {
          font-size: clamp(28px, 2.8vw, 46px);
          font-weight: 800; line-height: 1.08;
          color: #f0fdf0; letter-spacing: -0.03em;
        }

        .dp-left-title em {
          font-style: normal;
          background: linear-gradient(90deg, #4ade80, #a3e6b0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dp-left-desc {
          font-size: 13.5px; line-height: 1.65;
          color: rgba(200,230,200,0.5);
          max-width: 290px;
        }

        .dp-stats {
          display: flex; gap: 28px;
          padding-top: 20px;
          border-top: 1px solid rgba(74,222,128,0.12);
        }

        .dp-stat-n { font-size: 21px; font-weight: 800; color: #f0fdf0; letter-spacing: -0.02em; }
        .dp-stat-l { font-size: 10.5px; font-weight: 500; color: rgba(150,180,150,0.45); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.06em; }

        /* RIGHT */
        .dp-right {
          flex: 1;
          display: flex;
          align-items: stretch;
          padding: 18px;
          background: #f0f4ef;
          overflow: hidden;
        }

        /* CARD — flex column, fixed height */
        .dp-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 26px;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.09);
          overflow: hidden;
        }

        /* HEADER — never shrinks */
        .dp-header {
          flex-shrink: 0;
          padding: 26px 30px 14px;
          border-bottom: 1px solid #f0f4ef;
        }

        .dp-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }

        .dp-logo-mark {
          width: 32px; height: 32px; border-radius: 9px;
          background: linear-gradient(135deg, #15803d, #4ade80);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
        }

        .dp-logo-name { font-size: 16px; font-weight: 800; color: #0d1f09; letter-spacing: -0.02em; }

        .dp-heading { font-size: 19px; font-weight: 800; color: #0d1f09; letter-spacing: -0.02em; margin-bottom: 2px; }
        .dp-sub { font-size: 12px; color: #9aaa96; margin-bottom: 10px; }

        /* STEP TRACK */
        .dp-steps { display: flex; gap: 6px; }

        .dp-step-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }

        .dp-step-track {
          width: 100%; height: 3px; border-radius: 10px;
          background: #e8ede6;
          transition: background 0.35s;
        }

        .dp-step-item.active .dp-step-track,
        .dp-step-item.done .dp-step-track {
          background: linear-gradient(90deg, #15803d, #4ade80);
        }

        .dp-step-name {
          font-size: 9px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          color: #c5cec3; transition: color 0.3s;
        }

        .dp-step-item.active .dp-step-name { color: #15803d; }
        .dp-step-item.done .dp-step-name { color: #4ade80; }

        /* ALERT */
        .dp-alert {
          padding: 8px 12px; border-radius: 10px;
          font-size: 12px; font-weight: 600;
          margin-bottom: 0; margin-top: 10px;
        }

        .dp-alert.error { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
        .dp-alert.success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }

        /* BODY — fills remaining space, NO overflow */
        .dp-body {
          flex: 1;
          padding: 16px 30px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* STEP PANEL */
        .dp-step-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 9px;
          animation: fadeIn 0.22s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .dp-panel-title {
          font-size: 12.5px; font-weight: 700;
          color: #2d4a28; letter-spacing: -0.01em;
          display: flex; align-items: center; gap: 7px;
          padding-bottom: 8px;
          border-bottom: 1px solid #edf0eb;
          flex-shrink: 0;
        }

        /* GRID */
        .dp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          flex: 1;
          align-content: start;
        }

        .dp-span2 { grid-column: span 2; }

        /* INPUT */
        .dp-input {
          width: 100%;
          padding: 9px 12px;
          font-size: 12.5px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a2e15;
          background: #f8faf7;
          border: 1.5px solid #e2e8df;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .dp-input::placeholder { color: #b8c5b5; }

        .dp-input:focus {
          border-color: #4ade80;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(74,222,128,0.12);
        }

        /* SELECT */
        .dp-select {
          width: 100%;
          padding: 9px 12px;
          font-size: 12.5px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a2e15;
          background: #f8faf7;
          border: 1.5px solid #e2e8df;
          border-radius: 10px;
          outline: none; appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239aaa96' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 13px center;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .dp-btn-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
        .dp-select:focus {
          border-color: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,0.12);
        }

        /* OTP */
        .dp-otp-row {
          display: flex; align-items: center; gap: 6px;
          margin-top: 6px; flex-wrap: wrap;
        }

        .dp-otp-input {
          width: 74px; padding: 6px 10px;
          font-size: 12.5px; letter-spacing: 0.15em;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1a2e15; background: #fff;
          border: 1.5px solid #e2e8df; border-radius: 8px; outline: none;
          transition: border-color 0.2s;
        }

        .dp-otp-input:focus { border-color: #4ade80; }

        .dp-btn-send {
          padding: 6px 11px; font-size: 11px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #eff6ff; color: #2563eb;
          border: 1.5px solid #bfdbfe; border-radius: 8px; cursor: pointer;
          transition: background 0.2s; white-space: nowrap;
        }

        .dp-btn-send:hover { background: #dbeafe; }
        .dp-btn-send:disabled { opacity: 0.5; cursor: not-allowed; }

        .dp-btn-verify {
          padding: 6px 11px; font-size: 11px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #f0fdf4; color: #16a34a;
          border: 1.5px solid #bbf7d0; border-radius: 8px; cursor: pointer;
          transition: background 0.2s;
        }

        .dp-btn-verify:hover { background: #dcfce7; }

        .dp-verified {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11.5px; font-weight: 700; color: #16a34a;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 8px; padding: 5px 10px;
        }

        /* FILE */
        .dp-file-wrap { display: flex; flex-direction: column; gap: 4px; }

        .dp-file-lbl {
          font-size: 9.5px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: #7a9475;
        }

        .dp-file-zone {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 12px;
          background: #f8faf7;
          border: 1.5px dashed #cfdacb;
          border-radius: 10px; cursor: pointer; position: relative;
          transition: border-color 0.2s, background 0.2s;
          font-size: 12px; color: #9aaa96;
        }

        .dp-file-zone:hover { border-color: #4ade80; background: #f0fdf4; color: #15803d; }

        .dp-file-zone input[type=file] {
          position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
        }

        /* CHECKBOX */
        .dp-checkbox-row {
          display: flex; align-items: center; gap: 9px;
          font-size: 12px; color: #6b7c65;
          padding: 9px 12px;
          background: #f8faf7; border: 1px solid #e8ede6; border-radius: 10px;
        }

        .dp-checkbox-row input[type=checkbox] {
          width: 14px; height: 14px; accent-color: #16a34a; cursor: pointer; flex-shrink: 0;
        }

        /* FOOTER */
        .dp-footer {
          flex-shrink: 0;
          padding: 12px 30px 16px;
          display: flex; flex-direction: column; gap: 10px;
          border-top: 1px solid #f0f4ef;
        }

        .dp-btn-row { display: flex; gap: 8px; margin-top: 12px;  }

        .dp-btn-back {
          padding: 10px 18px; font-size: 13px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #f0f4ef; color: #4b5a44;
          border: none; border-radius: 12px; cursor: pointer;
          transition: background 0.2s;
        }

        .dp-btn-back:hover { background: #e2e8df; }

        .dp-btn-next {
          flex: 1; padding: 10px; font-size: 13px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(135deg, #15803d, #22c55e);
          color: #fff; border: none; border-radius: 12px; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          
        }

        .dp-btn-next:hover { opacity: 0.9; transform: translateY(-1px); }
        .dp-btn-next:active { transform: translateY(0); }

        /* SWITCH */
        .dp-switch {
          text-align: center; font-size: 12px; color: #9aaa96;
        }

        .dp-switch button {
          background: none; border: none;
          color: #16a34a; font-weight: 700;
          font-size: 12px; font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; text-decoration: underline; text-underline-offset: 2px;
        }

        /* LOGIN BODY */
        .dp-login-body {
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; gap: 10px;
          padding: 20px 30px;
        }

        .dp-forgot {
          text-align: right; background: none; border: none;
          font-size: 11.5px; color: #16a34a; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          margin-top: -4px;
        }
      `}</style>

      <div className="dp-root">
        {/* LEFT */}
        <div className="dp-left">
          <img
            src="/assets/Delivery.avif"
            alt="Delivery Partner"
            className="dp-left-img"
          />
          <div className="dp-left-overlay" />
          <div className="dp-left-content">
            <div className="dp-pill">
              <span className="dp-pill-dot" />
              Now Hiring
            </div>
            <div className="dp-left-title">
              Deliver Smarter.
              <br />
              <em>Earn Better.</em>
            </div>
            <div className="dp-left-desc">
              Join thousands of delivery partners. Flexible hours, daily
              payouts, and full KYC support from day one.
            </div>
            <div className="dp-stats">
              <div>
                <div className="dp-stat-n">12K+</div>
                <div className="dp-stat-l">Active Partners</div>
              </div>
              <div>
                <div className="dp-stat-n">₹800</div>
                <div className="dp-stat-l">Avg. Daily</div>
              </div>
              <div>
                <div className="dp-stat-n">48h</div>
                <div className="dp-stat-l">KYC Approval</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="dp-right">
          <div className="dp-card">
            {/* HEADER */}
            <div className="dp-header">
              <div className="dp-logo">
                <div className="dp-logo-mark">🛵</div>
                <div className="dp-logo-name">3arrow</div>
              </div>
              <div className="dp-heading">
                {isLogin ? "Welcome back" : "Create Account"}
              </div>
              <div className="dp-sub">
                {isLogin
                  ? "Sign in to your partner dashboard"
                  : `Step ${step} of 4 — ${STEPS[step - 1].label} Details`}
              </div>
              {!isLogin && (
                <div className="dp-steps">
                  {STEPS.map((s) => (
                    <div
                      key={s.id}
                      className={`dp-step-item ${step === s.id ? "active" : step > s.id ? "done" : ""}`}
                    >
                      <div className="dp-step-track" />
                      <div className="dp-step-name">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
              {message && (
                <div className={`dp-alert ${msgType}`}>
                  {msgType === "success" ? "✓ " : "⚠ "}
                  {message}
                </div>
              )}
            </div>

            {/* ── LOGIN ── */}
            {isLogin ? (
              <>
                <form onSubmit={handleLogin} className="dp-login-body">
                  <input
                    className="dp-input"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    onChange={handleChange}
                    required
                  />
                  <input
                    className="dp-input"
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="dp-forgot">
                    Forgot password?
                  </button>
                  <button
                    className=" h-15 rounded-2xl bg-green-500"
                    type="submit"
                  >
                    Sign In →
                  </button>
                </form>
                <div className="dp-footer">
                  <div className="dp-switch">
                    Don't have an account?{" "}
                    <button
                      onClick={() => {
                        setIsLogin(false);
                        setStep(1);
                        setMessage("");
                      }}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* BODY */}
                <div className="dp-body">
                  {/* STEP 1 */}
                  {step === 1 && (
                    <div className="dp-step-panel">
                      {/* <div className="dp-panel-title">
                        👤 Personal Information
                      </div> */}
                      <div className="dp-grid">
                        <div className="dp-span2">
                          <input
                            className="dp-input"
                            name="name"
                            placeholder="Full Name"
                            onChange={handleChange}
                            required
                          />
                        </div>
                        {/* Phone OTP */}
                        <div className="dp-span2">
                          <input
                            className="dp-input"
                            name="phone"
                            placeholder="Mobile Number"
                            onChange={handleChange}
                            required
                          />
                          <div className="dp-otp-row">
                            {!phoneOTPVerified ? (
                              <>
                                <button
                                  type="button"
                                  onClick={handleSendPhoneOTP}
                                  disabled={otpLoading.phone}
                                  className="dp-btn-send"
                                >
                                  {otpLoading.phone
                                    ? "Sending…"
                                    : otpSent.phone
                                      ? "Resend"
                                      : "Send OTP"}
                                </button>
                                {otpSent.phone && (
                                  <>
                                    <input
                                      type="text"
                                      placeholder="OTP"
                                      value={otp}
                                      onChange={(e) => setOtp(e.target.value)}
                                      className="dp-otp-input"
                                    />
                                    <button
                                      type="button"
                                      onClick={handleVerifyPhoneOTP}
                                      className="dp-btn-verify"
                                    >
                                      Verify
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="dp-verified">
                                ✓ Phone Verified
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Email OTP */}
                        <div className="dp-span2">
                          <input
                            className="dp-input"
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            onChange={handleChange}
                            required
                          />
                          <div className="dp-otp-row">
                            {!emailOTPVerified ? (
                              <>
                                <button
                                  type="button"
                                  onClick={handleSendEmailOTP}
                                  disabled={otpLoading.email}
                                  className="dp-btn-send"
                                >
                                  {otpLoading.email
                                    ? "Sending…"
                                    : otpSent.email
                                      ? "Resend"
                                      : "Send OTP"}
                                </button>
                                {otpSent.email && (
                                  <>
                                    <input
                                      type="text"
                                      placeholder="OTP"
                                      value={otp}
                                      onChange={(e) => setOtp(e.target.value)}
                                      className="dp-otp-input"
                                    />
                                    <button
                                      type="button"
                                      onClick={handleVerifyEmailOTP}
                                      className="dp-btn-verify"
                                    >
                                      Verify
                                    </button>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="dp-verified">
                                ✓ Email Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <input
                          className="dp-input"
                          name="password"
                          type="password"
                          placeholder="Password"
                          onChange={handleChange}
                          required
                        />
                        <input
                          className="dp-input"
                          type="date"
                          name="dateOfBirth"
                          onChange={handleChange}
                          required
                        />
                        <select
                          name="gender"
                          onChange={handleChange}
                          className="dp-select pb-0.5"
                          required
                        >
                          <option value="">Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        <input
                          className="dp-input"
                          name="city"
                          placeholder="City / Service Area"
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <div className="dp-step-panel">
                      {/* <div className="dp-panel-title">🪪 KYC Documents</div> */}
                      <div className="dp-grid">
                        <input
                          className="dp-input"
                          name="aadhaarNumber"
                          placeholder="Aadhaar Number"
                          onChange={handleChange}
                          required
                        />
                        <input
                          className="dp-input"
                          name="panNumber"
                          placeholder="PAN Number"
                          onChange={handleChange}
                          required
                        />
                        <FileInput
                          name="aadhaarFront"
                          label="Aadhaar Front"
                          onChange={handleFileChange}
                        />
                        <FileInput
                          name="aadhaarBack"
                          label="Aadhaar Back"
                          onChange={handleFileChange}
                        />
                        <div className="dp-span2">
                          <FileInput
                            name="panImage"
                            label="PAN Card Image"
                            onChange={handleFileChange}
                          />
                        </div>
                        <input
                          className="dp-input"
                          name="drivingLicenseNumber"
                          placeholder="DL Number"
                          onChange={handleChange}
                          required
                        />
                        <input
                          className="dp-input"
                          type="date"
                          name="dlExpiryDate"
                          onChange={handleChange}
                          required
                        />
                        <FileInput
                          name="dlFront"
                          label="DL Front"
                          onChange={handleFileChange}
                        />
                        <FileInput
                          name="dlBack"
                          label="DL Back"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <div className="dp-step-panel">
                      {/* <div className="dp-panel-title">
                        🛵 Vehicle Information
                      </div> */}
                      <div className="dp-grid">
                        <div className="dp-span2">
                          <select
                            name="vehicleType"
                            onChange={handleChange}
                            className="dp-select"
                            required
                          >
                            <option value="">Select Vehicle Type</option>
                            <option value="Bicycle">Bicycle</option>
                            <option value="Bike">Bike / Scooter</option>
                            <option value="Car">Car</option>
                          </select>
                        </div>
                        <input
                          className="dp-input"
                          name="vehicleNumber"
                          placeholder="Registration Number"
                          onChange={handleChange}
                          required
                        />
                        <input
                          className="dp-input"
                          name="vehicleModel"
                          placeholder="Make & Model"
                          onChange={handleChange}
                          required
                        />
                        <input
                          className="dp-input"
                          name="vehicleYear"
                          type="number"
                          placeholder="Year of Manufacture"
                          onChange={handleChange}
                          required
                        />
                        <div className="dp-span2">
                          <FileInput
                            name="rcImage"
                            label="RC Book / Insurance Document"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4 */}
                  {step === 4 && (
                    <div className="dp-step-panel">
                      {/* <div className="dp-panel-title">🏦 Bank Details</div> */}
                      <div className="dp-grid">
                        <div className="dp-span2">
                          <input
                            className="dp-input"
                            name="accountHolderName"
                            placeholder="Account Holder Name"
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <input
                          className="dp-input"
                          name="accountNumber"
                          placeholder="Account Number"
                          onChange={handleChange}
                          required
                        />
                        <input
                          className="dp-input"
                          name="ifscCode"
                          placeholder="IFSC Code"
                          onChange={handleChange}
                          required
                        />
                        <input
                          className="dp-input"
                          name="bankName"
                          placeholder="Bank Name"
                          onChange={handleChange}
                          required
                        />
                        <div className="dp-span2">
                          <FileInput
                            name="bankProofImage"
                            label="Cancelled Cheque / Passbook"
                            onChange={handleFileChange}
                          />
                        </div>
                        <div className="dp-span2">
                          <div className="dp-checkbox-row">
                            <input
                              type="checkbox"
                              name="termsAccepted"
                              onChange={handleChange}
                              required
                            />
                            I agree to the Terms & Conditions and Privacy Policy
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                <div className="dp-footer">
                  <div className="dp-btn-row">
                    {step > 1 && (
                      <button
                        className="dp-btn-back"
                        type="button"
                        onClick={prevStep}
                      >
                        ← Back
                      </button>
                    )}
                    {step < 4 ? (
                      <button
                        className=" dp-btn-next"
                        type="button"
                        onClick={nextStep}
                        disabled={!isStepValid()}
                      >
                        Continue →
                      </button>
                    ) : (
                      <button
                        className="dp-btn-next"
                        type="button"
                        onClick={handleRegister}
                        disabled={!isStepValid()}
                      >
                        Submit Application ✓
                      </button>
                    )}
                  </div>
                  <div className="dp-switch">
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setIsLogin(true);
                        setMessage("");
                      }}
                    >
                      Login
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const FileInput = ({ name, label, onChange }) => (
  <div className="dp-file-wrap">
    <span className="dp-file-lbl">{label}</span>
    <label className="dp-file-zone">
      <span style={{ fontSize: 14 }}>📎</span>
      <span>Choose file…</span>
      <input type="file" name={name} onChange={onChange} required />
    </label>
  </div>
);

export default DeliveryPartner;
