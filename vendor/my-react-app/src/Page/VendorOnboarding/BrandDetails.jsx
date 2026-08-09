import React, { useState, useEffect, useRef } from "react";
import { saveVendorStep, getMyVendor } from "../../services/vendorService";

const BrandDetails = ({ setIsStepValid }) => {
  const [formData, setFormData] = useState({
    brandName: "",
    brandType: "",
    trademarkNumber: "",
    brandWebsite: "", // ← key kept as brandWebsite (matches VerifySubmit)
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef(null);

  /* ── Validation ── */
  const isValid = () =>
    formData.brandName.trim() !== "" && formData.brandType.trim() !== "";

  useEffect(() => {
    setIsStepValid?.(isValid());
  }, [formData]);

  /* ── Load existing data ── */
  useEffect(() => {
    (async () => {
      try {
        const vendor = await getMyVendor();
        if (vendor?.brandDetails) {
          setFormData((prev) => ({ ...prev, ...vendor.brandDetails }));
        }
      } catch (_) {}
    })();
  }, []);

  /* ── Auto-save (debounced 1.5s) ── */
  useEffect(() => {
    if (!formData.brandName && !formData.brandType) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(autoSave, 1500);
    return () => clearTimeout(debounceRef.current);
  }, [formData]);

  const autoSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      setError("");
      await saveVendorStep("brandDetails", formData);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Header */}
      <div className="bd-header">
        <div>
          <h2 className="bd-title">Brand Details</h2>
          <p className="bd-sub">Enter your brand and trademark information.</p>
        </div>
        <div className="bd-save-indicator">
          {saving && (
            <span className="bd-saving">
              <span className="bd-dot-spin" /> Saving…
            </span>
          )}
          {saved && !saving && (
            <span className="bd-saved">
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

      {/* Error */}
      {error && <div className="bd-alert">{error}</div>}

      {/* Fields */}
      <div className="bd-grid">
        <div className="bd-field">
          <label className="bd-label" htmlFor="brandName">
            Brand Name <span className="bd-req">*</span>
          </label>
          <input
            id="brandName"
            type="text"
            name="brandName"
            value={formData.brandName}
            onChange={handleChange}
            placeholder="e.g. Nike, Apple"
            className={`bd-input${!formData.brandName && formData.brandType ? " bd-input-warn" : ""}`}
          />
          {!formData.brandName && (
            <span className="bd-hint">Required to proceed</span>
          )}
        </div>

        <div className="bd-field">
          <label className="bd-label" htmlFor="brandType">
            Brand Type <span className="bd-req">*</span>
          </label>
          <select
            id="brandType"
            name="brandType"
            value={formData.brandType}
            onChange={handleChange}
            className="bd-input"
          >
            <option value="">Select type…</option>
            <option value="Manufacturer">Manufacturer</option>
            <option value="Distributor">Distributor</option>
            <option value="Retailer">Retailer</option>
            <option value="Reseller">Reseller</option>
            <option value="Importer">Importer</option>
            <option value="Other">Other</option>
          </select>
          {!formData.brandType && (
            <span className="bd-hint">Required to proceed</span>
          )}
        </div>

        <div className="bd-field">
          <label className="bd-label" htmlFor="trademarkNumber">
            Trademark Number
            <span className="bd-optional">Optional</span>
          </label>
          <input
            id="trademarkNumber"
            type="text"
            name="trademarkNumber"
            value={formData.trademarkNumber}
            onChange={handleChange}
            placeholder="e.g. TM-1234567"
            className="bd-input"
          />
        </div>

        <div className="bd-field">
          <label className="bd-label" htmlFor="brandWebsite">
            Brand Website
            <span className="bd-optional">Optional</span>
          </label>
          <div className="bd-input-wrap">
            <span className="bd-prefix">🌐</span>
            <input
              id="brandWebsite"
              type="url"
              name="brandWebsite"
              value={formData.brandWebsite}
              onChange={handleChange}
              placeholder="https://yourbrand.com"
              className="bd-input bd-input-prefixed"
            />
          </div>
        </div>
      </div>

      {/* Completion hint */}
      {!isValid() && (
        <div className="bd-required-note">
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
          Fill in <strong>Brand Name</strong> and <strong>Brand Type</strong> to
          continue.
        </div>
      )}
    </>
  );
};

export default BrandDetails;

const CSS = `
  .bd-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 12px; margin-bottom: 22px; flex-wrap: wrap;
  }
  .bd-title { font-size: 17px; font-weight: 800; color: #111827; letter-spacing: -0.3px; margin: 0 0 3px; }
  .bd-sub   { font-size: 13px; color: #6b7280; margin: 0; }

  .bd-save-indicator { display: flex; align-items: center; }
  .bd-saving {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12.5px; color: #6b7280; font-weight: 600;
  }
  .bd-saved {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12.5px; color: #166534; font-weight: 700;
    background: #f0fdf4; border: 1.5px solid #86efac;
    padding: 4px 10px; border-radius: 100px;
  }
  .bd-dot-spin {
    width: 8px; height: 8px; border-radius: 50%;
    border: 2px solid #d1d5db; border-top-color: #5BB64A;
    display: inline-block;
    animation: bdSpin 0.7s linear infinite;
  }
  @keyframes bdSpin { to { transform: rotate(360deg); } }

  .bd-alert {
    background: #fef2f2; border: 1.5px solid #fca5a5; color: #991b1b;
    border-radius: 10px; padding: 11px 16px; font-size: 13px;
    font-weight: 500; margin-bottom: 16px;
  }

  .bd-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px 24px;
    margin-bottom: 16px;
  }

  .bd-field { display: flex; flex-direction: column; gap: 6px; }

  .bd-label {
    font-size: 13px; font-weight: 700; color: #374151;
    display: flex; align-items: center; gap: 6px;
  }
  .bd-req { color: #ef4444; font-size: 13px; font-weight: 700; }
  .bd-optional {
    font-size: 11px; color: #9ca3af; font-weight: 500;
    background: #f3f4f6; padding: 2px 7px; border-radius: 4px;
  }

  .bd-input {
    width: 100%; padding: 10px 13px;
    font-size: 13.5px; font-family: inherit; font-weight: 500;
    color: #111827; background: #fff;
    border: 1.5px solid #d1d5db; border-radius: 9px;
    outline: none; -webkit-appearance: none; appearance: none;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    transition: border-color 0.18s, box-shadow 0.18s;
    background-image: none;
  }
  .bd-input:focus {
    border-color: #5BB64A;
    box-shadow: 0 0 0 3.5px rgba(91,182,74,0.14), 0 1px 2px rgba(0,0,0,0.04);
  }
  .bd-input:hover:not(:focus):not(:disabled) { border-color: #9ca3af; }
  .bd-input::placeholder { color: #b0b7c3; font-weight: 400; }

  /* Select arrow */
  select.bd-input {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
    cursor: pointer;
  }
  select.bd-input:focus {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%235BB64A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  }

  /* Website prefix */
  .bd-input-wrap { position: relative; }
  .bd-prefix {
    position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
    font-size: 14px; pointer-events: none; line-height: 1;
  }
  .bd-input-prefixed { padding-left: 34px; }

  .bd-hint { font-size: 11.5px; color: #ef4444; font-weight: 600; margin-top: -2px; }
  .bd-input-warn { border-color: #fca5a5; }

  .bd-required-note {
    display: flex; align-items: center; gap: 8px;
    background: #eff6ff; border: 1.5px solid #bfdbfe;
    border-radius: 9px; padding: 11px 15px;
    font-size: 13px; color: #1d4ed8; font-weight: 500;
  }
  .bd-required-note svg { flex-shrink: 0; }

  @media (max-width: 600px) {
    .bd-grid { grid-template-columns: 1fr; }
    .bd-header { flex-direction: column; gap: 8px; }
  }
`;
