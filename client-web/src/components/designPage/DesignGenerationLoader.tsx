"use client";
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const LUXURY_QUOTES = [
  "True gold fears no fire.",
  "Jewelry is like the perfect spice - it always complements what’s already there.",
  "Crafting your imagination into reality...",
  "Elegance is the only beauty that never fades.",
  "Good things take time. Great things take a moment longer.",
  "Polishing the pixels...",
  "Setting the stones of your digital dream...",
  "Every piece of jewelry tells a story. We are writing yours."
];

export default function DesignGenerationLoader() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rotate quotes every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % LUXURY_QUOTES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans pb-20 pt-10">
      
      {/* Skeleton Header */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* --- LEFT COLUMN: IMAGE SKELETON --- */}
        <div className="flex flex-col items-center">
            {/* The Image Placeholder Box */}
            <div className="w-full max-w-500px]aspect-square bg-[#FAF9F6] rounded-3xl p-8 flex flex-col items-center justify-center relative mb-6 border border-gray-100 shadow-inner">
               
               {/* Animated Icon */}
               <div className="mb-6 bg-purple-50 p-4 rounded-full">
                 <Sparkles className="w-8 h-8 text-purple-600 animate-spin-slow" />
               </div>

               {/* Rotating Quote */}
               <div className="h-16 flex items-center justify-center px-8">
                 <p className="text-center font-serif text-gray-600 text-lg italic animate-fade-in transition-all duration-500">
                   “{LUXURY_QUOTES[quoteIndex]}”
                 </p>
               </div>
               
               {/* Progress Bar */}
               <div className="w-1/2 h-1 bg-gray-200 rounded-full mt-6 overflow-hidden">
                 <div className="h-full bg-purple-400 animate-progress-indeterminate"></div>
               </div>
            </div>

            {/* Skeleton Buttons */}
            <div className="flex gap-4 w-full max-w-500px justify-end">
                <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
                <div className="w-32 h-10 bg-gray-100 rounded-lg animate-pulse" />
            </div>
        </div>

        {/* --- RIGHT COLUMN: FLASHCARD SKELETON --- */}
        <div className="flex flex-col justify-center pt-4">
          
          {/* Skeleton Disclaimer */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8 h-20 animate-pulse" />

          <div className="h-6 w-1/4 bg-gray-200 rounded mb-6 animate-pulse" />
          
          {/* Skeleton Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-24 bg-[#F3EFE0]/50 rounded-xl animate-pulse border border-transparent" />
            ))}
          </div>
          
          {/* Skeleton Bottom Actions */}
          <div className="h-4 w-1/6 ml-auto bg-gray-100 rounded mb-10 mt-2 animate-pulse" />
          <div className="w-full h-12 bg-gray-100 rounded-full animate-pulse" />

        </div>
      </div>
    </div>
  );
}