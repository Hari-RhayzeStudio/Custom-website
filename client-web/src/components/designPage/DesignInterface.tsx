// app/design/page.tsx (Server Component - This is the ONLY file you need)
import DesignClient from '@/components/designPage/DesignClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Helper: Fetch with retry logic
async function fetchWithRetry(url: string, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store', // ✅ Changed to no-store to always get fresh data
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ Fetched ${url}: ${data.length} items`);
        return data;
      }
      
      console.error(`[FETCH] Attempt ${i + 1} failed with status ${res.status}`);
    } catch (error: any) {
      console.error(`[FETCH] Attempt ${i + 1} error:`, error.message);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.error(`[FETCH] All attempts failed for ${url}`);
  return [];
}

async function getTrendingData() {
  return fetchWithRetry(`${API_BASE_URL}/api/products/trending`);
}

async function getProductsData() {
  return fetchWithRetry(`${API_BASE_URL}/api/products`);
}

// ✅ Revalidate every hour
export const revalidate = 3600;

export default async function DesignPage() {
  console.log('🔍 [DESIGN PAGE] Fetching data from:', API_BASE_URL);
  
  // Fetch in parallel
  const [trendingData, productsData] = await Promise.all([
    getTrendingData(),
    getProductsData()
  ]);

  console.log('🔍 [DESIGN PAGE] Data received:', {
    trending: trendingData?.length || 0,
    products: productsData?.length || 0
  });

  return (
    <DesignClient 
      trendingData={trendingData || []} 
      productsData={productsData || []} 
    />
  );
}