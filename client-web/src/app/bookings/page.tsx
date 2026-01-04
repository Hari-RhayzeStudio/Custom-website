// src/app/bookings/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Check, PackageOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    slot: "10:00 AM - 10:30 AM"
  });

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);

  // 1. Load Data
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const localName = localStorage.getItem('user_name');

    // A. FETCH USER PROFILE TO PRE-FILL FORM
    if (userId) {
      axios.get(`http://localhost:3001/api/user/${userId}`)
        .then((res) => {
          const user = res.data;
          setFormData(prev => ({
            ...prev,
            name: user.full_name || localName || "",
            email: user.email || "" // <--- Pre-fills email from DB
          }));
        })
        .catch(err => console.error("Failed to load user info", err));
    }

    // B. LOAD WISHLIST PRODUCTS
    const loadWishlistData = async () => {
      const directSku = searchParams.get('sku');
      const storedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      const allSkusToFetch = Array.from(new Set([...storedWishlist, directSku].filter(Boolean)));

      if (allSkusToFetch.length === 0) {
        setProductsLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:3001/api/products');
        const allData = await res.json();
        const filtered = allData.filter((p: any) => allSkusToFetch.includes(p.sku));
        setWishlistProducts(filtered);

        if (directSku) setSelectedProducts([directSku]);
      } catch (err) {
        console.error("Failed to load wishlist products", err);
      } finally {
        setProductsLoading(false);
      }
    };

    loadWishlistData();
  }, [searchParams]);

  const toggleProduct = (sku: string) => {
    if (selectedProducts.includes(sku)) {
      setSelectedProducts(selectedProducts.filter(s => s !== sku));
    } else {
      setSelectedProducts([...selectedProducts, sku]);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = localStorage.getItem('user_id');
    
    // Force login if not authenticated
    if (!userId) {
      alert("Please log in to book a consultation.");
      // Optional: trigger login modal here if you have global state, or redirect
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post('http://localhost:3001/api/bookings', {
        user_id: userId,
        expert_name: "Mr. Kamraann Rajjani",
        consultation_date: formData.date,
        slot: formData.slot,
        product_skus: selectedProducts,
        // Send these so backend can update the profile
        name: formData.name, 
        email: formData.email 
      });

      if (res.data.success) {
        setStep(2);
      }
    } catch (error: any) {
      console.error("Booking Error:", error);
      alert("Failed to book consultation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/"><ArrowLeft className="w-6 h-6 text-gray-600" /></Link>
          <h1 className="text-2xl font-serif font-bold text-gray-800 text-center flex-1 pr-10">Consultation Booking</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="bg-[#F9F5E8] p-8 flex items-center gap-6">
            <img src="/assets/expert-avatar.png" alt="Expert" className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"/>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mr. Kamraann Rajjani</h2>
              <p className="text-sm text-gray-500">12+ years in Jewellery design</p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {step === 1 ? (
              <form onSubmit={handleConfirm}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-2">
                    <label className="font-bold text-sm text-gray-700">Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      className="w-full p-3 border rounded-lg bg-gray-50 text-sm focus:border-[#7D3C98] outline-none" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-sm text-gray-700">Consultation date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full p-3 border rounded-lg bg-gray-50 text-sm focus:border-[#7D3C98] outline-none" 
                        required 
                        min={new Date().toISOString().split('T')[0]} 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                      <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-sm text-gray-700">Email</label>
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="w-full p-3 border rounded-lg bg-gray-50 text-sm focus:border-[#7D3C98] outline-none" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-bold text-sm text-gray-700">Select slot</label>
                    <select 
                      className="w-full p-3 border rounded-lg bg-gray-50 text-sm text-gray-500 focus:border-[#7D3C98] outline-none"
                      value={formData.slot}
                      onChange={(e) => setFormData({...formData, slot: e.target.value})}
                    >
                      <option>10:00 AM - 10:30 AM</option>
                      <option>11:00 AM - 11:30 AM</option>
                      <option>02:00 PM - 02:30 PM</option>
                      <option>04:00 PM - 04:30 PM</option>
                    </select>
                  </div>
                </div>

                {/* --- WISHLIST SELECTION SECTION --- */}
                <div className="mb-10">
                  <div className="flex justify-between items-end mb-4">
                    <label className="font-bold text-sm text-gray-700 block">Select product from Wishlist (optional)</label>
                    <span className="text-xs text-gray-400">{selectedProducts.length} selected</span>
                  </div>

                  {productsLoading ? (
                    <div className="text-sm text-gray-400 italic">Loading your wishlist...</div>
                  ) : wishlistProducts.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {wishlistProducts.map((p) => (
                        <div 
                          key={p.sku} 
                          onClick={() => toggleProduct(p.sku)}
                          className={`relative w-28 h-28 rounded-xl border-2 cursor-pointer transition overflow-hidden shrink-0 group
                            ${selectedProducts.includes(p.sku) ? 'border-[#7D3C98] ring-2 ring-[#7D3C98]/20' : 'border-gray-200 hover:border-gray-300'}
                          `}
                        >
                          <img src={p.final_image_url} className="w-full h-full object-cover" alt={p.product_name} />
                          
                          <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border bg-white flex items-center justify-center transition
                             ${selectedProducts.includes(p.sku) ? 'border-[#7D3C98]' : 'border-gray-300 group-hover:border-gray-400'}
                          `}>
                            {selectedProducts.includes(p.sku) && <div className="w-2.5 h-2.5 rounded-full bg-[#7D3C98]"></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm">
                      <PackageOpen className="w-5 h-5" />
                      <span>Your wishlist is empty. Browse the catalogue to add items!</span>
                    </div>
                  )}
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-[#BFA3C6] hover:bg-[#7D3C98] text-white font-bold py-4 rounded-full transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isLoading ? "Confirming..." : "Confirm Booking"}
                </button>
              </form>
            ) : (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-in zoom-in">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Booking confirmed</h3>
                <p className="text-gray-500 text-sm mb-12 max-w-md mx-auto">
                  Meet link will be sent to <strong>{formData.email}</strong> so be ready to utilise your free consultation.
                </p>
                <Link href="/catalogue">
                  <button className="border-2 border-[#7D3C98] text-[#7D3C98] px-10 py-3 rounded-full font-bold hover:bg-purple-50 transition">
                    Explore more designs
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}