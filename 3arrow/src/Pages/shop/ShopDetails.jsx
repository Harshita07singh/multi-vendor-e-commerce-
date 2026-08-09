import React, { useState } from 'react';
import { Heart, Shuffle, Share2, ShoppingCart, Plus, Minus, Phone, Truck, RotateCcw, CheckCircle2, Package, Award, ChevronRight, Home } from 'lucide-react';

// Import images from assets - Correct path from Pages/shop folder
import Lays from "../../assets/Lays.png";
import Apple from "../../assets/Apple.png";
import Bread from "../../assets/Bread.png";
import ProductCard from '../../components/Productcard/ProductCard';

import FeaturesGrid from '../../components/FeaturesGrid';
import NewsletterBanner from '../../components/NewsletterBanner';
import Banner from '../../assets/Banner.png';

const ProductDetailPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  const product = {
    name: "Lay's Potato Chips Onion Flavored",
    rating: 4.7,
    reviews: 21671,
    sku: "EB4DRP",
    price: 25.00,
    originalPrice: 38.00,
    description: "Vivamus adipiscing nisl ut dolor dignissim semper. Nulla luctus malesuada tincidunt. Class aptent taciti sociosqu ad litora torquent",
    vendor: "Marketpro",
    stock: 45,
    images: [Lays, Apple, Bread, Lays],
    offers: [
      "Buy 1, Get 1 FREE",
      "Buy 1, Get 1 FREE"
    ],
    coupon: {
      text: "Mfr. coupon. $3.00 off 5",
      link: "View Details"
    }
  };
   const relatedProducts = [
    {
      image: Lays,
      title: "Lay's Classic Potato Chips",
      oldPrice: "$30.00",
      newPrice: "$20.00",
      rating: 4.6,
      reviews: 5420
    },
    {
      image: Apple,
      title: "Fresh Red Apples Premium",
      oldPrice: "$15.00",
      newPrice: "$10.00",
      rating: 4.5,
      reviews: 1520
    },
     {
      image: Lays,
      title: "Lay's Classic Potato Chips",
      oldPrice: "$30.00",
      newPrice: "$20.00",
      rating: 4.6,
      reviews: 5420
    },
    {
      image: Bread,
      title: "Whole Wheat Bread Fresh",
      oldPrice: "$8.00",
      newPrice: "$5.00",
      rating: 4.8,
      reviews: 890
    },
     {
      image: Lays,
      title: "Whole Wheat Bread Fresh",
      oldPrice: "$8.00",
      newPrice: "$5.00",
      rating: 4.8,
      reviews: 890
    },
     {
      image: Lays,
      title: "Lay's Classic Potato Chips",
      oldPrice: "$30.00",
      newPrice: "$20.00",
      rating: 4.6,
      reviews: 5420
    },
     {
      image: Apple,
      title: "Whole Wheat Bread Fresh",
      oldPrice: "$8.00",
      newPrice: "$5.00",
      rating: 4.8,
      reviews: 890
    },
    {
      image: Lays,
      title: "Lay's BBQ Flavor Chips",
      oldPrice: "$32.00",
      newPrice: "$22.00",
      rating: 4.7,
      reviews: 3200
    }
  ];

const breadcrumbs = [
  { name: 'Home', href: '#home', icon: <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
  { name: 'Shop', href: '#shop' },
  { name: 'Shop Grid', href: '#shop-grid' },
  { name: product.name, href: '#', current: true }
];
const marketingFeatures = [
  {
    title: "Free Shipping",
    description: "Free shipping all over the US",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 fill-white">
        <path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m1.5-9l1.96 2.5H17V9.5m-11 9A1.5 1.5 0 0 1 4.5 17A1.5 1.5 0 0 1 6 15.5A1.5 1.5 0 0 1 7.5 17A1.5 1.5 0 0 1 6 18.5M20 8h-3V4H3c-1.11 0-2 .89-2 2v11h2a3 3 0 0 0 3 3a3 3 0 0 0 3-3h6a3 3 0 0 0 3 3a3 3 0 0 0 3-3h2v-5l-3-4Z"/>
      </svg>
    )
  },
  {
    title: "100% Satisfaction",
    description: "Money back guarantee",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 fill-white">
        <path d="M23 12l-2.44-2.79l.34-3.69l-3.61-.82L15.4 1.5L12 2.96L8.6 1.5L6.71 4.69L3.1 5.5l.34 3.7L1 12l2.44 2.79l-.34 3.7l3.61.82L8.6 22.5l3.4-1.47l3.4 1.46l1.89-3.19l3.61-.82l-.34-3.69L23 12m-12.91 4.72l-3.8-3.81l1.48-1.48l2.32 2.33l5.85-5.87l1.48 1.48l-7.33 7.35z"/>
      </svg>
    )
  },
  {
    title: "Secure Payments",
    description: "100% secure transactions",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 fill-white">
        <path d="M20 8h-3V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2M9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6m9 14H6V10h12v10m-6-3c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2"/>
      </svg>
    )
  },
  {
    title: "24/7 Support",
    description: "Always here to help",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 sm:w-8 sm:h-8 fill-white">
        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5c0-.39-.15-.74-.39-1.01c-.23-.26-.38-.61-.38-.99c0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5c0-4.42-4.03-8-9-8m-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9S8 9.67 8 10.5S7.33 12 6.5 12m3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8m5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8m3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5"/>
      </svg>
    )
  }
];

 const features = [
  {
    icon: <Truck className="w-6 h-6 text-green-600" />,
    title: "Fast Delivery",
    description: "Lightning-fast shipping, guaranteed."
  },
  {
    icon: <RotateCcw className="w-6 h-6 text-green-600" />,
    title: "Free 90-day returns",
    description: "Shop risk-free with easy returns."
  },
  {
    icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
    title: "Pickup available at Shop location",
    description: "Usually ready in 24 hours"
  },
  {
    icon: <Award className="w-6 h-6 text-green-600" />,
    title: "Payment",
    description: "Payment upon receipt of goods, Payment by card in the department, Google Pay, Online card."
  },
  {
    icon: <Award className="w-6 h-6 text-green-600" />,
    title: "Warranty",
    description: "The Consumer Protection Act does not provide for the return of this product of proper quality."
  },
  {
    icon: <Package className="w-6 h-6 text-green-600" />,
    title: "Packaging",
    description: "Research & development value proposition graphical user interface investor."
  }
];
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
     

    <div className="min-h-screen bg-white-50">
      {/* Breadcrumb - Shop Details Header  */}
   {/*  Mobile Responsive  */}

<div className="bg-white border-b shadow-sm mb-4 sm:mb-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
    
    {/* Mobile me vertical stack - Title upar, breadcrumbs neeche */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
      
      {/* Title */}
      <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
        Shop Details
      </h2>
      
      {/* Breadcrumbs - Mobile me horizontal scroll */}
      <nav className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm overflow-x-auto scrollbar-hide">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.name}>
            {index > 0 && (
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-gray-400 flex-shrink-0" />
            )}
            {item.current ? (
              <span className="text-gray-600 font-medium whitespace-nowrap">
                {item.name}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-green-600 hover:text-green-700 font-medium transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                {item.icon}
                <span>{item.name}</span>
              </a>
            )}
          </React.Fragment>
        ))}
      </nav>
      
    </div>
  </div>
</div>
    

{/* Main Content */}
<div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
    
    {/* Left Column - Product Images */}
    <div className="lg:col-span-5 xl:col-span-5">
      
      {/* Main Product Image */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-5 mb-2 sm:mb-3">
        {/* Mobile: h-64, Tablet: h-72, Desktop: h-96 */}
        <div className="h-64 sm:h-72 md:h-80 lg:h-96 w-full overflow-hidden rounded-lg flex items-center justify-center p-2 sm:p-4 lg:p-6">
          <img
            src={product.images[selectedImage]}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 lg:gap-2.5">
        {product.images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className={`bg-white rounded-lg p-1.5 sm:p-2 border-2 transition-all shadow-sm hover:shadow-md ${
              selectedImage === idx 
                ? 'border-green-600 ring-1 ring-green-200' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-square w-full overflow-hidden rounded">
              <img 
                src={img} 
                alt={`Product ${idx + 1}`} 
                className="w-full h-full object-contain" 
              />
            </div>
          </button>
        ))}
      </div>
      </div>

   
         {/* Middle Column - Product Details - Compact Mobile Layout */}

<div className="lg:col-span-5 xl:col-span-4 space-y-3 sm:space-y-4">
  <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 lg:p-6">
    
    {/* Product Title */}
    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-2 sm:mb-3">
      {product.name}
    </h1>
    
    {/* Rating */}
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5 sm:mb-4">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-orange-400 text-sm sm:text-base lg:text-lg">★</span>
        ))}
      </div>
      <span className="text-gray-700 font-bold text-xs sm:text-sm">
        {product.rating} Star Rating
      </span>
      <span className="text-gray-500 text-xs sm:text-sm">
        ({product.reviews.toLocaleString()})
      </span>
      <span className="hidden sm:inline text-gray-400 text-xs">|</span>
      <span className="text-gray-500 text-xs sm:text-sm">
        SKU:<span className="font-bold ml-1">{product.sku}</span>
      </span>
    </div>

    {/* Description */}
    <p className="text-gray-600 leading-relaxed mb-3 sm:mb-4 lg:mb-6 text-sm sm:text-base">
      {product.description}
    </p>

    {/* Price + WhatsApp Button - Inline on Mobile */}
    {/* <div className="flex flex-wrap items-center gap-4 sm:gap-3 mb-5 sm:mb-6">
      <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
        ${product.price.toFixed(2)}
      </span>
      <span className="text-sm sm:text-base text-gray-400 line-through">
        ${product.originalPrice.toFixed(2)}
      </span> */}
      {/* WhatsApp Button - Compact on Mobile */}
      {/* <button className="px-5 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-green-600 text-white rounded-full font-semibold text-xs sm:text-sm lg:text-base hover:bg-green-700 transition-colors shadow-md hover:shadow-lg whitespace-nowrap">
        Order on What'sApp
      </button>
    </div> */}

   <div className="flex items-center justify-between mb-5 sm:mb-6">
  {/* Price Group */}
  <div className="flex items-baseline gap-2">
    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
      ${product.price.toFixed(2)}
    </span>
    <span className="text-sm sm:text-base text-gray-400 line-through">
      ${product.originalPrice.toFixed(2)}
    </span>
  </div>

  {/* WhatsApp Button */}
  <button className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 bg-green-600 text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-green-700 transition-colors shadow-md hover:shadow-lg whitespace-nowrap">
    Order on What'sApp
  </button>
</div>

    {/* Special Offer Timer */}
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 mb-5 sm:mb-4 border border-green-200">
  <div className="flex items-center gap-2 sm:gap-3 mb-2">
    <span className="text-green-700 font-bold text-sm sm:text-base">
      Special Offer:
    </span>
    <div className="flex gap-1.5 sm:gap-2">
      {[0, 0, 0, 0].map((_, idx) => (
        <div
          key={idx}
          className="w-7 h-7 sm:w-8 sm:h-8 bg-white border-2 border-green-600 rounded-md flex items-center justify-center font-bold text-xs sm:text-sm text-gray-900 shadow-sm"
        >
          0
        </div>
      ))}
    </div>
  </div>
  <p className="text-xs sm:text-sm text-gray-600">Remains until the end of the offer</p>
</div>



    {/* Stock Alert */}
    <div className="bg-white rounded-lg p-3 sm:p-4 mb-5 sm:mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-orange-500 text-lg sm:text-xl">⚡</span>
        <span className="font-semibold text-gray-900 text-sm sm:text-base">
          Products are almost sold out
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 mb-2 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-500" 
          style={{ width: '35%' }}
        ></div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600">
        Available only: <span className="font-bold text-orange-600">{product.stock}</span>
      </p>
    </div>

    {/* Quantity and Add to Cart - Inline on Mobile */}
  <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-5">
  <label className="block text-gray-700 font-semibold text-sm sm:text-base">
    Quantity:
  </label>
  <div className="flex items-center gap-3">
    {/* Quantity Selector */}
    <div className="flex items-center border-2 border-gray-300 rounded-full overflow-hidden">
      <button
        onClick={decrementQuantity}
        className="p-2 sm:p-3 hover:bg-gray-100 transition-colors active:bg-gray-200"
      >
        <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <span className="px-4 sm:px-6 font-bold text-base sm:text-lg">
        {quantity}
      </span>
      <button
        onClick={incrementQuantity}
        className="p-2 sm:p-3 hover:bg-gray-100 transition-colors active:bg-gray-200"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>

    {/* Add to Cart Button */}
    <button className="flex-1 max-w-[220px] sm:max-w-[260px] flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-green-600 text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-green-700 transition-all shadow-md hover:shadow-lg active:scale-95">
      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
      Add To Cart
    </button>
  </div>
</div>

    {/* Action Buttons */}
  <div className="flex gap-3 mb-5">
  <button className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors shadow-sm hover:shadow-md active:scale-95">
    <Heart className="w-5 h-5" />
  </button>
  <button className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors shadow-sm hover:shadow-md active:scale-95">
    <Shuffle className="w-5 h-5" />
  </button>
  <button className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center hover:bg-green-100 transition-colors shadow-sm hover:shadow-md active:scale-95">
    <Share2 className="w-5 h-5" />
  </button>
</div>

    {/* Coupon */}
   <div className="border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-2">
      <Plus className="w-4 h-4 text-orange-600 flex-shrink-0" />
      <span className="text-gray-700 text-sm font-medium">
        {product.coupon.text}
      </span>
    </div>
    <button className="text-orange-600 font-semibold text-sm hover:text-orange-700 hover:underline whitespace-nowrap">
      {product.coupon.link}
    </button>
  </div>
</div>

    {/* Offers */}
    <div className="space-y-2">
      {product.offers.map((offer, idx) => (
        <div key={idx} className="flex items-start gap-4 text-gray-700">
          <span className="w-1.5 h-1.5 bg-gray-900 rounded-full flex-shrink-0 mt-1.5"></span>
          <span className="text-sm sm:text-base">{offer}</span>
        </div>
      ))}
    </div>
  </div>
</div>

         
{/* Right Column - Features */}
<div className="lg:col-span-3 xl:col-span-3">
  <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 space-y-4"> 
    
    {/* VIEW STORE Button Box */}
  <div className="flex items-center gap-2 p-2.5 bg-green-600 rounded-full shadow-md">
  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
    <ShoppingCart className="w-5 h-5 text-green-600" />
  </div>
  <div className="flex-1">
    <span className="text-xs text-white font-medium block">
      by <span className="font-bold">{product.vendor}</span>
    </span>
  </div>
  <button className="px-3 py-2 bg-white text-green-600 rounded-full font-bold text-xs hover:bg-gray-50 transition-colors shadow-sm">
    VIEW STORE
  </button>
</div>

    {/* Features List */}
    {features.map((feature, idx) => (
      <div key={idx} className="flex gap-3 items-start">
        <div className="flex-shrink-0 mt-0.5">
          {feature.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-0.5 text-[15px]">
            {feature.title}
          </h3>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>
</div>
      
     {/* Tabs Section */}
<div className="mt-3 sm:mt-4 bg-white rounded-lg shadow-sm p-3 sm:p-4">
  {/* Tab Navigation */}
  <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 border-b pb-2">
    <div className="flex items-center gap-1 overflow-x-auto">
      <button
        onClick={() => setActiveTab('description')}
        className={`px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
          activeTab === 'description'
            ? 'text-white bg-green-600 rounded-full shadow-md'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-t-lg'
        }`}
      >
        Description
      </button>
      <button
        onClick={() => setActiveTab('reviews')}
        className={`px-3 sm:px-4 py-1.5 sm:py-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
          activeTab === 'reviews'
            ? 'text-white bg-green-600 rounded-full shadow-md'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-t-lg'
        }`}
      >
        Reviews
      </button>
    </div>
    <div className="flex items-center gap-1 sm:gap-1.5 bg-green-50 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg flex-shrink-0">
      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
      <span className="text-green-600 font-semibold text-[9px] sm:text-[10px]">
        100% Satisfaction Guaranteed
      </span>
    </div>
  </div>

  {/* Tab Content */}
  <div className="py-2">
    {/* Description Tab */}
    {activeTab === 'description' && (
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
          Product Description
        </h2>
        
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Wherever celebrations and good times happen, the LAY'S brand will be there just as it has been for more than 75 years. With flavors almost as rich as our history, we have a chip or crisp flavor guaranteed to bring a smile on your face.
        </p>
        
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Morbi ut sapien vitae odio accumsan gravida. Morbi vitae erat auctor, eleifend nunc a, lobortis neque. Praesent aliquam dignissim viverra. Maecenas lacus odio, feugiat eu nunc sit amet, maximus sagittis dolor. Vivamus nisi sapien, elementum sit amet eros sit amet, ultricies cursus ipsum. Sed consequat luctus ligula. Curabitur laoreet rhoncus blandit. Aenean vel diam ut arcu pharetra dignissim ut sed leo. Vivamus faucibus, ipsum in vestibulum vulputate, lorem orci convallis quam, sit amet consequat nulla felis pharetra lacus. Duis semper erat mauris, sed egestas purus commodo vel.
        </p>
        
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-gray-600">
          <li>8.0 oz. bag of LAY'S Classic Potato Chips</li>
          <li>Tasty LAY'S potato chips are a great snack</li>
          <li>Includes three ingredients: potatoes, oil, and salt</li>
          <li>Gluten free product</li>
        </ul>
      </div>
    )}

    {/* Reviews Tab */}
    {activeTab === 'reviews' && (
      <div>
        {/* Reviews Grid - Always side by side on larger screens */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
          {/* Left Side - Reviews - 7 columns */}
          <div className="xl:col-span-7 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Product Description
            </h2>
            
            {/* Review 1 */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3 mb-3">
                <img 
                  src="https://i.pravatar.cc/150?img=13" 
                  alt="Nicolas cage" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">Nicolas cage</h3>
                    <span className="text-xs text-gray-500">3 Days ago</span>
                  </div>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-orange-400 text-sm">★</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2">Greate Product</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour
              </p>
              
               
            </div>
            
            {/* Review 2 */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3 mb-3">
                <img 
                  src="https://i.pravatar.cc/150?img=25" 
                  alt="Sarah Johnson" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">Sarah Johnson</h3>
                    <span className="text-xs text-gray-500">5 Days ago</span>
                  </div>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-orange-400 text-sm">★</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2">Amazing Quality!</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Excellent product with fast delivery. Highly recommended for everyone looking for quality snacks.
              </p>
              
              <div className="flex items-center gap-4 text-sm">
                <button className="flex items-center gap-1 text-gray-600 hover:text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Like
                </button>
                <button className="flex items-center gap-1 text-gray-600 hover:text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Replay
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Customer Feedback - 5 columns */}
          <div className="xl:col-span-5">
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Customers Feedback
              </h2>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center shadow-sm">
                <div className="text-5xl font-bold text-green-600 mb-2">4.8</div>
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-orange-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Average Product Rating</p>
              </div>

              {/* Rating Bars */}
              <div className="space-y-3 bg-white rounded-lg p-4 border border-gray-200">
                {[
                  { rating: 5, count: 124, percentage: 85 },
                  { rating: 4, count: 52, percentage: 50 },
                  { rating: 3, count: 12, percentage: 20 },
                  { rating: 2, count: 5, percentage: 10 },
                  { rating: 1, count: 2, percentage: 5 }
                ].map((item) => (
                  <div key={item.rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-3">{item.rating}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-green-600 h-full rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-orange-400 text-xs">★</span>
                      ))}
                      <span className="text-sm font-medium text-gray-700 ml-1">{item.count}</span>
                    </div>
                  </div>
                  
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
    )}
  </div>
</div>

        </div>

       {/* related producrs card */}
<div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-6">
  <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
      Related Products
    </h2>
    
    
    {/* Grid: 3 columns on mobile, 4 on tablet, 6 on desktop */}
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 lg:gap-5 auto-rows-fr">
      {relatedProducts.map((item, index) => (
        <div 
          key={index}
          className="flex flex-col"
        >
          <ProductCard product={item} />
        </div>
      ))}
    </div>
    
  </div>
</div>


{/*  Features Grid  */}
<div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-0 sm:pb-2 lg:pb-3">
  <FeaturesGrid features={marketingFeatures} />
</div>

{/* Newsletter Banner Section */}
<div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-0 pb-3 sm:pb-4 lg:pb-6">
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

export default ProductDetailPage;