import React, { useState } from "react";
import SidebarStepper from "../VendorOnboarding/SidebarStepper";
import MobileStepper from "../VendorOnboarding/MobileStepper";
import BusinessDetails from "../VendorOnboarding/BusinessDetails";
import SellerDetails from "../VendorOnboarding/SellerDetails";
import BrandDetails from "../VendorOnboarding/BrandDetails";
import BankDetails from "../VendorOnboarding/BankDetails";
import ShippingLocations from "../VendorOnboarding/ShippingLocations";
import DigitalSignature from "../VendorOnboarding/DigitalSignature";
import VerifySubmit from "../VendorOnboarding/VerifySubmit";

const VendorOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Business details",
    "Seller details",
    "Brand details",
    "Bank details",
    "Shipping locations",
    "Digital signature",
    "Verify & submit",
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
          {renderStepContent()}

          {/* Buttons */}
          <div className="flex justify-between mt-10">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 border rounded-lg"
              >
                Back
              </button>
            )}

            {currentStep < steps.length - 1 && (
              <button
                onClick={nextStep}
                className="bg-[#299E60] text-white px-6 py-3 rounded-lg"
              >
                Save & Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorOnboarding;
