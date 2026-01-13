// src/components/CatalogueHeader.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon, FilterIcon, XIcon } from '@/components/Icons'; // Ensure path is correct
import CatalogueFilters from '@/components/CatalogueFilters';

export default function CatalogueHeader({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setSearchValue(searchParams.get('search') || "");
  }, [searchParams]);

  // Prevent background scrolling when filter is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isFilterOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) params.set('search', searchValue);
    else params.delete('search');
    router.push(`/catalogue?${params.toString()}`);
  };

  const activeFiltersCount = [
    searchParams.get('category'), 
    searchParams.get('material')
  ].filter(Boolean).length;

  return (
    <>
      {/* Sticky Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-6 py-4 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex gap-4 items-center">
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2 max-w-3xl relative group">
            <div className="relative flex-1">
                <input 
                  type="text" 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search rings, diamonds..." 
                  className="w-full p-3 pl-12 border border-gray-200 rounded-full bg-gray-50 focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 outline-none transition-all duration-300 placeholder-gray-400 text-gray-800"
                />
                <SearchIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#7D3C98] transition-colors" />
            </div>
            <button type="submit" className="bg-[#1a1a1a] text-white px-8 rounded-full font-medium hover:bg-[#7D3C98] transition-colors duration-300 hidden sm:block">
                Search
            </button>
          </form>

          {/* Filter Trigger Button */}
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-full font-medium border transition-all duration-300 relative
              ${isFilterOpen || activeFiltersCount > 0 
                ? 'bg-purple-50 border-[#7D3C98] text-[#7D3C98]' 
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <FilterIcon className="w-5 h-5" />
            <span className="hidden md:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#7D3C98] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- Filter Drawer --- */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-900/20 z-40 transition-opacity duration-300 backdrop-blur-sm ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsFilterOpen(false)}
      />

      {/* Side Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-112.5 bg-white z-50 shadow-2xl transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          
          {/* Drawer Header */}
          <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Filter Designs</h2>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-hide">
             <CatalogueFilters />
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-gray-100 bg-white flex gap-4 safe-area-bottom">
            <button 
              onClick={() => {
                router.push('/catalogue');
                setIsFilterOpen(false);
              }}
              className="flex-1 py-4 text-gray-500 font-bold hover:text-gray-900 transition underline-offset-4 hover:underline"
            >
              Clear All
            </button>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="flex-2 py-4 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-[#7D3C98] shadow-lg hover:shadow-purple-200 transition-all transform hover:-translate-y-0.5"
            >
              Show Results
            </button>
          </div>
        </div>
      </div>
    </>
  );
}