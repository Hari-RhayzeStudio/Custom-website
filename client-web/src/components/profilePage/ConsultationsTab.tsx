"use client";

import { useState } from 'react';
import axios from 'axios';
import useSWR from 'swr'; // ✅ Import SWR
import { CalendarIcon, MeetIcon } from '@/components/Icons';

interface Booking {
  id: string;
  expert_name: string;
  consultation_date: string;
  slot: string;
  status: string;
  product_images: string[];
}

// ✅ Define fetcher outside component
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export default function ConsultationsTab({ userId }: { userId: string }) {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  // ✅ SWR Hook: Caches data instantly. 
  // - If you leave this tab and come back, it loads INSTANTLY from cache.
  // - Then it checks the server quietly in the background for updates.
  const { data: bookings = [], isLoading } = useSWR<Booking[]>(
    userId ? `http://localhost:3001/api/bookings/user/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch just by clicking window
      dedupingInterval: 60000,  // Cache for 1 minute (Instant load on tab switch)
    }
  );

  // Logic to separate Upcoming vs Past
  const now = new Date();
  now.setHours(0, 0, 0, 0); 

  const upcomingBookings = bookings.filter(b => new Date(b.consultation_date) >= now);
  const pastBookings = bookings.filter(b => new Date(b.consultation_date) < now);

  const displayedBookings = filter === 'upcoming' ? upcomingBookings : pastBookings;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // ✅ Skeleton Loader (Better UX than text)
  if (isLoading) return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 min-h-100">
      <div className="h-8 w-48 bg-gray-100 rounded mb-8 animate-pulse"></div>
      <div className="space-y-4">
        {[1, 2].map(i => (
           <div key={i} className="h-40 bg-gray-50 rounded-2xl animate-pulse border border-gray-100"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-125 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header & Tabs */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold font-serif text-gray-800">My Consultations</h2>
        
        <div className="flex bg-gray-50 p-1 rounded-xl">
          <button 
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'upcoming' ? 'bg-white text-[#7D3C98] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Upcoming
          </button>
          <button 
            onClick={() => setFilter('past')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${filter === 'past' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Past History
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {displayedBookings.length === 0 ? (
          <div className="text-center py-20">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
               <CalendarIcon className="w-8 h-8" />
             </div>
             <p className="text-gray-500 font-medium">No {filter} consultations found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {displayedBookings.map((booking) => (
              <div key={booking.id} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-gray-100 hover:border-purple-100 hover:shadow-md transition-all group bg-white">
                
                {/* Date & Time Badge */}
                <div className="flex flex-col items-center justify-center bg-[#F9F5E8] rounded-xl p-4 min-w-25 text-center border border-[#ebdcb2]">
                   <span className="text-xs font-bold text-gray-400 uppercase">Date</span>
                   <span className="text-lg font-bold text-gray-900 leading-tight mb-1">{formatDate(booking.consultation_date)}</span>
                   <span className="text-xs font-bold text-[#7D3C98] bg-white px-2 py-0.5 rounded-md">{booking.slot}</span>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-center">
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${booking.status === 'confirmed' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{booking.status}</span>
                   </div>
                   <h3 className="text-lg font-bold text-gray-800 mb-1">Consultation with {booking.expert_name}</h3>
                   <p className="text-sm text-gray-500">Discussing Custom Jewelry Design</p>
                   
                   {/* Product Previews */}
                   {booking.product_images && booking.product_images.length > 0 && (
                     <div className="flex items-center gap-2 mt-4">
                        <span className="text-xs text-gray-400 mr-1">Products:</span>
                        <div className="flex -space-x-3">
                          {booking.product_images.slice(0, 4).map((img, idx) => (
                            <div key={idx} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100">
                              <img src={img} alt="Product" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                </div>

                {/* Action Button */}
                <div className="flex items-center">
                  {filter === 'upcoming' ? (
                     <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#7D3C98] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#6a3281] transition shadow-lg shadow-purple-100">
                        <MeetIcon className="w-5 h-5" /> Join Meet
                     </button>
                  ) : (
                     <button className="w-full md:w-auto px-6 py-3 rounded-xl font-bold text-gray-500 bg-gray-50 cursor-not-allowed">
                        Completed
                     </button>
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