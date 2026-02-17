import React, { useState } from "react";

const BankDetails = () => {
  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    branchName: "",
    cancelledCheque: null,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "cancelledCheque") {
      setFormData({
        ...formData,
        cancelledCheque: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.accountNumber !== formData.confirmAccountNumber) {
      setError("Account numbers do not match");
      return;
    }

    setError("");
    console.log("Bank Details Submitted:", formData);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Bank details</h1>
      <p className="text-gray-500 mb-8">
        Enter your bank account details for settlement
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Holder Name */}
          <div>
            <label className="font-semibold block mb-2">
              Account Holder Name *
            </label>
            <input
              type="text"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="font-semibold block mb-2">Bank Name *</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="font-semibold block mb-2">Account Number *</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Confirm Account Number */}
          <div>
            <label className="font-semibold block mb-2">
              Confirm Account Number *
            </label>
            <input
              type="text"
              name="confirmAccountNumber"
              value={formData.confirmAccountNumber}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* IFSC Code */}
          <div>
            <label className="font-semibold block mb-2">IFSC Code *</label>
            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 uppercase"
            />
          </div>

          {/* Branch Name */}
          <div>
            <label className="font-semibold block mb-2">Branch Name *</label>
            <input
              type="text"
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {/* Cancelled Cheque Upload */}
          <div className="md:col-span-2">
            <label className="font-semibold block mb-2">
              Upload Cancelled Cheque *
            </label>
            <input
              type="file"
              name="cancelledCheque"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </>
  );
};

export default BankDetails;
