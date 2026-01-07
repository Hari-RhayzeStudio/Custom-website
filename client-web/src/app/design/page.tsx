"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, Sparkles } from 'lucide-react';
import TrendingDesigns from '@/components/TrendingDesigns';

// We no longer import the Loader here, because the Result Page will handle it.

const categories = [
  { name: 'Rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop' },
  { name: 'Necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop' },
  { name: 'Bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&h=300&fit=crop' },
  { name: 'Earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop' },
];

export default function DesignPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [hotspot, setHotspot] = useState({ x: 0, y: 0 });
  
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
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

    // 1. Convert File to Base64 (if exists) so we can pass it via LocalStorage
    // (Browsers can't pass File objects between pages easily without a backend upload first)
    let base64Image = null;
    if (selectedFile) {
      base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(selectedFile);
      });
    }

    // 2. Save the REQUEST to LocalStorage with 'pending' status
    const pendingRequest = {
      prompt: prompt,
      base64Image: base64Image, // The uploaded reference image
      hotspot: hotspot,
      status: 'pending', // Result page will see this and trigger API
      timestamp: Date.now()
    };
    
    localStorage.setItem('pendingDesignRequest', JSON.stringify(pendingRequest));

    // 3. IMMEDIATE REDIRECT (SEO Friendly URL)
    const cleanPrompt = prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    router.push(`/design/result?prompt=${cleanPrompt}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-10">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-serif text-center mb-12 text-gray-800">
          {selectedFile ? "Edit Your Piece" : "Generate Your Personalized Jewellery"}
        </h1>

        {/* --- CATEGORIES (Hidden if file selected) --- */}
        {!selectedFile && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            {categories.map((category) => (
              <div key={category.name} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-center py-3 font-medium text-gray-700">{category.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* --- IMAGE UPLOAD PREVIEW --- */}
        {selectedFile && (
          <div className="bg-white rounded-3xl p-8 shadow-sm mb-8 flex flex-col md:flex-row gap-8 justify-center">
            <div className="relative inline-block border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
               <button onClick={() => { setSelectedFile(null); setHotspot({x:0, y:0}); }} className="absolute top-4 right-4 bg-white/80 p-1 rounded-full hover:text-red-500 z-10"><X className="w-5 h-5"/></button>
               <img ref={imageRef} src={previewUrl} onClick={handleImageClick} className="max-h-400px object-contain cursor-crosshair" alt="Reference" />
               {hotspot.x > 0 && (
                 <div className="absolute w-4 h-4 bg-purple-600 rounded-full border-2 border-white shadow-lg pointer-events-none animate-pulse" 
                      style={{ left: `${(hotspot.x / (imageRef.current?.naturalWidth||1))*(imageRef.current?.width||1)}px`, top: `${(hotspot.y / (imageRef.current?.naturalHeight||1))*(imageRef.current?.height||1)}px`, transform: 'translate(-50%, -50%)' }} />
               )}
            </div>
          </div>
        )}

        {/* --- INPUT AREA --- */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="relative">
             <textarea
               className="w-full p-4 pr-12 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 min-h-120px resize-none text-gray-700"
               placeholder={selectedFile ? "Describe your edit..." : "Enter your jewellery detail here..."}
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
             />
             {!selectedFile && (
               <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-purple-600 transition">
                 <Upload className="w-6 h-6" />
               </button>
             )}
             <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>
          
          <div className="mt-6 flex justify-center">
             <button
               onClick={handleGenerate}
               className="w-full md:w-1/3 py-3 bg-[#E5E7EB] hover:bg-[#d1d5db] text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
             >
               <Sparkles className="w-5 h-5" /> Generate
             </button>
          </div>

        {/* --- 2. ADD TRENDING COMPONENT HERE --- */}
        <TrendingDesigns 
          onSelectPrompt={(newPrompt) => {
            setPrompt(newPrompt);
            // Smooth scroll back to input
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
        />
        
        {/* How It Works Section (Optional, matches your design) */}
        <div className="mt-20 border-t border-gray-200 pt-10">
            <div className="flex items-center gap-4 mb-12 justify-center">
              <div className="h-1px bg-gray-200 w-20"></div>
              <h2 className="text-2xl font-serif text-gray-800">How it works</h2>
              <div className="h-1px bg-gray-200 w-20"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-3xl text-center shadow-sm">
                  <h3 className="text-xl font-serif font-bold text-[#7D3C98] mb-4">Step 1: Generate</h3>
                  <p className="text-gray-500 text-sm">Create your favourite jewellery with just a prompt and save it in your wishlist.</p>
               </div>
               <div className="bg-white p-8 rounded-3xl text-center shadow-sm">
                  <h3 className="text-xl font-serif font-bold text-[#7D3C98] mb-4">Step 2: Consultation</h3>
                  <p className="text-gray-500 text-sm">We'll help you to bring your imagination into reality with free discussion.</p>
               </div>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}