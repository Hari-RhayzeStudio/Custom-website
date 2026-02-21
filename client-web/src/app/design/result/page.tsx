"use client";
import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon, Undo2Icon } from '@/components/Icons'; 
import FlashcardGrid from '@/components/designResult/FlashcardGrid';
import DesignImagePreview from '@/components/designResult/DesignImagePreview';

// ✅ Define Base URL from Env with Fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// --- ROYAL SKELETON LOADER ---
const RoyalSkeletonLoader = () => {
  // Cycle through elegant loading messages
  const [loadingText, setLoadingText] = useState("Drafting your concept...");
  
  useEffect(() => {
    const messages = [
      "Selecting the finest metals...",
      "Polishing the details...",
      "Setting the gemstones...",
      "Finalizing your masterpiece..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingText(messages[i]);
      i = (i + 1) % messages.length;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      {/* Header Skeleton */}
      <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between opacity-50">
         <div className="flex items-center gap-4 w-full">
            <div className="w-10 h-10 bg-[#FAF8F3] border border-[#EFE8D8] rounded-full"></div>
            <div className="h-6 bg-[#FAF8F3] rounded w-1/3"></div>
         </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
         
         {/* ROYAL IMAGE AREA */}
         <div className="relative aspect-square bg-[#FAF8F3] rounded-[2rem] border border-[#F0EAD6] overflow-hidden shadow-sm flex flex-col items-center justify-center p-8">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-full h-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
            
            {/* Center Icon Pulse */}
            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full border-4 border-[#E5DCC5] flex items-center justify-center animate-pulse">
                    <div className="w-12 h-12 bg-[#D4C5A5] rounded-full animate-bounce"></div>
                </div>
                <div className="space-y-2 text-center">
                    <p className="text-[#7D3C98] font-serif text-xl tracking-wide font-medium animate-pulse">
                        {loadingText}
                    </p>
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-[#D4C5A5] to-transparent mx-auto rounded-full"></div>
                </div>
            </div>
         </div>

         {/* Right Side Content */}
         <div className="flex flex-col gap-6 pt-4">
            <div className="h-8 bg-[#FAF8F3] border border-[#F0EAD6] rounded w-3/4 mb-4"></div>
            
            {/* Flashcard Grid Skeleton - Warm Tones */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
               {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-32 bg-[#FAF8F3] border border-[#F0EAD6] rounded-xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite] delay-100"></div>
                  </div>
               ))}
            </div>

            <div className="h-14 bg-[#FAF8F3] border border-[#EFE8D8] rounded-full w-full mt-6"></div>
         </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

function DesignResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [data, setData] = useState<{ imageUrl: string; prompt: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  
  // Edit & Save State
  const [isEditing, setIsEditing] = useState(false);
  const [hotspot, setHotspot] = useState({ x: 0, y: 0 });
  const [editPrompt, setEditPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  // --- API Helpers ---
  const fetchFlashcards = async (promptText: string) => {
    setLoadingCards(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/generate-flashcards`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: promptText })
      });
      const result = await res.json();
      if (result.flashcards) setFlashcards(result.flashcards);
    } catch (err) { console.error(err); } finally { setLoadingCards(false); }
  };

  const handleGenerateEdit = async () => {
    if (!editPrompt.trim()) return;
    setLoading(true); setIsEditing(false);
    fetchFlashcards(editPrompt);
    
    try {
      if (!data) return; 
      const imageRes = await fetch(data.imageUrl);
      const formData = new FormData();
      formData.append('prompt', editPrompt);
      const blob = await imageRes.blob();
      formData.append('image', new File([blob], "current.png"));
      formData.append('x', hotspot.x.toString()); 
      formData.append('y', hotspot.y.toString());

      const res = await fetch(`${API_BASE_URL}/api/edit-design`, { method: 'POST', body: formData });
      const result = await res.json();

      if (result.imageUrl) {
        const newState = { imageUrl: result.imageUrl, prompt: editPrompt };
        setHistory(prev => [...prev, newState]); setData(newState);
        localStorage.setItem('designResult', JSON.stringify(newState));
        setEditPrompt(""); setHotspot({x:0, y:0});
      }
    } catch (e) { alert("Edit failed"); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return alert("Please log in.");
    setIsSaving(true);
    try {
      await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_sku: `gen-${Date.now()}`, product_name: `Custom: ${data?.prompt.substring(0, 15)}...`, product_image: data?.imageUrl })
      });
      alert("Saved!");
    } catch (e) { alert("Error saving."); } finally { setIsSaving(false); }
  };

  // --- Init Logic ---
  useEffect(() => {
    const init = async () => {
      const urlPrompt = searchParams.get('prompt');
      const pendingStr = localStorage.getItem('pendingDesignRequest');
      
      if (pendingStr) {
        const req = JSON.parse(pendingStr);
        if (req.status === 'pending') {
          const activePrompt = req.prompt;
          
          fetchFlashcards(activePrompt);
          try {
            const formData = new FormData();
            formData.append('prompt', activePrompt);
            let url = `${API_BASE_URL}/api/generate-design`;
            
            if (req.base64Image) {
               const blob = await (await fetch(req.base64Image)).blob();
               formData.append('image', blob);
               if(req.hotspot) { formData.append('x', req.hotspot.x); formData.append('y', req.hotspot.y); }
               url = `${API_BASE_URL}/api/edit-design`;
            }
            const result = await (await fetch(url, { method: 'POST', body: formData })).json();
            if (result.imageUrl) {
              const newState = { imageUrl: result.imageUrl, prompt: activePrompt };
              setHistory([newState]); setData(newState);
              localStorage.removeItem('pendingDesignRequest'); localStorage.setItem('designResult', JSON.stringify(newState));
            }
          } catch (e) { console.error(e); } finally { setLoading(false); }
          return;
        }
      }
      
      // Fallback load
      const stored = localStorage.getItem('designResult');
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed); if(history.length === 0) setHistory([parsed]);
        if (flashcards.length === 0) fetchFlashcards(parsed.prompt);
      }
      setLoading(false);
    };
    init();
  }, []); 

  // --- Handlers ---
  const handleUndo = () => {
    if (history.length <= 1) return;
    const prev = history[history.length - 2];
    setHistory(h => h.slice(0, -1)); setData(prev);
    localStorage.setItem('designResult', JSON.stringify(prev));
    fetchFlashcards(prev.prompt);
  };

  const handleImageClick = (x: number, y: number) => {
    if (!isEditing) return;
    console.log("Hotspot set at:", x, y); // Debug log
    setHotspot({ x, y });
  };

  if (loading) return <RoyalSkeletonLoader />;
  if (!data) return <div className="text-center p-20">No design found.</div>;

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
              <Link href="/design" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 shrink-0"><ArrowLeftIcon className="w-5 h-5" /></Link>
              
              {/* HEADING: Line clamped and responsive */}
              <h1 className="text-lg text-gray-700 font-medium capitalize leading-tight line-clamp-2 max-w-[70vw] md:max-w-[500px]">
                {data.prompt}
              </h1>
          </div>
          {history.length > 1 && !isEditing && <button onClick={handleUndo} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 shrink-0"><Undo2Icon className="w-4 h-4" /> Undo</button>}
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <DesignImagePreview 
            imageUrl={data.imageUrl} 
            isEditing={isEditing} 
            setIsEditing={setIsEditing} 
            hotspot={hotspot} 
            onImageClick={handleImageClick} // Pass the simplified handler
            onSave={handleSave} 
            isSaving={isSaving} 
            // imageRef={imageRef}  <-- REMOVE THIS PROP, it's handled internally now
        />
        
        <div className="flex flex-col justify-center pt-4 min-h-100">
          {isEditing ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <h2 className="text-xl font-bold text-gray-800 mb-6 font-serif">Select parts to edit</h2>
               <div className="bg-[#FAF8F3] p-6 rounded-2xl border border-[#F0E6D2] mb-6 text-sm text-gray-600"><p>1. Click on the image to place the edit point.</p><p>2. Describe your change below.</p></div>
               <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Change the color..." className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 min-h-30 resize-none mb-6" />
               <button onClick={handleGenerateEdit} disabled={hotspot.x === 0 || !editPrompt.trim()} className="w-full px-8 py-3 bg-[#E5E7EB] hover:bg-[#d1d5db] text-gray-800 rounded-lg font-medium disabled:opacity-50">Generate</button>
            </div>
          ) : (
            <>
              <FlashcardGrid loading={loadingCards} cards={flashcards} />
              <button onClick={() => router.push('/bookings')} className="w-full py-3.5 rounded-full border border-purple-300 text-purple-700 font-bold hover:bg-purple-50 transition flex items-center justify-center gap-3 shadow-sm mt-6">
                <img src="/assets/google-meet-icon.png" alt="Meet" className="w-6 h-6" /> Discuss Design
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DesignResultPage() {
  return (
    <Suspense fallback={<RoyalSkeletonLoader />}>
        <DesignResultContent />
    </Suspense>
  );
}