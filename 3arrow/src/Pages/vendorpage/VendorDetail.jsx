import React, { useState } from 'react';
import { ShoppingCart, Star, Heart, Search, Home, ChevronRight, ChevronDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/wishlistSlice';
import { useNavigate } from 'react-router-dom';
import Green from '../../assets/Green.png';
import Basket from '../../assets/Basket.png';
import Almond from '../../assets/Almond.png';
import Apple from '../../assets/Apple.png';
import Banana from '../../assets/Banana.png';
import Tropicana from '../../assets/Tropicana.png';
import Milk from '../../assets/Milk.png';
import Orange from '../../assets/Orange.png';
// import Bread from '../assets/Bread.png';
import Lays from '../../assets/Lays.png';
import NewsletterBanner from '../../components/NewsletterBanner';
import Banner from '../../assets/Banner.png';




// Reusable Product Card Component
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const navigate = useNavigate();

  const { wishlistItems } = useSelector(state => state.wishlist);

  // ✅ Simple check using only id
  const isInWishlist = wishlistItems.some(item => item.id === product.id);

  // 🛒 Add to Cart
  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart(product));
    navigate('/cart');
  };

  // Wishlist Toggle
  const handleWishlist = (e) => {
    e.stopPropagation();

    if (isInWishlist) {
      dispatch(removeFromWishlist(product.id));
    } else {
      dispatch(addToWishlist(product));
    }
  };

  return (
  <div className="bg-white rounded-lg lg:rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-green-600 transition-all cursor-pointer relative h-full flex flex-col">

      {/*  Wishlist Button */}
      <button
        onClick={handleWishlist}
        className={`absolute top-2 left-2 lg:top-4 lg:left-4 w-7 h-7 lg:w-8 lg:h-8 rounded-full shadow-md flex items-center justify-center z-20 transition-all 
        ${isInWishlist 
          ? "bg-red-500 text-white hover:bg-red-600" 
          : "bg-white text-gray-600 hover:bg-gray-100"
        }`}
        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart 
          className={`w-3 h-3 lg:w-4 lg:h-4 transition-all ${isInWishlist ? "fill-white" : ""}`} 
        />
      </button>

      {/* 🛒 Add Button */}
      <button
        onClick={handleAddToCart}
        className="absolute top-2 right-2 lg:top-4 lg:right-4 bg-[#299E60] hover:bg-[#299E60] text-white px-1.5 py-1 lg:px-2 lg:py-1 rounded-md flex items-center gap-0.5 text-[10px] lg:text-xs font-medium transition-colors z-20 shadow-md"
        aria-label="Add to cart"
      >
        <span className="hidden lg:inline">Add</span>
        <ShoppingCart className="w-3 h-3 lg:w-5 lg:h-5" />
      </button>

      {/* Product Image */}
     <div className="relative p-2 lg:p-4 h-30 lg:h-40 flex items-center justify-center">
        <img
          src={product.image}
          alt={product.title}
          className="max-w-full max-h-full object-contain"
        />
        {/* </div> */}
      </div>

      {/* Product Info */}
  <div className="px-2 lg:px-4 pb-2 lg:pb-4 flex flex-col flex-grow">
        
        {/* 💰 Price Section - Mobile Optimized */}
    <div className="flex items-baseline gap-1 flex-wrap mb-1 lg:mb-2">
          <span className="text-gray-400 line-through text-[10px] lg:text-sm">
            {product.oldPrice}
          </span>
          <span className="text-sm lg:text-xl font-bold text-gray-900">
            {product.newPrice}
          </span>
          <span className="text-gray-500 text-[10px] lg:text-sm">/Qty</span>
        </div>

        {/* ⭐ Rating Section */}
<div className="flex items-center gap-0.5 lg:gap-1 mb-1 lg:mb-2">
          <span className="text-gray-900 font-semibold text-[10px] lg:text-sm">
            {product.rating}
          </span>
          <Star className="w-2.5 h-2.5 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-gray-500 text-[10px] lg:text-sm">
            ({product.reviews})
          </span>
        </div>

        {/* 📝 Product Title */}
      <h3 className="text-gray-900 font-medium text-[11px] lg:text-sm leading-tight line-clamp-2 h-8 lg:h-10">  
          {product.title}
        </h3>
      </div>
    </div>
  );
};

 
const VendorInfoCard = ({ vendor }) => (
  
<div className="relative pt-12 lg:pt-14 w-60 mx-auto">

    {/* Vendor Logo - Floating on top (Smaller) */}
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-20 lg:w-28 lg:h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white z-10">
      <img 
        src={vendor.logo} 
        alt={vendor.name} 
        className="w-20 h-20 lg:w-24 lg:h-24 object-contain p-2" 
      />
    </div>
    
    {/* Card Content - Lighter Green Background #E6F9EF */}
   <div className="rounded-xl p-4 lg:p-6 pt-14 lg:pt-14 text-center shadow-lg" style={{ backgroundColor: '#E6F9EF' }}>
      {/* Vendor Name */}
      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1.5 lg:mb-2">
        {vendor.name}
      </h2>
      
      {/* Address */}
      <p className="text-xs lg:text-sm text-gray-700 mb-1">
        {vendor.address}
      </p>
      
      {/* Since */}
      <p className="text-[10px] lg:text-xs text-gray-600 mb-3 lg:mb-4">
        {vendor.since}
      </p>
      
      {/* Delivery Time Badge */}
      <div className="mb-3 lg:mb-4">
        <span className="inline-block bg-[#299E60] text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-md">
          Delivery by 7:00am
        </span>
      </div>
      
      {/* Description - Shorter */}
      <p className="text-xs lg:text-sm text-gray-700 mb-4 lg:mb-5 leading-relaxed px-1">
        {vendor.description}
      </p>
      
      {/* Social Links - Smaller */}
      <div className="flex justify-center gap-2.5 mb-4 lg:mb-5">
        {vendor.socialLinks.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            className="w-9 h-9 lg:w-10 lg:h-10 bg-white rounded-lg flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110"
          >
            {link.icon}
          </a>

        ))}
      </div>
      
      {/* Contact Button - Smaller */}
      <button
  onClick={() => navigate("/Contact")}
  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 lg:py-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg text-sm lg:text-base"
>
  Contact Seller
</button>

    </div>
  </div>
);


// Filter Section Component
const FilterSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

// Main Vendor Detail Page
export default function VendorDetailPage() {
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortBy, setSortBy] = useState('latest');

  // Dummy vendor data
  const vendor = {
    name: 'Safeway',
    logo: Basket,
    address: 'New Street, 520, New York',
    since: 'Since 2009',
    description: "It's easy and free to link or sign up for our loyalty program, and it only takes a few seconds.",
    socialLinks: [
      { icon: <svg className="w-4 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, url: '#' },
      { icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>, url: '#' },
      { icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>, url: '#' },
      { icon: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, url: '#' },
    ]
  };

  // Dummy products data
  const products = [
    {
      id: 301,
      title: "C-500 Antioxidant Protect Dietary Supplement",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Almond
    },
    {
      id: 302,
      title: "Marcel's Modern Pantry Almond Unsweetened",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Apple
    },
    {
      id: 303,
      title: "O Organics Milk, Whole, Vitamin D",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Green
    },
    {
      id: 304,
      title: "Whole Grains and Seeds Organic Bread",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Banana
    },
    {
      id: 305,
      title: "Lucerne Yogurt, Lowfat, Strawberry",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Orange
    },
    {
      id: 306,
      title: "C-500 Antioxidant Protect Dietary Supplement",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Milk
    },
    {
      id: 307,
      title: "Good & Gather Farmed Atlantic Salmon",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Tropicana
    },
     {
      id: 308,
      title: "Whole Grains and Seeds Organic Bread",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Banana
    },
    {
      id: 309,
      title: "Lucerne Yogurt, Lowfat, Strawberry",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Orange
    },
     {
      id: 310,
      title: "Marcel's Modern Pantry Almond Unsweetened",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Apple
    },
    {
      id: 311,
      title: "O Organics Milk, Whole, Vitamin D",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Green
    },
    {
      id: 312,
      title: "Whole Grains and Seeds Organic Bread",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Banana
    },
    {
      id: 313,
      title: "Lucerne Yogurt, Lowfat, Strawberry",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Orange
    },
    {
      id: 314,
      title: "C-500 Antioxidant Protect Dietary Supplement",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Milk
    },
    {
      id: 315,
      title: "Good & Gather Farmed Atlantic Salmon",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Tropicana
    },
     {
      id: 316,
      title: "Whole Grains and Seeds Organic Bread",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Banana
    },
    {
      id: 317,
      title: "Lucerne Yogurt, Lowfat, Strawberry",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Orange
    },
    {
      id: 318,
      title: "C-500 Antioxidant Protect Dietary Supplement",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Milk
    },
    {
      id: 319,
      title: "C-500 Antioxidant Protect Dietary Supplement",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Milk
    },
    {
      id: 320,
      title: "Good & Gather Farmed Atlantic Salmon",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Tropicana
    },
    
    {
      id: 321,
      title: "Market Pantry 41/50 Raw Tail-Off Large Shrimp",
      newPrice: "$14.99",
      oldPrice: "$28.99",
      rating: "4.8",
      reviews: "17k",
      image: Lays
    }
  ];

  const categories = [
    { name: "Mobile & Accessories", count: 12 },
    { name: "Laptop", count: 12 },
    { name: "Electronics", count: 12 },
    { name: "Smart Watch", count: 12 },
    { name: "Storage", count: 12 },
    { name: "Portable Devices", count: 12 },
    { name: "Action Camera", count: 12 }
  ];

  const ratingOptions = [
    { stars: 5, count: 124 },
    { stars: 4, count: 52 },
    { stars: 3, count: 12 },
    { stars: 2, count: 5 },
    { stars: 1, count: 2 }
  ];

  return (

    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-8">
          <Home className="w-4 h-4 text-gray-500" />
          <a href="#" className="text-gray-600 hover:text-green-600">Home</a>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-green-600 font-medium">Vendor Details</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Sidebar - Wider (1.5 cols out of 5) */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Vendor Info Card */}
            <VendorInfoCard vendor={vendor} />

            {/* Product Categories */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
  <FilterSection title="Product Category">
    
    {/* Scrollable Area */}
    <div className="max-h-60 overflow-y-auto pr-1 space-y-2">

      {categories.map((category, idx) => (
        <label
          key={idx}
          className="flex items-center justify-between group cursor-pointer rounded-lg px-3 py-2 hover:bg-green-50 transition"
        >
          {/* Left Side */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 accent-green-600 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-green-700">
              {category.name}
            </span>
          </div>

          {/* Count Badge */}
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full group-hover:bg-green-100 group-hover:text-green-700">
            {category.count}
          </span>
        </label>
      ))}

    </div>
  </FilterSection>
</div>


            Price Filter
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-xl font-bold mb-5 text-gray-800 border-b pb-3">Filter by Price</h3>
  <div className="space-y-5">
    {/* Dual Range Slider */}
    <div className="relative px-2 pt-2">
      <div className="relative h-2 bg-gray-200 rounded-full">
        {/* Active range bar */}
        <div 
          className="absolute h-2 bg-orange-500 rounded-full"
          style={{
            left: `${(priceRange[0] / 100) * 100}%`,
            right: `${100 - (priceRange[1] / 100) * 100}%`
          }}
        />
      </div>
      
      {/* Min range input */}
      <input
        type="range"
        min="0"
        max="100"
        value={priceRange[0]}
        onChange={(e) => {
          const value = Math.min(+e.target.value, priceRange[1] - 1);
          setPriceRange([value, priceRange[1]]);
        }}
        className="price-range-input absolute w-full h-2 bg-transparent appearance-none cursor-pointer top-2"
        style={{
          zIndex: priceRange[0] > 90 ? 5 : 3
        }}
      />
      
      {/* Max range input */}
      <input
        type="range"
        min="0"
        max="100"
        value={priceRange[1]}
        onChange={(e) => {
          const value = Math.max(+e.target.value, priceRange[0] + 1);
          setPriceRange([priceRange[0], value]);
        }}
        className="price-range-input absolute w-full h-2 bg-transparent appearance-none cursor-pointer top-2"
        style={{
          zIndex: 4
        }}
      />
    </div>
    
    {/* Price Display */}
    <div className="flex items-center justify-between px-1">
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 mb-1">Min Price</span>
        <span className="text-lg font-bold text-orange-500">${priceRange[0]}</span>
      </div>
      <div className="text-gray-400">—</div>
      <div className="flex flex-col items-end">
        <span className="text-xs text-gray-500 mb-1">Max Price</span>
        <span className="text-lg font-bold text-orange-500">${priceRange[1]}</span>
      </div>
    </div>
    
    {/* Apply Filter Button */}
    <button className="w-full bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 active:scale-[0.98] transition-all shadow-md">
      Apply Filter
    </button>
    
    {/* Reset Button */}
    <button 
      onClick={() => setPriceRange([0, 100])}
      className="w-full text-gray-600 text-sm hover:text-orange-500 transition-colors"
    >
      Reset Filters
    </button>
  </div>
</div>

            {/* Rating Filter */}
            <div className="bg-white rounded-lg p-6 ">
              <FilterSection title="Filter by Rating">
                <div className="space-y-3">
                  {ratingOptions.map((option, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer hover:text-green-600">
                      <input 
                        type="radio" 
                        name="rating" 
                        className="w-4 h-4 text-green-600 accent-green-600"
                        onChange={() => setSelectedRating(option.stars)}
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-4 h-4 ${i < option.stars ? 'fill-orange-400 text-orange-400' : 'fill-gray-200 text-gray-200'}`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{option.count}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </FilterSection>
            </div>

            {/* Promotional Banner */}
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 text-center w-60">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fresh Vegetables</h3>
              <p className="text-2xl font-bold text-green-600 mb-4">Up to 25% Off</p>
              <div className="relative w-full h-48 mb-4">
                <img 
                  src={Basket} 
                  alt="Vegetables basket"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </aside>

          {/* Main Products Area - Takes remaining 4 columns */}
      <div className="lg:col-span-4">
  {/* Search and Sort Bar */}
  <div className="bg-white rounded-full p-4 mb-6 flex flex-wrap items-center gap-8">
    <div className="max-w-[450px] flex-1">
      <div className="relative">
        <input
          type="text"
          placeholder="Search vendors by name or ID..."
          className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-balck"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-2 rounded-full">
          <Search className="w-5 h-5" />
        </button>
      </div>
    </div>
    
    <div className="flex items-center gap-4 ml-auto">
      <span className="text-lg text-gray-600 whitespace-nowrap">Showing 1-20 of 85 results</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium whitespace-nowrap">Sort by:</span>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-full px-3 py-2 text-sm w-20 "
        >
          <option value="latest">Latest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>
  </div>
            {/* Products Grid - 4 Cards per Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">  
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
             </div>
        </div>
      </main>
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

}