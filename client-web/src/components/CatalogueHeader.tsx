// src/components/CatalogueHeader.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon, FilterIcon, XIcon } from '@/components/Icons';
import CatalogueFilters from '@/components/CatalogueFilters';

export default function CatalogueHeader({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchValue(searchParams.get('search') || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      params.set('search', searchValue);
    } else {
      params.delete('search');
    }
    router.push(`/catalogue?${params.toString()}`);
  };

  // Count active filters for the badge
  const activeFiltersCount = [
    searchParams.get('category'), 
    searchParams.get('material')
  ].filter(Boolean).length;

  return (
    <>
      {/* --- Sticky Header --- */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex gap-3 items-center">
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2 max-w-2xl relative">
            <div className="relative flex-1">
                <input 
                type="text" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search designs..." 
                className="w-full p-3 pl-12 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                />
                <SearchIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            </div>
            <button type="submit" className="bg-[#7D3C98] text-white px-6 md:px-8 rounded-full font-bold shadow-md hover:bg-[#6a3281] transition hidden sm:block">
                Search
            </button>
          </form>

          {/* Filter Button */}
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full font-bold border transition-all relative
              ${isFilterOpen || activeFiltersCount > 0 
                ? 'bg-purple-50 border-[#7D3C98] text-[#7D3C98]' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
            `}
          >
            <FilterIcon className="w-5 h-5" />
            <span className="hidden md:inline">Filters</span>
            
            {/* Active Filter Badge */}
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#7D3C98] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- Filter Drawer (Slide-over) --- */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 backdrop-blur-sm ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsFilterOpen(false)}
      />

      {/* Sliding Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-400px bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          {/* Drawer Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-serif font-bold text-gray-900">Filter Designs</h2>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <XIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Drawer Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6">
             {/* We pass a close handler if we want auto-close features, or just render it */}
             <CatalogueFilters />
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
            <button 
              onClick={() => {
                router.push('/catalogue'); // Clear all
                setIsFilterOpen(false);
              }}
              className="flex-1 py-3 text-gray-500 font-bold hover:text-gray-800 transition"
            >
              Clear All
            </button>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="flex-1 py-3 bg-[#7D3C98] text-white rounded-xl font-bold hover:bg-[#6a3281] shadow-md transition"
            >
              Show Results
            </button>
          </div>
        </div>
      </div>
    </>
  );
}