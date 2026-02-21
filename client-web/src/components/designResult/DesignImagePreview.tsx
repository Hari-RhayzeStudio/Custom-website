"use client";
import { useRef } from 'react';
import { PencilIcon, DownloadIcon, HeartIcon, LoaderIcon, XIcon } from '@/components/Icons';

interface Props {
  imageUrl: string;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  hotspot: { x: number; y: number };
  onImageClick: (x: number, y: number) => void; // CHANGED: Now accepts raw X/Y
  onSave: () => void;
  isSaving: boolean;
  // We handle the ref internally now for calculations, but can accept one if needed
  imageRef?: React.RefObject<HTMLImageElement | null>;
}

export default function DesignImagePreview({ 
  imageUrl, 
  isEditing, 
  setIsEditing, 
  hotspot, 
  onImageClick, 
  onSave, 
  isSaving,
}: Props) {
  const localImageRef = useRef<HTMLImageElement>(null);

  // ✅ ROBUST CLICK HANDLER for object-fit: contain
  const handlePreviewClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isEditing || !localImageRef.current) return;
    
    const img = localImageRef.current;
    const rect = img.getBoundingClientRect();
    
    // 1. Calculate the actual displayed dimensions of the image
    const imageRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = rect.width / rect.height;
    
    let displayWidth = rect.width;
    let displayHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (containerRatio > imageRatio) {
      // Container is wider than image -> Pillarbox (bars on sides)
      displayWidth = rect.height * imageRatio;
      offsetX = (rect.width - displayWidth) / 2;
    } else {
      // Container is taller than image -> Letterbox (bars on top/bottom)
      displayHeight = rect.width / imageRatio;
      offsetY = (rect.height - displayHeight) / 2;
    }

    // 2. Calculate click position relative to the VISUAL image
    // e.clientX is viewport coordinates. rect.left is viewport coordinates.
    // We subtract rect.left (container start) AND offsetX (empty space).
    const clickX = e.clientX - rect.left - offsetX;
    const clickY = e.clientY - rect.top - offsetY;

    // 3. Normalize to Natural Dimensions (0 to naturalWidth)
    // Clamp values to ensure we don't click outside the image (in the whitespace)
    const finalX = Math.max(0, Math.min(displayWidth, clickX)) * (img.naturalWidth / displayWidth);
    const finalY = Math.max(0, Math.min(displayHeight, clickY)) * (img.naturalHeight / displayHeight);

    // 4. Send the calculated Natural Coordinates back to parent
    onImageClick(Math.round(finalX), Math.round(finalY));
  };

  return (
    <div className="flex flex-col items-center">
        {/* Container */}
        <div className={`w-full max-w-[500px] aspect-square bg-[#FAF9F6] rounded-3xl flex items-center justify-center mb-6 transition-all border border-transparent p-8 ${isEditing ? '!border-purple-200 cursor-crosshair' : ''}`}>
           
           <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
               <img 
                 ref={localImageRef} 
                 src={imageUrl} 
                 onClick={handlePreviewClick} 
                 className="w-full h-full object-contain drop-shadow-2xl select-none" 
                 alt="Design" 
                 draggable={false}
               />
               
               {isEditing && hotspot.x > 0 && localImageRef.current && (
                 <div 
                    className="absolute w-5 h-5 bg-purple-600 rounded-full border-[3px] border-white shadow-lg pointer-events-none animate-pulse z-10"
                    style={{ 
                        // We must apply the same logic in reverse to position the dot
                        // But since we are placing it inside a container that matches the IMG tag size,
                        // we can use percentages if we are careful, OR we can rely on the same offset logic.
                        
                        // SIMPLER APPROACH FOR DOT: 
                        // Use percentages of the natural image size.
                        // BUT, object-contain makes this hard because '50%' of the div isn't '50%' of the image.
                        
                        // HACK: Use the same aspect ratio logic for placement?
                        // Actually, CSS 'left/top' percentages on an absolute div refer to the CONTAINER padding box.
                        // So we need to calculate the position relative to the container again.
                        
                        left: (() => {
                            const img = localImageRef.current;
                            if(!img) return '50%';
                            const rect = img.getBoundingClientRect();
                            const imageRatio = img.naturalWidth / img.naturalHeight;
                            const containerRatio = rect.width / rect.height;
                            
                            let displayWidth = rect.width;
                            let offsetX = 0;
                            
                            if (containerRatio > imageRatio) {
                                displayWidth = rect.height * imageRatio;
                                offsetX = (rect.width - displayWidth) / 2;
                            }
                            // (hotspot / natural) * display + offset
                            return `${(hotspot.x / img.naturalWidth) * displayWidth + offsetX}px`;
                        })(),
                        
                        top: (() => {
                             const img = localImageRef.current;
                             if(!img) return '50%';
                             const rect = img.getBoundingClientRect();
                             const imageRatio = img.naturalWidth / img.naturalHeight;
                             const containerRatio = rect.width / rect.height;
                             
                             let displayHeight = rect.height;
                             let offsetY = 0;
                             
                             if (containerRatio <= imageRatio) {
                                 displayHeight = rect.width / imageRatio;
                                 offsetY = (rect.height - displayHeight) / 2;
                             }
                             return `${(hotspot.y / img.naturalHeight) * displayHeight + offsetY}px`;
                        })(),

                        transform: 'translate(-50%, -50%)',
                    }} 
                 />
               )}

               {isEditing && (
                 <button 
                   onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} 
                   className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:text-red-500 hover:bg-white transition z-20"
                 >
                   <XIcon className="w-4 h-4"/>
                 </button>
               )}
           </div>
        </div>

        {/* Toolbar */}
        {!isEditing && (
          <div className="flex items-center gap-3 w-full max-w-[500px] justify-end">
              <button onClick={() => setIsEditing(true)} className="p-3 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-full transition relative group">
                <PencilIcon className="w-5 h-5" />
              </button>
              <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-700 hover:text-red-500 px-6 py-2.5 rounded-lg font-medium transition text-sm disabled:opacity-50">
                 {isSaving ? <LoaderIcon className="w-4 h-4 animate-spin"/> : <HeartIcon className="w-4 h-4" />} Save
              </button>
              <a href={imageUrl} download="rhayze-design.png" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#EAE4D8] hover:bg-[#dcd5c7] text-gray-800 px-6 py-2.5 rounded-lg font-medium transition text-sm">
                <DownloadIcon className="w-4 h-4" /> Download
              </a>
          </div>
        )}
    </div>
  );
}