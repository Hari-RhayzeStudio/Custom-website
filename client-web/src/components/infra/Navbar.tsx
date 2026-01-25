"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { UserIcon, BellIcon } from '@/components/Icons'; 
import AuthModal from '../AuthModal';
import NotificationPanel from '../infra/NotificationPanel';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<{name: string} | null>(null); 
  
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedId = localStorage.getItem('user_id');
    if (storedName && storedId) {
      setUser({ name: storedName });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setProfileOpen(false);
    setIsNotificationOpen(false);
    router.push('/');
  };

  const navLinks = [
    { name: 'Design', href: '/design' },
    { name: 'Catalogue', href: '/catalogue' },
    { name: 'Wishlist', href: '/wishlist' },
    { name: 'About us', href: '/about' },
  ];

  return (
    <div className="w-full sticky top-0 z-50 bg-white" ref={navRef}>
      <div className="bg-[#F9F5E8] text-center px-4 py-3 md:py-4 lg:py-5 border-b border-[#ebdcb2] transition-all duration-300">
        <p className="text-[#7D3C98] font-serif italic font-medium text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
          “Prudent crafting, stunning art, Rhayze Studio captures every heart”
        </p>
      </div>
      
      <nav className="flex justify-between items-center px-6 md:px-8 py-4 shadow-sm relative">
        <Link href="/" className="text-xl md:text-2xl font-bold font-serif text-gray-900 shrink-0">
          Rhayze Studio
        </Link>
        
        <div className="hidden md:flex gap-6 lg:gap-8 text-gray-500 font-medium text-xs lg:text-sm uppercase tracking-wider">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`transition-colors hover:text-[#7D3C98] whitespace-nowrap ${pathname === link.href ? 'text-[#7D3C98] bg-purple-50 px-3 py-1 rounded-full' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative">
            <button 
              onClick={() => {
                 setIsNotificationOpen(!isNotificationOpen);
                 setProfileOpen(false);
              }}
              className={`relative p-2 rounded-full transition-colors duration-200 ${isNotificationOpen ? 'bg-purple-50 text-[#7D3C98]' : 'text-gray-400 hover:text-[#7D3C98] hover:bg-gray-50'}`}
            >
              <BellIcon className="w-5 h-5 md:w-6 md:h-6" />
              {user && <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>}
            </button>
            <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
          </div>

          <div className="relative">
             <button 
               onClick={() => {
                 if (user) {
                   setProfileOpen(!isProfileOpen);
                   setIsNotificationOpen(false);
                 } else {
                   setIsAuthOpen(true);
                 }
               }} 
               className="flex items-center gap-2 focus:outline-none group"
             >
                <div className={`p-2 rounded-full border transition-all duration-200 ${isProfileOpen ? 'bg-[#7D3C98] border-[#7D3C98]' : 'bg-purple-50 border-purple-100 group-hover:border-[#7D3C98]'}`}>
                   <UserIcon className={`w-5 h-5 md:w-6 md:h-6 transition-colors ${isProfileOpen ? 'text-white' : 'text-[#7D3C98]'}`} />
                </div>
                <span className="text-sm font-bold text-gray-700 max-w-25 truncate hidden sm:block">
                  {user ? user.name : "Sign in"}
                </span>
             </button>

             {/* Profile Dropdown */}
             {isProfileOpen && user && (
               <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
                 
                 {/* ✅ 1. Standard Profile Link */}
                 <Link 
                    href="/profile?tab=profile" 
                    onClick={() => setProfileOpen(false)} 
                    className="block px-4 py-3 text-sm hover:bg-gray-50 border-b transition"
                 >
                    My Profile
                 </Link>

                 {/* ✅ 2. Updated Link: Passes ?tab=consultations */}
                 <Link 
                    href="/profile?tab=consultations" 
                    onClick={() => setProfileOpen(false)} 
                    className="block px-4 py-3 text-sm hover:bg-gray-50 border-b transition"
                 >
                    My Consultations
                 </Link>

                 <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-500 font-bold transition">Logout</button>
               </div>
             )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={(u) => { setUser({ name: u.full_name }); setIsAuthOpen(false); }} />
    </div>
  );
}