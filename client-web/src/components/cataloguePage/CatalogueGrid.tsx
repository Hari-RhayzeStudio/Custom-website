"use client"; // <--- ADD THIS LINE AT THE TOP

import Link from 'next/link';
import Image from 'next/image';
import { EmptyStateIcon } from '@/components/Icons';
import { useState } from 'react'; // Optional: if you want to use state for the image fallback later

const generateSlug = (name: string, sku: string) => {
  const formattedName = (name || 'product').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  return `${formattedName}-${sku}`;
};

const formatCategory = (cat: string) => cat ? cat.toLowerCase().replace(/\s+/g, '-') : 'jewelry';

interface GridProps {
  products: any[];
  category?: string;
}

export default function CatalogueGrid({ products, category }: GridProps) {
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="w-full">
      {/* Summary Count */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {category || "All Designs"} 
          <span className="text-gray-400 font-normal text-sm ml-2">({safeProducts.length} found)</span>
        </h2>
      </div>

      {safeProducts.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            <EmptyStateIcon className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No designs found.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {safeProducts.map((p: any, index: number) => (
            <div 
              key={index} 
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col group hover:shadow-lg transition duration-300"
            >
              <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-xl bg-gray-50">
                 {p.final_image_url ? (
                   <Image 
                     src={p.final_image_url} 
                     alt={p.product_name || 'Jewelry Item'} 
                     fill
                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                     className="object-cover transition duration-700 group-hover:scale-105"
                     // This handler is what required "use client"
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.style.display = 'none'; // Simple hiding
                       target.parentElement!.style.backgroundColor = '#f3f4f6'; // Set grey bg
                       target.parentElement!.innerText = 'Image not available'; // Optional text
                       target.parentElement!.style.display = 'flex';
                       target.parentElement!.style.alignItems = 'center';
                       target.parentElement!.style.justifyContent = 'center';
                       target.parentElement!.style.fontSize = '12px';
                       target.parentElement!.style.color = '#9ca3af';
                     }}
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 text-xs">No Image</div>
                 )}
                 
                 {p.category && (
                   <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider text-gray-600 z-10">
                     {p.category}
                   </div>
                 )}
              </div>
              
              <h3 className="font-serif text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={p.product_name}>
                  {p.product_name || 'Untitled Product'}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">{p.final_description || ''}</p>
              
              <Link 
                href={`/${formatCategory(p.category)}/${generateSlug(p.product_name, p.sku)}`}
                className="w-full border border-[#7D3C98] text-[#7D3C98] py-2.5 rounded-xl font-bold text-sm hover:bg-[#7D3C98] hover:text-white transition-colors flex items-center justify-center gap-2 text-center"
              >
                  View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}