"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, PanInfo } from 'framer-motion';

export default function FloatingButton() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    if (!isDragging) {
      router.push('/bookings');
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={true}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info: PanInfo) => {
        setTimeout(() => setIsDragging(false), 100); 
      }}
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      whileDrag={{ cursor: "grabbing", scale: 1.1 }} // Cursor changes to "Closed Hand" when dragging
      className="fixed bottom-8 right-8 z-[100] cursor-pointer" // Default cursor is "Hand" (Clickable)
    >
      <button 
        onClick={handleClick}
        // Removed 'cursor-move' and kept the rest of the premium styling
        className="group relative flex items-center gap-3 bg-[#7D3C98] text-white py-3 px-6 pr-8 rounded-full shadow-[0_20px_50px_rgba(125,60,152,0.3)] transition-all overflow-hidden border border-white/20 backdrop-blur-md"
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Icon Container */}
        <div className="relative flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-inner border border-[#F9F5E8]">
           <img 
             src="/assets/google-meet-icon.png" 
             alt="Meet" 
             className="w-5 h-5 object-contain group-hover:scale-110 transition-transform duration-500" 
           />
        </div>

        {/* Text */}
        <div className="flex flex-col items-start select-none"> {/* select-none prevents text highlighting while dragging */}
          <span className="font-serif text-[10px] text-purple-200 uppercase tracking-[0.2em] leading-tight">
            Exclusive
          </span>
          <span className="font-medium text-sm tracking-wide text-white group-hover:text-[#F9F5E8] transition-colors">
            Book Consultation
          </span>
        </div>

        {/* Premium Glow Effect */}
        <div className="absolute inset-0 rounded-full ring-2 ring-white/0 group-hover:ring-white/20 transition-all duration-700" />
      </button>
    </motion.div>
  );
}