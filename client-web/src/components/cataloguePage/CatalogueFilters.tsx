"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { CheckIcon } from '@/components/Icons'; // Ensure this is imported

const CATEGORIES = ["All", "Earrings", "Bracelets", "Men Rings", "Ladies Rings", "Bands"];
const MATERIALS = ["All", "Platinum", "Gold", "White Gold", "Rose Gold"];

// Helper to map materials to CSS Gradients for that "Premium Metal" look
const getMaterialStyle = (material: string) => {
  switch (material) {
    case 'Platinum': return 'bg-gradient-to-br from-gray-100 to-gray-400 border-gray-200';
    case 'Gold': return 'bg-gradient-to-br from-[#FCE38A] to-[#F38181] border-yellow-200'; // Warm Gold
    case 'White Gold': return 'bg-gradient-to-br from-slate-50 to-slate-300 border-gray-200';
    case 'Rose Gold': return 'bg-gradient-to-br from-rose-100 to-rose-400 border-rose-200';
    default: return 'bg-gray-100 border-gray-200';
  }
};

export default function CatalogueFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "All") params.delete(name);
      else params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (type: string, value: string) => {
    router.push(`/catalogue?${createQueryString(type, value)}`, { scroll: false });
  };

  const currentCategory = searchParams.get('category') || "All";
  const currentMaterial = searchParams.get('material') || "All";

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* --- CATEGORIES (Clean List Style) --- */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-gray-900 text-xl tracking-wide">Category</h3>
        <div className="flex flex-col space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleFilterChange('category', cat)}
                className={`
                  group flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200
                  ${isActive ? 'bg-purple-50 text-[#7D3C98]' : 'hover:bg-gray-50 text-gray-600'}
                `}
              >
                <span className={`text-base ${isActive ? 'font-bold' : 'font-medium group-hover:text-gray-900'}`}>
                  {cat}
                </span>
                
                {/* Animated Checkmark */}
                <div className={`transition-all duration-200 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                   <CheckIcon className="w-5 h-5 text-[#7D3C98]" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-100 w-full" />

      {/* --- MATERIALS (Visual Swatch Style) --- */}
      <div className="space-y-5">
        <h3 className="font-serif font-bold text-gray-900 text-xl tracking-wide">Material</h3>
        <div className="flex flex-wrap gap-3">
          {MATERIALS.map((mat) => {
            const isActive = currentMaterial === mat;
            const isAll = mat === "All";

            return (
              <button
                key={mat}
                onClick={() => handleFilterChange('material', mat)}
                className={`
                  relative px-4 py-2 rounded-full border transition-all duration-300 flex items-center gap-2 group
                  ${isActive 
                    ? 'border-[#7D3C98] bg-purple-50 ring-1 ring-[#7D3C98] ring-offset-1' 
                    : 'border-gray-200 hover:border-gray-400 bg-white'}
                `}
              >
                {/* Visual Dot for Metal */}
                {!isAll && (
                  <span className={`w-4 h-4 rounded-full border shadow-sm ${getMaterialStyle(mat)}`} />
                )}
                
                <span className={`text-sm ${isActive ? 'font-bold text-[#7D3C98]' : 'font-medium text-gray-600'}`}>
                  {mat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}