import React from 'react';

export default function ExpertHeader() {
  return (
    <div className="bg-[#F9F5E8] p-8 flex items-center gap-6">
      <img 
        src="/assets/expert-avatar.webp" 
        alt="Expert" 
        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
      />
      <div>
        <h2 className="text-xl font-bold text-gray-900">Mr. Kamraann Rajjani</h2>
        <p className="text-sm text-gray-500">12+ years in Jewellery design</p>
      </div>
    </div>
  );
}