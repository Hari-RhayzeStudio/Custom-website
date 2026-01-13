"use client";
import { Loader2 } from 'lucide-react';

interface TrendingProps {
  onSelectPrompt: (prompt: string) => void;
  trendingData: any[]; // New Prop
}

export default function TrendingDesigns({ onSelectPrompt, trendingData }: TrendingProps) {
  // Removed internal useEffect fetch logic. 
  // We now rely purely on the passed prop.

  if (!trendingData || trendingData.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto mt-16 mb-16">
      <div className="flex items-center gap-4 mb-8 justify-center">
        <div className="h-px bg-gray-200 w-20"></div>
        <h2 className="text-2xl font-serif text-gray-800">Try trending designs</h2>
        <div className="h-px bg-gray-200 w-20"></div>
      </div>

      <div className="space-y-6">
        {trendingData.map((item) => (
          <div key={item.sku} className="flex items-center gap-6 group cursor-pointer" onClick={() => onSelectPrompt(item.final_description || item.product_name)}>
            {/* Image */}
            <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              <img 
                src={item.final_image_url} 
                alt={item.product_name} 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                {item.final_description || `A beautiful ${item.product_name} made of platinum with intricate details.`}
              </p>
              
              <button className="bg-[#F9F5E8] text-[#7D3C98] px-8 py-2 rounded-lg text-sm font-bold hover:bg-[#7D3C98] hover:text-white transition-all shadow-sm">
                try now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}