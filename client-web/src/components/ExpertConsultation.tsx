// components/ExpertConsultation.tsx
"use client";
import React, { useState } from 'react';
import BookingModal from './BookingModal'; // Make sure this path is correct

interface ExpertProps {
  name?: string;
  experience?: string;
  description?: string;
  avatarUrl?: string;
}

export default function ExpertConsultation({ 
  name = "Mr. Kamraann Rajjani", 
  experience = "12+ years in Jewellery design", 
  description = "With 12 years of experience in jewellery design, I bring a deep understanding of craftsmanship, aesthetics, and modern design trends. I specialise in transforming client ideas into custom concepts.",
  avatarUrl = "/assets/expert-avatar.webp" 
}: ExpertProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Free 30 min consultation with our expert</h3>
      
      <div className="bg-[#F9F5E8] rounded-2xl p-6 md:p-8 shadow-sm">
        {/* Profile Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img src={avatarUrl} alt={name} className="object-cover w-full h-full"/>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{name}</h4>
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">{experience}</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          {description}
        </p>
        
        {/* Standard Button (Not Movable) - Opens Modal */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-[#7D3C98] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#6a3281] transition shadow-md active:scale-[0.98]"
        >
          <img src="/assets/google-meet-icon.png" alt="Meet" className="w-5 h-5" />
          Book Consultation
        </button>
      </div>

      {/* The Popup Modal */}
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}