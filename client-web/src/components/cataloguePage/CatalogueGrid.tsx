"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { EmptyStateIcon, HeartIcon, HeartFilledIcon } from '@/components/Icons';
import AuthModal from '@/components/AuthModal'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

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
  
  const [wishlistedSkus, setWishlistedSkus] = useState<Set<string>>(new Set());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  const fetchWishlist = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
       setWishlistedSkus(new Set());
       return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const skus = new Set<string>(data.map((item: any) => item.product_sku));
      setWishlistedSkus(skus);
    } catch (err) {
      console.error("Failed to load wishlist");
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // ✅ FIRE-AND-FORGET: No async/await blocking, instant UI update
  const toggleWishlist = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); 
    e.stopPropagation();

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setIsAuthOpen(true);
      return; 
    }

    const isWishlisted = wishlistedSkus.has(product.sku);
    
    // 1. INSTANT UI UPDATE
    const newWishlist = new Set(wishlistedSkus);
    if (isWishlisted) newWishlist.delete(product.sku);
    else newWishlist.add(product.sku);
    setWishlistedSkus(newWishlist);

    // 2. BACKGROUND SERVER REQUEST (No await)
    if (isWishlisted) {
      fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_sku: product.sku })
      }).catch(() => fetchWishlist()); // Revert if fails
    } else {
      fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          product_sku: product.sku,
          product_name: product.product_name,
          product_image: product.final_image_url
        })
      }).catch(() => fetchWishlist()); // Revert if fails
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">
          {category || "All Designs"} 
          <span className="text-gray-400 font-normal text-xs sm:text-sm ml-2">({safeProducts.length} found)</span>
        </h2>
      </div>

      {safeProducts.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            <EmptyStateIcon className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No designs found.</p>
         </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {safeProducts.map((p: any, index: number) => {
            const productUrl = `/${formatCategory(p.category)}/${generateSlug(p.product_name, p.sku)}`;
            const isFav = wishlistedSkus.has(p.sku);

            return (
              <Link 
                href={productUrl}
                key={index} 
                className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col group hover:shadow-lg hover:border-purple-100 transition duration-300 h-full cursor-pointer relative"
              >
                <div className="relative aspect-square w-full mb-3 sm:mb-4 overflow-hidden rounded-xl bg-gray-50 shrink-0">
                   {p.final_image_url ? (
                     <Image 
                       src={p.final_image_url} 
                       alt={p.product_name || 'Jewelry Item'} 
                       fill
                       sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                       className="object-cover transition duration-700 group-hover:scale-105"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none'; 
                         target.parentElement!.style.backgroundColor = '#f3f4f6'; 
                       }}
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 text-xs">No Image</div>
                   )}
                   
                   {p.category && (
                     <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 backdrop-blur text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:py-1 rounded-md uppercase tracking-wider text-gray-600 group-hover:text-[#722E85] transition-colors z-10">
                       {p.category}
                     </div>
                   )}
                </div>

                <button 
                  onClick={(e) => toggleWishlist(e, p)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 p-1.5 sm:p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform z-20"
                >
                  {isFav ? (
                    <HeartFilledIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#C282D4]" />
                  ) : (
                    <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-[#C282D4] transition-colors" />
                  )}
                </button>
                
                <div className="flex flex-col flex-1">
                  <h3 className="font-serif text-sm sm:text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#722E85] transition-colors" title={p.product_name}>
                      {p.product_name || 'Untitled Product'}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2">
                    {p.final_description || ''}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={() => { 
          setIsAuthOpen(false); 
          fetchWishlist();
        }} 
      />
    </div>
  );
}