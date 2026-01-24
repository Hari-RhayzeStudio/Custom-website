import React from 'react';

export default function Loading() {
  return (
    <main className="min-h-screen bg-white font-sans animate-pulse">
      
      {/* --- SECTION 1: Product Header & Main Grid --- */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-6 h-6 bg-gray-200 rounded-full" /> {/* Back Arrow */}
          <div className="h-10 bg-gray-200 rounded-lg w-1/3" /> {/* Title */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* LEFT: Main Image Skeleton */}
          <div className="flex flex-col gap-6">
            <div className="relative aspect-square bg-gray-100 rounded-3xl border border-gray-200">
               {/* Heart Icon Placehoder */}
               <div className="absolute top-6 right-6 w-12 h-12 bg-gray-200 rounded-full" />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
               <div className="w-12 h-12 bg-gray-100 rounded-full border border-gray-200" /> {/* Share */}
               <div className="w-40 h-12 bg-gray-200 rounded-full" /> {/* Download */}
            </div>
          </div>

          {/* RIGHT: Details Panel Skeleton */}
          <div className="bg-[#F9F5E8]/50 p-10 rounded-[4rem] border border-[#f0ead6]">
             
             {/* Info Rows */}
             <div className="space-y-6 mb-10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                    <div className="h-6 w-24 bg-gray-200 rounded-full" />
                  </div>
                ))}
             </div>
            
            {/* View Selector Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-full aspect-square bg-gray-200 rounded-xl" />
                        <div className="h-3 w-12 bg-gray-200 rounded" />
                    </div>
                ))}
            </div>

            {/* Description Text */}
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>

        </div>
      </section>

      {/* --- SECTION 2: Timeline Skeleton --- */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-6">
           <div className="flex flex-col gap-12">
              {/* Timeline Item 1 */}
              <div className="flex items-center gap-8">
                 <div className="w-1/2 flex justify-end">
                    <div className="w-64 h-40 bg-gray-100 rounded-3xl" />
                 </div>
                 <div className="w-4 h-4 bg-gray-200 rounded-full shrink-0" />
                 <div className="w-1/2"></div>
              </div>
              {/* Timeline Item 2 */}
              <div className="flex items-center gap-8 flex-row-reverse">
                 <div className="w-1/2 flex justify-start">
                    <div className="w-64 h-40 bg-gray-100 rounded-3xl" />
                 </div>
                 <div className="w-4 h-4 bg-gray-200 rounded-full shrink-0" />
                 <div className="w-1/2"></div>
              </div>
           </div>
        </div>
      </section>

      {/* --- SECTION 3: Recommended Products Skeleton --- */}
      <section className="py-16 max-w-7xl mx-auto px-6">
         <div className="h-8 w-64 bg-gray-200 rounded mb-10 mx-auto" />
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
               <div key={i} className="aspect-4/5 bg-gray-100 rounded-2xl" />
            ))}
         </div>
      </section>

    </main>
  );
}