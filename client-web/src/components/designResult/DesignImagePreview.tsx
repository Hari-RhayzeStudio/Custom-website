"use client";
import { useRef } from 'react';
import { PencilIcon, DownloadIcon, HeartIcon, LoaderIcon, XIcon } from '@/components/Icons';

interface Props {
  imageUrl: string;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  hotspot: { x: number; y: number };
  onImageClick: (x: number, y: number) => void;
  onSave: () => void;
  isSaving: boolean;
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

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    const date = new Date().toISOString().split('T')[0];
    const fileName = `rhayze-studio-${date}.png`;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(imageUrl, '_blank');
    }
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isEditing || !localImageRef.current) return;
    
    const img = localImageRef.current;
    const rect = img.getBoundingClientRect();
    
    const imageRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = rect.width / rect.height;
    
    let displayWidth = rect.width;
    let displayHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;

    if (containerRatio > imageRatio) {
      displayWidth = rect.height * imageRatio;
      offsetX = (rect.width - displayWidth) / 2;
    } else {
      displayHeight = rect.width / imageRatio;
      offsetY = (rect.height - displayHeight) / 2;
    }

    const clickX = e.clientX - rect.left - offsetX;
    const clickY = e.clientY - rect.top - offsetY;

    const finalX = Math.max(0, Math.min(displayWidth, clickX)) * (img.naturalWidth / displayWidth);
    const finalY = Math.max(0, Math.min(displayHeight, clickY)) * (img.naturalHeight / displayHeight);

    onImageClick(Math.round(finalX), Math.round(finalY));
  };

  return (
    <div className="flex flex-col items-center">
        {/* ✅ FIX: Removed p-8 and aspect-square so the box perfectly hugs the image size */}
        <div className={`w-full max-w-125 bg-[#FAF9F6] rounded-3xl overflow-hidden flex items-center justify-center mb-6 transition-all border border-transparent ${isEditing ? 'border-purple-200! cursor-crosshair' : ''}`}>
            
           <div className="relative w-full h-auto flex items-center justify-center overflow-hidden">
               <img 
                 ref={localImageRef} 
                 src={imageUrl} 
                 onClick={handlePreviewClick} 
                 // ✅ FIX: Changed to h-auto with a max-height to let rectangles breathe without excessive letterboxing
                 className="w-full h-auto max-h-[600px] object-contain drop-shadow-2xl select-none" 
                 alt="Design" 
                 draggable={false}
               />
               
               {isEditing && hotspot.x > 0 && localImageRef.current && (
                 <div 
                    className="absolute w-5 h-5 bg-purple-600 rounded-full border-[3px] border-white shadow-lg pointer-events-none animate-pulse z-10"
                    style={{ 
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
                   className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-sm hover:text-red-500 hover:bg-white transition z-20"
                 >
                   <XIcon className="w-4 h-4"/>
                 </button>
               )}
           </div>
        </div>

        {/* Toolbar */}
        {!isEditing && (
          <div className="flex items-center gap-3 w-full max-w-125 justify-end">
              <button onClick={() => setIsEditing(true)} className="p-3 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-full transition relative group">
                <PencilIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDownload} 
                className="flex items-center gap-2 bg-[#EAE4D8] hover:bg-[#dcd5c7] text-gray-800 px-6 py-2.5 rounded-lg font-medium transition text-sm cursor-pointer"
              >
                <DownloadIcon className="w-4 h-4" /> Download
              </button>
          </div>
        )}
    </div>
  );
}