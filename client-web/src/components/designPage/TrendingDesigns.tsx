"use client";
import { LoaderIcon } from '@/components/Icons'; 

interface TrendingProps {
  onSelectPrompt: (prompt: string) => void;
  trendingData: any[]; 
}

export default function TrendingDesigns({ onSelectPrompt, trendingData }: TrendingProps) {
  if (!trendingData || trendingData.length === 0) return null;

  // Limit to 3 items so it aligns perfectly next to the large image
  const displayData = trendingData.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto mt-16 mb-16 w-full px-4">
      
      {/* HEADING CONTAINER */}
      <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12 justify-center overflow-hidden">
        <div className="h-px bg-gray-200 w-10 md:w-20 shrink"></div>
        <h2 className="text-xl md:text-2xl font-serif text-gray-800 whitespace-nowrap">
          Try Trending Designs
        </h2>
        <div className="h-px bg-gray-200 w-10 md:w-20 shrink"></div>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-stretch justify-center">
        
        {/* LEFT SIDE: Big Image */}
        <div className="w-full md:w-1/2 flex items-center justify-center order-1 md:order-1">
           <div className="w-full h-full min-h-[300px] md:min-h-[400px] rounded-[2rem] overflow-hidden bg-[#F6F3E6] relative shadow-sm">
              <img 
                src="/assets/trending-model.png" 
                alt="Trending Jewellery Model" 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/assets/placeholder-jewelry.jpg"; }}
              />
           </div>
        </div>

        {/* RIGHT SIDE: List of Trending Items */}
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6 order-2 md:order-2">
          {displayData.map((item) => {
            
            // ✅ DEBUGGING: This will print the item data to your browser console
            // Check this to ensure `final_description` is actually coming from the backend API
            console.log("Trending Item Data:", item);

            // ✅ DEFINING PROMPT TEXT: Strictly looks for descriptions, falls back to a formatted string.
            const promptText = item.final_description 
                            || item.meta_description 
                            || `Create a highly detailed design of: ${item.product_name}`;
            
            // ✅ VISUAL DISPLAY TEXT: Only shows the Product Name next to the image
            const displayText = item.product_name || "Custom Jewellery Design";

            return (
              <div key={item.sku} className="flex items-center gap-4 md:gap-6 group">
                
                {/* Item Image */}
                <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                  <img 
                    src={item.final_image_url} 
                    alt={item.product_name} 
                    className="w-[85%] h-[85%] object-cover group-hover:scale-110 transition duration-500 mix-blend-multiply"
                  />
                </div>

                {/* Item Content Area */}
                <div className="flex-1 flex flex-col justify-center">
                  
                  {/* VISUAL TEXT */}
                  <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2 leading-relaxed font-medium">
                    {displayText}
                  </p>
                  
                  {/* TRY NOW BUTTON */}
                  <button 
                    onClick={() => onSelectPrompt(promptText)}
                    className="w-full max-w-[198px] h-[46px] flex items-center justify-center bg-[#F9F5E8] text-[#7D3C98] rounded-lg text-sm font-semibold hover:bg-[#7D3C98] hover:text-white transition-all shadow-sm cursor-pointer"
                  >
                    try now
                  </button>
                </div>
                
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}