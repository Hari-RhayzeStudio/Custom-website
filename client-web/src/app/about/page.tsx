// src/app/about/page.tsx

import Link from 'next/link';
import { SparklesIcon } from '@/components/Icons';
// ✅ IMPORT FIXED: Pointing to the correct location based on previous steps
import TimelineSection from '@/components/TimelineSection'; 

// ✅ INTERFACE UPDATED: Added alt_text fields for SEO
interface Product {
  id: string;
  product_name: string;
  final_image_url: string;
  final_image_alt_text?: string;
  
  sketch_image_url?: string;
  sketch_image_alt_text?: string;
  
  wax_image_url?: string;
  wax_image_alt_text?: string;
  
  cast_image_url?: string;
  cast_image_alt_text?: string;
  
  final_description: string;
}

function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

async function getAboutData() {
  try {
    // Ensure this URL matches your .env variable or localhost port
    const res = await fetch('http://localhost:3001/api/products', { next: { revalidate: 60 } });
    
    if (!res.ok) throw new Error('Failed to fetch');
    const allProducts: Product[] = await res.json();
    
    if (allProducts.length === 0) return { headerImages: [], lifecycleProduct: null };

    const shuffled = shuffleArray(allProducts);
    const headerImages = shuffled.slice(0, 3);
    
    // Find a product that has all images for the timeline, fallback to first item
    const lifecycleProduct = shuffled.find(p => p.sketch_image_url && p.wax_image_url && p.cast_image_url) || shuffled[0];

    return { headerImages, lifecycleProduct };
  } catch (error) {
    console.error("About page data fetch error:", error);
    return { headerImages: [], lifecycleProduct: null };
  }
}

export default async function AboutUs() {
  const { headerImages, lifecycleProduct } = await getAboutData();
  const placeholderImg = "/placeholder-jewelry.jpg";

  return (
    <main className="bg-white overflow-hidden font-sans">
      
      {/* SECTION 1: Header */}
      <section className="pt-24 pb-12 px-6 text-center max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-8 tracking-tight">
          About <span className="text-[#7D3C98]">Rhayze Studio</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-16">
          We combine high skill with the soulful touch of traditional craftsmanship to create jewellery that is uniquely yours.
        </p>

        {/* Carousel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {headerImages.length > 0 ? headerImages.map((p, idx) => (
                <div key={p.id || idx} className={`relative aspect-4/5 rounded-3xl overflow-hidden shadow-lg border border-gray-100 ${idx === 1 ? 'md:-mt-12 z-10 shadow-2xl' : 'scale-95 opacity-90'}`}>
                    <img 
                      src={p.final_image_url || placeholderImg} 
                      alt={p.final_image_alt_text || p.product_name} 
                      className="object-cover w-full h-full hover:scale-110 transition duration-700" 
                    />
                </div>
            )) : [1,2,3].map(i => <div key={i} className="aspect-4/5 bg-gray-100 rounded-3xl animate-pulse"></div>)}
        </div>
      </section>

      {/* SECTION 2: The Timeline (Full Mode) */}
      <section className="bg-linear-to-b from-white to-[#FDFBF7]">
         <div className="text-center pt-20">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-2">The Crafting Journey</h2>
            <p className="text-gray-500">From your imagination to reality</p>
         </div>
         
         {/* ✅ Explicitly passing mode="full" (though it is default) */}
         <TimelineSection product={lifecycleProduct} mode="full" />
      </section>

      {/* SECTION 3: CTA */}
      <section className="bg-white py-24 px-6 text-center border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">Ready to create your masterpiece?</h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
                Our experts are 24/7 available to guide you through the process. Let's make something beautiful together.
            </p>
            {/* ✅ WRAPPED IN LINK TO BOOKINGS */}
            <Link href="/bookings">
              <button className="flex items-center gap-3 bg-[#7D3C98] text-white px-10 py-4 rounded-full font-bold hover:bg-[#6a3281] transition shadow-lg hover:shadow-purple-200 transform hover:-translate-y-1 mx-auto">
                 <SparklesIcon className="w-5 h-5" /> Start Free Consultation
              </button>
            </Link>
        </div>
      </section>

    </main>
  );
}