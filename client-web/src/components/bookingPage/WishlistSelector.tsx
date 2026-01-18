import React from 'react';
import { Loader2, PackageOpen } from 'lucide-react';

interface WishlistSelectorProps {
  loading: boolean;
  products: any[];
  selectedProducts: string[];
  onToggleProduct: (sku: string) => void;
}

export default function WishlistSelector({ loading, products, selectedProducts, onToggleProduct }: WishlistSelectorProps) {
  return (
    <div className="mb-10">
      <div className="flex justify-between items-end mb-4">
        <label className="font-bold text-sm text-gray-700 block">Select product from Wishlist (optional)</label>
        <span className="text-xs text-gray-400">{selectedProducts.length} selected</span>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 italic flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin"/> Loading your wishlist...
        </div>
      ) : products.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {products.map((p) => {
            const isSelected = selectedProducts.includes(p.sku);
            return (
              <div 
                key={p.sku} 
                onClick={() => onToggleProduct(p.sku)}
                className={`relative w-28 h-28 rounded-xl border-2 cursor-pointer transition overflow-hidden shrink-0 group
                  ${isSelected ? 'border-[#7D3C98] ring-2 ring-[#7D3C98]/20' : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                <img src={p.final_image_url} className="w-full h-full object-cover" alt={p.product_name} />
                
                {/* Selection Dot */}
                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border bg-white flex items-center justify-center transition
                    ${isSelected ? 'border-[#7D3C98]' : 'border-gray-300 group-hover:border-gray-400'}
                `}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#7D3C98]"></div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm">
          <PackageOpen className="w-5 h-5" />
          <span>Your wishlist is empty. Browse the catalogue to add items!</span>
        </div>
      )}
    </div>
  );
}