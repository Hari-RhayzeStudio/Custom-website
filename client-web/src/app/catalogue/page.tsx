// src/app/catalogue/page.tsx
import CatalogueHeader from '@/components/cataloguePage/CatalogueHeader';
import CatalogueGrid from '@/components/cataloguePage/CatalogueGrid';

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

  const url = `http://localhost:3001/api/products?${params.toString()}`;
  
  try {
    const res = await fetch(url, fetchOptions); 
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error(error);
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
      <div className="max-w-7xl mx-auto p-6 md:p-8">
          {/* No Suspense here. We pass data directly. */}
          <CatalogueGrid products={products} category={category} />
      </div>
    </div>
  );
}