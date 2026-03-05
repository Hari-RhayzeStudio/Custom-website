// src/app/about/page.tsx
import Link from 'next/link';
import { SparklesIcon } from '@/components/Icons';
import TimelineSection from '@/components/TimelineSection'; 
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

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

const FALLBACK_PRODUCT: Product = {
    id: "fallback-1",
    product_name: "Signature Diamond Ring",
    final_image_url: "/assets/placeholder-jewelry.jpg",
    sketch_image_url: "/assets/placeholder-jewelry.jpg", 
    wax_image_url: "/assets/placeholder-jewelry.jpg",
    cast_image_url: "/assets/placeholder-jewelry.jpg",
    final_description: "A placeholder description for offline mode."
};

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
    const res = await fetch(`${API_BASE_URL}/api/products`, { 
        next: { revalidate: 3600 } 
    });
    
    if (!res.ok) throw new Error('Failed to fetch');
    const allProducts: Product[] = await res.json();
    
    if (allProducts.length === 0) throw new Error("No products found");

    const shuffled = shuffleArray(allProducts);
    const headerImages = shuffled.slice(0, 3);
    
    const lifecycleProduct = shuffled.find(p => p.sketch_image_url && p.wax_image_url && p.cast_image_url) || shuffled[0];

    return { headerImages, lifecycleProduct };
  } catch (error) {
    console.warn("⚠️ Backend unavailable or sleeping. Using fallback data for About Page.");
    return { 
        headerImages: [FALLBACK_PRODUCT, FALLBACK_PRODUCT, FALLBACK_PRODUCT], 
        lifecycleProduct: FALLBACK_PRODUCT 
    };
  }
}

export default async function AboutUs() {
  const { headerImages, lifecycleProduct } = await getAboutData();
  const placeholderImg = "/assets/placeholder-jewelry.jpg";

  return (
    <main className="bg-white overflow-hidden font-sans">
      
      {/* SECTION 1: Header */}
      <section className="pt-24 pb-4 px-6 text-center max-w-5xl mx-auto">
        
        {/* ✅ Applied montserrat.className and removed font-serif */}
        <h1 className={`${montserrat.className} text-4xl md:text-6xl font-semibold text-gray-900 mb-6 tracking-tight`}>
          About <span className="text-[#7D3C98]">Rhayze Studio</span>
        </h1>
        
        <div className="flex flex-row items-center justify-center gap-2 md:gap-6 mb-10 h-45 md:h-62.5">
            <div className="relative w-[28%] md:w-39.25 h-[70%] md:h-42 rounded-2xl overflow-hidden shadow-md border border-gray-100 opacity-90 shrink-0">
                <img src={headerImages[0]?.final_image_url || placeholderImg} alt={headerImages[0]?.final_image_alt_text || "Left Product"} className="object-cover w-full h-full hover:scale-110 transition duration-700" />
            </div>
            
            <div className="relative w-[44%] md:w-83.75 h-[95%] md:h-55.25 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 z-10 shrink-0">
                <img src={headerImages[1]?.final_image_url || placeholderImg} alt={headerImages[1]?.final_image_alt_text || "Center Product"} className="object-cover w-full h-full hover:scale-110 transition duration-700" />
            </div>
            
            <div className="relative w-[28%] md:w-39.25 h-[70%] md:h-42 rounded-2xl overflow-hidden shadow-md border border-gray-100 opacity-90 shrink-0">
                <img src={headerImages[2]?.final_image_url || placeholderImg} alt={headerImages[2]?.final_image_alt_text || "Right Product"} className="object-cover w-full h-full hover:scale-110 transition duration-700" />
            </div>
        </div>

        {/* ✅ Applied montserrat.className here */}
        <p className={`${montserrat.className} text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4`}>
          We are a jewellery design–first studio that blends advanced AI with real craftsmanship to help you create pieces that are truly yours. Our platform is built with jewellers, not instead of them, so every design can travel from a simple prompt to a piece you can actually wear.
        </p>

      </section>

      {/* SECTION 2: The Timeline (Full Mode) */}
      <section className="bg-linear-to-b from-white to-[#FDFBF7]">
         <div className="text-center pt-20 px-4">
            <h2 className={`${montserrat.className} font-bold text-3xl md:text-4xl text-gray-900 mb-3`}>
               The Crafting Journey
            </h2>
            <p className={`${montserrat.className} text-gray-500 text-sm md:text-base`}>
               From your imagination to reality
            </p>
         </div>
         
         <TimelineSection product={lifecycleProduct || FALLBACK_PRODUCT} mode="full" />
      </section>

      {/* SECTION 3: CTA */}
      <section className="bg-white py-20 md:py-24 px-6 text-center border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
            <h2 className={`${montserrat.className} text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6`}>Ready to create your masterpiece?</h2>
            <p className={`${montserrat.className} text-gray-500 text-sm md:text-base mb-8 md:mb-10 leading-relaxed`}>
                Our experts are 24/7 available to guide you through the process. Let's make something beautiful together.
            </p>
            <Link href="/bookings">
              <button className={`${montserrat.className} flex items-center justify-center gap-3 bg-[#7D3C98] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full font-bold text-sm md:text-base hover:bg-[#6a3281] transition shadow-lg hover:shadow-purple-200 transform hover:-translate-y-1 mx-auto cursor-pointer w-full sm:w-auto`}>
                 <img src="/assets/google-meet-icon.png" alt="Meet" className="w-4 h-4 md:w-5 md:h-5" /> Start Free Consultation
              </button>
            </Link>
        </div>
      </section>

    </main>
  );
}