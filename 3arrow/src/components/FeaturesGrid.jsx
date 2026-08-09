import React from "react";

export default function FeaturesGrid({ features }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 mb-12 sm:mb-16 lg:mb-20">
      {features.map((feature, index) => (
        <div
          key={index}
          className="bg-[#CEF2DF] rounded-xl sm:rounded-3xl p-4 sm:p-6 flex flex-col items-center text-center"
        >
          {/* Icon */}
          <div className="w-10 h-10 sm:w-16 sm:h-16 bg-[#34A853] rounded-full flex items-center justify-center mb-3">
            {feature.icon}
          </div>

          {/* Text */}
          <h3 className="text-sm sm:text-xl font-semibold text-gray-900 mb-1">
            {feature.title}
          </h3>

          <p className="text-[10px] sm:text-sm text-gray-700">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
