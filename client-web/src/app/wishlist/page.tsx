"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import useSWR from 'swr'; // ✅ 1. Import SWR
import { XIcon } from '@/components/Icons';

// ✅ 2. Define Fetcher for SWR
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function WishlistPage() {
  const [userId, setUserId] = useState<string | null>(null);

  // Get User ID on mount (Client-side only)
  useEffect(() => {
    setUserId(localStorage.getItem('user_id'));
  }, []);

  // ✅ 3. SWR Hook (Handles caching, revalidation, and loading state)
  // Only fetch if userId exists
  const { data: wishlistItems, error, isLoading, mutate } = useSWR(
    userId ? `http://localhost:3001/api/wishlist/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch just because I clicked the window
      dedupingInterval: 60000,   // Cache data for 1 minute (Instant load on return)
    }
  );

  const generateSlug = (name: string, sku: string) => {
    const formattedName = name?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    return `${formattedName}-${sku}`;
  };

  const removeItem = async (sku: string) => {
    if (!userId || !wishlistItems) return;

    // ✅ 4. Optimistic UI with SWR (Update cache immediately)
    const newItems = wishlistItems.filter((item: any) => item.product_sku !== sku);
    
    // Update local data immediately without waiting for server
    mutate(newItems, false); 

    try {
      await axios.delete('http://localhost:3001/api/wishlist', {
        data: { user_id: userId, product_sku: sku }
      });
      // Trigger a background re-fetch just to be safe
      mutate();
    } catch (error) {
      console.error("Failed to remove item", error);
      alert("Failed to remove item.");
      mutate(); // Revert changes on error
    }
  };

  // ✅ 5. Skeleton Loading State (Better UX than text)
  if (isLoading || !userId) return (
    <main className="bg-white min-h-screen py-10 px-6 max-w-7xl mx-auto">
      <div className="h-8 w-48 bg-gray-100 rounded mb-8 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-gray-100 rounded-2xl p-4">
             <div className="aspect-square bg-gray-100 rounded-xl mb-4 animate-pulse"></div>
             <div className="h-4 w-3/4 bg-gray-100 rounded mb-2 animate-pulse"></div>
             <div className="h-10 w-full bg-gray-100 rounded mt-4 animate-pulse"></div>
          </div>
        ))}
      </div>
    </main>
  );

  return (
    <main className="bg-white min-h-screen pb-20 relative">
      {!wishlistItems || wishlistItems.length === 0 ? (
        <section className="py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
              Not added any design yet
            </h2>
            <Link href="/catalogue">
              <button className="border-2 border-[#7D3C98] text-[#7D3C98] px-8 py-3 rounded-full font-semibold hover:bg-[#7D3C98] hover:text-white transition mb-16">
                Explore Designs
              </button>
            </Link>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-2">No items saved yet</h3>
              <p className="text-gray-600">
                Save designs for later and make your wishlists based on favourite
              </p>
            </div>

            <div className="relative h-64 md:h-80 w-full mx-auto opacity-80">
              <Image
                src="/assets/empty-wishlist-illustration.png" 
                alt="No items in wishlist"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="py-10 px-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Your Wishlist</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistItems.map((item: any) => (
              <div key={item.id} className="group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                {/* Remove Button */}
                <button 
                  onClick={() => removeItem(item.product_sku)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition hover:scale-110"
                >
                  <XIcon className="w-4 h-4" />
                </button>

                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
                  <img 
                    src={item.product_image || '/placeholder.jpg'} 
                    alt={item.product_name} 
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                  />
                </div>

                <h3 className="font-serif font-bold text-gray-900 truncate mb-1">{item.product_name}</h3>
                
                <Link href={`/jewelry/${generateSlug(item.product_name, item.product_sku)}`}>
                  <button className="w-full mt-4 border border-[#7D3C98] text-[#7D3C98] py-2.5 rounded-xl font-bold text-sm hover:bg-[#7D3C98] hover:text-white transition-colors">
                    View Details
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}