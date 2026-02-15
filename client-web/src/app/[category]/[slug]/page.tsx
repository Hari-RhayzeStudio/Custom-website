import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/Icons';
import ProductDetailsClient from '@/components/cataloguePage/ProductDetailsClient';
import TimelineSection from '@/components/TimelineSection';
import RecommendedProducts from '@/components/cataloguePage/RecommendedProducts';

// ✅ 1. Force Dynamic Rendering
// This ensures the page is built when the user visits it, not at build time.
// It effectively waits for the Backend to wake up.
export const dynamic = 'force-dynamic';

// ✅ 2. Define Base URL Securely
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// ✅ 3. Fetch data at Request Time
async function getProduct(slug: string) {
  try {
    // Extract SKU from the end of the slug (e.g., "gold-ring-100002" -> "100002")
    const sku = slug.split('-').pop()?.trim();
    
    if (!sku) {
      console.error("❌ Invalid Slug/SKU extraction:", slug);
      return null;
    }

    console.log(`🔍 Fetching product SKU: ${sku} from ${API_BASE_URL}`);

    // Disable caching (cache: 'no-store') so we don't cache a "404" if the backend sleeps
    const productRes = await fetch(`${API_BASE_URL}/api/products/${sku}`, {
      cache: 'no-store' 
    });
    
    if (!productRes.ok) {
      console.error(`❌ Backend Error ${productRes.status}:`, await productRes.text());
      return null;
    }
    
    return await productRes.json();
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return null;
  }
}

async function getRecommendations(category: string, currentSku: string) {
  try {
    // Disable caching for recommendations too
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      cache: 'no-store'
    });
    
    if(!res.ok) return [];

    const allProducts = await res.json();
    
    return allProducts.filter(
      (p: any) => p.category === category && p.sku !== currentSku
    );
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

// ✅ Server Component
export default async function ProductDetails({ 
  params 
}: { 
  params: Promise<{ category: string; slug: string }> 
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-20 text-center">
        <h1 className="font-serif text-2xl text-gray-800 mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-6">The product could not be loaded. The server might be waking up.</p>
        <Link href="/catalogue" className="px-6 py-2 bg-black text-white rounded-full text-sm">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const recommended = await getRecommendations(product.category, product.sku);

  return (
    <main className="min-h-screen bg-white font-sans">
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/catalogue">
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 hover:text-[#7D3C98] transition" />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            {product.product_name}
          </h1>
        </div>

        {/* Client component handles interactive features */}
        <ProductDetailsClient product={product} />
      </section>

      {/* Timeline section */}
      <section className="relative bg-white border-t border-gray-100 py-10">
        <TimelineSection product={product} mode="design-only" />
      </section>

      {/* Recommended products */}
      <RecommendedProducts products={recommended} currentSku={product.sku} />
    </main>
  );
}

// ✅ Generate metadata for SEO (Dynamic)
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ category: string; slug: string }> 
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found | Rhayze Studio',
    };
  }

  return {
    title: `${product.product_name} | Rhayze Studio`,
    description: product.final_description || `Exquisite ${product.category} design by Rhayze Studio`,
    openGraph: {
      title: product.product_name,
      description: product.final_description,
      images: [product.final_image_url],
    },
  };
}