import React, { useState } from "react";

const VerifySubmit = () => {
  const [formData, setFormData] = useState({
    confirmInformation: false,
    finalSubmission: true,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, checked } = e.target;

    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.confirmInformation) {
      setError(
        "Please confirm that all information is correct before submitting.",
      );
      return;
    }

    setError("");

    console.log("Final Submission Data:", formData);

    // 👉 Call your final onboarding API here
    // Example:
    // await axios.post("/api/vendor/submit", fullVendorData)

    alert("Application submitted successfully!");
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Verify & Submit</h1>
      <p className="text-gray-500 mb-8">
        Please review all your details before final submission.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="bg-gray-50 p-6 rounded-lg border mb-6">
          <p className="text-gray-700">
            Make sure all the information provided in previous steps is
            accurate. Once submitted, changes may require admin approval.
          </p>
        </div>

        {/* Confirm Checkbox */}
        <div className="flex items-start gap-3 mb-6">
          <input
            type="checkbox"
            name="confirmInformation"
            checked={formData.confirmInformation}
            onChange={handleChange}
            className="mt-1"
          />
          <label className="text-sm text-gray-700">
            I confirm that all information provided is true and correct.
          </label>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg"
        >
          Final Submit
        </button>
      </form>
    </>
  );
};

export default VerifySubmit;
