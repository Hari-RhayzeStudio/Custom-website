import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/Icons';
import ProductDetailsClient from '@/components/cataloguePage/ProductDetailsClient';
import TimelineSection from '@/components/TimelineSection';
import RecommendedProducts from '@/components/cataloguePage/RecommendedProducts';

// ✅ 1. Import Montserrat Font
import { Montserrat } from 'next/font/google';

// ✅ 2. Initialize Font
const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// ✅ Force Dynamic Rendering (Essential for Render Free Tier)
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

async function getProduct(slug: string) {
  try {
    const parts = slug.split('-');
    const potentialSku = parts[parts.length - 1];

    if (!potentialSku || isNaN(Number(potentialSku))) {
      console.error(`❌ Invalid SKU extracted from slug: "${slug}". Extracted: "${potentialSku}"`);
      return null;
    }

    const endpoint = `${API_BASE_URL}/api/products/${potentialSku}`;
    console.log(`🔍 Requesting Product: ${endpoint}`);

    const productRes = await fetch(endpoint, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!productRes.ok) {
      const errorText = await productRes.text();
      console.error(`❌ Backend Error ${productRes.status} at ${endpoint}:`, errorText);
      return null;
    }
    
    return await productRes.json();
  } catch (error) {
    console.error('❌ Network/Code Error in getProduct:', error);
    return null;
  }
}

async function getRecommendations(category: string, currentSku: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`, { cache: 'no-store' });
    if(!res.ok) return [];
    const allProducts = await res.json();
    return allProducts.filter((p: any) => p.category === category && p.sku !== currentSku);
  } catch (error) {
    return [];
  }
}

export default async function ProductDetails({ 
  params 
}: { 
  params: Promise<{ category: string; slug: string }> 
}) {
  const resolvedParams = await params;
  const cleanSlug = decodeURIComponent(resolvedParams.slug);
  const product = await getProduct(cleanSlug);
  
  if (!product) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-20 text-center ${montserrat.className}`}>
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-6">
          We couldn't find the design you're looking for. <br/>
          <span className="text-xs opacity-50">(Slug: {cleanSlug})</span>
        </p>
        <Link href="/catalogue" className="px-6 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const recommended = await getRecommendations(product.category, product.sku);

  return (
    <main className={`min-h-screen bg-white ${montserrat.className}`}>
      
      {/* ✅ INCREASED WIDTH: Replaced max-w-6xl with max-w-[1440px] and added responsive padding to match header */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 xl:px-28 py-10 md:py-14">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/catalogue">
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 hover:text-[#7D3C98] transition" />
          </Link>
          {/* ✅ Scaled up the title slightly for larger screens so it doesn't look too small */}
          <h1 className="text-[22px] md:text-[28px] font-semibold text-gray-900 leading-none">
            {product.product_name}
          </h1>
        </div>

        {/* Product Details Client Component */}
        <ProductDetailsClient product={product} />
      </section>

      <section className="relative bg-white border-t border-gray-100 py-10">
        <TimelineSection product={product} mode="design-only" />
      </section>

      <RecommendedProducts products={recommended} currentSku={product.sku} />

      {/* ✅ Why Rhayze Studio Section */}
      <section className="px-6 md:px-12 lg:px-20 xl:px-28 pb-16 md:pb-24">
        <div className="max-w-[880px] w-full mx-auto bg-[#FAF8F3] rounded-[2rem] flex flex-col items-center justify-center px-6 py-10 md:h-[261px] text-center shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Why Rhayze Studio
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl mb-8 leading-relaxed">
            We are 24x7 available to serve you, our aim is to improve your experience through overall process of making Jewellery and make this process visible to you. Everything is transparent with us.
          </p>
          <Link 
            href="/bookings"
            className="flex items-center justify-center gap-3 bg-[#7D3C98] hover:bg-[#6a3281] text-white font-medium py-3.5 px-10 rounded-full transition-colors w-full sm:w-auto shadow-sm"
          >
            <img 
              src="/assets/google-meet-icon.png" 
              alt="Meet" 
              className="w-5 h-5 object-contain" 
            />
            Book Consultation
          </Link>
        </div>
      </section>
    </main>
  );
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ category: string; slug: string }> 
}) {
  const resolvedParams = await params;
  const product = await getProduct(decodeURIComponent(resolvedParams.slug));
  
  if (!product) return { title: 'Product Not Found | Rhayze Studio' };

  return {
    title: `${product.product_name} | Rhayze Studio`,
    description: product.final_description || `Exquisite ${product.category} design`,
    openGraph: {
      title: product.product_name,
      description: product.final_description,
      images: [product.final_image_url],
    },
  };
}