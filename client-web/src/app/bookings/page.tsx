"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

// Imports from the components we just created
import ExpertHeader from '@/components/bookingPage/ExpertHeader';
import BookingForm from '@/components/bookingPage/BookingForm';
import WishlistSelector from '@/components/bookingPage/WishlistSelector';
import SuccessView from '@/components/bookingPage/SuccessView';

function BookingContent() {
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

  // 1. Data Loading Logic
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const directSku = searchParams.get('sku');

    // A. Pre-fill User
    if (userId) {
      axios.get(`http://localhost:3001/api/user/${userId}`)
        .then((res) => {
          setFormData(prev => ({
            ...prev,
            name: res.data.full_name || "",
            email: res.data.email || "" 
          }));
        })
        .catch(err => console.error("Failed to load user info", err));
    }

    // B. Load Products
    const loadProducts = async () => {
      setProductsLoading(true);
      let combinedProducts: any[] = [];

      try {
        if (userId) {
          const res = await axios.get(`http://localhost:3001/api/wishlist/${userId}`);
          combinedProducts = res.data.map((item: any) => ({
             sku: item.product_sku,
             product_name: item.product_name,
             final_image_url: item.product_image 
          }));
        }

        if (directSku) {
          const alreadyExists = combinedProducts.some(p => p.sku === directSku);
          if (!alreadyExists) {
             try {
               const productRes = await axios.get(`http://localhost:3001/api/products/${directSku}`);
               combinedProducts.push(productRes.data);
             } catch (e) { console.error("Direct SKU error"); }
          }
          setSelectedProducts([directSku]);
        }
        setWishlistProducts(combinedProducts);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
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
    if (!userId) return alert("Please log in to book.");

    setIsLoading(true);
    try {
      const selectedImageUrls = wishlistProducts
        .filter(p => selectedProducts.includes(p.sku))
        .map(p => p.final_image_url);

      const res = await axios.post('http://localhost:3001/api/bookings', {
        user_id: userId,
        expert_name: "Mr. Kamraann Rajjani",
        consultation_date: formData.date,
        slot: formData.slot,
        name: formData.name, 
        email: formData.email,
        product_skus: selectedProducts,
        product_images: selectedImageUrls 
      });

      if (res.data.success) setStep(2);
    } catch (error) {
      alert("Failed to book consultation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Nav */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/catalogue"><ArrowLeft className="w-6 h-6 text-gray-600 cursor-pointer" /></Link>
          <h1 className="text-2xl font-serif font-bold text-gray-800 text-center flex-1 pr-10">Consultation Booking</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <ExpertHeader />

          <div className="p-8 md:p-12">
            {step === 1 ? (
              <form onSubmit={handleConfirm}>
                
                <BookingForm formData={formData} setFormData={setFormData} />
                
                <WishlistSelector 
                  loading={productsLoading}
                  products={wishlistProducts}
                  selectedProducts={selectedProducts}
                  onToggleProduct={toggleProduct}
                />

                <button 
                  disabled={isLoading}
                  className="w-full bg-[#BFA3C6] hover:bg-[#7D3C98] text-white font-bold py-4 rounded-full transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isLoading ? "Confirming..." : "Confirm Booking"}
                </button>
              </form>
            ) : (
              <SuccessView email={formData.email} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#7D3C98] animate-spin" /></div>}>
      <BookingContent />
    </Suspense>
  );
}