// src/components/CatalogueFilters.tsx
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const CATEGORIES = ["All", "Rings", "Necklaces", "Earrings", "Bracelets", "Men Rings"];
const MATERIALS = ["All", "Platinum", "Gold", "White Gold", "Rose Gold"];

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
    <div className="space-y-8">
      {/* Categories */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">Category</h3>
        <div className="grid grid-cols-1 gap-3">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${currentCategory === cat ? 'border-[#7D3C98]' : 'border-gray-300'}`}>
                {currentCategory === cat && <div className="w-2.5 h-2.5 rounded-full bg-[#7D3C98]" />}
              </div>
              <input type="radio" name="category" className="hidden" checked={currentCategory === cat} onChange={() => handleFilterChange('category', cat)} />
              <span className={`text-base ${currentCategory === cat ? 'text-[#7D3C98] font-bold' : 'text-gray-600'}`}>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">Material</h3>
        <div className="grid grid-cols-1 gap-3">
          {MATERIALS.map((mat) => (
            <label key={mat} className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentMaterial === mat ? 'border-[#7D3C98]' : 'border-gray-300'}`}>
                {currentMaterial === mat && <div className="w-2.5 h-2.5 bg-[#7D3C98]" />}
              </div>
              <input type="radio" name="material" className="hidden" checked={currentMaterial === mat} onChange={() => handleFilterChange('material', mat)} />
              <span className={`text-base ${currentMaterial === mat ? 'text-[#7D3C98] font-bold' : 'text-gray-600'}`}>{mat}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}