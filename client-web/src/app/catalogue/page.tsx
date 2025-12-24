"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
// IMPORT FROM YOUR NEW FILE
import { EmptyStateIcon } from '@/components/Icons'; 

export default function Catalogue() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Added a small debounce could be a next step here
    fetch(`http://localhost:3001/api/products?search=${search}`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, [search]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* Search Header */}
      <div className="flex gap-4 mb-12 max-w-4xl mx-auto pt-10">
        <input 
          type="text" 
          placeholder="Search for rings, necklaces, or bracelets..." 
          className="flex-1 p-4 border border-gray-200 rounded-full px-8 shadow-sm focus:ring-2 focus:ring-[#7D3C98]/20 focus:border-[#7D3C98] outline-none transition-all"
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="bg-[#7D3C98] text-white px-10 rounded-full hover:bg-[#63307a] transition shadow-md font-medium tracking-wide">
          Search
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {products.map((p: any) => (
          <div key={p.id} className="bg-white p-4 rounded-2xl hover:shadow-xl transition-all duration-300 border border-transparent hover:border-purple-100 group">
            {/* Image Container */}
            <div className="relative aspect-square w-full mb-6 overflow-hidden rounded-xl bg-gray-50">
               <img 
                 src={p.final_image_url || '/placeholder-jewelry.jpg'} 
                 alt={p.product_name} 
                 className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" 
               />
            </div>
            
            <div className="px-1">
              <h3 className="font-serif text-lg font-bold text-gray-900 mb-1">
                {p.product_name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                {p.final_description}
              </p>
              
              <Link href={`/product/${p.sku}`} className="block">
                 <button className="w-full py-3 rounded-lg border border-[#7D3C98] text-[#7D3C98] font-semibold text-xs uppercase tracking-wider hover:bg-[#7D3C98] hover:text-white transition-all">
                   View Design
                 </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State with New Icon Component */}
      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <div className="bg-gray-100 p-6 rounded-full mb-4 animate-pulse">
            <EmptyStateIcon className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-xl font-serif italic text-gray-500">No matching designs found in our studio.</p>
        </div>
      )}
    </div>
  );
}