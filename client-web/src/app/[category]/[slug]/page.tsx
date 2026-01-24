// src/app/[category]/[slug]/page.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/Icons';
import ProductDetailsClient from '@/components/cataloguePage/ProductDetailsClient';
import TimelineSection from '@/components/TimelineSection';
import RecommendedProducts from '@/components/cataloguePage/RecommendedProducts';

// ✅ This tells Next.js to generate static pages at build time
export async function generateStaticParams() {
  try {
    const res = await fetch('http://localhost:3001/api/products');
    const products = await res.json();
    
    return products.map((product: any) => ({
      category: product.category,
      slug: `${product.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${product.sku}`,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// ✅ Fetch data at build time for SSG
async function getProduct(slug: string) {
  try {
    const sku = slug.split('-').pop()?.trim();
    if (!sku) return null;

    const productRes = await fetch(`http://localhost:3001/api/products/${sku}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!productRes.ok) return null;
    
    return await productRes.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

async function getRecommendations(category: string, currentSku: string) {
  try {
    const res = await fetch('http://localhost:3001/api/products', {
      next: { revalidate: 3600 }
    });
    const allProducts = await res.json();
    
    return allProducts.filter(
      (p: any) => p.category === category && p.sku !== currentSku
    );
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

// ✅ Server Component (default in App Router)
export default async function ProductDetails({ 
  params 
}: { 
  params: Promise<{ category: string; slug: string }> 
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  
  if (!product) {
    return (
      <div className="p-20 text-center font-serif text-xl">
        Product Not Found
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

        {/* ✅ Client component handles interactive features */}
        <ProductDetailsClient product={product} />
      </section>

      {/* ✅ Timeline section with design-only mode */}
      <section className="relative bg-white border-t border-gray-100 py-10">
        <TimelineSection product={product} mode="design-only" />
      </section>

      {/* ✅ Recommended products */}
      <RecommendedProducts products={recommended} currentSku={product.sku} />
    </main>
  );
}

// ✅ Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ category: string; slug: string }> 
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
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