// client-web/src/app/wishlist/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { SparklesIcon } from '@/components/Icons';

export default function WishlistPage() {
  // In a real application, you would fetch the wishlist items here.
  // For this example, we'll assume the wishlist is empty to match the design.
  const wishlistItems = [];

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
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No items saved yet
              </h3>
              <p className="text-gray-600">
                Save designs for later and make your wishlists based on favourite
              </p>
            </div>

            <div className="relative h-64 md:h-80 w-full mx-auto">
              {/* Use the provided illustration for the empty state */}
              <Image
                src="/assets/empty-wishlist-illustration.png" // Make sure this image is in your public/assets folder
                alt="No items in wishlist"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 px-6">
          {/* Implementation for when there are items in the wishlist would go here */}
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">
            Your Wishlist
          </h2>
          {/* Grid of wishlist items... */}
        </section>
      )}
    </main>
  );
}

