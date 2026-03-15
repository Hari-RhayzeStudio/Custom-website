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
      // Center (Large)
      return "left-1/2 -translate-x-1/2 w-[44%] md:w-[48%] h-[95%] md:h-full z-20 opacity-100 shadow-2xl";
    } else if (offset === 1) {
      // Right (Smaller)
      return "left-[72%] md:left-[78%] -translate-x-1/2 w-[28%] md:w-[32%] h-[70%] md:h-[75%] z-10 opacity-90 shadow-md cursor-pointer";
    } else if (offset === processImages.length - 1) {
      // Left (Smaller)
      return "left-[28%] md:left-[22%] -translate-x-1/2 w-[28%] md:w-[32%] h-[70%] md:h-[75%] z-10 opacity-90 shadow-md cursor-pointer";
    } else {
      // Hidden (Behind center)
      return "left-1/2 -translate-x-1/2 w-[28%] md:w-[32%] h-[70%] md:h-[75%] z-0 opacity-0 scale-75";
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto h-48 md:h-[260px] lg:h-[300px] mb-12 overflow-hidden flex items-center justify-center">
      {processImages.map((src, index) => (
        <div
          key={index}
          // Allow clicking a side image to manually bring it to the center
          onClick={() => setCurrentIndex(index)}
          className={`absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 ${getPosition(index)}`}
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
  );
}