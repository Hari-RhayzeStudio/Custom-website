"use client";
import { useEffect, useState } from 'react';
import DesignClient from '@/components/designPage/DesignClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function DesignClientWrapper() {
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log('🔍 [CLIENT] Fetching from:', API_BASE_URL);
      
      try {
        const [trendingRes, productsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/products/trending`),
          fetch(`${API_BASE_URL}/api/products`)
        ]);

        const trending = trendingRes.ok ? await trendingRes.json() : [];
        const products = productsRes.ok ? await productsRes.json() : [];

        console.log('✅ [CLIENT] Trending:', trending.length, 'Products:', products.length);

        setTrendingData(trending);
        setProductsData(products);
      } catch (error) {
        console.error('❌ [CLIENT] Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-serif">Loading designs...</p>
        </div>
      </div>
    );
  }

  return (
    <DesignClient 
      trendingData={trendingData} 
      productsData={productsData} 
    />
  );
}