"use client";
import React, { useState, useEffect } from 'react';
import { XIcon, CheckIcon, PackageOpenIcon, LoaderIcon } from './Icons';
import axios from 'axios';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ✅ 1. Define Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    slot: "10:00 AM - 10:30 AM"
  });

  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Load Data when Modal Opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      
      const userId = localStorage.getItem('user_id');
      const localName = localStorage.getItem('user_name');

      // ✅ 2. Use API_BASE_URL for User Info
      if (userId) {
        axios.get(`${API_BASE_URL}/api/user/${userId}`)
          .then(res => {
            const u = res.data;
            setFormData(prev => ({
              ...prev,
              name: u.full_name || localName || "",
              email: u.email || ""
            }));
          })
          .catch(console.error);
      }

      // ✅ 3. Use API_BASE_URL for Products
      const storedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (storedWishlist.length > 0) {
        fetch(`${API_BASE_URL}/api/products`)
          .then(res => res.json())
          .then(data => {
            const filtered = data.filter((p: any) => storedWishlist.includes(p.sku));
            setWishlistProducts(filtered);
          })
          .catch(console.error);
      } else {
        setWishlistProducts([]);
      }
    }
  }, [isOpen]);

  const toggleProduct = (sku: string) => {
    setSelectedProducts(prev => 
      prev.includes(sku) ? prev.filter(s => s !== sku) : [...prev, sku]
    );
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
      alert("Please log in to book a consultation.");
      return; 
    }

    setIsLoading(true);

    try {
      // ✅ 4. Use API_BASE_URL for Booking Submission
      const res = await axios.post(`${API_BASE_URL}/api/bookings`, {
        user_id: userId,
        expert_name: "Mr. Kamraann Rajjani",
        consultation_date: formData.date,
        slot: formData.slot,
        product_skus: selectedProducts,
        name: formData.name,  
        email: formData.email 
      });

      if (res.data.success) {
        setStep(2);
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Failed to book consultation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        <button onClick={onClose} className="absolute right-5 top-5 text-gray-400 hover:text-gray-800 transition z-10">
          <XIcon className="w-6 h-6" />
        </button>

        <div className="p-8">
          {step === 1 ? (
            <>
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Book Consultation</h2>
              
              <form onSubmit={handleConfirm}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Name</label>
                    <input required type="text" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 transition" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date</label>
                    <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 transition" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                    <input required type="email" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 transition" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Slot</label>
                    <select className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-purple-100 transition" value={formData.slot} onChange={e => setFormData({...formData, slot: e.target.value})}>
                      <option>10:00 AM - 10:30 AM</option>
                      <option>02:00 PM - 02:30 PM</option>
                    </select>
                  </div>
                </div>

                {/* Wishlist Selector */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-xs font-bold text-gray-500 uppercase block">Discuss Products (Optional)</label>
                    <span className="text-xs text-[#7D3C98] font-medium">{selectedProducts.length} selected</span>
                  </div>
                  
                  {wishlistProducts.length > 0 ? (
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                      {wishlistProducts.map(p => (
                        <div key={p.sku} onClick={() => toggleProduct(p.sku)} className={`relative w-24 h-24 rounded-xl border-2 cursor-pointer shrink-0 overflow-hidden transition-all group ${selectedProducts.includes(p.sku) ? 'border-[#7D3C98] ring-2 ring-purple-50' : 'border-gray-100 hover:border-purple-200'}`}>
                          <img src={p.final_image_url} alt={p.product_name} className="w-full h-full object-cover" />
                          <div className={`absolute inset-0 bg-[#7D3C98]/20 flex items-center justify-center transition-opacity duration-200 ${selectedProducts.includes(p.sku) ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="bg-white rounded-full p-1 shadow-sm"><CheckIcon className="w-4 h-4 text-[#7D3C98]" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 flex gap-2 items-center justify-center">
                      <PackageOpenIcon className="w-5 h-5 text-gray-300"/> <span>Wishlist is empty</span>
                    </div>
                  )}
                </div>

                <button disabled={isLoading} className="w-full bg-[#7D3C98] text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#6a3281] transition shadow-lg shadow-purple-100 disabled:opacity-70">
                  {isLoading && <LoaderIcon className="w-5 h-5 animate-spin" />}
                  {isLoading ? "Confirming..." : "Confirm Booking"}
                </button>
              </form>
            </>
          ) : (
            // Success Step
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in">
                <CheckIcon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                We have sent the meeting link to <strong>{formData.email}</strong>.
              </p>
              <button onClick={onClose} className="bg-gray-100 text-gray-900 px-10 py-3 rounded-full font-bold hover:bg-gray-200 transition">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}