"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Add this
import { UserIcon, BellIcon } from '@/components/Icons'; 
import AuthModal from './AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<{name: string} | null>(null); 

  const navLinks = [
    { name: 'Design', href: '/design' },
    { name: 'Catalogue', href: '/catalogue' },
    { name: 'Wishlist', href: '/wishlist' },
    { name: 'About us', href: '/about' },
  ];

  return (
    <div className="w-full sticky top-0 z-60 bg-white">
      <div className="bg-[#F9F5E8] text-center py-2 text-xs text-[#7D3C98] font-serif italic border-b border-[#ebdcb2]">
        “Prudent crafting, stunning art, Rhayze Studio captures every heart”
      </div>
      
      <nav className="flex justify-between items-center px-8 py-4 shadow-sm">
        <Link href="/" className="text-2xl font-bold font-serif text-gray-900">Rhayze Studio</Link>
        
        <div className="hidden md:flex gap-8 text-gray-500 font-medium text-sm uppercase tracking-wider">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`transition-colors hover:text-[#7D3C98] ${pathname === link.href ? 'text-[#7D3C98] bg-purple-50 px-3 py-1 rounded-full' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-6">
          <BellIcon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-[#7D3C98]" />
          <div className="relative">
             <button 
               onClick={() => user ? setProfileOpen(!isProfileOpen) : setIsAuthOpen(true)} 
               className="flex items-center gap-2"
             >
                <div className="bg-purple-50 p-2 rounded-full border border-purple-100">
                   <UserIcon className="w-5 h-5 text-[#7D3C98]" />
                </div>
                <span className="text-sm font-bold text-gray-700">{user ? user.name : "Sign in"}</span>
             </button>

             {isProfileOpen && user && (
               <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-2xl z-70 overflow-hidden animate-in fade-in slide-in-from-top-2">
                 <Link href="/profile" className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">My Profile</Link>
                 <Link href="/bookings" className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">Booking form</Link>
                 <button onClick={() => setUser(null)} className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-red-500 font-bold">Logout</button>
               </div>
             )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={setUser} />
    </div>
  );
}