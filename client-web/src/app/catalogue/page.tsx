import CatalogueHeader from '@/components/cataloguePage/CatalogueHeader';
import CatalogueGrid from '@/components/cataloguePage/CatalogueGrid';

// ✅ Define Base URL from Env with Fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Fetch Logic moved back to Page
async function getProducts(search?: string, category?: string, material?: string) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (material) params.append('material', material);
  
  // Cache Strategy: Cache default view for 1 hour, dynamic filters are fresh
  const isDefaultView = !search && !category && !material;
  const fetchOptions: RequestInit = isDefaultView 
    ? { next: { revalidate: 3600 } } 
    : { next: { revalidate: 0 } };

  // ✅ Use API_BASE_URL here
  const url = `${API_BASE_URL}/api/products?${params.toString()}`;
  
  try {
    const res = await fetch(url, fetchOptions); 
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch catalogue:", error);
    return [];
  }
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; material?: string }>;
}) {
  const { search = "", category = "", material = "" } = await searchParams;

  // BLOCKING FETCH: The page waits here until data is ready.
  // This prevents the "Skeleton Flash".
  const products = await getProducts(search, category, material);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <CatalogueHeader initialSearch={search} />
      
      {/* ✅ ADDED MORE LEFT/RIGHT SPACE: 
          Increased px-4 to px-6 (mobile), md:px-12 (tablet), lg:px-20, xl:px-28 (desktops) 
      */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 xl:px-28 py-8 md:py-12">
          <CatalogueGrid products={products} category={category} />
      </div>
    </div>
  );
}