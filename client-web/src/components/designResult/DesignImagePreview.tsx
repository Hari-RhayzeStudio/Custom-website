"use client";
import { PencilIcon, DownloadIcon, HeartIcon, LoaderIcon, XIcon } from '@/components/Icons';

interface Props {
  imageUrl: string;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  hotspot: { x: number; y: number };
  onImageClick: (e: React.MouseEvent<HTMLImageElement>) => void;
  onSave: () => void;
  isSaving: boolean;
  // FIXED: RefObject type now accepts HTMLImageElement | null
  imageRef: React.RefObject<HTMLImageElement | null>;
}

export default function DesignImagePreview({ 
  imageUrl, 
  isEditing, 
  setIsEditing, 
  hotspot, 
  onImageClick, 
  onSave, 
  isSaving, 
  imageRef 
}: Props) {
  return (
    <div className="flex flex-col items-center">
        <div className={`w-full max-w-125 aspect-square bg-[#FAF9F6] rounded-3xl flex items-center justify-center relative mb-6 transition-all ${isEditing ? 'border-2 border-purple-200 cursor-crosshair' : ''}`}>
           <div className="relative w-full h-full p-8 flex items-center justify-center">
               <img 
                 ref={imageRef} 
                 src={imageUrl} 
                 onClick={onImageClick} 
                 className="max-w-full max-h-full object-contain drop-shadow-2xl" 
                 alt="Design" 
               />
               
               {isEditing && hotspot.x > 0 && (
                 <div className="absolute w-5 h-5 bg-purple-600 rounded-full border-2 border-white shadow-lg pointer-events-none animate-bounce"
                      style={{ 
                        left: `${(hotspot.x / (imageRef.current?.naturalWidth||1))*(imageRef.current?.width||1)}px`, 
                        top: `${(hotspot.y / (imageRef.current?.naturalHeight||1))*(imageRef.current?.height||1)}px`, 
                        transform: 'translate(-50%, -50%)', 
                        marginTop: '32px', 
                        marginLeft: '32px' 
                      }} />
               )}

               {isEditing && (
                 <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:text-red-500">
                   <XIcon className="w-5 h-5"/>
                 </button>
               )}
           </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-3 w-full max-w-125 justify-end">
              <button onClick={() => setIsEditing(true)} className="p-3 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-full transition relative group">
                <PencilIcon className="w-5 h-5" />
              </button>
              
              <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-700 hover:text-red-500 px-6 py-2.5 rounded-lg font-medium transition text-sm disabled:opacity-50">
                 {/* Ensure LoaderIcon is imported correctly from your Icons file */}
                 {isSaving ? <LoaderIcon className="w-4 h-4 animate-spin"/> : <HeartIcon className="w-4 h-4" />} Save
              </button>
              
              <a href={imageUrl} download="rhayze-design.png" className="flex items-center gap-2 bg-[#EAE4D8] hover:bg-[#dcd5c7] text-gray-800 px-6 py-2.5 rounded-lg font-medium transition text-sm">
                <DownloadIcon className="w-4 h-4" /> Download
              </a>
          </div>
        )}
    </div>
  );
}