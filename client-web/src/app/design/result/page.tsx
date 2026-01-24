"use client";
import { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Ensure these imports match your actual file structure
import { ArrowLeftIcon, Undo2Icon, LoaderIcon } from '@/components/Icons'; 
import FlashcardGrid from '@/components/designResult/FlashcardGrid';
import DesignImagePreview from '@/components/designResult/DesignImagePreview';

// --- LOCAL LOADER COMPONENT ---
// Replaces the confusing "DesignGenerationLoader" which was actually a full page component
const SimpleLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-white">
    <LoaderIcon className="w-10 h-10 text-purple-600 animate-spin mb-4" />
    <p className="text-gray-500 font-serif animate-pulse">Designing your jewellery...</p>
  </div>
);

function DesignResultContent() {
  const router = useRouter();
  
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

  // Ref is initialized with null, matching the updated interface in DesignImagePreview
  const imageRef = useRef<HTMLImageElement>(null);

  // --- API Helpers ---
  const fetchFlashcards = async (promptText: string) => {
    setLoadingCards(true);
    try {
      const res = await fetch('http://localhost:3001/api/generate-flashcards', {
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
      if (!data) return; // Guard clause
      const imageRes = await fetch(data.imageUrl);
      const formData = new FormData();
      formData.append('prompt', editPrompt);
      // Convert current image URL to blob for re-upload
      const blob = await imageRes.blob();
      formData.append('image', new File([blob], "current.png"));
      formData.append('x', hotspot.x.toString()); 
      formData.append('y', hotspot.y.toString());

      const res = await fetch('http://localhost:3001/api/edit-design', { method: 'POST', body: formData });
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
      await fetch('http://localhost:3001/api/wishlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product_sku: `gen-${Date.now()}`, product_name: `Custom: ${data?.prompt.substring(0, 15)}...`, product_image: data?.imageUrl })
      });
      alert("Saved!");
    } catch (e) { alert("Error saving."); } finally { setIsSaving(false); }
  };

  // --- Init Logic ---
  useEffect(() => {
    const init = async () => {
      const pendingStr = localStorage.getItem('pendingDesignRequest');
      if (pendingStr) {
        const req = JSON.parse(pendingStr);
        if (req.status === 'pending') {
          fetchFlashcards(req.prompt);
          try {
            const formData = new FormData();
            formData.append('prompt', req.prompt);
            let url = 'http://localhost:3001/api/generate-design';
            
            if (req.base64Image) {
               const blob = await (await fetch(req.base64Image)).blob();
               formData.append('image', blob);
               if(req.hotspot) { formData.append('x', req.hotspot.x); formData.append('y', req.hotspot.y); }
               url = 'http://localhost:3001/api/edit-design';
            }
            const result = await (await fetch(url, { method: 'POST', body: formData })).json();
            if (result.imageUrl) {
              const newState = { imageUrl: result.imageUrl, prompt: req.prompt };
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

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isEditing || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    setHotspot({ x: Math.round((e.clientX - rect.left) * scaleX), y: Math.round((e.clientY - rect.top) * scaleY) });
  };

  if (loading) return <SimpleLoader />;
  if (!data) return <div className="text-center p-20">No design found.</div>;

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <Link href="/design" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"><ArrowLeftIcon className="w-5 h-5" /></Link>
              <h1 className="text-lg text-gray-700 font-medium truncate max-w-[500px] capitalize">{data.prompt}</h1>
          </div>
          {history.length > 1 && !isEditing && <button onClick={handleUndo} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200"><Undo2Icon className="w-4 h-4" /> Undo</button>}
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <DesignImagePreview 
            imageUrl={data.imageUrl} 
            isEditing={isEditing} 
            setIsEditing={setIsEditing} 
            hotspot={hotspot} 
            onImageClick={handleImageClick} 
            onSave={handleSave} 
            isSaving={isSaving} 
            imageRef={imageRef} 
        />
        
        <div className="flex flex-col justify-center pt-4 min-h-[400px]">
          {isEditing ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <h2 className="text-xl font-bold text-gray-800 mb-6 font-serif">Select parts to edit</h2>
               <div className="bg-[#FAF8F3] p-6 rounded-2xl border border-[#F0E6D2] mb-6 text-sm text-gray-600"><p>1. Click on the image to place the edit point.</p><p>2. Describe your change below.</p></div>
               <textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Change the color..." className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 min-h-[120px] resize-none mb-6" />
               <button onClick={handleGenerateEdit} disabled={hotspot.x === 0 || !editPrompt.trim()} className="w-full px-8 py-3 bg-[#E5E7EB] hover:bg-[#d1d5db] text-gray-800 rounded-lg font-medium disabled:opacity-50">Generate</button>
            </div>
          ) : (
            <>
              <FlashcardGrid loading={loadingCards} cards={flashcards} />
              <button onClick={() => router.push('/bookings')} className="w-full py-3.5 rounded-full border border-purple-300 text-purple-700 font-bold hover:bg-purple-50 transition flex items-center justify-center gap-3 shadow-sm mt-6">
                {/* Ensure this path is correct for your public folder */}
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
    <Suspense fallback={<SimpleLoader />}>
        <DesignResultContent />
    </Suspense>
  );
}