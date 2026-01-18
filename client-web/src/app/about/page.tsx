import Link from 'next/link';
import Image from 'next/image';
import { MeetIcon, RequirementsIcon, SparklesIcon } from '@/components/Icons';
import CraftingProcess from '@/components/CraftingProcess';

// Define the product shape based on your Prisma schema
interface Product {
  id: string;
  product_name: string;
  final_image_url: string;
  sketch_image_url?: string;
  wax_image_url?: string;
  cast_image_url?: string;
  final_description: string;
}

// Helper to shuffle array for random selection
function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

// Fetch data on the server
async function getAboutData() {
  try {
    // Ensure your backend is running on port 3001
    const res = await fetch('http://localhost:3001/api/products', { 
        next: { revalidate: 60 } // Re-fetch every 60 seconds for freshness
    });
    
    if (!res.ok) throw new Error('Failed to fetch data');
    
    const allProducts: Product[] = await res.json();
    
    if (allProducts.length === 0) {
        return { headerImages: [], lifecycleProduct: null };
    }

    const shuffled = shuffleArray(allProducts);
    
    // Pick top 3 for the header grid
    const headerImages = shuffled.slice(0, 3);
    
    // Pick the first one that has all necessary images for the lifecycle flow
    // Fallback to just the first random one if a perfect one isn't found.
    const lifecycleProduct = shuffled.find(p => 
        p.sketch_image_url && p.wax_image_url && p.cast_image_url
    ) || shuffled[0];

    return { headerImages, lifecycleProduct };

  } catch (error) {
    console.error("About Page Data Error:", error);
    // Return empty states so page doesn't crash
    return { headerImages: [], lifecycleProduct: null };
  }
}

export default async function AboutUs() {
  const { headerImages, lifecycleProduct } = await getAboutData();
  const purpleText = "text-[#7D3C98]";
  const creamBg = "bg-[#F9F5E8]";

  // Placeholder if data is missing
  const placeholderImg = "/placeholder-jewelry.jpg";

  return (
    <main className="bg-white overflow-hidden">
      {/* --- SECTION 1: Header & Random Image Grid --- */}
      <section className="py-20 px-6 text-center max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-16">
          About Rhayze Studio
        </h1>

        {/* Random Final Images Grid (Simulating carousel style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {headerImages.length > 0 ? headerImages.map((p, idx) => (
                <div key={p.id || idx} className={`relative aspect-square rounded-2xl overflow-hidden shadow-lg ${idx === 1 ? 'md:-mt-8 md:mb-8 z-10' : ''}`}>
                    <img 
                        src={p.final_image_url || placeholderImg} 
                        alt={p.product_name || "Jewelry"}
                        className="object-cover w-full h-full"
                    />
                </div>
            )) : (
                // Fallback if no data
                [1,2,3].map(i => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse"></div>
                ))
            )}
        </div>

        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          We are a jewellery design-first studio that blends advanced AI with real craftsmanship to help you create pieces that are truly yours. Our platform is built with jewellers, not instead of them, so every design can travel from a simple prompt to a piece you can actually wear.
        </p>
      </section>


      {/* --- SECTION 2: How It Works Title --- */}
      <section className="py-10 text-center">
        <h2 className="text-4xl font-serif font-bold text-gray-900">How it works</h2>
      </section>


      {/* --- SECTION 3: Steps 1 & 2 (Consultation Timeline) --- */}
      <section className="max-w-5xl mx-auto px-6 py-10 relative">
         {/* Central Vertical Line */}
        <div className={`absolute left-1/2 top-0 bottom-0 w-0.5 ${creamBg} md:block hidden`}></div>

        <div className="flex flex-col md:gap-y-24">
            {/* Step 1: Consultation (Left side) */}
            <div className="md:w-1/2 md:pr-12 relative">
                 <h3 className={`text-3xl font-serif ${purpleText} mb-6 text-center md:text-left`}>Step-1: Consultation</h3>
                 <div className={`${creamBg} p-10 rounded-3xl text-center relative`}>
                    {/* Timeline Dot */}
                    <div className={`hidden md:block absolute top-1/2 -right-14 w-4 h-4 rounded-full ${purpleText} bg-current ring-4 ring-white`}></div>
                    
                    <MeetIcon className="w-16 h-16 mx-auto mb-6 text-blue-500" />
                    <h4 className="text-xl font-bold mb-4">Book Consultation</h4>
                    <p className="text-gray-600">Book free-consultation and discuss your requirement with us</p>
                 </div>
            </div>

            {/* Step 2: Requirements (Right side, offset down) */}
            <div className="md:w-1/2 md:ml-auto md:pl-12 relative mt-12 md:mt-0">
                 <h3 className={`text-3xl font-serif ${purpleText} mb-6 text-center md:text-right`}>Step-2: Requirements</h3>
                 <div className={`${creamBg} p-10 rounded-3xl text-center relative`}>
                    {/* Timeline Dot */}
                    <div className={`hidden md:block absolute top-1/2 -left-14 w-4 h-4 rounded-full ${purpleText} bg-current ring-4 ring-white`}></div>

                    <RequirementsIcon className="w-16 h-16 mx-auto mb-6 text-gray-700" />
                    <h4 className="text-xl font-bold mb-4">Choose Design or tell us custom requirements</h4>
                    <p className="text-gray-600">We have a wide-range of designs in catalogue or generate with us or we do create <strong>"Custom Designs"</strong></p>
                 </div>
            </div>
        </div>
      </section>
      {/* Step-3: Designing using the separate file */}
      <CraftingProcess product={lifecycleProduct} />


      {/* --- SECTION 5: Why Rhayze Studio & Footer --- */}
      {/* <section className="bg-[#FDFBF7] py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-8">Why Rhayze Studio</h2>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
                We are 24x7 available to serve you, our aim is to improve your experience through overall process of making Jewellery and make this process visible to you. Everything is transparent with us.
            </p>
            <button className="flex items-center justify-center gap-3 mx-auto bg-[#7D3C98] text-white px-12 py-4 rounded-full text-lg font-bold hover:bg-[#6a3281] transition shadow-lg">
                <SparklesIcon className="w-6 h-6" />
                Book Consultation
            </button>
        </div>
      </section> */}

    </main>
  );
}