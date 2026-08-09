import React, { useState, useEffect } from "react";
import { submitVendor, getMyVendor } from "../../services/vendorService";

/* ── helpers ────────────────────────────────────────────────────────── */
// Returns true if obj exists AND has at least one non-empty value
const isFilled = (obj) =>
  obj != null &&
  typeof obj === "object" &&
  Object.values(obj).some((v) => v !== "" && v !== null && v !== undefined);

const Row = ({ label, value, full }) => (
  <div className={`vs-row${full ? " vs-row-full" : ""}`}>
    <span className="vs-row-label">{label}</span>
    <span className="vs-row-value">
      {value ? value : <span className="vs-empty">—</span>}
    </span>
  </div>
);

/* ── section card ───────────────────────────────────────────────────── */
const Section = ({ icon, title, filled, children }) => (
  <div className={`vs-section${filled ? " filled" : " empty"}`}>
    <div className="vs-section-head">
      <div className={`vs-section-badge${filled ? " filled" : ""}`}>
        {filled ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2.5 7L5.5 10L11.5 4"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 4v4M7 9.5v.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <div className="vs-section-meta">
        <div className="vs-section-title">
          {icon} {title}
        </div>
        {!filled && (
          <div className="vs-section-missing">
            Not completed yet — go back to fill this section
          </div>
        )}
      </div>
      <div className={`vs-section-pill${filled ? " filled" : " empty"}`}>
        {filled ? "Complete" : "Incomplete"}
      </div>
    </div>

    {filled && (
      <>
        <div className="vs-section-divider" />
        <div className="vs-grid">{children}</div>
      </>
    )}
  </div>
);

/* ── main component ─────────────────────────────────────────────────── */
const VerifySubmit = ({ setIsStepValid }) => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setIsStepValid?.(confirmed);
  }, [confirmed, setIsStepValid]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMyVendor();
        setVendor(data);
      } catch (err) {
        setError(err.message || "Failed to load vendor data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmed) {
      setError("Please confirm before submitting.");
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const result = await submitVendor();
      setSuccess(result.message || "Application submitted successfully!");
      setConfirmed(false);
      window.location.reload();
    } catch (err) {
      setError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── derive filled state for every section using isFilled() ── */
  const bd = vendor?.businessDetails;
  const sd = vendor?.sellerDetails;
  const brd = vendor?.brandDetails;
  const bk = vendor?.bankDetails;
  const sh = vendor?.shippingLocations;
  const ds = vendor?.digitalSignature;

  const sectionsFilled = [
    isFilled(bd),
    isFilled(sd),
    isFilled(brd),
    isFilled(bk),
    isFilled(sh),
    isFilled(ds),
  ];
  const completedCount = sectionsFilled.filter(Boolean).length;
  const allComplete = completedCount === sectionsFilled.length;

  /* ── loading ── */
  if (loading)
    return (
      <div className="vs-loading">
        <div className="vs-spinner" />
        <span>Loading your application summary…</span>
      </div>
    );

  /* ── no vendor ── */
  if (!vendor)
    return (
      <div className="vs-alert vs-alert-error">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M9 5.5v4M9 11.5v.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Unable to load vendor information. Please go back and complete the
        required steps.
      </div>
    );

  return (
    <>
      <style>{CSS}</style>

      {/* ── Page title ── */}
      <div className="vs-page-head">
        <div>
          <h2 className="vs-page-title">Review Your Application</h2>
          <p className="vs-page-sub">
            Verify all sections before final submission.
          </p>
        </div>
        <div className={`vs-completion-badge${allComplete ? " complete" : ""}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle
              cx="8"
              cy="8"
              r="7"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M5 8l2.5 2.5L11 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {completedCount} / {sectionsFilled.length} sections complete
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="vs-alert vs-alert-error">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle
              cx="8"
              cy="8"
              r="7"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M8 5v4M8 10.5v.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="vs-alert vs-alert-success">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle
              cx="8"
              cy="8"
              r="7"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M5 8l2.5 2.5L11 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {success}
        </div>
      )}

      {/* ── Sections ── */}
      <div className="vs-sections">
        {/* 1. Business Details */}
        <Section title="Business Details" filled={sectionsFilled[0]}>
          <Row label="Business Name" value={bd?.businessName} />
          <Row label="Business Type" value={bd?.businessType} />
          <Row label="GST Number" value={bd?.gstNumber} />
          <Row label="PAN Number" value={bd?.panNumber} />
          <Row label="Business Email" value={bd?.businessEmail} />
          <Row label="Business Phone" value={bd?.businessPhone} />
          {bd?.yearEstablished && (
            <Row label="Year Established" value={bd.yearEstablished} />
          )}
          {bd?.numberOfEmployees && (
            <Row label="Employees" value={bd.numberOfEmployees} />
          )}
          {bd?.onboardAs && (
            <Row
              label="Onboard As"
              value={
                Array.isArray(bd.onboardAs)
                  ? bd.onboardAs.join(", ")
                  : bd.onboardAs
              }
              full
            />
          )}
        </Section>

        {/* 2. Seller Details */}
        <Section title="Seller Details" filled={sectionsFilled[1]}>
          <Row label="Seller Name" value={sd?.sellerName} />
          <Row label="Email" value={sd?.sellerEmail} />
          <Row label="Phone" value={sd?.sellerPhone} />
          <Row label="City" value={sd?.city} />
          <Row label="State" value={sd?.state} />
          <Row label="Pincode" value={sd?.pincode} />
          {sd?.address && <Row label="Address" value={sd.address} full />}
        </Section>

        {/* 3. Brand Details — field names match BrandDetails.jsx exactly */}
        <Section title="Brand Details" filled={sectionsFilled[2]}>
          <Row label="Brand Name" value={brd?.brandName} />
          <Row label="Brand Type" value={brd?.brandType} />
          <Row label="Trademark Number" value={brd?.trademarkNumber} />
          {/* BrandDetails.jsx saves as brandWebsite — NOT website */}
          <Row label="Website" value={brd?.brandWebsite} />
        </Section>

        {/* 4. Bank Details — field names match BankDetails.jsx exactly */}
        <Section title="Bank Details" filled={sectionsFilled[3]}>
          <Row label="Account Holder" value={bk?.accountHolderName} />
          <Row label="Bank Name" value={bk?.bankName} />
          {/* Mask all but last 4 digits */}
          <Row
            label="Account Number"
            value={
              bk?.accountNumber
                ? "••••  ••••  " + String(bk.accountNumber).slice(-4)
                : undefined
            }
          />
          <Row label="IFSC Code" value={bk?.ifscCode} />
          {/* BankDetails.jsx has branch but no accountType */}
          <Row label="Branch" value={bk?.branch} />
        </Section>

        {/* 5. Shipping Locations */}
        <Section title="Shipping Locations" filled={sectionsFilled[4]}>
          <Row label="Warehouse Address" value={sh?.warehouseAddress} full />
          <Row label="City" value={sh?.city} />
          <Row label="State" value={sh?.state} />
          <Row label="Pincode" value={sh?.pincode} />
          <Row label="Country" value={sh?.country} />
          {sh?.shippingZones && (
            <Row
              label="Shipping Zones"
              value={
                Array.isArray(sh.shippingZones)
                  ? sh.shippingZones.join(", ")
                  : sh.shippingZones
              }
              full
            />
          )}
        </Section>

        {/* 6. Digital Signature */}
        <Section title="Digital Signature" filled={sectionsFilled[5]}>
          <Row label="Signatory Name" value={ds?.signatoryName} />
          <Row label="Designation" value={ds?.designation} />
          <Row label="Date" value={ds?.signatureDate} />
          {ds?.signatureUrl && (
            <div className="vs-row vs-row-full">
              <span className="vs-row-label">Signature Preview</span>
              <img
                src={ds.signatureUrl}
                alt="Digital Signature"
                className="vs-sig-img"
              />
            </div>
          )}
        </Section>
      </div>

      {/* ── Confirmation + submit ── */}
      <form onSubmit={handleSubmit}>
        <div className={`vs-confirm-box${confirmed ? " checked" : ""}`}>
          <label className="vs-confirm-label" htmlFor="vs-confirm">
            <div className="vs-custom-checkbox">
              <input
                id="vs-confirm"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <div className="vs-checkbox-ui">
                {confirmed && (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path
                      d="M1.5 5.5L4 8L9.5 2.5"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="vs-confirm-text">
              I confirm that all information provided is{" "}
              <strong>true, accurate, and complete</strong>. I understand that
              submitting false information may result in rejection or account
              termination.
            </span>
          </label>
        </div>

        {!allComplete && (
          <div className="vs-incomplete-warning">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2L14.5 13.5H1.5L8 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M8 6.5v3M8 11v.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>
              <strong>
                {sectionsFilled.length - completedCount} section(s)
              </strong>{" "}
              are not yet complete. You can still submit, but incomplete
              sections may delay approval.
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !confirmed}
          className={`vs-submit-btn${submitting || !confirmed ? " disabled" : ""}`}
        >
          {submitting ? (
            <>
              <div className="vs-btn-spinner" /> Submitting…
            </>
          ) : (
            <>
              Submit Application
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>
      </form>
    </>
  );
};

export default VerifySubmit;

/* ─── Scoped CSS ─────────────────────────────────────────────────────────── */
const CSS = `
  .vs-page-head {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 12px; margin-bottom: 22px; flex-wrap: wrap;
  }
  .vs-page-title { font-size: 18px; font-weight: 800; color: #111827; letter-spacing: -0.3px; margin: 0 0 3px; }
  .vs-page-sub   { font-size: 13px; color: #6b7280; margin: 0; }

  .vs-completion-badge {
    display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
    background: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 100px;
    font-size: 12.5px; font-weight: 700; color: #c2410c; white-space: nowrap;
  }
  .vs-completion-badge.complete { background: #f0fdf4; border-color: #86efac; color: #166534; }

  .vs-alert {
    display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px;
    border-radius: 10px; font-size: 13.5px; font-weight: 500; line-height: 1.55;
    margin-bottom: 16px; border: 1.5px solid;
  }
  .vs-alert svg { flex-shrink: 0; margin-top: 1px; }
  .vs-alert-error   { background: #fef2f2; border-color: #fca5a5; color: #991b1b; }
  .vs-alert-success { background: #f0fdf4; border-color: #86efac; color: #166534; }

  .vs-sections { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }

  .vs-section { background: #fff; border: 1.5px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
  .vs-section.filled { border-color: #bbf7d0; }
  .vs-section.empty  { border-color: #f3f4f6; background: #fafafa; }

  .vs-section-head { display: flex; align-items: center; gap: 12px; padding: 13px 18px; background: #f9fafb; }
  .vs-section.filled .vs-section-head { background: #f0fdf4; }

  .vs-section-badge {
    width: 30px; height: 30px; border-radius: 50%; background: #d1d5db;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .vs-section-badge.filled { background: #5BB64A; }

  .vs-section-meta { flex: 1; min-width: 0; }
  .vs-section-title   { font-size: 13.5px; font-weight: 800; color: #111827; display: flex; align-items: center; gap: 6px; }
  .vs-section-missing { font-size: 11.5px; color: #9ca3af; margin-top: 2px; font-weight: 500; }

  .vs-section-pill { padding: 3px 12px; border-radius: 100px; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
  .vs-section-pill.filled { background: #dcfce7; color: #166534; }
  .vs-section-pill.empty  { background: #f3f4f6; color: #9ca3af; }

  .vs-section-divider { height: 1px; background: #e5e7eb; }

  /* Data grid */
  .vs-grid { display: grid; grid-template-columns: 1fr 1fr; }

  .vs-row {
    display: flex; flex-direction: column; gap: 3px;
    padding: 11px 18px; border-bottom: 1px solid #f3f4f6;
  }
  /* Remove right border for odd items in 2-col layout (achieved by nth-child even trick) */
  .vs-row:nth-child(odd)  { border-right: 1px solid #f3f4f6; }
  .vs-row-full { grid-column: 1 / -1; border-right: none; }

  /* Remove bottom border on last row(s) */
  .vs-row:last-child,
  .vs-row:nth-last-child(2):not(.vs-row-full) { border-bottom: none; }
  .vs-row-full:last-child { border-bottom: none; }

  .vs-row-label {
    font-size: 10.5px; color: #6b7280; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .vs-row-value { font-size: 13.5px; color: #111827; font-weight: 600; word-break: break-word; line-height: 1.45; }
  .vs-empty { color: #d1d5db; font-weight: 400; }

  .vs-sig-img {
    max-width: 200px; max-height: 70px; border: 1.5px solid #e5e7eb;
    border-radius: 8px; padding: 6px; background: #fff; margin-top: 4px; object-fit: contain;
  }

  /* Confirm */
  .vs-confirm-box {
    background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 12px;
    padding: 16px 18px; margin-bottom: 12px; transition: all 0.2s;
  }
  .vs-confirm-box.checked { background: #f0fdf4; border-color: #86efac; }
  .vs-confirm-label { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; }
  .vs-custom-checkbox { position: relative; flex-shrink: 0; margin-top: 1px; }
  .vs-custom-checkbox input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }
  .vs-checkbox-ui {
    width: 19px; height: 19px; border: 2px solid #d1d5db; border-radius: 5px;
    background: #fff; display: flex; align-items: center; justify-content: center; transition: all 0.18s;
  }
  .vs-confirm-box.checked .vs-checkbox-ui { background: #5BB64A; border-color: #5BB64A; }
  .vs-confirm-text { font-size: 13.5px; color: #374151; line-height: 1.65; font-weight: 500; }

  .vs-incomplete-warning {
    display: flex; align-items: flex-start; gap: 10px; background: #fff7ed;
    border: 1.5px solid #fed7aa; border-radius: 10px; padding: 12px 16px;
    font-size: 13px; color: #92400e; margin-bottom: 14px; line-height: 1.55;
  }
  .vs-incomplete-warning svg { flex-shrink: 0; margin-top: 1px; }

  .vs-submit-btn {
    width: 100%; padding: 13px 20px; border-radius: 10px; border: none; background: #5BB64A;
    color: #fff; font-size: 14.5px; font-weight: 800; font-family: inherit; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow: 0 4px 16px rgba(91,182,74,0.35); transition: all 0.18s;
  }
  .vs-submit-btn:hover:not(.disabled) { background: #4aa33c; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(91,182,74,0.42); }
  .vs-submit-btn.disabled { background: #d1d5db; color: #9ca3af; box-shadow: none; cursor: not-allowed; }

  .vs-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 14px; padding: 48px 24px; color: #6b7280;
    font-size: 14px; font-weight: 500;
  }
  .vs-spinner, .vs-btn-spinner {
    border: 2.5px solid #e5e7eb; border-top-color: #5BB64A;
    border-radius: 50%; animation: vsSpin 0.7s linear infinite;
  }
  .vs-spinner     { width: 32px; height: 32px; }
  .vs-btn-spinner { width: 16px; height: 16px; flex-shrink: 0; border-width: 2px; }
  @keyframes vsSpin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .vs-grid { grid-template-columns: 1fr; }
    .vs-row  { border-right: none !important; }
    .vs-row-full { grid-column: 1; }
    .vs-section-head { padding: 12px 14px; }
    .vs-row { padding: 10px 14px; }
    .vs-page-head { flex-direction: column; gap: 8px; }
  }
`;
