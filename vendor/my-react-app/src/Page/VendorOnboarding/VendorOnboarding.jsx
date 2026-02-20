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
import TopProgressStepper from "../VendorOnboarding/TopProgressStepper";

const VendorOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [isStepValid, setIsStepValid] = useState(false);

  const steps = [
    "Business details",
    "Seller details",
    "Brand details",
    "Bank details",
    "Shipping locations",
    "Digital signature",
    "Verify & submit",
  ];

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
          title: "Application Approved! ",
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
    if (currentStep < steps.length - 1 && isStepValid) {
      setCurrentStep(currentStep + 1);
      setIsStepValid(false);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BusinessDetails setIsStepValid={setIsStepValid} />;
      case 1:
        return <SellerDetails setIsStepValid={setIsStepValid} />;
      case 2:
        return <BrandDetails setIsStepValid={setIsStepValid} />;
      case 3:
        return <BankDetails setIsStepValid={setIsStepValid} />;
      case 4:
        return <ShippingLocations setIsStepValid={setIsStepValid} />;
      case 5:
        return <DigitalSignature setIsStepValid={setIsStepValid} />;
      case 6:
        return <VerifySubmit setIsStepValid={setIsStepValid} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen mt-10 bg-white flex font-sans">
      {/* Desktop Sidebar */}
      {/* <div className="hidden md:flex flex-col w-80 bg-gradient-to-b from-[#299E60] to-[#14452F] text-white shadow-sm fixed left-0 top-0 h-screen"> */}
      {/* Fixed Header Section - No Scroll */}
      {/* <div className="p-8 space-y-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-white">seller hub</h1>
          <p className="text-yellow-300 text-4xl glow-text font-bold glow-text-strong">
            by 3arrow
          </p>
        </div> */}

      {/* Fixed Intro Content - No Scroll */}
      {/* <div className="px-6 py-8 space-y-6 flex-shrink-0"> */}
      {/* Intro Section */}
      {/* <div>
            <h2 className="text-2xl font-bold mb-1">
              Welcome to 3arrow Seller Hub
            </h2>
            <p className="text-sm text-green-100 leading-relaxed">
              Join a fast-growing marketplace designed to empower sellers.
              3arrow provides the tools, logistics, and support you need to
              expand your business and reach customers effortlessly.
            </p>
          </div> */}

      {/* Compliance Notice */}
      {/* <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4">
            <p className="text-xs text-red-200 leading-relaxed">
              ⚠️ Ensure that all business, tax, and banking details are
              accurate. Incorrect information may delay verification, payments,
              or approval.
            </p>
          </div>
        </div> */}

      {/* Scrollable Steps Section */}

      {/* <div className="px-6 py-8 flex-1 overflow-y-auto">
          <SidebarStepper steps={steps} currentStep={currentStep} />
        </div>
      </div> */}

      {/* Main Content Area */}
      <div className="flex-1  flex flex-col h-screen bg-gray-50">
        {/* Mobile Header */}
        {/* <div className="md:hidden bg-gradient-to-b from-[#299E60] to-[#14452F] text-white p-5 shadow-sm">
          <h1 className="text-xl font-bold text-white">seller hub</h1>
          <p className="text-yellow-300 text-sm">by 3arrow</p>
        </div> */}

        <div className="md:hidden bg-white shadow-sm">
          <MobileStepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Fixed Top Progress Stepper */}
        <div className="bg-white shadow-sm px-6 md:px-12 py-6 flex-shrink-0">
          <div className="max-w-5xl mx-auto">
            <TopProgressStepper steps={steps} currentStep={currentStep} />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Status Alert */}
            {!loadingStatus && statusInfo && (
              <div
                className={`mb-8 p-6 rounded-lg border ${
                  statusInfo.type === "warning"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                    : statusInfo.type === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {statusInfo.title}
                    </h3>
                    <p className="text-sm opacity-90">{statusInfo.message}</p>
                  </div>
                  <StatusBadge status={vendor.status} />
                </div>
              </div>
            )}

            {/* Status Bar */}
            {!loadingStatus && vendor && (
              <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Current Status:
                  <span className="ml-2 font-semibold text-gray-900">
                    {vendor.status.toUpperCase()}
                  </span>
                </span>
                <StatusBadge status={vendor.status} />
              </div>
            )}

            {isEditingDisabled && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                <p className="text-sm">
                  ℹ️ Your application status is{" "}
                  <span className="font-semibold">'{vendor.status}'</span>. You
                  cannot edit your profile at this time.
                </p>
              </div>
            )}

            {!isEditingDisabled && <>{renderStepContent()}</>}

            {isEditingDisabled && (
              <div className="p-8 bg-white rounded-lg border border-gray-200 text-center">
                <p className="text-gray-600 mb-6">
                  {vendor.status === "approved"
                    ? "Your vendor profile is complete and approved!"
                    : "Please wait for admin review to complete."}
                </p>
                <a
                  href="/dashboard"
                  className="inline-block px-8 py-3 bg-[#299E60] hover:bg-[#207a4a] text-white rounded-lg font-semibold shadow-sm transition-all duration-200"
                >
                  Go to Dashboard
                </a>
              </div>
            )}

            {/* Spacer for content so it doesn't hide under fixed footer */}
            {!isEditingDisabled && <div className="h-32"></div>}
          </div>
        </div>
      </div>

      {/* Fixed Footer - Navigation Buttons */}
      {!isEditingDisabled && (
        <div className="fixed bottom-0 left-0 right-0  bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-5xl mx-auto px-6 md:px-12 py-6 flex justify-between items-center gap-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                currentStep === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              ← Previous
            </button>

            {saving && (
              <div className="flex-1 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-center text-sm font-medium">
                Saving your progress...
              </div>
            )}

            {!saving && <div className="flex-1"></div>}

            {currentStep < steps.length - 1 && (
              <button
                onClick={nextStep}
                disabled={!isStepValid}
                className={`px-8 py-3 rounded-lg font-semibold text-white shadow-sm transition-all duration-200 ${
                  isStepValid
                    ? "bg-[#299E60] hover:bg-[#207a4a] cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed opacity-60"
                }`}
              >
                Next →
              </button>
            )}

            {/* {currentStep === steps.length - 1 && (
              <button className="px-8 py-3 rounded-lg font-semibold bg-[#299E60] hover:bg-[#207a4a] text-white shadow-sm transition-all duration-200">
                Submit
              </button>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOnboarding;
