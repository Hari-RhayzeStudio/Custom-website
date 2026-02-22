import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/Icons';
import ProductDetailsClient from '@/components/cataloguePage/ProductDetailsClient';
import TimelineSection from '@/components/TimelineSection';
import RecommendedProducts from '@/components/cataloguePage/RecommendedProducts';

// ✅ 1. Force Dynamic Rendering (Essential for Render Free Tier)
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
      <div className="min-h-screen flex flex-col items-center justify-center p-20 text-center">
        <h1 className="font-serif text-2xl text-gray-800 mb-4">Product Not Found</h1>
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
    <main className="min-h-screen bg-white font-sans">
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/catalogue">
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 hover:text-[#7D3C98] transition" />
          </Link>
          {/* ✅ UPDATED HEADING SIZE TO EXACTLY 20px */}
          <h1 className="text-[20px] font-serif font-bold text-gray-900 leading-none">
            {product.product_name}
          </h1>
        </div>

        {/* ✅ Product Details Client Component */}
        <ProductDetailsClient product={product} />
      </section>

      <section className="relative bg-white border-t border-gray-100 py-10">
        <TimelineSection product={product} mode="design-only" />
      </section>

      <RecommendedProducts products={recommended} currentSku={product.sku} />
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