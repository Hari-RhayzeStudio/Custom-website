"use client";

interface EditPanelProps {
  editPrompt: string;
  setEditPrompt: (val: string) => void;
  onGenerate: () => void;
  hotspotSelected: boolean;
}

export default function EditPanel({ editPrompt, setEditPrompt, onGenerate, hotspotSelected }: EditPanelProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-bold text-gray-800 mb-6 font-serif">Select parts of the image to edit</h2>
      <div className="bg-[#FAF8F3] p-6 rounded-2xl border border-[#F0E6D2] mb-6 text-sm text-gray-600">
        <p>1. Click on the image to place the edit point.</p>
        <p>2. Describe your change below.</p>
      </div>
      <textarea 
        value={editPrompt} 
        onChange={(e) => setEditPrompt(e.target.value)} 
        placeholder="Change the color..." 
        className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 min-h-[120px] resize-none mb-6" 
      />
      <button 
        onClick={onGenerate} 
        disabled={!hotspotSelected || !editPrompt.trim()} 
        className="w-full px-8 py-3 bg-[#E5E7EB] hover:bg-[#d1d5db] text-gray-800 rounded-lg font-medium disabled:opacity-50"
      >
        Generate
      </button>
    </div>
  );
}