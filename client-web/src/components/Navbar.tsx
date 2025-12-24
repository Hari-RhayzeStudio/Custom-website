"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
// IMPORT FROM YOUR NEW FILE
import { UserIcon, BellIcon } from '@/components/Icons'; 

export default function Navbar() {
  const [quote, setQuote] = useState("");
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null); 

  useEffect(() => {
    // In a real app, use SWR or React Query for this to avoid waterfall requests
    fetch('http://localhost:3001/api/quote')
      .then(res => res.json())
      .then(data => setQuote(data.quote))
      .catch(() => setQuote("Gold is money. Everything else is credit.")); // Fallback
  }, []);

  return (
    <div className="w-full sticky top-0 z-50">
      {/* Top Header */}
      <div className="bg-[#F9F5E8] text-center py-2 text-sm text-[#7D3C98] font-serif italic border-b border-[#ebdcb2]">
        “{quote}”
      </div>

      {/* Main Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="text-2xl font-bold font-serif tracking-tight text-gray-900">
          Rhayze Studio
        </div>
        
        <div className="hidden md:flex gap-8 text-gray-600 font-medium text-sm tracking-wide uppercase">
          <Link href="/design" className="hover:text-[#7D3C98] transition-colors">Design</Link>
          <Link href="/catalogue" className="hover:text-[#7D3C98] transition-colors">Catalogue</Link>
          <Link href="/wishlist" className="hover:text-[#7D3C98] transition-colors">Wishlist</Link>
          <Link href="/about" className="hover:text-[#7D3C98] transition-colors">About us</Link>
        </div>

        <div className="flex items-center gap-6">
          <BellIcon className="w-5 h-5 text-gray-500 hover:text-[#7D3C98] cursor-pointer transition-colors" />
          
          <div className="relative">
             <button 
               onClick={() => setProfileOpen(!isProfileOpen)} 
               className="flex items-center gap-2 group"
             >
                <div className="bg-purple-50 group-hover:bg-purple-100 p-2 rounded-full transition-colors">
                   <UserIcon className="w-5 h-5 text-[#7D3C98]" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user ? "Sufiyan" : "Sign In"}</span>
             </button>

             {isProfileOpen && (
               <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden">
                 {user ? (
                   <>
                     <Link href="/profile" className="block px-4 py-3 text-sm hover:bg-gray-50">My Profile</Link>
                     <button className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-red-500">Sign Out</button>
                   </>
                 ) : (
                   <Link href="/login" className="block px-4 py-3 text-sm hover:bg-gray-50 text-gray-700">Login</Link>
                 )}
               </div>
             )}
          </div>
        </div>
      </nav>
    </div>
  );
}