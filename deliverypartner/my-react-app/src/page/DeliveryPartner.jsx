import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Arrow from "../assets/3arrow.png";
import banner from "../assets/Delivery Banner.webp";
import { User } from "lucide-react";

const STEPS = [
  { id: 1, label: "Personal", icon: <User /> },
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
  const [otpSent, setOtpSent] = useState({ email: false });
  const [otpLoading, setOtpLoading] = useState({ email: false });
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
          height: 100vh; width: 100vw;
          display: flex;
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow: hidden;
          background: #f0f4ef;
        }

        /* ══════════════════════════════════
           LEFT — full-height split banner
        ══════════════════════════════════ */
        .dp-left {
          width: 55%;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }

        /* Banner image fills the whole panel */
        .dp-left-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center center;
          display: block;
        }

        /* Dark gradient only at the top so text pops */
        .dp-left-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            175deg,
            rgba(5, 20, 5, 0.72) 0%,
            rgba(5, 20, 5, 0.38) 38%,
            rgba(5, 20, 5, 0.0) 62%
          );
          pointer-events: none;
        }

        /* ── Overlay text block — top-left ── */
        .dp-left-text {
          position: absolute;
          top: 60px; left: 36px; right: 36px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* "Now Hiring" pill */
        .dp-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(74, 222, 128, 0.14);
          border: 1px solid rgba(74, 222, 128, 0.38);
          border-radius: 100px;
          padding: 5px 14px;
          width: fit-content;
        }
        .dp-pill-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
          animation: dp-blink 2s ease-in-out infinite;
        }
        .dp-pill-label {
          font-size: 10px; font-weight: 700;
          color: #4ade80; letter-spacing: 0.1em; text-transform: uppercase;
        }
        @keyframes dp-blink { 0%,100%{opacity:1;} 50%{opacity:0.2;} }

        /* Headline */
        .dp-headline {
          font-size: clamp(24px, 2.8vw, 42px);
          font-weight: 800; line-height: 1.08;
          color: #ffffff; letter-spacing: -0.03em;
        }
        .dp-headline em {
          font-style: normal; color: #5CB74D;
        }

        /* Subtext */
        .dp-desc {
          font-size: 13px; line-height: 1.68;
          color: rgba(255, 255, 255, 0.68);
          max-width: 300px;
        }

        /* Stats */
        .dp-stats {
          display: flex; gap: 24px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.14);
        }
        .dp-stat-n { font-size: 20px; font-weight: 800; color: #5CB74D; }
        .dp-stat-l { font-size: 10px; font-weight: 500; color:#5CB74D; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.06em; }

        /* ══════════════════════════════════
           RIGHT — scrollable form panel
        ══════════════════════════════════ */
        .dp-right {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 20px 24px;
          overflow-y: auto;
          background: #fff;
        }

        .dp-card {
          width: 100%; max-width: 440px;
          display: flex; flex-direction: column;
          background: #fff; 
        
          overflow: hidden;
        }

        .dp-header { flex-shrink: 0; padding: 24px 28px 14px; border-bottom: 1px solid #f0f4ef; }
        .dp-logo { display: flex; align-items: center; margin-bottom: 16px; }
        .dp-logo img { height: 50px; width: auto; object-fit: contain; display: block; }
        .dp-heading { font-size: 30px; font-weight: 800; color: #5CB74D; letter-spacing: -0.02em; margin-bottom: 2px; }
        .dp-sub { font-size: 16px; color: #9aaa96; margin-bottom: 10px; }

        .dp-steps { display: flex; gap: 6px; }
        .dp-step-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .dp-step-track { width: 100%; height: 3px; border-radius: 10px; background: #e8ede6; transition: background 0.35s; }
        .dp-step-item.active .dp-step-track,
        .dp-step-item.done .dp-step-track { background: linear-gradient(90deg, #15803d, #4ade80); }
        .dp-step-name { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #c5cec3; transition: color 0.3s; }
        .dp-step-item.active .dp-step-name { color: #15803d; }
        .dp-step-item.done .dp-step-name { color: #4ade80; }

        .dp-alert { padding: 8px 12px; border-radius: 10px; font-size: 12px; font-weight: 600; margin-top: 10px; }
        .dp-alert.error { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
        .dp-alert.success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }

        .dp-body { padding: 14px 28px; display: flex; flex-direction: column; }
        .dp-step-panel { display: flex; flex-direction: column; gap: 9px; animation: fadeIn 0.22s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateX(10px);}to{opacity:1;transform:translateX(0);} }

        .dp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-content: start; }
        .dp-span2 { grid-column: span 2; }

        .dp-input {
          width: 100%; padding: 9px 12px; font-size: 12.5px;
          font-family: 'Plus Jakarta Sans', sans-serif; color: #1a2e15;
          background: #f8faf7; border: 1.5px solid #e2e8df; border-radius: 10px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .dp-input::placeholder { color: #b8c5b5; }
        .dp-input:focus { border-color: #4ade80; background: #fff; box-shadow: 0 0 0 3px rgba(74,222,128,0.12); }

        .dp-select {
          width: 100%; padding: 9px 12px; font-size: 12.5px;
          font-family: 'Plus Jakarta Sans', sans-serif; color: #1a2e15;
          background: #f8faf7; border: 1.5px solid #e2e8df; border-radius: 10px;
          outline: none; appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' viewBox='0 0 12 7'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239aaa96' stroke-width='1.8' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 13px center;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .dp-select:focus { border-color: #4ade80; box-shadow: 0 0 0 3px rgba(74,222,128,0.12); }

        .dp-otp-row { display: flex; align-items: center; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
        .dp-otp-input {
          width: 74px; padding: 6px 10px; font-size: 12.5px; letter-spacing: 0.15em;
          font-family: 'Plus Jakarta Sans', sans-serif; color: #1a2e15; background: #fff;
          border: 1.5px solid #e2e8df; border-radius: 8px; outline: none; transition: border-color 0.2s;
        }
        .dp-otp-input:focus { border-color: #4ade80; }
        .dp-btn-send { padding: 6px 11px; font-size: 11px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; background: #eff6ff; color: #2563eb; border: 1.5px solid #bfdbfe; border-radius: 8px; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
        .dp-btn-send:hover { background: #dbeafe; }
        .dp-btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
        .dp-btn-verify { padding: 6px 11px; font-size: 11px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; background: #f0fdf4; color: #16a34a; border: 1.5px solid #bbf7d0; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
        .dp-btn-verify:hover { background: #dcfce7; }
        .dp-verified { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 700; color: #16a34a; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 5px 10px; }

        .dp-file-wrap { display: flex; flex-direction: column; gap: 4px; }
        .dp-file-lbl { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #7a9475; }
        .dp-file-zone { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8faf7; border: 1.5px dashed #cfdacb; border-radius: 10px; cursor: pointer; position: relative; transition: border-color 0.2s, background 0.2s; font-size: 12px; color: #9aaa96; }
        .dp-file-zone:hover { border-color: #4ade80; background: #f0fdf4; color: #15803d; }
        .dp-file-zone input[type=file] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

        .dp-checkbox-row { display: flex; align-items: center; gap: 9px; font-size: 12px; color: #6b7c65; padding: 9px 12px; background: #f8faf7; border: 1px solid #e8ede6; border-radius: 10px; }
        .dp-checkbox-row input[type=checkbox] { width: 14px; height: 14px; accent-color: #16a34a; cursor: pointer; flex-shrink: 0; }

        .dp-footer { flex-shrink: 0; padding: 12px 28px 18px; display: flex; flex-direction: column; gap: 10px; border-top: 1px solid #f0f4ef; }
        .dp-btn-row { display: flex; gap: 8px; }

        .dp-btn-back { padding: 10px 18px; font-size: 13px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif; background: #f0f4ef; color: #4b5a44; border: none; border-radius: 12px; cursor: pointer; transition: background 0.2s; }
        .dp-btn-back:hover { background: #e2e8df; }

        .dp-btn-next { flex: 1; padding: 11px; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; background: linear-gradient(135deg, #15803d, #22c55e); color: #fff; border: none; border-radius: 12px; cursor: pointer; transition: opacity 0.2s, transform 0.15s; }
        .dp-btn-next:hover { opacity: 0.9; transform: translateY(-1px); }
        .dp-btn-next:active { transform: translateY(0); }
        .dp-btn-next:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .dp-switch { text-align: center; font-size: 12px; color: #9aaa96; }
        .dp-switch button { background: none; border: none; color: #16a34a; font-weight: 700; font-size: 12px; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }

        .dp-login-body { display: flex; flex-direction: column; gap: 10px; padding: 24px 28px; }
        .dp-signin-btn { width: 100%; padding: 13px; font-size: 14px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; background: linear-gradient(135deg, #15803d, #22c55e); color: #fff; border: none; border-radius: 14px; cursor: pointer; transition: opacity 0.2s, transform 0.15s; margin-top: 4px; }
        .dp-signin-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .dp-forgot { text-align: right; background: none; border: none; font-size: 11.5px; color: #16a34a; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }

        /* ════════════ TABLET ════════════ */
        @media (min-width: 768px) and (max-width: 1023px) {
          .dp-left { width: 45%; }
          .dp-left-text { top: 24px; left: 24px; right: 24px; }
          .dp-headline { font-size: 22px; }
          .dp-card { max-width: 400px; }
        }

        /* ════════════ MOBILE ════════════ */
        @media (max-width: 767px) {
          .dp-root { flex-direction: column; height: auto; min-height: 100vh; overflow-y: auto; }

          .dp-left { width: 100%; height: 280px; flex-shrink: 0; }
          .dp-left-img { object-position: center 15%; }
          .dp-left-text { top: 20px; left: 20px; right: 20px; gap: 10px; }
          .dp-headline { font-size: 20px; }
          .dp-desc { font-size: 11.5px; max-width: 100%; }
          .dp-stats { gap: 18px; padding-top: 10px; }
          .dp-stat-n { font-size: 17px; }

          .dp-right { flex: 1; padding: 16px; justify-content: flex-start; }
          .dp-card { max-width: 100%; border-radius: 20px; }
          .dp-grid { grid-template-columns: 1fr; }
          .dp-span2 { grid-column: span 1; }
          .dp-header { padding: 20px 20px 12px; }
          .dp-body { padding: 12px 20px; }
          .dp-footer { padding: 10px 20px 16px; }
          .dp-login-body { padding: 20px; }
        }
      `}</style>

      <div className="dp-root">
        {/* ── LEFT: full-height banner + overlay text ── */}
        <div className="dp-left">
          <img src={banner} alt="Delivery Partner" className="dp-left-img" />

          {/* Gradient so text is legible over the image */}
          <div />

          {/* Text overlaid on top-left of the banner */}
          <div className="dp-left-text">
            <div className="dp-headline">
              <div className="dp-logo">
                <img src={Arrow} alt="3arrow" />
              </div>
              <em>Deliver Better.</em>
              <br />
              <em>Earn Better.</em>
            </div>

            <div className="dp-stats">
              <div>
                <div className="dp-stat-n ">12K+</div>
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

        {/* ── RIGHT: form card ── */}
        <div className="dp-right">
          <div className="dp-card">
            <div className="dp-header">
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
                  <button className="dp-signin-btn" type="submit">
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
                <div className="dp-body">
                  {step === 1 && (
                    <div className="dp-step-panel">
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
                        <div className="dp-span2">
                          <input
                            className="dp-input"
                            name="phone"
                            placeholder="Mobile Number"
                            onChange={handleChange}
                            required
                          />
                        </div>
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
                          className="dp-select"
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

                  {step === 2 && (
                    <div className="dp-step-panel">
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

                  {step === 3 && (
                    <div className="dp-step-panel">
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

                  {step === 4 && (
                    <div className="dp-step-panel">
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
                        className="dp-btn-next"
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
