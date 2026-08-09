

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import fruits2 from '../assets/fruits2.png';
import Milk from '../assets/Milk.png'
import Tropicana from '../assets/Tropicana.png';
import PeanutButter from '../assets/PeanutButter.png';
import Mushrooms from '../assets/Mushrooms.png';
import download from '../assets/download.png';
import Lays from '../assets/Lays.png';

const OrganicFoodSection = () => {
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const products = [
    {
      id: 61,
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: fruits2,
      rating: 4.8,
      reviews: 17,
      originalPrice: 28.99,
      price: 14.99
    },
    {
      id: 62,
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: Milk,
      rating: 4.8,
      reviews: 17,
      originalPrice: 28.99,
      price: 14.99
    },
    {
      id: 63,
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: Tropicana,
      rating: 4.8,
      reviews: 17,
      originalPrice: 28.99,
      price: 14.99
    },
    {
      id: 64,
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: Lays,
      rating: 4.8,
      reviews: 17,
      originalPrice: 28.99,
      price: 14.99
    },
    {
      id: 65,
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: download,
      rating: 4.8,
      reviews: 17,
      originalPrice: 28.99,
      price: 14.99
    },
    {
      id: 66,
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: PeanutButter,
      rating: 4.8,
      reviews: 17,
      originalPrice: 28.99,
      price: 14.99
    },
    {
      id: 67,
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: Mushrooms,
      rating: 4.8,
      reviews: 17,
      originalPrice: 28.99,
      price: 14.99
    },
    {
      id: 68,
      name: "Taylor Farms Broccoli Florets Vegetables",
      image: PeanutButter,
      rating: 4.8,
      reviews: 17,
      originalPrice: 28.99,
      price: 14.99
    }
  ];

  // Duplicate products for infinite loop
  const allProducts = [...products, ...products];

  // Auto scroll effect
  useEffect(() => {
    if (isDragging) return; // Don't auto-scroll while dragging
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= products.length) {
          if (scrollRef.current) {
            scrollRef.current.style.transition = 'none';
            scrollRef.current.style.transform = `translateX(0px)`;
          }
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.style.transition = 'transform 0.5s ease-in-out';
            }
          }, 50);
          return 0;
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [products.length, isDragging]);

  // Calculate card width
  const getCardWidth = () => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1400;
    
    if (screenWidth < 640) {
      return (screenWidth - 48) / 3;
    } else if (screenWidth < 1024) {
      return (screenWidth - 80) / 4;
    } else {
      const containerWidth = Math.min(screenWidth - 32, 1400);
      return (containerWidth - 100) / 5;
    }
  };

  const scroll = (direction) => {
    if (direction === 'left') {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }
  };

  // Mouse/Touch drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    containerRef.current.style.cursor = 'grabbing';
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
    }
  };

  return (
    <div className="bg-white py-8 sm:py-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Organic Food</h2>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm sm:text-base text-gray-700 font-medium">All Categories</span>
            <div className="flex gap-1 sm:gap-2">
              <button 
                onClick={() => scroll('left')}
                className="p-1.5 sm:p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="p-1.5 sm:p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Carousel */}
        <div 
          ref={containerRef}
          className="overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          style={{ 
            scrollBehavior: isDragging ? 'auto' : 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <div 
            ref={scrollRef}
            className="flex gap-2 sm:gap-4"
            style={{ 
              transform: isDragging ? 'none' : `translateX(-${currentIndex * (getCardWidth() + (window.innerWidth < 640 ? 8 : 16))}px)`,
              transition: isDragging ? 'none' : 'transform 0.5s ease-in-out'
            }}
          >
            {allProducts.map((product, index) => (
              <div 
                key={`${product.id}-${index}`}
                onMouseEnter={() => !isDragging && setHoveredCard(`${product.id}-${index}`)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`flex-shrink-0 bg-white rounded-xl p-2 sm:p-4 md:p-5 transition-all duration-300 flex flex-col select-none ${
                  hoveredCard === `${product.id}-${index}`
                    ? 'border-1 border-green-500 ' 
                    : 'border-2 border-gray-100 '
                }`}
                style={{ width: `${getCardWidth()}px` }}
              >
                {/* Product Image */}
                <div className="rounded-xl mb-2 flex items-center justify-center h-25 sm:h-40 md:h-48 overflow-hidden pointer-events-none">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded-xl"
                    draggable="false"
                  />
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">{product.rating}</span>
                  <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-orange-400 text-orange-400" />
                  <span className="text-gray-500 text-[10px] sm:text-xs">({product.reviews}k)</span>
                </div>

                {/* Product Name */}
                <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-900 mb-1 sm:mb-2 line-clamp-2 min-h-[24px] sm:min-h-[32px]">
                  {product.name}
                </h3>
                
                {/* Price and Add Button */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-gray-400 line-through text-[9px] sm:text-xs">${product.originalPrice}</span>
                    <div className="flex items-center gap-0.5">
                      <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">${product.price}</span>
                      <span className="hidden sm:inline text-xs text-gray-500">/Qty</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 sm:px-3 py-1 bg-green-100 text-green-600 font-medium rounded-lg hover:bg-green-200 transition flex items-center gap-1 text-[10px] sm:text-xs"
                  >
                    Add
                    <ShoppingCart className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom CSS for hiding scrollbar */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default OrganicFoodSection;