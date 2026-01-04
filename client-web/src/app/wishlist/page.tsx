// src/app/wishlist/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { X } from 'lucide-react';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Helper to generate slug for links (same as in your catalogue)
  const generateSlug = (name: string, sku: string) => {
    const formattedName = name?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    return `${formattedName}-${sku}`;
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    setUserId(storedUserId);

    if (storedUserId) {
      axios.get(`http://localhost:3001/api/wishlist/${storedUserId}`)
        .then(res => setWishlistItems(res.data))
        .catch(err => console.error("Error loading wishlist", err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const removeItem = async (sku: string) => {
    if (!userId) return;
    
    // Optimistic UI update
    setWishlistItems(prev => prev.filter(item => item.product_sku !== sku));

    try {
      await axios.delete('http://localhost:3001/api/wishlist', {
        data: { user_id: userId, product_sku: sku }
      });
    } catch (error) {
      console.error("Failed to remove item", error);
      alert("Failed to remove item. Please refresh.");
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-[#7D3C98]">Loading...</div>;

  return (
    <main className="bg-white min-h-screen pb-20 relative">
      {wishlistItems.length === 0 ? (
        <section className="py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto">
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

            <div className="relative h-64 md:h-80 w-full mx-auto">
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
        <section className="py-10 px-6 max-w-7xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Your Wishlist</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistItems.map((item) => (
              <div key={item.id} className="group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
                {/* Remove Button */}
                <button 
                  onClick={() => removeItem(item.product_sku)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
                  <img 
                    src={item.product_image || '/placeholder.jpg'} 
                    alt={item.product_name} 
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <h3 className="font-serif font-bold text-gray-900 truncate mb-1">{item.product_name}</h3>
                
                <Link href={`/jewelry/${generateSlug(item.product_name, item.product_sku)}`}>
                  <button className="w-full mt-4 border border-[#7D3C98] text-[#7D3C98] py-2 rounded-lg font-bold text-sm hover:bg-[#7D3C98] hover:text-white transition">
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