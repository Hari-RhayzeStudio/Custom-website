"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XIcon, UploadIcon } from '@/components/Icons';
import TrendingDesigns from '@/components/designPage/TrendingDesigns';

// ✅ Swiper Imports (Required for the images to load properly in the carousel)
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const DEFAULT_CATEGORIES = [
  { name: 'Men-rings', image: '/assets/placeholder-men-ring.jpg' },
  { name: 'Bands', image: '/assets/placeholder-band.jpg' },
  { name: 'Ladies-rings', image: '/assets/placeholder-ladies-ring.jpg' },
  { name: 'Earrings', image: '/assets/placeholder-earring.jpg' },
  // { name: 'Bracelets', image: '/assets/placeholder-jewelry.jpg' },
  // { name: 'Necklaces', image: '/assets/placeholder-jewelry.jpg' },
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
  const [isNavigating, setIsNavigating] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
    
    // Duplicate categories to ensure swiper has enough slides to loop infinitely
    const loopedCategories = [...dynamicCategories];
    while (loopedCategories.length < 6) {
        loopedCategories.push(...dynamicCategories);
    }
    setCategories(loopedCategories.slice(0, 9)); 
  }, [productsData]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

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
    
    try {
        setIsNavigating(true); 
        let base64Image = null;
        if (selectedFile) {
          base64Image = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(selectedFile);
          });
        }

        const pendingRequest = {
          prompt: prompt,
          base64Image: base64Image,
          hotspot: hotspot,
          status: 'pending',
          timestamp: Date.now()
        };
        
        localStorage.setItem('pendingDesignRequest', JSON.stringify(pendingRequest));
        const cleanPrompt = prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        router.push(`/design/result?prompt=${cleanPrompt}`);
        
    } catch (error) {
        console.error("Navigation Error:", error);
        setIsNavigating(false);
        alert("Something went wrong. Please try again.");
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/catalogue?category=${encodeURIComponent(categoryName)}`);
  };

  const CategoryCard = ({ category, isActive }: { category: any, isActive?: boolean }) => (
    <div 
      onClick={() => handleCategoryClick(category.name)}
      className={`
        relative overflow-hidden rounded-[1.5rem] transition-all duration-500 cursor-pointer 
        ${isActive ? 'shadow-xl border-2 border-[#7D3C98]' : 'shadow-md opacity-80 hover:opacity-100'}
        bg-white h-full w-full
      `}
    >
      <img 
        src={category.image} 
        alt={category.name} 
        className="w-full h-full object-cover"
        onError={(e) => { e.currentTarget.src = "/assets/placeholder-jewelry.jpg"; }} 
        loading="eager"
      />
      
      <div className={`
        absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full backdrop-blur-md transition-all duration-300
        ${isActive ? 'bg-white/90 text-[#7D3C98] opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}>
        <p className="font-serif tracking-wide text-xs md:text-sm font-bold whitespace-nowrap">
          {category.name}
        </p>
      </div>
    </div>
  );

  const isButtonDisabled = !prompt.trim() || isNavigating;
  const buttonBaseClasses = "w-full md:w-auto px-12 py-3 rounded-xl font-medium transition-colors text-base shadow-sm flex items-center justify-center gap-2";
  const buttonStateClasses = isButtonDisabled 
    ? "bg-[#E5E7EB] text-gray-700 cursor-not-allowed opacity-70" 
    : "bg-[#722E85] text-white hover:bg-[#5e256e] cursor-pointer";

  return (
    <div className="min-h-screen bg-[#FAF8F3] pt-2 md:pt-4 pb-12 md:pb-10 overflow-x-hidden flex flex-col justify-start">
      <div className="max-w-[1440px] mx-auto w-full">
        
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-serif text-center mb-2 md:mb-4 text-gray-800 leading-tight px-4 mt-2">
          {selectedFile ? "Edit Your Piece" : "Generate Your Personalized Jewellery"}
        </h1>

        {!selectedFile && (
          // ✅ CAROUSEL RESTORED HERE
          <div className="mb-2 relative w-full max-w-4xl mx-auto">
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              loop={true}
              slidesPerView={3}
              coverflowEffect={{
                rotate: 0, stretch: 0, depth: 100, modifier: 1, slideShadows: false, scale: 0.6,
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              modules={[EffectCoverflow, Autoplay, Pagination]}
              className="w-full !pb-6 pt-2"
            >
              {categories.map((category, index) => (
                <SwiperSlide key={`${category.name}-${index}`} className="!h-[150px] md:!h-[220px]">
                  {({ isActive }) => ( <CategoryCard category={category} isActive={isActive} /> )}
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
            {/* Edit Image & Instructions UI */}
            {selectedFile && (
              <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm mb-4 animate-in fade-in slide-in-from-bottom-4 border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start justify-center">
                  
                  {/* Image with Hotspot */}
                  <div className="relative group w-full md:w-1/2 flex justify-center">
                    <button onClick={() => { setSelectedFile(null); setHotspot({x:0, y:0}); }} className="absolute -top-2 -right-2 md:-top-3 md:-right-3 p-2 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-md z-10"><XIcon className="w-5 h-5"/></button>
                    <div className="relative inline-block border border-gray-100 rounded-2xl p-2 bg-gray-50/50">
                      <img ref={imageRef} src={previewUrl} onClick={handleImageClick} className="max-h-48 md:max-h-64 w-auto object-contain cursor-crosshair rounded-xl shadow-sm" alt="Reference"/>
                      {hotspot.x > 0 && (
                        <div className="absolute w-5 h-5 bg-purple-600 rounded-full border-[2.5px] border-white shadow-lg pointer-events-none animate-pulse" style={{ left: `${(hotspot.x / (imageRef.current?.naturalWidth||1))*(imageRef.current?.width||1) + 8}px`, top: `${(hotspot.y / (imageRef.current?.naturalHeight||1))*(imageRef.current?.height||1) + 8}px`, transform: 'translate(-50%, -50%)' }} />
                      )}
                    </div>
                  </div>
                  
                  {/* ✅ ADDED Instructions Box */}
                  <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#F0EAD6] shadow-sm mb-2">
                      <p className="font-bold text-gray-800 text-sm text-center mb-4 font-serif">Click on product to make precise edit</p>
                      <div className="space-y-3">
                        <p className="text-gray-600 text-sm flex gap-3 items-center">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-[#7D3C98] font-bold text-xs shrink-0">1</span> 
                          Select part to edit
                        </p>
                        <p className="text-gray-600 text-sm flex gap-3 items-center">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-[#7D3C98] font-bold text-xs shrink-0">2</span> 
                          Enter prompt to make precise edit
                        </p>
                        <p className="text-gray-600 text-sm flex gap-3 items-center">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-[#7D3C98] font-bold text-xs shrink-0">3</span> 
                          Generate Product
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Input Container */}
            <div className="bg-white rounded-3xl p-3 md:p-4 shadow-sm border border-gray-100/50 mb-3 md:mb-4">
              <div className="relative">
                <textarea 
                  ref={textAreaRef}
                  className="w-full p-3 pr-10 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 resize-none text-gray-700 placeholder:text-gray-400 text-sm md:text-base overflow-hidden"
                  style={{ minHeight: '50px', height: 'auto' }}
                  placeholder={selectedFile ? "Describe your edit here..." : "Enter your jewellery detail here..."} 
                  value={prompt} 
                  onChange={handlePromptChange} 
                />
                {!selectedFile && ( <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 p-2 text-gray-400 hover:text-purple-600 bg-white rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200"><UploadIcon className="w-5 h-5" /></button> )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center mb-6">
              <button onClick={handleGenerate} disabled={isButtonDisabled} className={`${buttonBaseClasses} ${buttonStateClasses}`}>
                {isNavigating && <span className="animate-spin h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full"></span>}
                {isNavigating ? 'Generating...' : 'Generate'}
              </button>
            </div>

            {/* Trending Designs */}
            <div className="w-full flex flex-col items-center">
               <TrendingDesigns 
                 trendingData={trendingData} 
                 onSelectPrompt={(newPrompt) => { 
                   setPrompt(newPrompt); 
                   if(textAreaRef.current) setTimeout(() => {
                      textAreaRef.current!.style.height = 'auto';
                      textAreaRef.current!.style.height = `${textAreaRef.current!.scrollHeight}px`;
                   }, 0);
                   window.scrollTo({ top: 0, behavior: 'smooth' }); 
                 }} 
               />
            </div>

            {/* How it works Section */}
            <div className="mt-8 border-t border-gray-200 pt-8 pb-10">
              <div className="flex items-center gap-4 mb-8 justify-center">
                <div className="h-px bg-gray-200 w-12 md:w-20"></div>
                <h2 className="text-xl md:text-2xl font-serif text-gray-800">How it works</h2>
                <div className="h-px bg-gray-200 w-12 md:w-20"></div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-white p-6 md:p-8 rounded-3xl text-center shadow-sm border border-gray-50">
                  <h3 className="text-lg md:text-xl font-serif font-bold text-[#7D3C98] mb-2">Step 1: Generate</h3>
                  <p className="text-gray-500 text-sm">
                    Create your favourite jewellery with just a prompt and save it in your wishlist.
                  </p>
                </div>
                <div className="bg-white p-6 md:p-8 rounded-3xl text-center shadow-sm border border-gray-50">
                  <h3 className="text-lg md:text-xl font-serif font-bold text-[#7D3C98] mb-2">Step 2: Consultation</h3>
                  <p className="text-gray-500 text-sm">
                    We'll help you to bring your imagination into reality with free discussion.
                  </p>
                </div>
              </div>
            </div>

        </div>
      </div>
    </div>
  );
}