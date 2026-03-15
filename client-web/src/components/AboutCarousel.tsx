"use client";

import React, { useState, useEffect } from 'react';

const processImages = [
  "/assets/manufacturing.webp", 
  "/assets/manufacture.png", 
  "/assets/discuss-design.png", 
  "/assets/dd.webp", 
  "/assets/dd1.webp"
];

export default function AboutCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % processImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getPosition = (index: number) => {
    const offset = (index - currentIndex + processImages.length) % processImages.length;
    
    if (offset === 0) {
      // Center (Large): 325px x 200px
      return "left-1/2 -translate-x-1/2 w-[260px] h-[160px] md:w-[325px] md:h-[200px] z-20 opacity-100 shadow-xl";
    } else if (offset === 1) {
      // Right (Small): 155px x 165px
      return "left-[calc(50%+140px)] md:left-[calc(50%+260px)] -translate-x-1/2 w-[120px] h-[130px] md:w-[155px] md:h-[165px] z-10 opacity-90 hover:opacity-100 shadow-md cursor-pointer";
    } else if (offset === processImages.length - 1) {
      // Left (Small): 155px x 165px
      return "left-[calc(50%-140px)] md:left-[calc(50%-260px)] -translate-x-1/2 w-[120px] h-[130px] md:w-[155px] md:h-[165px] z-10 opacity-90 hover:opacity-100 shadow-md cursor-pointer";
    } else {
      // Hidden (Behind center)
      return "left-1/2 -translate-x-1/2 w-[155px] h-[165px] z-0 opacity-0 scale-75 pointer-events-none";
    }
  };

  return (
    <div className="w-full flex flex-col items-center mb-12 md:mb-16">
      
      {/* 🖼️ Carousel Images Container */}
      <div className="relative w-full max-w-4xl mx-auto h-[180px] md:h-[220px] overflow-hidden flex items-center justify-center">
        {processImages.map((src, index) => (
          <div
            key={index}
            // Allow clicking a side image to manually bring it to the center
            onClick={() => setCurrentIndex(index)}
            className={`absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 ${getPosition(index)}`}
          >
            <img
              src={src}
              alt={`Process ${index + 1}`}
              className="object-cover w-full h-full"
              onError={(e) => e.currentTarget.src = "/assets/placeholder-jewelry.jpg"}
            />
          </div>
        ))}
      </div>

      {/* ⏺️ Pagination Dots */}
      <div className="flex justify-center items-center gap-2 mt-6">
        {processImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === index 
                ? 'w-6 bg-[#7D3C98]'  // Active state (purple pill)
                : 'w-2 bg-gray-300 hover:bg-gray-400' // Inactive state (gray circle)
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
}