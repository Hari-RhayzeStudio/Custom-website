// src/app/catalogue/page.tsx
import Link from 'next/link';

async function getProducts(search?: string) {
  const url = search 
    ? `http://localhost:3001/api/products?search=${search}`
    : `http://localhost:3001/api/products`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;
  const products = await getProducts(search);

  // Generates: product-name-12345
  const generateSlug = (name: string, sku: string) => {
    const formattedName = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with -
      .replace(/^-+|-+$/g, ''); // Trim dashes
    return `${formattedName}-${sku}`;
  };

  // Normalizes category: "Ladies Rings" -> "ladies-rings"
  const formatCategory = (cat: string) => cat.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <form action="/catalogue" method="GET" className="flex gap-4 mb-12 max-w-4xl mx-auto">
        <input 
          name="search"
          type="text" 
          defaultValue={search}
          placeholder="Search for designs..." 
          className="flex-1 p-4 border rounded-full px-8 shadow-sm outline-none transition-all"
        />
        <button type="submit" className="bg-[#7D3C98] text-white px-10 rounded-full font-medium">
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
        {products.map((p: any) => (
          <div key={p.id.toString()} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col group">
            <div className="relative aspect-square w-full mb-6 overflow-hidden rounded-xl bg-gray-50">
               <img 
                 src={p.final_image_url || '/placeholder.jpg'} 
                 alt={p.product_name} 
                 className="object-cover w-full h-full" 
               />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">{p.product_name}</h3>
            <p className="text-sm text-gray-600 line-clamp-3 mb-6">{p.final_description}</p>
            
            {/* CORRECTED URL FORMAT: website/${category}/product_name-sku */}
            <Link href={`/${formatCategory(p.category)}/${generateSlug(p.product_name, p.sku)}`}>
              <button className="w-full border-2 border-[#7D3C98] text-[#7D3C98] py-2 rounded-lg font-bold">
                View Details
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}