// src/app/design/page.tsx (Server Component)
import DesignClient from '@/components/designPage/DesignClient';

// 1. Fetch Trending Data (Cached for 24 Hours)
async function getTrendingData() {
  try {
    const res = await fetch('http://localhost:3001/api/products/trending', {
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
// We cache this shorter because inventory might change more often than trends
async function getProductsData() {
  try {
    const res = await fetch('http://localhost:3001/api/products', {
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