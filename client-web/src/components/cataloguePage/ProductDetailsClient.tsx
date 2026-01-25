"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  DownloadIcon, 
  HeartIcon, 
  HeartFilledIcon, 
  ShareIcon, 
  MeetIcon,
  LoaderIcon // Ensure you have this in Icons.tsx, or replace with standard spinner
} from '@/components/Icons';

type ViewType = 'sketch' | 'wax' | 'cast' | 'final';

export default function ProductDetailsClient({ product }: { product: any }) {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>('final');
  
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // Shows loading spinner on heart
  const [isToggling, setIsToggling] = useState(false); 

  // ✅ 1. FAST CHECK ON LOAD
  useEffect(() => {
    const checkStatus = async () => {
      const userId = localStorage.getItem('user_id');
      
      // If not logged in or no product data, stop checking
      if (!userId || !product?.sku) {
        setIsChecking(false);
        return;
      }

      try {
        // 🔥 OPTIMIZED CALL: Asks server specifically for THIS item
        const res = await axios.get(`http://localhost:3001/api/wishlist/${userId}?product_sku=${product.sku}`);
        
        // If the array has items, it means it's in the wishlist
        setIsWishlisted(res.data.length > 0);
      } catch (error) {
        console.error("Wishlist sync error:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, [product]);

  // ✅ 2. INSTANT TOGGLE (Optimistic UI)
  const handleWishlistToggle = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return alert("Please login to add items to wishlist");
    
    if (isToggling) return; 
    setIsToggling(true);

    const previousState = isWishlisted;
    setIsWishlisted(!previousState); // Instant visual update

    try {
      if (previousState) {
        // Remove
        await axios.delete('http://localhost:3001/api/wishlist', { 
          data: { user_id: userId, product_sku: product.sku } 
        });
      } else {
        // Add
        await axios.post('http://localhost:3001/api/wishlist', {
          user_id: userId, 
          product_sku: product.sku, 
          product_name: product.product_name, 
          product_image: product.final_image_url
        });
      }
    } catch (e) { 
      // Revert if failed
      setIsWishlisted(previousState);
      alert("Could not update wishlist");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDownload = async () => {
    const imageUrl = product[`${activeView}_image_url`];
    if (!imageUrl) return alert("Image not available");
    
    const filename = `${product.product_name.replace(/[^a-z0-9]/gi, '-')}-${activeView}.jpg`;
    const proxyUrl = `http://localhost:3001/api/download-proxy?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;

    try {
      const link = document.createElement('a'); link.href = proxyUrl; link.setAttribute('download', filename);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch { window.open(imageUrl, '_blank'); }
  };

  const handleShare = async () => {
    const shareData = { title: product.product_name, url: window.location.href };
    if (navigator.share && navigator.canShare(shareData)) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  const handleDiscussDesign = () => {
    router.push(`/bookings?sku=${product.sku}`);
  };

  const currentImage = product[`${activeView}_image_url`] || '/placeholder.jpg';
  const currentAlt = product[`${activeView}_image_alt_text`] || `${product.product_name} - ${activeView}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      
      {/* LEFT: Main Image Area */}
      <div className="flex flex-col gap-6">
        <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden group border border-gray-100 shadow-sm">
          <img src={currentImage} alt={currentAlt} className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105" />
          
          <button 
            onClick={handleWishlistToggle} 
            className="absolute top-6 right-6 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-all hover:scale-110 z-10 cursor-pointer flex items-center justify-center"
          >
            {isChecking ? (
               // Small Spinner while checking (prevents flashing wrong state)
               <LoaderIcon className="w-6 h-6 text-gray-400 animate-spin" />
            ) : isWishlisted ? (
               // Filled Black Heart
               <HeartFilledIcon className="w-6 h-6 text-black" />
            ) : (
               // Outline Gray Heart
               <HeartIcon className="w-6 h-6 text-gray-400 hover:text-black transition-colors" />
            )}
          </button>
        </div>
        
        <div className="flex gap-4 justify-end">
           <button onClick={handleShare} className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full text-gray-700 hover:text-[#7D3C98] hover:border-[#7D3C98] transition"><ShareIcon className="w-5 h-5" /></button>
           <button onClick={handleDownload} className="flex items-center gap-2 bg-[#7D3C98] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:bg-[#6a3281] transition"><DownloadIcon className="w-5 h-5" /> Download</button>
        </div>
      </div>

      {/* RIGHT: Details Panel */}
      <div className="bg-[#F9F5E8] p-10 rounded-[4rem]">
         <div className="space-y-6 mb-10">
            <Row label="Product" value={product.category} />
            <Row label="Material" value="Platinum" />
            <Row label="Status" value="Finished" />
         </div>
        
         <div className="grid grid-cols-4 gap-4 mb-8">
            {['sketch', 'wax', 'cast', 'final'].map((view) => (
                <button key={view} onClick={() => setActiveView(view as ViewType)} className={`flex flex-col items-center gap-2 p-2 rounded-xl transition ${activeView === view ? 'bg-purple-100 ring-2 ring-[#7D3C98]' : 'hover:bg-gray-100'}`}>
                    <div className="w-full aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 p-2">
                        <img src={product[`${view}_image_url`] || '/placeholder.jpg'} alt={`${view}`} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-gray-700">{view === 'sketch' ? 'Render' : view}</span>
                </button>
            ))}
         </div>

         <p className="text-gray-700 leading-relaxed font-medium text-lg mb-8">{product.final_description}</p>

         <button 
            onClick={handleDiscussDesign}
            className="w-full py-3.5 rounded-full border border-purple-300 text-purple-700 font-bold hover:bg-purple-50 transition flex items-center justify-center gap-3 shadow-sm bg-white"
         >
            <img src="/assets/google-meet-icon.png" alt="Meet" className="w-6 h-6" /> Discuss Design
         </button>

      </div>
    </div>
  );
}

const Row = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-[#ebdcb2]">
    <span className="text-gray-600 font-medium">{label}-</span>
    <span className="bg-purple-100 px-4 py-1 rounded-full text-[#7D3C98] font-bold text-xs uppercase">{value}</span>
  </div>
);