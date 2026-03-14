"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, ChevronRightIcon } from '@/components/Icons';

// ✅ 1. Import Montserrat Font
import { Montserrat } from 'next/font/google';

// ✅ 2. Initialize Font
const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

interface Product {
  sku: string;
  product_name: string;
  category: string;
  final_image_url: string;
}

export default function RecommendedProducts({ products, currentSku }: { products: Product[], currentSku: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(p => p.sku !== currentSku);

  if (filteredProducts.length === 0) return null;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const formatCategory = (cat: string) => cat.toLowerCase().replace(/\s+/g, '-');
  
  const generateSlug = (name: string, sku: string) => {
    const formattedName = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${formattedName}-${sku}`;
  };

  return (
    <section className={`max-w-7xl mx-auto px-6 py-16 md:py-20 relative group/slider ${montserrat.className}`}>
      
      {/* ✅ FIX: Changed justify-between to justify-center and text-center to align the heading perfectly in the center */}
      <div className="flex justify-center items-center text-center w-full mb-8 md:mb-10">
        <h2 className="text-[24px] sm:text-[28px] md:text-[32px] lg:text-[36px] font-semibold text-gray-900 transition-all duration-300">
          Recommended for You
        </h2>
      </div>
      
      <div className="relative">
        {/* Left Navigation Arrow */}
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-4 z-20 bg-white shadow-lg border border-gray-100 p-3 rounded-full text-[#7D3C98] hover:bg-[#7D3C98] hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 hidden md:block"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 md:gap-6 pb-6 scrollbar-hide snap-x snap-mandatory px-1"
        >
          {filteredProducts.map((p) => (
            <Link 
              key={p.sku} 
              href={`/${formatCategory(p.category)}/${generateSlug(p.product_name, p.sku)}`} 
              className="group min-w-40 w-40 sm:min-w-55 sm:w-55 md:min-w-70 md:w-70 snap-center flex flex-col"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 border border-gray-100 shadow-sm shrink-0">
                <Image 
                  src={p.final_image_url || '/placeholder.jpg'} 
                  alt={p.product_name}
                  fill
                  sizes="(max-width: 640px) 160px, (max-width: 768px) 220px, 280px"
                  className="object-cover transition duration-700 group-hover:scale-110 mix-blend-multiply" 
                />
              </div>
              
              <h4 className="font-semibold text-gray-900 text-sm md:text-lg truncate group-hover:text-[#7D3C98] transition">
                {p.product_name}
              </h4>
              <p className="text-gray-400 text-[10px] md:text-xs mt-1 uppercase tracking-widest">{p.category}</p>
            </Link>
          ))}
        </div>

        {/* Right Navigation Arrow */}
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-4 z-20 bg-white shadow-lg border border-gray-100 p-3 rounded-full text-[#7D3C98] hover:bg-[#7D3C98] hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 hidden md:block"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}