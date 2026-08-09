import React from "react";
import FeaturesGrid from "./FeaturesGrid";
import NewsletterBanner from "./NewsletterBanner";
import Banner from "../assets/Banner.png";

export default function MarketProSections() {
  const features = [
    {
      title: "Free Shipping",
      description: "Free shipping all over the US",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-6 h-6 sm:w-8 sm:h-8 fill-white"
        >
          <path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m1.5-9l1.96 2.5H17V9.5m-11 9A1.5 1.5 0 0 1 4.5 17A1.5 1.5 0 0 1 6 15.5A1.5 1.5 0 0 1 7.5 17A1.5 1.5 0 0 1 6 18.5M20 8h-3V4H3c-1.11 0-2 .89-2 2v11h2a3 3 0 0 0 3 3a3 3 0 0 0 3-3h6a3 3 0 0 0 3 3a3 3 0 0 0 3-3h2v-5l-3-4Z" />
        </svg>
      ),
    },
    {
      title: "100% Satisfaction",
      description: "Free shipping all over the US",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-6 h-6 sm:w-8 sm:h-8 fill-white"
        >
          <path d="M23 12l-2.44-2.79l.34-3.69l-3.61-.82L15.4 1.5L12 2.96L8.6 1.5L6.71 4.69L3.1 5.5l.34 3.7L1 12l2.44 2.79l-.34 3.7l3.61.82L8.6 22.5l3.4-1.47l3.4 1.46l1.89-3.19l3.61-.82l-.34-3.69L23 12m-12.91 4.72l-3.8-3.81l1.48-1.48l2.32 2.33l5.85-5.87l1.48 1.48l-7.33 7.35z" />
        </svg>
      ),
    },
    {
      title: "Secure Payments",
      description: "Free shipping all over the US",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-6 h-6 sm:w-8 sm:h-8 fill-white"
        >
          <path d="M20 8h-3V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2M9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6m9 14H6V10h12v10m-6-3c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2" />
        </svg>
      ),
    },
    {
      title: "24/7 Support",
      description: "Free shipping all over the US",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-6 h-6 sm:w-8 sm:h-8 fill-white"
        >
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5c0-.39-.15-.74-.39-1.01c-.23-.26-.38-.61-.38-.99c0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5c0-4.42-4.03-8-9-8m-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9S8 9.67 8 10.5S7.33 12 6.5 12m3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8m5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8m3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-9xl mx-auto p-4 sm:p-5">
      <FeaturesGrid features={features} />
      <NewsletterBanner
        title="Don't Miss Out"
        subtitle1="on Grocery"
        subtitle2="Deals"
        description="SIGN UP FOR THE UPDATE NEWSLETTER"
        bannerImage={Banner}
      />
    </div>
  );
}
