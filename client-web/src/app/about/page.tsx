import Link from 'next/link';
import TimelineSection from '@/components/TimelineSection'; 
import AboutCarousel from '@/components/AboutCarousel'; // ✅ Import the new Carousel
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

async function getTimelineData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`, { 
        next: { revalidate: 3600 } 
    });
    
    if (!res.ok) throw new Error('Failed to fetch');
    const allProducts: Product[] = await res.json();
    
    if (allProducts.length === 0) throw new Error("No products found");

    // Grab a product that has all timeline images
    const lifecycleProduct = allProducts.find(p => p.sketch_image_url && p.wax_image_url && p.cast_image_url) || allProducts[0];

    return { lifecycleProduct };
  } catch (error) {
    console.warn("⚠️ Backend unavailable. Using fallback data for Timeline.");
    return { lifecycleProduct: FALLBACK_PRODUCT };
  }
}

export default async function AboutUs() {
  const { lifecycleProduct } = await getTimelineData();

  return (
    <main className="bg-white overflow-hidden font-sans">
      
      {/* SECTION 1: Header */}
      <section className="pt-24 pb-8 px-6 text-center max-w-[1440px] mx-auto">
        
        <h1 className={`${montserrat.className} text-4xl md:text-6xl font-semibold text-gray-900 mb-10 tracking-tight`}>
          About <span className="text-[#7D3C98]">Rhayze Studio</span>
        </h1>
        
        {/* ✅ Insert the 3D auto-scrolling 5-image carousel */}
        <AboutCarousel />

        <p className={`${montserrat.className} text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4 text-justify md:text-center`}>
          We are a jewellery design–first studio that blends advanced AI with real craftsmanship to help you create pieces that are truly yours. Our platform is built with jewellers, not instead of them, so every design can travel from a simple prompt to a piece you can actually wear.
        </p>

      </section>

      {/* SECTION 2: The Timeline */}
      <section className="bg-gradient-to-b from-white to-[#FDFBF7]">
         <div className="text-center pt-16 md:pt-20 px-4">
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
            <h2 className={`${montserrat.className} text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6`}>
                Ready to create your masterpiece?
            </h2>
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