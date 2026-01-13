// src/app/catalogue/page.tsx
import Link from 'next/link';
import CatalogueHeader from '@/components/cataloguePage/CatalogueHeader'; // Import new header
import { EmptyStateIcon } from '@/components/Icons';

// ... (Keep your getProducts function exactly as it is) ...
async function getProducts(search?: string, category?: string, material?: string) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (material) params.append('material', material);
  const url = `http://localhost:3001/api/products?${params.toString()}`;
  
  try {
    const res = await fetch(url, { next: { revalidate: 0 } }); 
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
  const products = await getProducts(search, category, material);

  // ... (Keep generateSlug and formatCategory helpers) ...
  const generateSlug = (name: string, sku: string) => {
    const formattedName = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    return `${formattedName}-${sku}`;
  };
  const formatCategory = (cat: string) => cat ? cat.toLowerCase().replace(/\s+/g, '-') : 'jewelry';

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      
      {/* New Header Logic with Filter Drawer  */}
      <CatalogueHeader initialSearch={search} />

      <div className="max-w-7xl mx-auto p-6 md:p-8">
          
          {/* Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {category || "All Designs"} 
              <span className="text-gray-400 font-normal text-sm ml-2">({products.length} found)</span>
            </h2>
          </div>

          {/* Product Grid (Full Width) */}
          <div className="w-full">
            {products.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                  <EmptyStateIcon className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No designs found.</p>
                  <p className="text-sm">Try adjusting your filters or search.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((p: any) => (
                  <div key={p.id.toString()} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col group hover:shadow-lg transition duration-300">
                    <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-xl bg-gray-50">
                       <img 
                         src={p.final_image_url || '/placeholder.jpg'} 
                         alt={p.product_name} 
                         className="object-cover w-full h-full transition duration-700 group-hover:scale-105" 
                       />
                       <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider text-gray-600">
                         {p.category}
                       </div>
                    </div>
                    
                    <h3 className="font-serif text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={p.product_name}>
                        {p.product_name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">{p.final_description}</p>
                    
                    <Link href={`/${formatCategory(p.category)}/${generateSlug(p.product_name, p.sku)}`}>
                      <button className="w-full border border-[#7D3C98] text-[#7D3C98] py-2.5 rounded-xl font-bold text-sm hover:bg-[#7D3C98] hover:text-white transition-colors flex items-center justify-center gap-2">
                        View Details
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}