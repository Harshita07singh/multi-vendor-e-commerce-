import React, { useState, useEffect } from "react";
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

const VendorOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const steps = [
    "Business details",
    "Seller details",
    "Brand details",
    "Bank details",
    "Shipping locations",
    "Digital signature",
    "Verify & submit",
  ];

  // Fetch vendor status on mount
  useEffect(() => {
    fetchVendorStatus();
  }, []);

  const fetchVendorStatus = async () => {
    try {
      setLoadingStatus(true);
      const response = await vendorAPI.getMyVendor();
      setVendor(response);
    } catch (err) {
      console.error("Failed to fetch vendor status:", err);
      setVendor(null);
    } finally {
      setLoadingStatus(false);
    }
  };

  const getStatusMessage = () => {
    if (!vendor) return null;

    switch (vendor.status) {
      case "pending":
        return {
          type: "warning",
          title: "Application Under Review",
          message:
            "Your application is currently under review by our admin team. You cannot make changes at this time.",
        };
      case "approved":
        return {
          type: "success",
          title: "Application Approved! 🎉",
          message:
            "Congratulations! Your vendor application has been approved. Your profile is now complete.",
        };
      case "rejected":
        return {
          type: "error",
          title: "Application Rejected",
          message: vendor.adminRemark
            ? `Your application was rejected. Reason: ${vendor.adminRemark}. Please update your information and resubmit.`
            : "Your application was rejected. Please update your information and resubmit.",
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusMessage();
  const isEditingDisabled =
    vendor && (vendor.status === "pending" || vendor.status === "approved");

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // 👇 STEP CONTENT SWITCHER
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BusinessDetails />;
      case 1:
        return <SellerDetails />;
      case 2:
        return <BrandDetails />;
      case 3:
        return <BankDetails />;
      case 4:
        return <ShippingLocations />;
      case 5:
        return <DigitalSignature />;
      case 6:
        return <VerifySubmit />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 bg-[#299E60] text-white">
        <div className="p-6 font-bold text-2xl">
          seller hub <span className="text-yellow-400">by 3arrow</span>
        </div>

        <div className="px-6 mt-6">
          <SidebarStepper steps={steps} currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white">
        {/* Mobile Header */}
        <div className="md:hidden bg-yellow-400 p-4 font-bold text-lg">
          seller hub by 3arrow
        </div>

        {/* Mobile Stepper */}
        <div className="md:hidden">
          <MobileStepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="p-6 md:p-10 max-w-4xl mx-auto">
          {/* Status Alert */}
          {!loadingStatus && statusInfo && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                statusInfo.type === "warning"
                  ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                  : statusInfo.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{statusInfo.title}</h3>
                  <p className="text-sm">{statusInfo.message}</p>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={vendor.status} />
                </div>
              </div>
            </div>
          )}

          {/* Status Bar - Shows current status */}
          {!loadingStatus && vendor && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Current Status:{" "}
                  <span className="font-semibold">
                    {vendor.status.toUpperCase()}
                  </span>
                </span>
                <StatusBadge status={vendor.status} />
              </div>
            </div>
          )}

          {isEditingDisabled && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
              <p className="text-sm">
                ℹ️ Your application status is{" "}
                <span className="font-semibold">'{vendor.status}'</span>. You
                cannot edit your profile at this time.
              </p>
            </div>
          )}

          {!isEditingDisabled && (
            <>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4 mt-12">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`px-8 py-3 rounded-lg font-semibold ${
                    currentStep === 0
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-gray-500 hover:bg-gray-600 text-white"
                  }`}
                >
                  ← Previous
                </button>

                {currentStep < steps.length - 1 && (
                  <button
                    onClick={nextStep}
                    className="px-8 py-3 rounded-lg font-semibold bg-[#299E60] hover:bg-[#207a4a] text-white"
                  >
                    Next →
                  </button>
                )}
              </div>

              {/* Save Indicator */}
              {saving && (
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-center">
                  Saving your progress...
                </div>
              )}
            </>
          )}

          {isEditingDisabled && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600 mb-4">
                {vendor.status === "approved"
                  ? "Your vendor profile is complete and approved!"
                  : "Please wait for admin review to complete."}
              </p>
              <a
                href="/dashboard"
                className="inline-block px-6 py-2 bg-[#299E60] hover:bg-[#207a4a] text-white rounded-lg font-semibold transition"
              >
                Go to Dashboard
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorOnboarding;
