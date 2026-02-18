// src/app/design/page.tsx (Server Component - Optimized)
import DesignClient from '@/components/designPage/DesignClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Helper: Fetch with retry logic
async function fetchWithRetry(url: string, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const res = await fetch(url, {
        signal: controller.signal,
        // ✅ Use 'force-cache' to cache responses but allow background revalidation
        cache: 'force-cache',
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        return await res.json();
      }
      
      console.error(`[FETCH] Attempt ${i + 1} failed with status ${res.status}`);
    } catch (error: any) {
      console.error(`[FETCH] Attempt ${i + 1} error:`, error.message);
      
      // If last retry, wait a bit before final attempt
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  return [];
}

async function getTrendingData() {
  return fetchWithRetry(`${API_BASE_URL}/api/products/trending`);
}

async function getProductsData() {
  return fetchWithRetry(`${API_BASE_URL}/api/products`);
}

// ✅ ISR: Page is pre-rendered and regenerated every hour in the background
export const revalidate = 3600; // 1 hour

// ✅ Generate page at build time
export const dynamic = 'force-static';

export default async function DesignPage() {
  // Fetch in parallel
  const [trendingData, productsData] = await Promise.all([
    getTrendingData(),
    getProductsData()
  ]);

  // ✅ Even if fetches fail, page renders with placeholders
  return (
    <DesignClient 
      trendingData={trendingData || []} 
      productsData={productsData || []} 
    />
  );
}