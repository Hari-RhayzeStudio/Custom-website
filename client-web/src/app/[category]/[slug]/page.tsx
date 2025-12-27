"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CraftingProcess from '@/components/CraftingProcess';
import RecommendedProducts from '@/components/RecommendedProducts'; // Import the new file
import { SparklesIcon, ArrowLeftIcon, DownloadIcon, HeartIcon, ShareIcon } from '@/components/Icons';

// Define allowed view types
type ViewType = 'sketch' | 'wax' | 'cast' | 'final';

export default function ProductDetails() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('final');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Reset scroll position immediately on click
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const resolvedParams = params instanceof Promise ? await params : params;
        const slug = resolvedParams.slug as string;
        const sku = slug.split('-').pop()?.trim();

        if (!sku) return;

        setLoading(true); // Show loading state while fetching new product

        // 2. Fetch the main product
        const productRes = await fetch(`http://localhost:3001/api/products/${sku}`);
        const productData = await productRes.json();
        
        setProduct(productData);
        setActiveView('final'); 

        // 3. Fetch recommendations for the NEW product's category
        const recommendationsRes = await fetch(`http://localhost:3001/api/products`);
        const allProducts = await recommendationsRes.json();
        
        const categoryMatches = allProducts.filter((p: any) => 
          p.category === productData.category && p.sku !== sku
        );
        
        setRecommended(categoryMatches);
      } catch (error) {
        console.error("Failed to fetch product data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params]);


  const handleDownload = async () => {
    if (!product) return;

    const imageUrl = product[`${activeView}_image_url`];
    if (!imageUrl) {
      alert("Image not available");
      return;
    }

    // Using the Backend Proxy approach we discussed previously
    const filename = `${product.product_name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${product.sku}-${activeView}.jpg`;
    // Ensure this matches your actual backend URL and port
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
    if (!product) return;
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

  if (loading) return <div className="p-20 text-center font-serif text-xl">Loading Design...</div>;
  if (!product) return <div className="p-20 text-center font-serif text-xl">Product Not Found</div>;

  const currentImage = product[`${activeView}_image_url`] || '/placeholder.jpg';

  return (
    <main className="min-h-screen bg-white font-sans">
      {/* 1. Product Info Section */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/catalogue"><ArrowLeftIcon className="w-6 h-6 text-gray-600 hover:text-[#7D3C98] transition" /></Link>
          <h1 className="text-3xl font-serif font-bold text-gray-900">{product.product_name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="flex flex-col gap-6">
            <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden group border border-gray-100 shadow-sm">
              <img src={currentImage} className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105" alt={product.product_name} />
              <button className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:text-red-500 transition z-10">
                <HeartIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="flex gap-4 justify-end">
               <button onClick={handleShare} className="flex items-center justify-center w-12 h-12 bg-white border border-gray-200 rounded-full text-gray-700 hover:text-[#7D3C98] hover:border-[#7D3C98] transition"><ShareIcon className="w-5 h-5" /></button>
               <button onClick={handleDownload} className="flex items-center gap-2 bg-[#7D3C98] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md hover:bg-[#6a3281] transition"><DownloadIcon className="w-5 h-5" /> Download</button>
            </div>
          </div>

          <div className="bg-[#F9F5E8] p-10 rounded-[4rem]">
            {/* Details Table */}
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center py-3 border-b border-[#ebdcb2]">
                <span className="text-gray-600 font-medium">Product-</span>
                <span className="bg-purple-100 px-4 py-1 rounded-full text-[#7D3C98] font-bold text-xs uppercase">{product.category}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#ebdcb2]">
                <span className="text-gray-600 font-medium">Material-</span>
                <span className="bg-purple-100 px-4 py-1 rounded-full text-[#7D3C98] font-bold text-xs uppercase">Platinum</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#ebdcb2]">
                <span className="text-gray-600 font-medium">Status-</span>
                <span className="bg-purple-100 px-4 py-1 rounded-full text-[#7D3C98] font-bold text-xs uppercase">Finished</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
                {['sketch', 'wax', 'cast', 'final'].map((view) => (
                    <button key={view} onClick={() => setActiveView(view as ViewType)} className={`flex flex-col items-center gap-2 p-2 rounded-xl transition ${activeView === view ? 'bg-purple-100 ring-2 ring-[#7D3C98]' : 'hover:bg-gray-100'}`}>
                        <div className="w-full aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 p-2"><img src={product[`${view}_image_url`] || '/placeholder.jpg'} className="w-full h-full object-contain" alt={view} /></div>
                        <span className="text-[10px] font-bold uppercase text-gray-700">{view === 'sketch' ? 'Render' : view}</span>
                    </button>
                ))}
            </div>
            <p className="text-gray-700 leading-relaxed font-medium text-lg">{product.final_description}</p>
          </div>
        </div>
      </section>

      {/* 2. Process Section */}
      <section className="bg-white border-t border-gray-100 py-24">
        <CraftingProcess product={product} />
      </section>

      {/* 3. Reusable Recommended Section (Horizontal Scroll) */}
      <RecommendedProducts products={recommended} currentSku={product.sku} />

      {/* 4. FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="flex items-center gap-3 bg-[#7D3C98] text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:scale-105 transition">
          <SparklesIcon className="w-6 h-6" /> Book Consultation
        </button>
      </div>
    </main>
  );
}