import React from "react";

const TopProgressStepper = ({ steps, currentStep }) => {
  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 z-0 rounded-full"></div>

        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center w-full text-center"
            >
              {/* Circle */}
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full border-4 text-sm font-semibold transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-[#299E60] border-[#299E60] text-white"
                      : isActive
                        ? "bg-white border-[#299E60] text-[#299E60]"
                        : "bg-white border-gray-300 text-gray-400"
                  }
                `}
              >
                {index + 1}
              </div>

              {/* Label */}
              <p
                className={`mt-3 text-xs md:text-sm font-medium px-2
                  ${isCompleted || isActive ? "text-gray-800" : "text-gray-400"}
                `}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopProgressStepper;
