"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XIcon, UploadIcon } from '@/components/Icons';
import TrendingDesigns from '@/components/designPage/TrendingDesigns';

// ✅ Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const DEFAULT_CATEGORIES = [
  { name: 'Men-rings', image: '/assets/placeholder-men-ring.jpg' },
  { name: 'Bands', image: '/assets/placeholder-band.jpg' },
  { name: 'Ladies-rings', image: '/assets/placeholder-ladies-ring.jpg' },
  { name: 'Earrings', image: '/assets/placeholder-earring.jpg' }
];

interface DesignClientProps {
  trendingData: any[];
  productsData: any[];
}

export default function DesignClient({ trendingData, productsData }: DesignClientProps) {
  const router = useRouter();
  
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [hotspot, setHotspot] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!productsData || !Array.isArray(productsData) || productsData.length === 0) return;

    const dynamicCategories = DEFAULT_CATEGORIES.map(cat => {
      const normalizedCatName = cat.name.toLowerCase().replace(/[-_\s]/g, '');
      const matching = productsData.filter((p: any) => {
        if (!p.category) return false;
        const normalizedProductCat = p.category.toLowerCase().replace(/[-_\s]/g, '');
        return normalizedProductCat === normalizedCatName && !!(p.final_image_url || p.image_url);
      });

      if (matching.length > 0) {
        const randomProduct = matching[Math.floor(Math.random() * matching.length)];
        return { 
          name: cat.name, 
          image: randomProduct.final_image_url || randomProduct.image_url 
        };
      }
      return cat;
    });
    
    // Ensure we have enough slides for the loop
    const loopedCategories = [...dynamicCategories];
    while (loopedCategories.length < 6) {
        loopedCategories.push(...dynamicCategories);
    }
    setCategories(loopedCategories.slice(0, 8)); 
  }, [productsData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setHotspot({ x: 0, y: 0 }); 
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    setHotspot({
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY)
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const pendingRequest = {
      prompt: prompt,
      hotspot: hotspot,
      status: 'pending',
      timestamp: Date.now()
    };
    localStorage.setItem('pendingDesignRequest', JSON.stringify(pendingRequest));
    const cleanPrompt = prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    router.push(`/design/result?prompt=${cleanPrompt}`);
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/catalogue?category=${encodeURIComponent(categoryName)}`);
  };

  // ✅ COMPACT CARD: Removed heavy overlays so side items are clear
  const CategoryCard = ({ category, isActive }: { category: any, isActive?: boolean }) => (
    <div 
      onClick={() => handleCategoryClick(category.name)}
      className={`
        relative overflow-hidden rounded-[1.5rem] transition-all duration-500 cursor-pointer 
        ${isActive ? 'shadow-xl shadow-purple-100 border-2 border-white' : 'shadow-md brightness-95 hover:brightness-100'}
        bg-white h-full w-full group
      `}
    >
      <div className="w-full h-full relative">
        <img 
          src={category.image} 
          alt={category.name} 
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = "/assets/placeholder-jewelry.jpg"; }} 
          loading="eager"
        />
        {/* Removed the opacity layer so side images remain CLEAR */}
      </div>
      
      {/* Label only appears on active (middle) slide to keep side ones clean */}
      <div className={`
        absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full backdrop-blur-md transition-all duration-300
        ${isActive ? 'bg-white/90 text-[#7D3C98] opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}>
        <p className="font-serif tracking-wide text-xs md:text-sm font-bold whitespace-nowrap">
          {category.name}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-6 md:py-10 pb-[80px] md:pb-10 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto">
        
        <h1 className="text-3xl md:text-4xl font-serif text-center mb-8 text-gray-800 leading-tight px-4">
          {selectedFile ? "Edit Your Piece" : "Generate Your Personalized Jewellery"}
        </h1>

        {!selectedFile && (
          <div className="mb-12 relative w-full max-w-5xl mx-auto">
            {/* ✅ SWIPER: Compact, 3 items visible, Middle Pops Out */}
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              loop={true}
              slidesPerView={3} // ✅ Shows exactly 3 items
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: false, // ✅ Disable shadows so side items are clear
                scale: 0.6, // ✅ Side items are 60% size of middle (Big difference)
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              modules={[EffectCoverflow, Autoplay, Pagination]}
              className="w-full !pb-10 pt-2"
            >
              {categories.map((category, index) => (
                <SwiperSlide key={`${category.name}-${index}`} className="!h-[200px] md:!h-[320px]">
                  {({ isActive }) => (
                     <CategoryCard category={category} isActive={isActive} />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
            
            <style jsx global>{`
              .swiper-pagination-bullet { background: #ccc; opacity: 0.5; width: 6px; height: 6px; }
              .swiper-pagination-bullet-active { background: #7D3C98; opacity: 1; width: 16px; border-radius: 4px; }
            `}</style>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-4 md:px-6">
            {/* EDIT MODE */}
            {selectedFile && (
              <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start justify-center">
                  <div className="relative group w-full md:w-1/2 flex justify-center">
                    <button 
                      onClick={() => { setSelectedFile(null); setHotspot({x:0, y:0}); }} 
                      className="absolute -top-2 -right-2 p-2 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-sm z-10"
                    >
                      <XIcon className="w-5 h-5"/>
                    </button>
                    <div className="relative inline-block">
                      <img 
                        ref={imageRef} 
                        src={previewUrl} 
                        onClick={handleImageClick} 
                        className="max-h-52 md:max-h-64 w-auto object-contain cursor-crosshair rounded-lg" 
                        alt="Reference"
                      />
                      {hotspot.x > 0 && (
                        <div 
                          className="absolute w-4 h-4 bg-purple-600 rounded-full border-[2px] border-white shadow-lg pointer-events-none animate-pulse" 
                          style={{ 
                            left: `${(hotspot.x / (imageRef.current?.naturalWidth||1))*(imageRef.current?.width||1)}px`, 
                            top: `${(hotspot.y / (imageRef.current?.naturalHeight||1))*(imageRef.current?.height||1)}px`, 
                            transform: 'translate(-50%, -50%)' 
                          }} 
                        />
                      )}
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 pt-2">
                    <div className="bg-[#F9F5E8] py-2 px-4 rounded-lg border border-[#F0EAD6] mb-4">
                      <p className="font-bold text-gray-800 text-xs text-center">Click product to edit</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PROMPT INPUT */}
            <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100/50">
              <div className="relative">
                <textarea
                  className="w-full p-4 pr-12 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 min-h-[80px] resize-none text-gray-700 placeholder:text-gray-400 text-sm md:text-base"
                  placeholder={selectedFile ? "Describe your edit here..." : "Enter your jewellery detail here..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                {!selectedFile && (
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="absolute bottom-3 right-3 p-2 text-gray-400 hover:text-purple-600 bg-white rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200"
                  >
                    <UploadIcon className="w-5 h-5" />
                  </button>
                )}
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button 
                onClick={handleGenerate} 
                disabled={!prompt.trim()} 
                className="w-full md:w-auto px-10 py-3 bg-[#E5E7EB] hover:bg-[#d1d5db] text-gray-700 rounded-xl font-medium transition-colors text-base shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate
              </button>
            </div>

            <TrendingDesigns 
              trendingData={trendingData} 
              onSelectPrompt={(newPrompt) => {
                setPrompt(newPrompt);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
            />
        </div>
      </div>
    </div>
  );
}