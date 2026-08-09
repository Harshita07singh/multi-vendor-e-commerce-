
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Tamoto from '../../assets/Tamoto.png';
import Pototo from '../../assets/Pototo.png';
import Cabbage from '../../assets/Cabbage.png';
import fruits2 from '../../assets/fruits2.png';
import Food from '../../assets/Food.png';
import Milk from '../../assets/Milk.png';
import Lays from '../../assets/Lays.png';
import Orange from '../../assets/Orange.png';
import Bread from '../../assets/Bread.png';
import FeaturesGrid from '../../components/FeaturesGrid';
import {  ShoppingBag, ArrowLeft, Star, Tag, ChevronRight, Home, Truck, Shield, Headphones, CreditCard } from 'lucide-react';
import NewsletterBanner from '../../components/NewsletterBanner';
import Banner from '../../assets/Banner.png';


const VendorPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const allVendors = [
    {
      id: 1,
      name: "Fresh Mart",
      logo: fruits2,
      bgColor: "bg-[#E8F5E9]",
      delivery: "Delivery by 7:00am",
      offer: "$10 off Fresh Produce"
    },
    {
      id: 2,
      name: "Daily Needs",
      logo: Milk,
      bgColor: "bg-[#FFF8E1]",
      delivery: "Delivery by 8:00am",
      offer: "Buy 1 Get 1 Free"
    },
    {
      id: 3,
      name: "Super Store",
      logo: Food,
      bgColor: "bg-[#F3E5F5]",
      delivery: "Delivery by 6:30am",
      offer: "$15 off on $100"
    },
    {
      id: 4,
      name: "Veg Market",
      logo: Tamoto,
      bgColor: "bg-[#FCE4EC]",
      delivery: "Delivery by 7:30am",
      offer: "Free Delivery"
    },
    {
      id: 5,
      name: "Quick Shop",
      logo: Pototo,
      bgColor: "bg-[#E1F5FE]",
      delivery: "Delivery by 9:00am",
      offer: "$5 off Snacks"
    },
    {
      id: 6,
      name: "Green Grocers",
      logo: Cabbage,
      bgColor: "bg-[#FFF3E0]",
      delivery: "Delivery by 6:00am",
      offer: "20% off Vegetables"
    },
    {
      id: 7,
      name: "City Mart",
      logo: Orange,
      bgColor: "bg-[#FFEBEE]",
      delivery: "Delivery by 8:30am",
      offer: "$8 off Fruits"
    },
    {
      id: 8,
      name: "Smart Bazaar",
      logo: Bread,
      bgColor: "bg-[#F1F8E9]",
      delivery: "Delivery by 7:00am",
      offer: "Free Snack with order"
    },
    {
      id: 9,
      name: "Farm Fresh",
      logo: Lays,
      bgColor: "bg-[#E0F2F1]",
      delivery: "Delivery by 6:45am",
      offer: "$12 off Organic"
    }
  ];

  // Features data
    const features = [
      {
        icon: <Truck size={24} className="text-white" />,
        title: "Free Delivery",
        description: "For all orders over $50"
      },
      {
        icon: <Shield size={24} className="text-white" />,
        title: "Secure Payment",
        description: "100% secure transaction"
      },
      {
        icon: <Headphones size={24} className="text-white" />,
        title: "24/7 Support",
        description: "Dedicated customer support"
      },
      {
        icon: <CreditCard size={24} className="text-white" />,
        title: "Easy Returns",
        description: "30-day return policy"
      }
    ];
  

  // Product images
  const productImages = [Milk, Lays, Orange, Bread, fruits2];

  // Filter vendors based on search
  const filteredVendors = allVendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Section */}
      <div className="bg-gray-50 py-4">
        <div className="container mx-auto px-6">
          {/* Vendor List heading aur Breadcrumb ek line mein */}
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-3xl font-bold text-gray-800">Vendor List</h1>
            
            {/* Breadcrumb - Right side mein */}
            <div className="flex items-center text-sm text-gray-600">
              <Link to="/" className="hover:text-green-600 transition-colors flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
              </Link>
              <span className="mx-2">›</span>
              <span className="text-gray-800 font-medium">Vendor List</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-6">
        
        {/* VENDOR CARDS SECTION */}
        <div className="bg-white py-6 sm:py-8 px-4 rounded-full">
          <div className="max-w-7xl mx-auto">
            
            {/* Search and Filter Section - DESKTOP VIEW SAME, MOBILE VIEW CHANGED */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              {/* Left Side - Showing Results */}
              <div className="text-gray-600 font-medium">
                Showing 1-{filteredVendors.length} of {allVendors.length} results
              </div>

             
              {/* DESKTOP*/}
              <div className="flex flex-row md:flex-row gap-3 w-full md:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 md:flex-initial">
                  <input
                    type="text"
                    placeholder="Search vendors by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gray-600 font-medium whitespace-nowrap">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-500 bg-white cursor-pointer"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="name"> (A-Z)</option>
                    <option value="name-desc"> (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vendors Grid - Mobile: 1 column, Desktop: 2-3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4 lg:gap-4">
              {filteredVendors.map((vendor) => (
             <div key={vendor.id} className="relative pt-12 sm:pt-12 lg:pt-16">
                  {/* Vendor Logo */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-full flex items-center justify-center shadow-lg border-2 sm:border-4 border-white z-10">
                    <img 
                      src={vendor.logo} 
                      alt={vendor.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
                    />
                  </div>

                  {/* Card Content */}
                  <div className={`${vendor.bgColor} rounded-2xl sm:rounded-3xl p-4 sm:p-4 lg:p-6 pt-14 sm:pt-14 lg:pt-20 text-center`}>
                    {/* Vendor Name */}
                   <Link to={`/vendor/${vendor.id}`}>
  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-2 hover:text-green-600 transition-colors cursor-pointer">
    {vendor.name}
  </h3>
</Link>

                    {/* Delivery Time */}
                    <p className="text-sm sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      {vendor.delivery}
                    </p>

                    {/* Offer Badge */}
                  <div className="mb-4 sm:mb-5">
  <Link to="/shop">
    <span className="inline-block bg-[#FF6B35] text-white px-4 sm:px-4 lg:px-5 py-1.5 sm:py-1.5 lg:py-2 rounded-full text-sm sm:text-sm font-semibold hover:bg-[#FF5722] transition-colors cursor-pointer">
      {vendor.offer}
    </span>
  </Link>
</div>

                    {/* Product Images */}
                    <div className="flex justify-center items-center gap-2 sm:gap-2 lg:gap-3">
                      {productImages.map((product, idx) => (
                        <div
                          key={idx}
                          className="w-12 h-12 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white rounded-full flex items-center justify-center shadow-md p-1.5 sm:p-1.5 lg:p-2"
                        >
                          <img
                            src={product}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-full object-contain"
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
         {/* ✅ FeaturesGrid Component */}
                    <div className="mt-12 sm:mt-16 lg:mt-10">
                      <FeaturesGrid features={features} />
                    </div>
                    
      </div>
        {/* Newsletter Banner Section */}
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 pt-0 pb-3 sm:pb-4 lg:pb-6">
                      <NewsletterBanner 
                        title="Don't Miss Out"
                        subtitle1="on Grocery"
                        subtitle2="Deals"
                        description="SIGN UP FOR THE UPDATE NEWSLETTER"
                        bannerImage={Banner}
                        bgColor="#202341"
                      />
                    </div>
      
    </div>
  );
};

export default VendorPage;