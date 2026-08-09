import React from "react";
import { Link } from "react-router-dom";

/**
 * VendorCards — pure presentational component.
 *
 * Props
 * ─────
 * vendors     – array of vendor objects:
 *               { id, name, logo, thumbnails[], bgColor, delivery, offer }
 *               `logo` is already a fully-resolved URL (done in VendorList normalizeVendor)
 * title       – section heading (default: "Weekly Top Vendors")
 * showAllLink – whether to render the "All Vendors" link (default: true)
 */
const VendorCards = ({
  vendors = [],
  title = "Weekly Top Vendors",
  showAllLink = true,
}) => {
  if (vendors.length === 0) {
    return (
      <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 text-center text-gray-400">
        No vendors available right now.
      </div>
    );
  }

  return (
    <div className="bg-white py-6 sm:py-8">
      <div className="max-w-9xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-500">
            {title}
          </h2>
          {showAllLink && (
            <Link
              to="/vendors"
              className="text-green-600 font-medium hover:text-green-700 text-sm sm:text-base transition-colors"
            >
              {/* All Vendors */}
            </Link>
          )}
        </div>

        {/* Vendors Grid — 2 cols on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-4">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="relative pt-10 sm:pt-12 lg:pt-16">
              {/* Vendor Logo */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-full flex items-center justify-center shadow-lg border-2 sm:border-4 border-white z-10">
                <img
                  src={vendor.logo}
                  alt={vendor.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain rounded-full"
                  onError={(e) => {
                    // Guard against infinite loop if fallback also fails
                    if (e.currentTarget.dataset.fallback) return;
                    e.currentTarget.dataset.fallback = "true";
                    e.currentTarget.src =
                      "https://cdn-icons-png.flaticon.com/512/2913/2913133.png";
                  }}
                />
              </div>

              {/* Card Body */}
              <div
                className={`${vendor.bgColor} rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-6 pt-12 sm:pt-14 lg:pt-20 text-center`}
              >
                {/* Vendor Name */}
                <Link to={`/#/${vendor.id}`}>
                  <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-500 mb-1 sm:mb-2 hover:text-green-600 transition-colors cursor-pointer">
                    {vendor.name}
                  </h3>
                </Link>

                {/* Delivery info */}
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">
                  {vendor.delivery}
                </p>

                {/* Offer badge */}
                <div className="mb-3 sm:mb-5">
                  <Link to="/">
                    {/* <span className="inline-block bg-[#FF6B35] text-white px-2 sm:px-4 lg:px-5 py-1 sm:py-1.5 lg:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#FF5722] transition-colors cursor-pointer">
                      {vendor.offer}
                    </span> */}
                  </Link>
                </div>

                {/* Category image thumbnails (per-vendor, dynamic) */}
                <div className="flex justify-center items-center gap-1 sm:gap-2 lg:gap-3">
                  {(vendor.thumbnails || []).map((src, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-md p-1 sm:p-1.5 lg:p-2"
                    >
                      <img
                        src={src}
                        alt={`Category ${idx + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorCards;
