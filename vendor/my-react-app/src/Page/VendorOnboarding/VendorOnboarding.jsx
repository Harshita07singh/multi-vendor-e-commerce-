import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarStepper from "../VendorOnboarding/SidebarStepper";
import MobileStepper from "../VendorOnboarding/MobileStepper";
import BusinessDetails from "../VendorOnboarding/BusinessDetails";
import SellerDetails from "../VendorOnboarding/SellerDetails";
import BrandDetails from "../VendorOnboarding/BrandDetails";
import BankDetails from "../VendorOnboarding/BankDetails";
import ShippingLocations from "../VendorOnboarding/ShippingLocations";
import DigitalSignature from "../VendorOnboarding/DigitalSignature";
import VerifySubmit from "../VendorOnboarding/VerifySubmit";
import StatusBadge from "../../component/StatusBadge";
import { vendorAPI } from "../../services/api";
import LoginModal from "../../component/LoginModal";

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { label: "Business details", short: "Business" },
  { label: "Seller details", short: "Seller" },
  { label: "Brand details", short: "Brand" },
  { label: "Bank details", short: "Bank" },
  { label: "Shipping locations", short: "Shipping" },
  { label: "Digital signature", short: "Signature" },
  { label: "Verify & submit", short: "Verify" },
];

// ─── Status colours ──────────────────────────────────────────────────────────
const STATUS_STYLE = {
  approved: {
    bg: "#f0fdf4",
    border: "#bbf7d0",
    text: "#15803d",
    badge: "#22c55e",
    title: "Application Approved! 🎉",
  },
  pending: {
    bg: "#fffbeb",
    border: "#fde68a",
    text: "#b45309",
    badge: "#f59e0b",
    title: "Application Under Review",
  },
  rejected: {
    bg: "#fef2f2",
    border: "#fecaca",
    text: "#dc2626",
    badge: "#ef4444",
    title: "Application Rejected",
  },
  draft: {
    bg: "#f8fafc",
    border: "#e2e8f0",
    text: "#475569",
    badge: "#94a3b8",
    title: "Draft",
  },
};

const STATUS_MSG = {
  approved:
    "Congratulations! Your vendor application has been approved. Your profile is now complete.",
  pending:
    "Your application is currently under review by our admin team. You cannot make changes at this time.",
  rejected: (remark) =>
    remark
      ? `Your application was rejected. Reason: ${remark}. Please update your information and resubmit.`
      : "Your application was rejected. Please update your information and resubmit.",
  draft: "Complete all steps below and submit your application for review.",
};

const VendorOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [vendor, setVendor] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isStepValid, setIsStepValid] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setShowLoginModal(true);
      setLoadingStatus(false);
      return;
    }
    fetchVendorStatus();
  }, []);

  const fetchVendorStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await vendorAPI.getMyVendor();
      setVendor(res);
    } catch {
      setVendor(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  const isEditingDisabled =
    vendor && (vendor.status === "pending" || vendor.status === "approved");
  const statusStyle = vendor
    ? STATUS_STYLE[vendor.status] || STATUS_STYLE.draft
    : null;

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && isStepValid) {
      setCurrentStep((s) => s + 1);
      setIsStepValid(false);
      window.scrollTo(0, 0);
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo(0, 0);
    }
  };

  const renderStep = () => {
    const map = [
      BusinessDetails,
      SellerDetails,
      BrandDetails,
      BankDetails,
      ShippingLocations,
      DigitalSignature,
      VerifySubmit,
    ];
    const Comp = map[currentStep];
    return Comp ? <Comp setIsStepValid={setIsStepValid} /> : null;
  };

  return (
    <>
      {showLoginModal && <LoginModal setOpenModal={setShowLoginModal} />}

      <style>{CSS}</style>

      <div className="vo-root">
        {/* ══════════════════════════════════════════
            TOP PROGRESS STEPPER
        ══════════════════════════════════════════ */}
        <div className="vo-stepper-bar">
          <div className="vo-stepper-inner">
            {STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <React.Fragment key={i}>
                  {/* connector line before each step except first */}
                  {i > 0 && <div className={`vo-line${done ? " done" : ""}`} />}
                  <div className="vo-step-wrap">
                    <div
                      className={`vo-circle${done ? " done" : active ? " active" : ""}`}
                    >
                      {done ? (
                        <span className="vo-check">✓</span>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={`vo-step-label${active ? " active" : done ? " done" : ""}`}
                    >
                      {/* full label on md+, short on mobile */}
                      <span className="vo-label-full">{step.label}</span>
                      <span className="vo-label-short">{step.short}</span>
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            SCROLLABLE CONTENT
        ══════════════════════════════════════════ */}
        <div className="vo-content">
          <div className="vo-content-inner">
            {/* Status alert — single consolidated card */}
            {!loadingStatus && vendor && statusStyle && (
              <div
                className="vo-status-card"
                style={{
                  background: statusStyle.bg,
                  borderColor: statusStyle.border,
                }}
              >
                <div className="vo-status-left">
                  <div
                    className="vo-status-dot"
                    style={{ background: statusStyle.badge }}
                  />
                  <div>
                    <div
                      className="vo-status-title"
                      style={{ color: statusStyle.text }}
                    >
                      {statusStyle.title}
                    </div>
                    <div
                      className="vo-status-msg"
                      style={{ color: statusStyle.text }}
                    >
                      {vendor.status === "rejected"
                        ? STATUS_MSG.rejected(vendor.adminRemark)
                        : STATUS_MSG[vendor.status]}
                    </div>
                  </div>
                </div>
                <span
                  className="vo-badge"
                  style={{
                    background: `${statusStyle.badge}18`,
                    color: statusStyle.badge,
                    border: `1px solid ${statusStyle.badge}44`,
                  }}
                >
                  {vendor.status.charAt(0).toUpperCase() +
                    vendor.status.slice(1)}
                </span>
              </div>
            )}

            {/* Editing disabled notice */}
            {!loadingStatus && isEditingDisabled && (
              <div className="vo-info-box">
                <span className="vo-info-icon">ℹ</span>
                Your application status is <strong>'{vendor.status}'</strong>.
                You cannot edit your profile at this time.
              </div>
            )}

            {/* Step content */}
            {!isEditingDisabled && (
              <div className="vo-step-content">{renderStep()}</div>
            )}

            {/* Locked state: Go to Dashboard card */}
            {isEditingDisabled && (
              <div className="vo-locked-card">
                <div className="vo-locked-icon">
                  {vendor.status === "approved" ? "🎉" : "⏳"}
                </div>
                <p className="vo-locked-text">
                  {vendor.status === "approved"
                    ? "Your vendor profile is complete and approved!"
                    : "Please wait for admin review to complete."}
                </p>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="vo-dash-btn"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {/* Spacer so content clears fixed footer */}
            {!isEditingDisabled && <div style={{ height: 120 }} />}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            FIXED FOOTER NAV
        ══════════════════════════════════════════ */}
        {!isEditingDisabled && (
          <div className="vo-footer">
            <div className="vo-footer-inner">
              {/* Previous */}
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`vo-btn-prev${currentStep === 0 ? " disabled" : ""}`}
              >
                ← Previous
              </button>

              {/* Step counter (mobile) */}
              <span className="vo-step-counter">
                Step {currentStep + 1} of {STEPS.length}
              </span>

              {/* Next */}
              {currentStep < STEPS.length - 1 && (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid}
                  className={`vo-btn-next${!isStepValid ? " disabled" : ""}`}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VendorOnboarding;

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  /* ── Root layout ── */
  .vo-root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    color: #111827;
  }

  /* ── Stepper bar ── */
  .vo-stepper-bar {
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    padding: 20px 24px;
    position: sticky;
    top: 0;
    z-index: 30;
    box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  }
  .vo-stepper-inner {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0;
  }

  /* connector line */
  .vo-line {
    flex: 1;
    height: 2px;
    background: #e5e7eb;
    margin-top: 19px;
    transition: background .3s;
    min-width: 12px;
  }
  .vo-line.done { background: #5BB64A; }

  /* step wrap */
  .vo-step-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* circle */
  .vo-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 2px solid #d1d5db;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: #9ca3af;
    transition: all .3s;
    flex-shrink: 0;
  }
  .vo-circle.active {
    border-color: #5BB64A;
    background: #fff;
    color: #5BB64A;
    box-shadow: 0 0 0 4px rgba(91,182,74,0.15);
  }
  .vo-circle.done {
    border-color: #5BB64A;
    background: #5BB64A;
    color: #fff;
  }
  .vo-check { font-size: 16px; font-weight: 900; }

  /* label */
  .vo-step-label {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    transition: color .3s;
  }
  .vo-step-label.active { color: #111827; font-weight: 800; }
  .vo-step-label.done   { color: #5BB64A; font-weight: 600; }
  .vo-label-short { display: none; }

  /* ── Content ── */
  .vo-content {
    flex: 1;
    overflow-y: auto;
    padding: 32px 24px;
  }
  .vo-content-inner {
    max-width: 860px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Status card ── */
  .vo-status-card {
    border: 1.5px solid;
    border-radius: 12px;
    padding: 18px 22px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    animation: voFadeUp .3s ease;
  }
  .vo-status-left {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }
  .vo-status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;
    animation: voPulse 2s infinite;
  }
  .vo-status-title {
    font-size: 15px;
    font-weight: 800;
    margin-bottom: 4px;
    letter-spacing: -0.2px;
  }
  .vo-status-msg {
    font-size: 13.5px;
    line-height: 1.6;
    opacity: .85;
  }
  .vo-badge {
    flex-shrink: 0;
    padding: 5px 16px;
    border-radius: 100px;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.3px;
    white-space: nowrap;
    align-self: flex-start;
  }

  /* ── Info box ── */
  .vo-info-box {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1d4ed8;
    border-radius: 10px;
    padding: 14px 18px;
    font-size: 13.5px;
    line-height: 1.6;
    animation: voFadeUp .3s ease;
  }
  .vo-info-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #1d4ed8;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 900;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ── Step content ── */
  .vo-step-content {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 28px 32px;
    animation: voFadeUp .3s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }

  /* ── Locked card ── */
  .vo-locked-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 48px 32px;
    text-align: center;
    animation: voFadeUp .3s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .vo-locked-icon {
    font-size: 52px;
    margin-bottom: 16px;
  }
  .vo-locked-text {
    font-size: 16px;
    color: #4b5563;
    margin: 0 0 24px;
    font-weight: 500;
  }
  .vo-dash-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 32px;
    background: #5BB64A;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(91,182,74,0.35);
    transition: all .2s;
    letter-spacing: -0.2px;
  }
  .vo-dash-btn:hover {
    background: #4aa33c;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(91,182,74,0.4);
  }

  /* ── Footer ── */
  .vo-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1.5px solid #e5e7eb;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
    z-index: 40;
  }
  .vo-footer-inner {
    max-width: 860px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .vo-step-counter {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
  }

  /* prev / next buttons */
  .vo-btn-prev {
    padding: 11px 24px;
    border-radius: 10px;
    border: 1.5px solid #e5e7eb;
    background: #fff;
    color: #374151;
    font-size: 14px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: all .15s;
  }
  .vo-btn-prev:hover:not(.disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
  }
  .vo-btn-prev.disabled {
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #f3f4f6;
    cursor: not-allowed;
  }
  .vo-btn-next {
    padding: 11px 28px;
    border-radius: 10px;
    border: none;
    background: #5BB64A;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    box-shadow: 0 3px 12px rgba(91,182,74,0.3);
    transition: all .15s;
  }
  .vo-btn-next:hover:not(.disabled) {
    background: #4aa33c;
    transform: translateY(-1px);
    box-shadow: 0 5px 16px rgba(91,182,74,0.38);
  }
  .vo-btn-next.disabled {
    background: #d1d5db;
    color: #9ca3af;
    box-shadow: none;
    cursor: not-allowed;
  }

  /* ── Animations ── */
  @keyframes voFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: none; }
  }
  @keyframes voPulse {
    0%,100% { opacity: 1; }
    50%      { opacity: .45; }
  }

  /* ── RESPONSIVE ─────────────────────────────── */

  /* Tablet (≤ 768px) */
  @media (max-width: 768px) {
    .vo-stepper-bar { padding: 14px 16px; }
    .vo-circle { width: 32px; height: 32px; font-size: 12px; }
    .vo-circle.active { box-shadow: 0 0 0 3px rgba(91,182,74,0.15); }
    .vo-check { font-size: 13px; }
    .vo-label-full  { display: none; }
    .vo-label-short { display: inline; }
    .vo-step-label  { font-size: 10px; }
    .vo-line { margin-top: 16px; }

    .vo-content { padding: 20px 16px; }
    .vo-step-content { padding: 20px 18px; }
    .vo-status-card { padding: 14px 16px; }
    .vo-footer-inner { padding: 12px 16px; }
  }

  /* Mobile (≤ 480px) */
  @media (max-width: 480px) {
    /* Collapse stepper to just numbers — hide labels */
    .vo-step-label { display: none; }
    .vo-circle { width: 28px; height: 28px; font-size: 11px; }
    .vo-line { margin-top: 14px; min-width: 6px; }
    .vo-check { font-size: 11px; }

    .vo-stepper-bar { padding: 12px 12px; }
    .vo-stepper-inner { gap: 0; }

    .vo-content { padding: 14px 12px; }
    .vo-step-content { padding: 16px 14px; border-radius: 10px; }
    .vo-locked-card { padding: 36px 20px; }
    .vo-locked-icon { font-size: 40px; }
    .vo-locked-text { font-size: 14px; }
    .vo-dash-btn { width: 100%; justify-content: center; }

    .vo-status-card { flex-direction: column; gap: 10px; }
    .vo-badge { align-self: flex-start; }

    .vo-btn-prev, .vo-btn-next { padding: 10px 18px; font-size: 13px; }
    .vo-step-counter { font-size: 12px; }
  }
`;
