// src/app/design/page.tsx (Server Component)
import DesignClient from '@/components/designPage/DesignClient';

// ✅ Define Base URL from Env with Fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// 1. Fetch Trending Data (Cached for 24 Hours)
async function getTrendingData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/trending`, {
      next: { revalidate: 86400 }, // 86400 seconds = 24 Hours
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Trending fetch error:", error);
    return [];
  }
}

// 2. Fetch Products for Categories (Cached for 1 Hour)
async function getProductsData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      next: { revalidate: 3600 }, // 1 Hour
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Products fetch error:", error);
    return [];
  }
}

export default async function DesignPage() {
  // Fetch in parallel on the server
  const [trendingData, productsData] = await Promise.all([
    getTrendingData(),
    getProductsData()
  ]);

  return (
    <DesignClient 
      trendingData={trendingData} 
      productsData={productsData} 
    />
  );
}