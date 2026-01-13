"use client";

import { useEffect, useState, useRef, Suspense } from 'react'; // 1. Import Suspense
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Pencil, X, AlertTriangle, Sparkles, Undo2, Heart, Loader2 } from 'lucide-react';
import DesignGenerationLoader from '@/components/designPage/DesignGenerationLoader';

// Type Definitions
type DesignState = {
  imageUrl: string;
  prompt: string;
};

type Flashcard = {
  term: string;
  definition: string;
};

// 2. RENAME your main logic component (e.g., DesignResultContent)
// Remove "export default" from here
function DesignResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // This is safe now because it's inside Suspense
  
  // -- STATE --
  const [data, setData] = useState<DesignState | null>(null);
  const [history, setHistory] = useState<DesignState[]>([]); 
  const [loading, setLoading] = useState(true); 
  
  // Flashcard State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  
  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [hotspot, setHotspot] = useState({ x: 0, y: 0 });
  const [editPrompt, setEditPrompt] = useState("");
  
  // Saving
  const [isSaving, setIsSaving] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  // --- HELPER: FETCH FLASHCARDS ---
  const fetchFlashcards = async (promptText: string) => {
    setLoadingCards(true);
    try {
      const res = await fetch('http://localhost:3001/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });
      const result = await res.json();
      if (result.flashcards) {
        setFlashcards(result.flashcards);
      }
    } catch (err) {
      console.error("Failed to load flashcards", err);
      setFlashcards([
        { term: "Custom Design", definition: "A unique piece created specifically for you based on your prompt." },
        { term: "Consultation", definition: "A discussion with our jewelry experts to refine details before manufacturing." },
        { term: "3D Modeling", definition: "The process of creating a digital representation of the jewelry before casting." },
        { term: "Gemstone Setting", definition: "The art of securely attaching gemstones to the metal framework." }
      ]);
    } finally {
      setLoadingCards(false);
    }
  };

  // --- 1. INITIALIZATION & FETCHING LOGIC ---
  useEffect(() => {
    const init = async () => {
      const pendingReqString = localStorage.getItem('pendingDesignRequest');
      
      if (pendingReqString) {
        const req = JSON.parse(pendingReqString);
        
        if (req.status === 'pending') {
          setLoading(true); 
          fetchFlashcards(req.prompt);

          try {
            const formData = new FormData();
            formData.append('prompt', req.prompt);
            
            let endpoint = 'http://localhost:3001/api/generate-design';

            if (req.base64Image) {
               const res = await fetch(req.base64Image);
               const blob = await res.blob();
               formData.append('image', blob);
               if(req.hotspot) {
                 formData.append('x', req.hotspot.x);
                 formData.append('y', req.hotspot.y);
               }
               endpoint = 'http://localhost:3001/api/edit-design';
            }

            const response = await fetch(endpoint, { method: 'POST', body: formData });
            const result = await response.json();
            
            if (result.imageUrl) {
              const newState = { imageUrl: result.imageUrl, prompt: req.prompt };
              setHistory([newState]);
              setData(newState);
              localStorage.removeItem('pendingDesignRequest');
              localStorage.setItem('designResult', JSON.stringify(newState));
            }
          } catch (e) {
            console.error(e);
          } finally {
            setLoading(false); 
          }
          return; 
        }
      }

      const storedResult = localStorage.getItem('designResult');
      if (storedResult) {
        const parsed = JSON.parse(storedResult);
        setData(parsed);
        if(history.length === 0) setHistory([parsed]);
        setLoading(false);
        if (flashcards.length === 0) fetchFlashcards(parsed.prompt);
      } else {
        setLoading(false);
        setLoadingCards(false);
      }
    };

    init();
  }, []);

  // --- HANDLERS ---
  const handleBack = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); 
    const previousState = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    setData(previousState);
    localStorage.setItem('designResult', JSON.stringify(previousState));
    const cleanPrompt = previousState.prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    router.replace(`/design/result?prompt=${cleanPrompt}`);
    fetchFlashcards(previousState.prompt);
  };

  const handleGenerateEdit = async () => {
    if (!editPrompt.trim()) return;

    setLoading(true); 
    setIsEditing(false); 
    fetchFlashcards(editPrompt);

    const cleanPrompt = editPrompt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    router.push(`/design/result?prompt=${cleanPrompt}`);

    try {
      const imageRes = await fetch(data!.imageUrl);
      const imageBlob = await imageRes.blob();
      const file = new File([imageBlob], "current.png", { type: "image/png" });

      const formData = new FormData();
      formData.append('prompt', editPrompt);
      formData.append('image', file);
      formData.append('x', hotspot.x.toString());
      formData.append('y', hotspot.y.toString());

      const response = await fetch('http://localhost:3001/api/edit-design', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.imageUrl) {
        const newState = { imageUrl: result.imageUrl, prompt: editPrompt };
        setHistory(prev => [...prev, newState]);
        setData(newState);
        localStorage.setItem('designResult', JSON.stringify(newState));
        setEditPrompt("");
        setHotspot({x:0, y:0});
      }
    } catch (e) {
      alert("Edit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isEditing || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    setHotspot({
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY)
    });
  };

  const handleSaveToAccount = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert("Please log in to save designs to your account.");
      return;
    }
    if (!data) return;

    setIsSaving(true);
    try {
      const generatedSku = `gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const res = await fetch('http://localhost:3001/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          product_sku: generatedSku,
          product_name: `Custom: ${data.prompt.substring(0, 20)}...`,
          product_image: data.imageUrl
        })
      });

      if (res.ok) alert("Design saved successfully!");
      else alert("Failed to save design.");
    } catch (error) {
      alert("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCardClick = (index: number) => {
    if (flippedIndices.includes(index)) {
        setFlippedIndices(prev => prev.filter(i => i !== index));
    } else {
        setFlippedIndices(prev => [...prev, index]);
    }
  };

  // --- RENDER ---
  if (loading) return <DesignGenerationLoader />;
  if (!data) return <div className="text-center p-20">No design found.</div>;

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
              <Link href="/design" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
                 <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-lg text-gray-700 font-medium truncate max-w-500px capitalize">
                {data.prompt}
              </h1>
          </div>
          
          {history.length > 1 && !isEditing && (
            <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-purple-700 transition">
              <Undo2 className="w-4 h-4" /> Undo Last Edit
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* LEFT: IMAGE */}
        <div className="flex flex-col items-center">
            <div className={`w-full max-w-500px aspect-square bg-[#FAF9F6] rounded-3xl flex items-center justify-center relative mb-6 transition-all ${isEditing ? 'border-2 border-purple-200 cursor-crosshair' : ''}`}>
               <div className="relative w-full h-full p-8 flex items-center justify-center">
                   <img ref={imageRef} src={data.imageUrl} alt={data.prompt} onClick={handleImageClick} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                   
                   {isEditing && hotspot.x > 0 && (
                     <div className="absolute w-5 h-5 bg-purple-600 rounded-full border-2 border-white shadow-lg pointer-events-none animate-bounce"
                          style={{ left: `${(hotspot.x / (imageRef.current?.naturalWidth||1))*(imageRef.current?.width||1)}px`, top: `${(hotspot.y / (imageRef.current?.naturalHeight||1))*(imageRef.current?.height||1)}px`, transform: 'translate(-50%, -50%)', marginTop: '32px', marginLeft: '32px' }} />
                   )}

                   {isEditing && (
                     <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:text-red-500"><X className="w-5 h-5"/></button>
                   )}
               </div>
            </div>

            {!isEditing && (
              <div className="flex items-center gap-3 w-full max-w-500px justify-end">
                  <button onClick={() => setIsEditing(true)} className="p-3 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-full transition relative group">
                    <Pencil className="w-5 h-5" />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Edit</span>
                  </button>
                  <button onClick={handleSaveToAccount} disabled={isSaving} className="flex items-center gap-2 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-700 hover:text-red-500 px-6 py-2.5 rounded-lg font-medium transition text-sm disabled:opacity-50">
                     {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Heart className="w-4 h-4" />} Save
                  </button>
                  <a href={data.imageUrl} download="rhayze-design.png" className="flex items-center gap-2 bg-[#EAE4D8] hover:bg-[#dcd5c7] text-gray-800 px-6 py-2.5 rounded-lg font-medium transition text-sm">
                     <Download className="w-4 h-4" /> Download
                  </a>
              </div>
            )}
        </div>

        {/* RIGHT: CONTENT */}
        <div className="flex flex-col justify-center pt-4 min-h-400px">
          {isEditing ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <h2 className="text-xl font-bold text-gray-800 mb-6 font-serif">Select parts of the image to edit</h2>
               <div className="bg-[#FAF8F3] p-6 rounded-2xl border border-[#F0E6D2] mb-6 text-sm text-gray-600">
                   <p>1. Click on the image to place the edit point.</p>
                   <p>2. Describe your change below.</p>
               </div>
               <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Change the color..." className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 min-h-120px resize-none mb-6" />
               <button onClick={handleGenerateEdit} disabled={hotspot.x === 0 || !editPrompt.trim()} className="w-full px-8 py-3 bg-[#E5E7EB] hover:bg-[#d1d5db] text-gray-800 rounded-lg font-medium disabled:opacity-50">Generate</button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="bg-[#F5F5F5] rounded-lg p-4 mb-8 flex gap-3 items-start">
                 <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                 <div><p className="font-bold text-gray-700 text-sm">Disclaimer:</p><p className="text-gray-500 text-xs">We are not saving this design.</p></div>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-6">Flashcard Guide</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {loadingCards ? (
                     [1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>)
                  ) : (
                     flashcards.map((card, index) => {
                        const isFlipped = flippedIndices.includes(index);
                        return (
                            <div 
                                key={index} 
                                className="group h-40 w-full perspective-[1000px] cursor-pointer"
                                onClick={() => handleCardClick(index)}
                            >
                                <div className={`relative h-full w-full transition-all duration-500 transform-3d ${isFlipped ? 'transform-[rotateY(180deg)]' : ''}`}>
                                    <div className="absolute inset-0 h-full w-full rounded-xl bg-[#F3EFE0] border border-transparent hover:border-[#7D3C98] flex items-center justify-center text-center p-4 backface-hidden">
                                        <span className="text-gray-700 text-sm font-bold font-serif">{card.term}</span>
                                    </div>
                                    <div className="absolute inset-0 h-full w-full rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-center p-4 transform-[rotateY(180deg)] backface-hidden overflow-y-auto no-scrollbar">
                                        <p className="text-purple-900 text-xs leading-relaxed font-medium">{card.definition}</p>
                                    </div>
                                </div>
                            </div>
                        );
                     })
                  )}
              </div>

              <button onClick={() => router.push('/bookings')} className="w-full py-3.5 rounded-full border border-purple-300 text-purple-700 font-bold hover:bg-purple-50 transition flex items-center justify-center gap-3 shadow-sm hover:shadow-md mt-6">
                <img src="/assets/google-meet-icon.png" alt="Meet" className="w-6 h-6" onError={(e) => e.currentTarget.style.display = 'none'} /> Discuss Design
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 3. NEW EXPORT DEFAULT (The actual Page component)
export default function DesignResultPage() {
  return (
    // Wrap the content in Suspense. fallback can be your loading spinner.
    <Suspense fallback={<DesignGenerationLoader />}>
      <DesignResultContent />
    </Suspense>
  );
}