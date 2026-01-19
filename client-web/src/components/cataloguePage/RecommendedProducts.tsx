// src/components/RecommendedProducts.tsx
"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@/components/Icons';

interface Product {
  sku: string;
  product_name: string;
  category: string;
  final_image_url: string;
}

export default function RecommendedProducts({ products, currentSku }: { products: Product[], currentSku: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter out the current product being viewed to avoid duplicates
  const filteredProducts = products.filter(p => p.sku !== currentSku);

  if (filteredProducts.length === 0) return null;

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  // Helper functions to match your URL requirements
  const formatCategory = (cat: string) => cat.toLowerCase().replace(/\s+/g, '-');
  
  const generateSlug = (name: string, sku: string) => {
    const formattedName = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with dashes
      .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes
    return `${formattedName}-${sku}`;
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 relative group">
      <div className="flex justify-between items-end mb-12">
        <h2 className="text-4xl font-serif font-bold text-gray-900">Recommended for You</h2>
        {/* <p className="text-[#7D3C98] font-bold text-sm tracking-widest uppercase">Same Category</p> */}
      </div>
      
      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-8 pb-10 scrollbar-hide snap-x snap-mandatory"
        >
          {filteredProducts.map((p) => (
            /* On click, this Link opens the specific product page */
            <Link 
              key={p.sku} 
              href={`/${formatCategory(p.category)}/${generateSlug(p.product_name, p.sku)}`} 
              className="group min-w-70 md:min-w-[320px] snap-center block"
            >
              <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 mb-6 border border-gray-100 shadow-sm relative">
                <img 
                  src={p.final_image_url || '/placeholder.jpg'} 
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
                  alt={p.product_name}
                />
                <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/5"></div>
              </div>
              
              <h4 className="font-bold text-gray-900 text-lg truncate group-hover:text-[#7D3C98] transition">
                {p.product_name}
              </h4>
              <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">{p.sku}</p>
            </Link>
          ))}
        </div>

        {/* Right Arrow navigation */}
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white shadow-xl border border-gray-100 p-4 rounded-full text-[#7D3C98] hover:bg-[#7D3C98] hover:text-white transition-all opacity-0 group-hover:opacity-100 md:block hidden"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}