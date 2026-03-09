"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function ConsultationsTab({ userId, userEmail }: { userId: string, userEmail: string }) {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/bookings/user/${userId}`)
      .then(res => setBookings(res.data))
      .catch(console.error);
  }, [userId]);

  // Separate bookings
  const now = new Date();
  const recentBookings = bookings.filter(b => new Date(b.consultation_date) >= now);
  const pastBookings = bookings.filter(b => new Date(b.consultation_date) < now);

  return (
    <div className="w-full max-w-4xl">
      
      {/* EXPERT CARD */}
      <div className="bg-[#FCF9F2] p-5 md:p-6 rounded-lg border border-[#F0EAD6] mb-10 md:mb-12">
        <div className="flex items-center gap-4 mb-4">
            {/* Placeholder for Expert Image */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
                <img src="/assets/expert-avatar.webp" alt="Expert" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display='none'}/>
            </div>
            <div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base">Mr. Kamraann Rajjani</h3>
                <p className="text-xs text-gray-500">12+ years in Jewellery design</p>
            </div>
        </div>
        <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-6 text-justify">
            With 12 years of experience in jewellery design, I bring a deep understanding of craftsmanship, aesthetics, and modern design trends. I specialise in transforming client ideas into custom concepts that blend creativity with technical precision. From concept sketches to detailed design planning, I ensure every piece reflects personal style, emotional value, and long-lasting quality.
        </p>
        
        <button 
            onClick={() => router.push('/bookings')}
            className="w-full py-3 bg-[#8C38A3] text-white text-sm font-bold rounded-full hover:bg-[#722E85] transition flex justify-center items-center gap-2 shadow-sm"
        >
            <img src="/assets/google-meet-icon.png" alt="Meet" className="w-4 h-4" onError={(e) => e.currentTarget.style.display='none'} />
            Book Consultation
        </button>
      </div>

      {/* RECENT TABLE */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
            <h3 className="text-base md:text-lg font-medium text-gray-800">Recent</h3>
            <div className="h-px bg-gray-200 flex-1"></div>
        </div>
        
        {recentBookings.length === 0 ? (
            <div className="text-sm text-gray-500 pb-4">No recent consultations found.</div>
        ) : (
            <div className="flex flex-col gap-6">
                {recentBookings.map((b, i) => (
                    // ✅ RESPONSIVE LAYOUT: Stacks vertically on mobile, side-by-side on md+ screens
                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between text-sm border-b border-gray-100 pb-5 gap-4 md:gap-0">
                        
                        <div className="w-full md:w-1/3">
                            <p className="font-bold text-gray-700 mb-1">Email</p>
                            <p className="text-gray-500 wrap-break-word">{userEmail}</p>
                        </div>
                        
                        <div className="w-full md:w-1/3">
                            <p className="font-bold text-gray-700 mb-1">Consultation date</p>
                            <p className="text-gray-500 flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {new Date(b.consultation_date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                            </p>
                        </div>
                        
                        <div className="w-full md:w-1/3 md:text-right flex flex-col md:items-end">
                            <p className="font-bold text-gray-700 mb-2 md:mb-1">Product selected</p>
                            {b.product_images && b.product_images.length > 0 ? (
                                <div className="flex md:justify-end gap-2 flex-wrap">
                                  {b.product_images.map((imgUrl: string, imgIndex: number) => (
                                    <div key={imgIndex} className="w-10 h-10 md:w-8 md:h-8 rounded-md border border-gray-100 flex items-center justify-center bg-gray-50 shrink-0">
                                      <img src={imgUrl} alt="Product" className="w-[80%] h-[80%] object-contain mix-blend-multiply" />
                                    </div>
                                  ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">NA</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* PAST TABLE */}
      <div>
        <div className="flex items-center gap-4 mb-6">
            <h3 className="text-base md:text-lg font-medium text-gray-800">Past</h3>
            <div className="h-px bg-gray-200 flex-1"></div>
        </div>
        
        {pastBookings.length === 0 ? (
            <div className="text-sm text-gray-500">No past consultations found.</div>
        ) : (
            <div className="flex flex-col gap-6">
                {pastBookings.map((b, i) => (
                    // ✅ RESPONSIVE LAYOUT
                    <div key={i} className="flex flex-col md:flex-row md:items-center justify-between text-sm border-b border-gray-100 pb-5 gap-4 md:gap-0">
                        
                        <div className="w-full md:w-1/3">
                            <p className="font-bold text-gray-700 mb-1">Email</p>
                            <p className="text-gray-500 wrap-break-word">{userEmail}</p>
                        </div>
                        
                        <div className="w-full md:w-1/3">
                            <p className="font-bold text-gray-700 mb-1">Date</p>
                            <p className="text-gray-500 flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {new Date(b.consultation_date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                            </p>
                        </div>
                        
                        <div className="w-full md:w-1/3 md:text-right flex flex-col md:items-end">
                            <p className="font-bold text-gray-700 mb-2 md:mb-1">Product selected</p>
                            {b.product_images && b.product_images.length > 0 ? (
                                <div className="flex md:justify-end gap-2 flex-wrap">
                                  {b.product_images.map((imgUrl: string, imgIndex: number) => (
                                    <div key={imgIndex} className="w-10 h-10 md:w-8 md:h-8 rounded-md border border-gray-100 flex items-center justify-center bg-gray-50 shrink-0">
                                      <img src={imgUrl} alt="Product" className="w-[80%] h-[80%] object-contain mix-blend-multiply" />
                                    </div>
                                  ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">NA</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
}