// src/components/TrendingDesigns.tsx
"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

interface TrendingProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function TrendingDesigns({ onSelectPrompt }: TrendingProps) {
  const [trendingItems, setTrendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/products/trending');
        setTrendingItems(res.data);
      } catch (error) {
        console.error("Failed to load trending", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) return <div className="py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#7D3C98]"/></div>;
  if (trendingItems.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto mt-16 mb-16">
      <div className="flex items-center gap-4 mb-8 justify-center">
        <div className="h-1px bg-gray-200 w-20"></div>
        <h2 className="text-2xl font-serif text-gray-800">Try trending prompt</h2>
        <div className="h-1px bg-gray-200 w-20"></div>
      </div>

      <div className="space-y-6">
        {trendingItems.map((item) => (
          <div key={item.sku} className="flex items-center gap-6 group">
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
                {/* Use the description as the prompt text, or fallback to name if desc is missing */}
                {item.final_description || `A beautiful ${item.product_name} made of platinum with intricate details.`}
              </p>
              
              <button 
                onClick={() => onSelectPrompt(item.final_description || `A beautiful ${item.product_name} made of platinum with intricate details.`)}
                className="bg-[#F9F5E8] text-[#7D3C98] px-8 py-2 rounded-lg text-sm font-bold hover:bg-[#7D3C98] hover:text-white transition-all shadow-sm"
              >
                try now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}