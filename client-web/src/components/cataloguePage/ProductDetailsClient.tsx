"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  DownloadIcon, 
  HeartIcon, 
  HeartFilledIcon, 
  ShareIcon, 
  LoaderIcon 
} from '@/components/Icons';
import AuthModal from '@/components/AuthModal';

type ViewType = 'sketch' | 'wax' | 'cast' | 'final';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ProductDetailsClient({ product }: { product: any }) {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ViewType>('final');
  
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isToggling, setIsToggling] = useState(false); 
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const checkStatus = async () => {
    const userId = localStorage.getItem('user_id');
    
    if (!userId || !product?.sku) {
      setIsChecking(false);
      setIsWishlisted(false);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/wishlist/${userId}?product_sku=${product.sku}`);
      setIsWishlisted(res.data.length > 0);
    } catch (error) {
      console.error("Wishlist sync error:", error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [product]);

  const handleWishlistToggle = async () => {
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
      setIsAuthOpen(true);
      return; 
    }
    
    if (isToggling) return; 
    setIsToggling(true);

    const previousState = isWishlisted;
    setIsWishlisted(!previousState);

    try {
      if (previousState) {
        await axios.delete(`${API_BASE_URL}/api/wishlist`, { 
          data: { user_id: userId, product_sku: product.sku } 
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/wishlist`, {
          user_id: userId, 
          product_sku: product.sku, 
          product_name: product.product_name, 
          product_image: product.final_image_url
        });
      }
    } catch (e) { 
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
    const proxyUrl = `${API_BASE_URL}/api/download-proxy?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;

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
    <>
      {/* ✅ FLUID RESPONSIVE GRID: Stretches perfectly to window size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full items-stretch">
        
        {/* LEFT: Main Image & Toolbar */}
        <div className="flex flex-col w-full h-full">
          
          {/* IMAGE CARD - Aspect Square so it resizes beautifully */}
          <div className="relative bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm w-full aspect-square">
            <img src={currentImage} alt={currentAlt} className="w-full h-full object-contain p-8 transition-transform duration-500 hover:scale-105" />
            
            <button 
              onClick={handleWishlistToggle} 
              className="absolute top-4 right-4 lg:top-6 lg:right-6 p-2.5 lg:p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-all hover:scale-110 z-10 flex items-center justify-center"
            >
              {isChecking ? (
                 <LoaderIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 animate-spin" />
              ) : isWishlisted ? (
                 <HeartFilledIcon className="w-5 h-5 lg:w-6 lg:h-6 text-[#C282D4]" />
              ) : (
                 <HeartIcon className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 hover:text-[#C282D4] transition-colors" />
              )}
            </button>
          </div>
          
          {/* ✅ TOOLBAR: Anchored to the bottom-right of the image block */}
          <div className="flex gap-2 justify-end w-full mt-4">
             <button onClick={handleShare} className="flex shrink-0 items-center justify-center aspect-square w-10 lg:w-12 bg-white border border-gray-200 rounded-full text-gray-700 hover:text-[#7D3C98] hover:border-[#7D3C98] transition shadow-sm">
               <ShareIcon className="w-4 h-4 lg:w-5 lg:h-5" />
             </button>
             <button onClick={handleDownload} className="flex items-center justify-center gap-2 px-5 lg:px-6 py-2 lg:py-3 bg-[#7D3C98] text-white rounded-full font-bold text-xs lg:text-sm shadow-md hover:bg-[#6a3281] transition">
               <DownloadIcon className="w-4 h-4 lg:w-5 lg:h-5" /> 
               <span>Download</span>
             </button>
          </div>
        </div>

        {/* RIGHT: Details Panel - Flexes to match the exact height of the left column */}
        <div className="bg-[#F9F5E8] p-6 lg:p-10 rounded-3xl lg:rounded-[2.5rem] w-full flex flex-col justify-between h-full shadow-sm border border-[#F0EAD6]/50">
           <div>
             <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                <Row label="Product" value={product.category} />
                <Row label="Material" value="Platinum" />
                <Row label="Status" value="Finished" />
             </div>
            
             <div className="grid grid-cols-4 gap-2 lg:gap-3 mb-6 lg:mb-8">
                {['sketch', 'wax', 'cast', 'final'].map((view) => (
                    <button key={view} onClick={() => setActiveView(view as ViewType)} className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition ${activeView === view ? 'bg-purple-100 ring-2 ring-[#7D3C98]' : 'hover:bg-gray-100'}`}>
                        <div className="w-full aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 p-1">
                            <img src={product[`${view}_image_url`] || '/placeholder.jpg'} alt={`${view}`} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[8px] lg:text-[10px] font-bold uppercase text-gray-700 leading-none mt-1">{view === 'sketch' ? 'Render' : view}</span>
                    </button>
                ))}
             </div>
             
             <p className="text-gray-700 leading-relaxed font-medium text-xs lg:text-[15px] mb-6 line-clamp-4">
                {product.final_description}
             </p>
           </div>

           <button 
              onClick={handleDiscussDesign}
              className="w-full py-3.5 lg:py-4 rounded-full border border-purple-300 text-purple-700 font-bold text-sm lg:text-base hover:bg-purple-50 transition flex items-center justify-center gap-2 shadow-sm bg-white mt-auto"
           >
              <img src="/assets/google-meet-icon.png" alt="Meet" className="w-5 h-5 lg:w-6 lg:h-6" /> Discuss Design
           </button>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={() => {
          setIsAuthOpen(false);
          checkStatus();
        }} 
      />
    </>
  );
}

const Row = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center py-2 lg:py-2.5 border-b border-[#ebdcb2]">
    <span className="text-gray-600 font-medium text-sm lg:text-base">{label}-</span>
    <span className="bg-purple-100 px-3 py-1 rounded-full text-[#7D3C98] font-bold text-[10px] lg:text-[11px] uppercase tracking-wide">{value}</span>
  </div>
);