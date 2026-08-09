import React, { useState, useEffect } from "react";
import VendorCards from "./VendorCard";
import Milk from "../assets/Milk.png";
import Lays from "../assets/Lays.png";
import Orange from "../assets/Orange.png";
import Bread from "../assets/Bread.png";
import fruits2 from "../assets/fruits2.png";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

const BG_COLORS = [
  "bg-[#F4F6E6]",
  "bg-[#E6F6F6]",
  "bg-[#F8EAE4]",
  "bg-[#FFF5E6]",
  "bg-[#F4F6E6]",
  "bg-[#E6F6F6]",
];

const FALLBACK_LOGO = "https://cdn-icons-png.flaticon.com/512/2913/2913133.png";
const STATIC_PRODUCTS = [Milk, Lays, Orange, Bread, fruits2];

function resolveImage(src) {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  return BASE_URL + (src.startsWith("/") ? src : `/${src}`);
}

function normalizeVendor(vendor, index, categoryMap) {
  const name =
    vendor.businessDetails?.businessName ||
    vendor.sellerDetails?.sellerName ||
    vendor.brandDetails?.brandName ||
    "Unnamed Vendor";

  const vendorCategories = categoryMap[vendor._id] || [];

  // Logo priority:
  // 1. brandDetails.brandLogo — uploaded via VendorProfileSection
  // 2. vendor.logo            — legacy field
  // 3. first category image   — visual fallback
  // 4. generic icon
  const logo =
    resolveImage(vendor.brandDetails?.brandLogo) ||
    resolveImage(vendor.logo) ||
    (vendorCategories[0]?.image
      ? resolveImage(vendorCategories[0].image)
      : null) ||
    FALLBACK_LOGO;

  const categoryThumbnails = vendorCategories
    .slice(0, 5)
    .map((c) => resolveImage(c.image))
    .filter(Boolean);

  const thumbnails =
    categoryThumbnails.length > 0 ? categoryThumbnails : STATIC_PRODUCTS;

  const city =
    vendor.sellerDetails?.city || vendor.shippingLocations?.city || "";

  return {
    id: vendor._id,
    name,
    logo,
    thumbnails,
    bgColor: BG_COLORS[index % BG_COLORS.length],
    delivery: city ? `Delivery from ${city}` : "Delivery by 6:15am",
    offer: "$5 off Snack & Candy",
  };
}

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 1. Fetch approved vendors — brandDetails.brandLogo included in response
        const vendorRes = await fetch(`${BASE_URL}/api/auth/vendor/approved`);
        if (!vendorRes.ok)
          throw new Error(`Vendors fetch failed (${vendorRes.status})`);

        const vendorData = await vendorRes.json();
        const sliced = vendorData.slice(0, 6);

        // Debug: confirm brandLogo is coming in response
        console.log(
          "[VendorList] brandLogos:",
          sliced.map((v) => ({
            name: v.businessDetails?.businessName,
            brandLogo: v.brandDetails?.brandLogo,
          })),
        );

        // 2. Fetch categories in parallel
        const categoryResults = await Promise.all(
          sliced.map((v) =>
            fetch(`${BASE_URL}/api/categories?vendorId=${v._id}`)
              .then((r) => (r.ok ? r.json() : []))
              .catch(() => []),
          ),
        );

        // 3. Build vendorId -> categories[] map
        const categoryMap = {};
        sliced.forEach((v, i) => {
          categoryMap[v._id] = categoryResults[i];
        });

        setVendors(sliced.map((v, i) => normalizeVendor(v, i, categoryMap)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="bg-white py-6 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-500">
              Our Vendors
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-red-400">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="relative pt-10 sm:pt-12 lg:pt-16 animate-pulse"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gray-200 rounded-full z-10" />
                <div className="bg-gray-100 rounded-2xl sm:rounded-3xl p-3 pt-12 sm:pt-14 lg:pt-20 text-center">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3].map((x) => (
                      <div
                        key={x}
                        className="w-10 h-10 bg-gray-200 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-6 px-4 sm:px-6 text-center text-red-500">
        <p>Could not load vendors: {error}</p>
      </div>
    );
  }

  return (
    <VendorCards vendors={vendors} title="Our Vendors" showAllLink={true} />
  );
};

export default VendorList;
