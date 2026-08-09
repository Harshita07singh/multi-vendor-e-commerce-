

import React from 'react';

export default function NewsletterBanner({ 
  title = "Don't Miss Out",
  subtitle1 = "on Grocery",
  subtitle2 = "Deals",
  description = "SING UP FOR THE UPDATE NEWSLETTER",
  bannerImage,
  bgColor = "#202341"
}) {
  return (
    <div 
      className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden min-h-[200px] sm:min-h-[280px] lg:min-h-[320px] flex items-center"
      style={{ backgroundColor: bgColor }}
    >
      <div className="relative z-10 max-w-full lg:max-w-2xl">
        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-1 sm:mb-3">
          {title}
        </h2>
        <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-0.5 sm:mb-2">
          {subtitle1}
        </h3>
        <h3 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3 sm:mb-6">
          {subtitle2}
        </h3>
        <p className="text-[10px] sm:text-base md:text-lg text-white mb-3 sm:mb-6 tracking-wide font-medium">
          {description}
        </p>
        
        <div className="relative max-w-full sm:max-w-xl lg:max-w-2xl">
          <input
            type="email"
            placeholder="Your email address..."
            className="w-full pl-4 sm:pl-6 md:pl-8 pr-28 sm:pr-36 md:pr-40 py-2 sm:py-4 md:py-5 rounded-full bg-transparent border-2 border-white/30 text-white placeholder-gray-400 text-xs sm:text-base focus:outline-none focus:border-white/50 transition-colors"
          />
          <button className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 px-4 sm:px-8 md:px-10 py-1.5 sm:py-2.5 md:py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full text-xs sm:text-base transition-colors whitespace-nowrap">
            Subscribe
          </button>
        </div>
      </div>

      {bannerImage && (
        <>
          <div className="hidden lg:block absolute right-8 xl:right-12 bottom-0 w-[350px] xl:w-[420px] h-[280px] xl:h-[320px]">
            <img 
              src={bannerImage} 
              alt="Banner"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden md:block lg:hidden absolute right-4 bottom-0 w-[300px] h-[230px]">
            <img 
              src={bannerImage} 
              alt="Banner"
              className="w-full h-full object-contain"
            />
          </div>
        </>
      )}
    </div>
  );
}