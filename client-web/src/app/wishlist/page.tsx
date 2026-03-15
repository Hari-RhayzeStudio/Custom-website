"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { EmptyStateIcon, HeartFilledIcon, LoaderIcon } from '@/components/Icons';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

const formatCategory = (cat: string) => cat ? cat.toLowerCase().replace(/\s+/g, '-') : 'jewelry';

const generateSlug = (name: string, sku: string) => {
  const formattedName = (name || 'product').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  return `${formattedName}-${sku}`;
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // 1. Fetch data on load
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setIsFetching(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        // 1. Fetch wishlist items
        const res = await axios.get(`${API_BASE_URL}/api/wishlist/${userId}?_t=${Date.now()}`);
        const rawWishlist = res.data;

        // 2. Fetch master products list to get real Categories and Descriptions
        const productsRes = await axios.get(`${API_BASE_URL}/api/products`);
        const allProducts = Array.isArray(productsRes.data) ? productsRes.data : [];

        // 3. Merge the data so the Wishlist exactly matches the Catalogue
        const enrichedWishlist = rawWishlist.map((item: any) => {
            const matchingProduct = allProducts.find((p: any) => p.sku === item.product_sku);
            
            let realCategory = matchingProduct?.category || item.category;
            
            // Smart Fallback for Custom AI Generated Designs
            if (!realCategory || realCategory.toLowerCase() === 'jewelry') {
                const searchName = (item.product_name || '').toLowerCase();
                if (searchName.includes('earring')) realCategory = 'Earrings';
                else if (searchName.includes('bracelet')) realCategory = 'Bracelets';
                else if (searchName.includes('band')) realCategory = 'Bands';
                else if (searchName.includes('ring')) realCategory = 'Ladies-rings';
                else realCategory = 'Custom Design';
            }

            return {
                ...item,
                category: realCategory,
                final_description: matchingProduct?.final_description || item.final_description || 'Exquisite custom design from Rhayze Studio.',
            };
        });

        setWishlist(enrichedWishlist);
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchWishlist();

    const handleUpdate = () => fetchWishlist();
    window.addEventListener('wishlistUpdated', handleUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleUpdate);
  }, []);

  // 2. 🔥 INSTANT REMOVE LOGIC
  const handleRemoveItem = (e: React.MouseEvent, product_sku: string) => {
    e.preventDefault(); 
    e.stopPropagation();

    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    const previousWishlist = [...wishlist];

    // ✅ INSTANT UI UPDATE: Remove from screen immediately
    setWishlist(prev => prev.filter(item => item.product_sku !== product_sku));
    
    // Update navbar bell/heart instantly
    window.dispatchEvent(new Event('wishlistUpdated'));

    // ✅ BACKGROUND SERVER REQUEST: Quietly deletes in the database
    axios.delete(`${API_BASE_URL}/api/wishlist`, {
      data: { user_id: userId, product_sku: product_sku }
    }).catch(() => {
      setWishlist(previousWishlist);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-360 mx-auto px-6 md:px-12 lg:px-20 xl:px-28 py-8 md:py-12">
        
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-[24px] md:text-[28px] lg:text-[32px] xl:text-[36px] font-serif font-medium text-gray-900 text-center">Your Wishlist</h1>
          {isFetching && <LoaderIcon className="w-5 h-5 ml-4 text-[#7D3C98] animate-spin" />}
        </div>

        {!isFetching && wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 animate-in fade-in duration-300">
            <EmptyStateIcon className="w-16 h-16 mb-4 text-gray-300" />
            <h2 className="text-lg font-medium text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 mb-6">Explore our catalogue and find something you love.</p>
            <Link href="/catalogue" className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-bold hover:bg-[#7D3C98] transition shadow-md cursor-pointer">
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {wishlist.map((item) => {
              const categoryStr = item.category || 'Jewelry';
              const productUrl = `/${formatCategory(categoryStr)}/${generateSlug(item.product_name, item.product_sku)}`;

              return (
                <Link 
                  href={productUrl}
                  key={item.product_sku} 
                  className="bg-white p-2.5 sm:p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col group hover:shadow-lg hover:border-purple-100 transition duration-300 h-full cursor-pointer relative animate-in fade-in zoom-in-95"
                >
                  {/* Image Area */}
                  <div className="relative aspect-square w-full mb-3 sm:mb-4 overflow-hidden rounded-xl bg-gray-50 shrink-0">
                     {item.product_image ? (
                       <Image 
                         src={item.product_image} 
                         alt={item.product_name || 'Jewelry Item'} 
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
                     
                     {/* Category Pill - Exact Match to CatalogueGrid */}
                     <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 backdrop-blur text-[9px] sm:text-[10px] font-medium px-2 py-0.5 sm:py-1 rounded-md uppercase tracking-wider text-gray-600 group-hover:text-[#722E85] transition-colors z-10">
                       {categoryStr}
                     </div>
                  </div>

                  {/* INSTANT REMOVE (HEART) BUTTON */}
                  <button 
                    onClick={(e) => handleRemoveItem(e, item.product_sku)}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 p-1.5 sm:p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform z-20 cursor-pointer"
                    title="Remove from wishlist"
                  >
                     <HeartFilledIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#C282D4]" />
                  </button>
                  
                  {/* Text Area */}
                  <div className="flex flex-col flex-1">
                    <h3 className="font-serif text-sm sm:text-lg font-medium text-gray-900 mb-1 line-clamp-1 group-hover:text-[#722E85] transition-colors" title={item.product_name}>
                        {item.product_name || `Product SKU: ${item.product_sku}`}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2">
                      {item.final_description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}