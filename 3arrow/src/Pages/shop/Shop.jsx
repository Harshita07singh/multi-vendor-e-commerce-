
import React, { useState } from 'react';
import { ShoppingCart, Grid, List, ChevronDown, Home, ChevronRight, Star } from 'lucide-react';
import Ipad from '../../assets/Ipad.png';
import { useNavigate } from "react-router-dom";

// ============ REUSABLE GREEN CARD COMPONENT ============

const ProductCard = ({ product, viewMode = 'grid' }) => {
    const navigate = useNavigate();

  const goToDetail = () => {
    navigate(`/shop/${product.id}`);
  };

  if (viewMode === 'list') {
    // List View - Horizontal Layout
    return (
<div
  onClick={goToDetail}
  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-green-400 transition-all duration-300 cursor-pointer flex group"
>

        <div className="relative p-6 w-2/5 flex-shrink-0 bg-gray-50">
          <button className="absolute top-4 right-4 bg-white hover:bg-green-700 text-gray-700 hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md z-10 border border-gray-200">
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>

          <div className="flex justify-center items-center h-48">
            <img 
              src={product.image}
              alt={product.name}
              className="w-30 h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <div className="px-6 py-5 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-gray-800 font-semibold text-lg leading-snug transition-colors line-clamp-2">
              {product.name}
            </h3>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-gray-900 font-semibold text-sm">{product.rating}</span>
              <span className="text-gray-400 text-sm">({product.reviews}k reviews)</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-gray-900">${product.price}</span>
              <span className="text-gray-400 line-through text-base">${product.oldPrice}</span>
              <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md text-xs font-semibold">
                {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Availability</span>
                <span className="text-gray-900 font-semibold">Sold: {product.sold}/{product.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(product.sold / product.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View - Vertical Layout (Default)
  return (
    // <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer ">
    <div
  onClick={goToDetail}
  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
>

      <div className="relative p-5 bg-gray-50">
        <button className="absolute top-4 right-4 bg-white hover:bg-green-700 text-gray-700 hover:text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md z-10 border border-gray-200">
          <ShoppingCart className="w-4 h-4" />
          Add
        </button>

        <div className="flex justify-center items-center h-52 mb-3">
          <img 
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      <div className="px-5 pb-5 space-y-2.5">
        <h3 className="text-gray-800 font-semibold text-base leading-snug transition-colors line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-gray-900 font-semibold text-sm">{product.rating}</span>
          <span className="text-gray-400 text-xs">({product.reviews}k)</span>
        </div>

        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-xl font-bold text-gray-900">${product.price}</span>
          <span className="text-gray-400 line-through text-sm">${product.oldPrice}</span>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-1.5">
          <span className="text-orange-600 text-xs font-semibold">
            Save ${(product.oldPrice - product.price).toFixed(2)} ({Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF)
          </span>
        </div>

        <div className="pt-2 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Available</span>
            <span className="text-gray-900 font-medium">{product.total - product.sold} left</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-400 to-orange-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${(product.sold / product.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
// ============ MAIN SHOP PAGE ============

export default function ShopPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('Popular');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedRating, setSelectedRating] = useState(4);
  const [selectedColors, setSelectedColors] = useState([]);

  const categories = [
    { name: 'Mobile & Accessories', count: 12 },
    { name: 'Laptop', count: 12 },
    { name: 'Electronics', count: 12 },
    { name: 'Smart Watch', count: 12 },
    { name: 'Storage', count: 12 },
    { name: 'Portable Devices', count: 12 },
    { name: 'Action Camera', count: 12 },
    { name: 'Smart Gadget', count: 12 },
    { name: 'Monitor', count: 12 },
    { name: 'Smart TV', count: 12 },
    { name: 'Camera', count: 12 },
    { name: 'Monitor Stand', count: 12 },
  ];

  const ratings = [
    { stars: 5, count: 124 },
    { stars: 4, count: 52 },
    { stars: 3, count: 12 },
    { stars: 2, count: 5 },
    { stars: 1, count: 2 },
  ];

  const colors = [
    { name: 'Black', count: 12 },
    { name: 'Blue', count: 12 },
    { name: 'Gray', count: 12 },
    { name: 'Green', count: 12 },
    { name: 'Red', count: 12 },
    { name: 'White', count: 12 },
    { name: 'Purple', count: 12 },
  ];

  const brands = [
    { name: 'Apple', count: 12 },
    { name: 'Samsung', count: 10 },
    { name: 'Xiaomi', count: 8 },
    { name: 'Realme', count: 6 },
    { name: 'OnePlus', count: 5 },
  ];

  const products = [
    {
      id: 1,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 2,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 3,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1592286927505-2fd0d1e6b7f4?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 4,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 5,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 6,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 7,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 8,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 9,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 10,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
     {
      id: 4,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 5,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 6,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 7,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 8,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 9,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    {
      id: 10,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
    
    
     {
       id: 11,
       name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
       oldPrice: 28.99,
       price: 14.99,
     },
    
    
     {
       id: 11,
       name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
       oldPrice: 28.99,
       price: 14.99,
     },
    {
      id: 12,
      name: 'Taylor Farms Broccoli Florets Vegetables',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews: 17,
      sold: 18,
      total: 35,
      oldPrice: 28.99,
      price: 14.99,
    },
  ];

  const features = [
    {
      title: "Free Shipping",
      description: "Free shipping all over the US",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 fill-white">
          <path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m1.5-9l1.96 2.5H17V9.5m-11 9A1.5 1.5 0 0 1 4.5 17A1.5 1.5 0 0 1 6 15.5A1.5 1.5 0 0 1 7.5 17A1.5 1.5 0 0 1 6 18.5M20 8h-3V4H3c-1.11 0-2 .89-2 2v11h2a3 3 0 0 0 3 3a3 3 0 0 0 3-3h6a3 3 0 0 0 3 3a3 3 0 0 0 3-3h2v-5l-3-4Z"/>
        </svg>
      )
    },
    {
      title: "100% Satisfaction",
      description: "Free shipping all over the US",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 fill-white">
          <path d="M23 12l-2.44-2.79l.34-3.69l-3.61-.82L15.4 1.5L12 2.96L8.6 1.5L6.71 4.69L3.1 5.5l.34 3.7L1 12l2.44 2.79l-.34 3.7l3.61.82L8.6 22.5l3.4-1.47l3.4 1.46l1.89-3.19l3.61-.82l-.34-3.69L23 12m-12.91 4.72l-3.8-3.81l1.48-1.48l2.32 2.33l5.85-5.87l1.48 1.48l-7.33 7.35z"/>
        </svg>
      )
    },
    {
      title: "Secure Payments",
      description: "Free shipping all over the US",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 fill-white">
          <path d="M20 8h-3V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2M9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6m9 14H6V10h12v10m-6-3c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2"/>
        </svg>
      )
    },
    {
      title: "24/7 Support",
      description: "Free shipping all over the US",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 fill-white">
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5c0-.39-.15-.74-.39-1.01c-.23-.26-.38-.61-.38-.99c0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5c0-4.42-4.03-8-9-8m-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9S8 9.67 8 10.5S7.33 12 6.5 12m3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8m5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8m3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5"/>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white-500">
      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 py-4 ">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-800">Shop</h1>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Home className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600 hover:text-orange-500 cursor-pointer">Home</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-orange-500 font-semibold">Shop</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Product Categories Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-5 text-gray-800 border-b pb-3">Product Category</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="flex justify-between items-center text-gray-700 hover:text-orange-500 cursor-pointer transition-colors py-1"
                  >
                    <span className="text-sm">{category.name}</span>
                    <span className="text-gray-400 text-sm">({category.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter by Price */}
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

           {/* Filter by Rating Card */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-xl font-bold mb-5 text-gray-800 border-b pb-3">Filter by Rating</h3>
  <div className="space-y-2">
    {ratings.map((item) => (
      <label 
        key={item.stars} 
        className="flex items-center justify-between cursor-pointer hover:bg-orange-50 p-3 rounded-lg transition-all group"
      >
        <div className="flex items-center gap-3 flex-1">
          <input
            type="radio"
            name="rating"
            checked={selectedRating === item.stars}
            onChange={() => setSelectedRating(item.stars)}
            className="w-4 h-4 accent-orange-500 cursor-pointer"
          />
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < item.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
            <span className="text-sm font-medium text-gray-700 ml-1">& Up</span>
          </div>
        </div>
        <span className="text-sm text-gray-500 font-medium">({item.count})</span>
      </label>
    ))}
  </div>
</div>
               {/* Filter by Color Card */}
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-xl font-bold mb-5 text-gray-800 border-b pb-3">Filter by Color</h3>
  <div className="space-y-2">
    {colors.map((color) => (
      <label 
        key={color.name} 
        className="flex items-center justify-between gap-3 cursor-pointer hover:bg-orange-50 p-3 rounded-lg transition-all group"
      >
        <div className="flex items-center gap-3 flex-1">
          <input
            type="radio"
            name="color-filter"
            value={color.name}
            checked={selectedColors === color.name}
            onChange={() => setSelectedColors(color.name)}
            className="color-radio w-5 h-5 cursor-pointer"
          />
          <span className="text-gray-700 text-sm font-medium group-hover:text-orange-600 transition-colors">
            {color.name}
          </span>
        </div>
        <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded-full group-hover:bg-orange-100 group-hover:text-orange-600 transition-all">
          {color.count}
        </span>
      </label>
    ))}
  </div>
  
  {/* Clear Selection Button */}
  <button 
    onClick={() => setSelectedColors(null)}
    className="w-full mt-4 text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
  >
    Clear Selection
  </button>
</div>

            {/* Filter by Brand Card */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-xl font-bold mb-5 text-gray-800 border-b pb-3">Filter by Brand</h3>
  
  {/* Search Box */}
  <div className="mb-4">
    <div className="relative">
      <input
        type="text"
        placeholder="Search brands..."
        className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
      />
      <svg 
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  </div>

  {/* Brand List */}
  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
    {brands.map((brand) => (
      <label 
        key={brand.name} 
        className="flex items-center justify-between gap-3 cursor-pointer hover:bg-orange-50 p-3 rounded-lg transition-all group"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <input
              type="radio"
              name="brand-filter"
              value={brand.name}
              className="brand-radio w-5 h-5 cursor-pointer"
            />
          </div>
          <span className="text-gray-700 text-sm font-medium group-hover:text-orange-600 transition-colors">
            {brand.name}
          </span>
        </div>
        <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded-full group-hover:bg-orange-100 group-hover:text-orange-600 transition-all">
          {brand.count}
        </span>
      </label>
    ))}
  </div>

  {/* Clear Selection Button */}
  <button className="w-full mt-4 text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors">
    Clear Selection
  </button>
</div>
   
           {/* Promotional Banner */}
          <div className="rounded-xl overflow-hidden shadow-xl">
      <img 
    src={Ipad} 
    alt="Apple iPad Air 4th Generation" 
    className="w-full h-full object-cover rounded-xl"
     />
</div>
</div>
          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 font-medium">Showing 1-20 of 85 result</p>
              
              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === 'list' 
                        ? 'bg-white border-2 border-gray-300' 
                        : 'bg-white border border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <List className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-orange-500 text-white border-2 border-orange-500' 
                        : 'bg-white border border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </div>
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border-1 rounded-xl px-6 py-2.5 pr-10 cursor-pointer font-medium text-gray-700 "
                    >
                      <option>Popular</option>
                      <option>Latest</option>
                      <option>Trending</option>
                      <option>Matches</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid/List */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  viewMode={viewMode}
                />
              ))}
            </div>
            </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="max-w-7xl mx-auto p-4 sm:p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-5 mb-12 sm:mb-16 lg:mb-5">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-[#CEF2DF] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex items-center gap-4 sm:gap-5"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#34A853] rounded-full flex items-center justify-center flex-shrink-0">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-700">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}


