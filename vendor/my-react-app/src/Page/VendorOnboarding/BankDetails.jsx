import React, { useState, useEffect, useRef } from "react";
import { saveVendorStep, getMyVendor } from "../../services/vendorService";

const BankDetails = ({ setIsStepValid }) => {
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branch: "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  /* ── Validation ── */
  const isValid = () =>
    formData.accountHolderName.trim() !== "" &&
    formData.accountNumber.trim() !== "" &&
    formData.ifscCode.trim() !== "" &&
    formData.bankName.trim() !== "" &&
    formData.branch.trim() !== "";

  useEffect(() => {
    setIsStepValid?.(isValid());
  }, [formData]);

  /* ── Load existing data ── */
  useEffect(() => {
    (async () => {
      try {
        const vendor = await getMyVendor();
        if (vendor?.bankDetails) {
          setFormData((prev) => ({ ...prev, ...vendor.bankDetails }));
        }
      } catch (_) {}
    })();
  }, []);

  /* ── Auto-save (debounced 1.5s) ── */
  useEffect(() => {
    if (!formData.accountHolderName && !formData.accountNumber) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(autoSave, 1500);
    return () => clearTimeout(debounceRef.current);
  }, [formData]);

  const autoSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      setError("");
      await saveVendorStep("bankDetails", formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // IFSC always uppercase
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ifscCode" ? value.toUpperCase() : value,
    }));
  };

  const required = (field) => (!formData[field] ? " bk-input-warn" : "");

  return (
    <>
      <style>{CSS}</style>

      {/* Header */}
      <div className="bk-header">
        <div>
          <h2 className="bk-title">Bank Details</h2>
          <p className="bk-sub">
            Enter your bank account details for settlement payments.
          </p>
        </div>
        <div className="bk-save-indicator">
          {saving && (
            <span className="bk-saving">
              <span className="bk-dot-spin" /> Saving…
            </span>
          )}
          {saved && !saving && (
            <span className="bk-saved">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M2 6.5L5 9.5L11 3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Security note */}
      <div className="bk-security-note">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path
            d="M7.5 1L2 3.5V7c0 3.2 2.5 5.5 5.5 6.5C10.5 12.5 13 10.2 13 7V3.5L7.5 1Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M5 7.5l2 2 3-3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Your banking information is encrypted and stored securely.
      </div>

      {/* Error */}
      {error && <div className="bk-alert">{error}</div>}

      {/* Fields */}
      <div className="bk-grid">
        <div className="bk-field">
          <label className="bk-label" htmlFor="accountHolderName">
            Account Holder Name <span className="bk-req">*</span>
          </label>
          <input
            id="accountHolderName"
            type="text"
            name="accountHolderName"
            value={formData.accountHolderName}
            onChange={handleChange}
            placeholder="As per bank records"
            className={`bk-input${required("accountHolderName")}`}
          />
        </div>

        <div className="bk-field">
          <label className="bk-label" htmlFor="bankName">
            Bank Name <span className="bk-req">*</span>
          </label>
          <input
            id="bankName"
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            placeholder="e.g. State Bank of India"
            className={`bk-input${required("bankName")}`}
          />
        </div>

        <div className="bk-field">
          <label className="bk-label" htmlFor="accountNumber">
            Account Number <span className="bk-req">*</span>
          </label>
          <input
            id="accountNumber"
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            placeholder="Enter account number"
            className={`bk-input${required("accountNumber")}`}
            inputMode="numeric"
          />
        </div>

        <div className="bk-field">
          <label className="bk-label" htmlFor="ifscCode">
            IFSC Code <span className="bk-req">*</span>
          </label>
          <input
            id="ifscCode"
            type="text"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleChange}
            placeholder="e.g. SBIN0001234"
            maxLength={11}
            className={`bk-input bk-mono${required("ifscCode")}`}
          />
          <span className="bk-hint-neutral">
            11-character code printed on your cheque
          </span>
        </div>

        <div className="bk-field bk-field-full">
          <label className="bk-label" htmlFor="branch">
            Branch <span className="bk-req">*</span>
          </label>
          <input
            id="branch"
            type="text"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            placeholder="e.g. Connaught Place, New Delhi"
            className={`bk-input${required("branch")}`}
          />
        </div>
      </div>

      {/* Completion hint */}
      {!isValid() && (
        <div className="bk-required-note">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle
              cx="7"
              cy="7"
              r="6"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M7 4.5v3M7 9v.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          All five fields are required to proceed to the next step.
        </div>
      )}
    </>
  );
};

export default BankDetails;

const CSS = `
  .bk-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 12px; margin-bottom: 14px; flex-wrap: wrap;
  }
  .bk-title { font-size: 17px; font-weight: 800; color: #111827; letter-spacing: -0.3px; margin: 0 0 3px; }
  .bk-sub   { font-size: 13px; color: #6b7280; margin: 0; }

  .bk-save-indicator { display: flex; align-items: center; }
  .bk-saving {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12.5px; color: #6b7280; font-weight: 600;
  }
  .bk-saved {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12.5px; color: #166534; font-weight: 700;
    background: #f0fdf4; border: 1.5px solid #86efac;
    padding: 4px 10px; border-radius: 100px;
  }
  .bk-dot-spin {
    width: 8px; height: 8px; border-radius: 50%;
    border: 2px solid #d1d5db; border-top-color: #5BB64A;
    display: inline-block; animation: bkSpin 0.7s linear infinite;
  }
  @keyframes bkSpin { to { transform: rotate(360deg); } }

  .bk-security-note {
    display: flex; align-items: center; gap: 8px;
    background: #f0fdf4; border: 1.5px solid #bbf7d0;
    border-radius: 9px; padding: 10px 14px; font-size: 12.5px;
    color: #166534; font-weight: 600; margin-bottom: 18px;
  }
  .bk-security-note svg { flex-shrink: 0; }

  .bk-alert {
    background: #fef2f2; border: 1.5px solid #fca5a5; color: #991b1b;
    border-radius: 10px; padding: 11px 16px; font-size: 13px; font-weight: 500; margin-bottom: 16px;
  }

  .bk-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 24px; margin-bottom: 16px; }
  .bk-field { display: flex; flex-direction: column; gap: 6px; }
  .bk-field-full { grid-column: 1 / -1; }

  .bk-label {
    font-size: 13px; font-weight: 700; color: #374151;
    display: flex; align-items: center; gap: 6px;
  }
  .bk-req { color: #ef4444; font-size: 13px; font-weight: 700; }

  .bk-input {
    width: 100%; padding: 10px 13px;
    font-size: 13.5px; font-family: inherit; font-weight: 500;
    color: #111827; background: #fff;
    border: 1.5px solid #d1d5db; border-radius: 9px;
    outline: none; -webkit-appearance: none; appearance: none;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .bk-input:focus {
    border-color: #5BB64A;
    box-shadow: 0 0 0 3.5px rgba(91,182,74,0.14), 0 1px 2px rgba(0,0,0,0.04);
  }
  .bk-input:hover:not(:focus):not(:disabled) { border-color: #9ca3af; }
  .bk-input::placeholder { color: #b0b7c3; font-weight: 400; }
  .bk-input-warn { border-color: #fca5a5 !important; }
  .bk-mono { font-family: 'Courier New', monospace; font-weight: 700; letter-spacing: 1px; font-size: 13px; }

  .bk-hint-neutral { font-size: 11.5px; color: #9ca3af; font-weight: 500; margin-top: -2px; }

  .bk-required-note {
    display: flex; align-items: center; gap: 8px;
    background: #eff6ff; border: 1.5px solid #bfdbfe;
    border-radius: 9px; padding: 11px 15px; font-size: 13px; color: #1d4ed8; font-weight: 500;
  }
  .bk-required-note svg { flex-shrink: 0; }

  @media (max-width: 600px) {
    .bk-grid { grid-template-columns: 1fr; }
    .bk-field-full { grid-column: 1; }
    .bk-header { flex-direction: column; gap: 8px; }
  }
`;
