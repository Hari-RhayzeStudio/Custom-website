// src/app/[category]/[slug]/ProductDetailsClient.tsx
"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DownloadIcon, HeartIcon, ShareIcon } from '@/components/Icons';

type ViewType = 'sketch' | 'wax' | 'cast' | 'final';

interface ProductDetailsClientProps {
  product: any;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [activeView, setActiveView] = useState<ViewType>('final');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check wishlist status on mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) return;

      try {
        const wishlistRes = await axios.get(`http://localhost:3001/api/wishlist/${userId}`);
        const inWishlist = wishlistRes.data.some((item: any) => item.product_sku === product.sku);
        setIsWishlisted(inWishlist);
      } catch (error) {
        console.error("Failed to check wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [product.sku]);

  const handleWishlistToggle = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert("Please login to add items to wishlist");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await axios.delete('http://localhost:3001/api/wishlist', {
          data: { user_id: userId, product_sku: product.sku }
        });
        setIsWishlisted(false);
      } else {
        await axios.post('http://localhost:3001/api/wishlist', {
          user_id: userId,
          product_sku: product.sku,
          product_name: product.product_name,
          product_image: product.final_image_url
        });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Wishlist action failed", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleDownload = async () => {
    const imageUrl = product[`${activeView}_image_url`];
    if (!imageUrl) {
      alert("Image not available");
      return;
    }

    const filename = `${product.product_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${product.sku}-${activeView}.jpg`;
    const proxyUrl = `http://localhost:3001/api/download-proxy?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;

    try {
      const link = document.createElement('a');
      link.href = proxyUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      window.open(imageUrl, '_blank');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Rhayze Studio - ${product.product_name}`,
      text: `Check out this exquisite ${product.product_name} design (${activeView} view)!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (err) {
        alert("Unable to share.");
      }
    }
  };

  const currentImage = product[`${activeView}_image_url`] || '/placeholder.jpg';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      {/* Image Section */}
      <div className="flex flex-col gap-6">
        <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden group border border-gray-100 shadow-sm">
          <img 
            src={currentImage} 
            className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105" 
            alt={product.product_name} 
          />
          
          <button 
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
            className={`absolute top-6 right-6 p-3 rounded-full shadow-md transition z-10 
              ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'}
            `}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <HeartIcon className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
        
        <div className="flex gap-4 justify-end">
          <button 
            onClick={handleShare} 
            className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full text-gray-700 hover:text-[#7D3C98] hover:border-[#7D3C98] transition"
            aria-label="Share product"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={handleDownload} 
            className="flex items-center gap-2 bg-[#7D3C98] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:bg-[#6a3281] transition"
          >
            <DownloadIcon className="w-5 h-5" /> Download
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="bg-[#F9F5E8] p-10 rounded-[4rem]">
        <div className="space-y-6 mb-10">
          <div className="flex justify-between items-center py-3 border-b border-[#ebdcb2]">
            <span className="text-gray-600 font-medium">Product-</span>
            <span className="bg-purple-100 px-4 py-1 rounded-full text-[#7D3C98] font-bold text-xs uppercase">
              {product.category}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#ebdcb2]">
            <span className="text-gray-600 font-medium">Material-</span>
            <span className="bg-purple-100 px-4 py-1 rounded-full text-[#7D3C98] font-bold text-xs uppercase">
              Platinum
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-[#ebdcb2]">
            <span className="text-gray-600 font-medium">Status-</span>
            <span className="bg-purple-100 px-4 py-1 rounded-full text-[#7D3C98] font-bold text-xs uppercase">
              Finished
            </span>
          </div>
        </div>
        
        {/* View Selector */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {['sketch', 'wax', 'cast', 'final'].map((view) => (
            <button 
              key={view} 
              onClick={() => setActiveView(view as ViewType)} 
              className={`flex flex-col items-center gap-2 p-2 rounded-xl transition 
                ${activeView === view ? 'bg-purple-100 ring-2 ring-[#7D3C98]' : 'hover:bg-gray-100'}
              `}
              aria-label={`View ${view} image`}
            >
              <div className="w-full aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 p-2">
                <img 
                  src={product[`${view}_image_url`] || '/placeholder.jpg'} 
                  className="w-full h-full object-contain" 
                  alt={`${view} view`} 
                />
              </div>
              <span className="text-[10px] font-bold uppercase text-gray-700">
                {view === 'sketch' ? 'Render' : view}
              </span>
            </button>
          ))}
        </div>

        <p className="text-gray-700 leading-relaxed font-medium text-lg">
          {product.final_description}
        </p>
      </div>
    </div>
  );
}