"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeftIcon, LoaderIcon } from '@/components/Icons';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

import ExpertHeader from '@/components/bookingPage/ExpertHeader';
import BookingForm from '@/components/bookingPage/BookingForm';
import WishlistSelector from '@/components/bookingPage/WishlistSelector';
import SuccessView from '@/components/bookingPage/SuccessView';

// ✅ Define Base URL from Env with Fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

function BookingContent() {
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
    slot: "10:00 AM - 10:30 AM" // Default matches the first option in the list
  });

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);

  // Derived state to check if all required fields are filled
  const isFormComplete = formData.name.trim() !== "" && 
                         formData.email.trim() !== "" && 
                         formData.date.trim() !== "" && 
                         formData.slot.trim() !== "";

  // 1. Data Loading Logic
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const directSku = searchParams.get('sku');

    // A. Pre-fill User
    if (userId) {
      axios.get(`${API_BASE_URL}/api/user/${userId}`)
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
          const res = await axios.get(`${API_BASE_URL}/api/wishlist/${userId}`);
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
               const productRes = await axios.get(`${API_BASE_URL}/api/products/${directSku}`);
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
    if (!isFormComplete) return; 

    const userId = localStorage.getItem('user_id');
    if (!userId) return alert("Please log in to book.");

    setIsLoading(true);
    try {
      const selectedImageUrls = wishlistProducts
        .filter(p => selectedProducts.includes(p.sku))
        .map(p => p.final_image_url);

      const res = await axios.post(`${API_BASE_URL}/api/bookings`, {
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

  // ✅ Smart Back Navigation Logic
  const handleBackNavigation = () => {
    if (typeof window !== 'undefined') {
      // Check if the user came from a page within your own website
      if (document.referrer && document.referrer.includes(window.location.host)) {
        router.back();
      } else {
        // Fallback if they opened the booking page directly or in a new tab
        router.push('/catalogue');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Nav */}
        <div className="flex items-center gap-4 mb-8">
          {/* ✅ UPDATED BACK BUTTON */}
          <button 
            type="button" 
            onClick={handleBackNavigation}
            className="focus:outline-none flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 cursor-pointer" />
          </button>
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
                  disabled={isLoading || !isFormComplete}
                  className={`
                    w-full font-bold py-4 rounded-full transition-all shadow-md flex items-center justify-center gap-2 mt-8
                    ${isFormComplete 
                        ? 'bg-[#7D3C98] hover:bg-[#6a3281] text-white cursor-pointer' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}
                  `}
                >
                  {isLoading && <LoaderIcon className="w-5 h-5 animate-spin" />}
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoaderIcon className="w-8 h-8 text-[#7D3C98] animate-spin" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}