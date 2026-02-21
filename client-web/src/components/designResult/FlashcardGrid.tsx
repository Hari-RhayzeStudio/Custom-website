// src/components/designResult/FlashcardGrid.tsx
import { useState } from 'react';
import { AlertTriangleIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';

export default function FlashcardGrid({ loading, cards }: { loading: boolean; cards: any[] }) {
  const [flipped, setFlipped] = useState<number[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const INITIAL_DISPLAY_COUNT = 6;

  const toggleFlip = (index: number) => {
    setFlipped(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const visibleCards = isExpanded ? cards : cards.slice(0, INITIAL_DISPLAY_COUNT);
  const hiddenCount = cards.length - INITIAL_DISPLAY_COUNT;

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
      
      {/* Disclaimer */}
      <div className="bg-[#F5F5F5] rounded-lg p-4 mb-8 flex gap-3 items-start">
         <AlertTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
         <div>
            <p className="font-bold text-gray-700 text-sm">Disclaimer:</p>
            <p className="text-gray-500 text-xs">We are not saving this design.</p>
         </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-6">Flashcard Guide</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
          {loading ? (
             [1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>)
          ) : (
             visibleCards.map((card, index) => (
                <div 
                    key={index} 
                    className="group h-40 w-full perspective-[1000px] cursor-pointer" 
                    onClick={() => toggleFlip(index)}
                >
                    <div className={`relative h-full w-full transition-all duration-500 transform-3d ${flipped.includes(index) ? 'transform-[rotateY(180deg)]' : ''}`}>
                        
                        {/* Front Side */}
                        <div className="absolute inset-0 h-full w-full rounded-xl bg-[#F3EFE0] border border-transparent hover:border-[#7D3C98] flex items-center justify-center text-center p-4 backface-hidden shadow-sm">
                            <span className="text-gray-800 text-sm font-bold font-serif leading-tight">{card.term}</span>
                        </div>

                        {/* Back Side - FIXED ALIGNMENT */}
                        {/* - Added 'items-center' to center vertically
                           - Removed 'pt-6' and used 'p-4' for even padding
                           - Added 'leading-snug' for better line height 
                        */}
                        <div className="absolute inset-0 h-full w-full rounded-xl bg-purple-50 border border-purple-200 flex flex-col items-center justify-center text-center p-4 transform-[rotateY(180deg)] backface-hidden overflow-hidden">
                            <div className="w-full max-h-full overflow-y-auto no-scrollbar flex items-center justify-center">
                                <p className="text-purple-900 text-xs font-medium leading-snug break-words px-1">
                                  {card.definition}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
             ))
          )}
      </div>

      {!loading && cards.length > INITIAL_DISPLAY_COUNT && (
        <div className="flex justify-end">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-bold text-[#7D3C98] hover:text-purple-800 hover:bg-purple-50 px-3 py-1.5 rounded-full transition-colors"
          >
            {isExpanded ? (
              <>Show Less <ChevronUpIcon className="w-3 h-3" /></>
            ) : (
              <>+{hiddenCount} More <ChevronDownIcon className="w-3 h-3" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}