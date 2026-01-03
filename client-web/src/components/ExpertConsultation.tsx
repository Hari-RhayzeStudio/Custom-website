// components/ExpertConsultation.tsx
"use client";
import React from 'react';
import Link from 'next/link'; // Import Link

interface ExpertProps {
  name?: string;
  experience?: string;
  description?: string;
  avatarUrl?: string;
}

export default function ExpertConsultation({ 
  name = "Mr. Kamraann Rajjani", 
  experience = "12+ years in Jewellery design", 
  description = "With 12 years of experience in jewellery design, I bring a deep understanding of craftsmanship, aesthetics, and modern design trends. I specialise in transforming client ideas into custom concepts that blend creativity with technical precision. From concept sketches to detailed design planning, I ensure every piece reflects personal style, emotional value, and long-lasting quality.",
  avatarUrl = "/assets/expert-avatar.png" 
}: ExpertProps) {
  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Free 30 min consultation with our expert</h3>
      <div className="bg-[#F9F5E8] rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img 
              src={avatarUrl} 
              alt={name} 
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{name}</h4>
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">{experience}</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          {description}
        </p>
        
        {/* Updated Link to Bookings Page */}
        <Link href="/bookings" className="block w-full">
          <button className="w-full bg-[#7D3C98] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#6a3281] transition shadow-md">
            <img src="/assets/google-meet-icon.png" alt="Meet" className="w-5 h-5" />
            Book Consultation
          </button>
        </Link>
      </div>
    </div>
  );
}