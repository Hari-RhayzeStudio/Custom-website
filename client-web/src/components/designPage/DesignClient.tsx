"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// UPDATED: Import from your central Icons file
import { XIcon, UploadIcon } from '@/components/Icons';
import TrendingDesigns from '@/components/designPage/TrendingDesigns';

// Default / Fallback Images
const DEFAULT_CATEGORIES = [
  { name: 'Men-rings', image: '/assets/placeholder-Men-ring.jpg' },
  { name: 'Bands', image: '/assets/placeholder-band.jpg' },
  { name: 'Ladies-rings', image: '/assets/placeholder-Ladies-ring.jpg' },
  { name: 'Earrings', image: '/assets/placeholder-earring.jpg' },
];

interface DesignClientProps {
  trendingData: any[]; // Passed from Server
  productsData: any[]; // Passed from Server
}

export default function DesignClient({ trendingData, productsData }: DesignClientProps) {
  const router = useRouter();
  
  // -- STATE --
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [hotspot, setHotspot] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. PROCESS CATEGORIES (Instant - No Fetching needed) ---
  useEffect(() => {
    if (!Array.isArray(productsData) || productsData.length === 0) return;

    const dynamicCategories = DEFAULT_CATEGORIES.map(cat => {
        const matching = productsData.filter((p: any) => 
            p.category?.toLowerCase() === cat.name.toLowerCase() && 
            (p.final_image_url || p.image_url)
        );

        if (matching.length > 0) {
            // Pick a random product
            const randomProduct = matching[Math.floor(Math.random() * matching.length)];
            return { 
                name: cat.name, 
                image: randomProduct.final_image_url || randomProduct.image_url 
            };
        }
        return cat;
    });

    setCategories(dynamicCategories);
  }, [productsData]);

  // --- HANDLERS ---
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
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#FAF8F3] py-10">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-serif text-center mb-12 text-gray-800">
          {selectedFile ? "Edit Your Piece" : "Generate Your Personalized Jewellery"}
        </h1>

        {/* Categories */}
        {!selectedFile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            {categories.map((category) => (
              <div key={category.name} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-default">
                <div className="aspect-square overflow-hidden bg-gray-100 relative">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.currentTarget.src = "/assets/placeholder-jewelry.jpg"; }} 
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>
                <p className="text-center py-3 font-medium text-gray-700 font-serif tracking-wide">{category.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Upload Preview */}
        {selectedFile && (
          <div className="bg-white rounded-3xl p-8 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row gap-12 items-start justify-center">
              <div className="relative group w-full md:w-1/2 flex justify-center">
                <button onClick={() => { setSelectedFile(null); setHotspot({x:0, y:0}); }} className="absolute -top-2 -right-2 md:top-0 md:right-0 p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition z-10">
                    <XIcon className="w-5 h-5"/>
                </button>
                <div className="relative inline-block">
                  <img ref={imageRef} src={previewUrl} onClick={handleImageClick} className="max-h-75 w-auto object-contain cursor-crosshair rounded-lg" alt="Reference"/>
                  {hotspot.x > 0 && (
                    <div className="absolute w-5 h-5 bg-purple-600 rounded-full border-[3px] border-white shadow-lg pointer-events-none animate-pulse" style={{ left: `${(hotspot.x / (imageRef.current?.naturalWidth||1))*(imageRef.current?.width||1)}px`, top: `${(hotspot.y / (imageRef.current?.naturalHeight||1))*(imageRef.current?.height||1)}px`, transform: 'translate(-50%, -50%)' }} />
                  )}
                </div>
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6 pt-4">
                 <div className="bg-[#F9F5E8] py-3 px-6 rounded-lg shadow-sm border border-[#F0EAD6]"><p className="font-bold text-gray-800 text-sm text-center tracking-wide">Click on product to make precise edit</p></div>
                 <div className="bg-[#FDFBF7] p-6 rounded-xl border border-gray-100 space-y-4">
                    <p className="text-gray-600 text-sm flex gap-3 items-center"><span className="font-bold text-gray-400">1.</span> Select part to edit</p>
                    <p className="text-gray-600 text-sm flex gap-3 items-center"><span className="font-bold text-gray-400">2.</span> enter prompt to make precise edit</p>
                    <p className="text-gray-600 text-sm flex gap-3 items-center"><span className="font-bold text-gray-400">3.</span> Generate Product</p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50">
          <div className="relative">
             <textarea
               className="w-full p-4 pr-12 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 min-h-30 resize-none text-gray-700 placeholder:text-gray-400 text-base"
               placeholder={selectedFile ? "Describe your edit here..." : "Enter your jewellery detail here..."}
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
             />
             {!selectedFile && (
               <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-purple-600 transition bg-white rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200">
                   <UploadIcon className="w-5 h-5" />
               </button>
             )}
             <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8 flex justify-center">
           <button onClick={handleGenerate} disabled={!prompt.trim()} className="px-12 py-3 bg-[#E5E7EB] hover:bg-[#d1d5db] text-gray-700 rounded-lg font-medium transition-colors text-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Generate</button>
        </div>

        {/* --- TRENDING SECTION (Passed Data) --- */}
        <TrendingDesigns 
          trendingData={trendingData} 
          onSelectPrompt={(newPrompt) => {
            setPrompt(newPrompt);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
        />
        
        {/* How It Works */}
        <div className="mt-20 border-t border-gray-200 pt-10">
            <div className="flex items-center gap-4 mb-12 justify-center">
              <div className="h-px bg-gray-200 w-20"></div><h2 className="text-2xl font-serif text-gray-800">How it works</h2><div className="h-px bg-gray-200 w-20"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-3xl text-center shadow-sm"><h3 className="text-xl font-serif font-bold text-[#7D3C98] mb-4">Step 1: Generate</h3><p className="text-gray-500 text-sm">Create your favourite jewellery with just a prompt and save it in your wishlist.</p></div>
               <div className="bg-white p-8 rounded-3xl text-center shadow-sm"><h3 className="text-xl font-serif font-bold text-[#7D3C98] mb-4">Step 2: Consultation</h3><p className="text-gray-500 text-sm">We'll help you to bring your imagination into reality with free discussion.</p></div>
            </div>
        </div>

      </div>
    </div>
  );
}