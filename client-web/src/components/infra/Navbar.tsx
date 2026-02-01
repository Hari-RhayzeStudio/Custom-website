"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { UserIcon, BellIcon } from '@/components/Icons'; 
import AuthModal from '../AuthModal';
import NotificationPanel from '../infra/NotificationPanel';

// --- SVG ICONS FOR NAVIGATION ---
const DesignIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.077-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-5-5m0 0a3 3 0 0 1-2.991-1.545m0 0c-1.333 2.114-1.333 5.115 0 7.229" />
  </svg>
);
const CatalogueIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
);
const WishlistIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

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

  const desktopLinks = [
    { name: 'Design', href: '/design' },
    { name: 'Catalogue', href: '/catalogue' },
    { name: 'Wishlist', href: '/wishlist' },
    { name: 'About us', href: '/about' },
  ];

  // Helper for active styling (Mobile Bottom Nav & Desktop Nav)
  // ✅ Updated Active Background Color to #F6ECF8
  const getLinkClasses = (href: string, isDesktop = false) => {
    const isActive = pathname === href;
    
    if (isDesktop) {
        return `transition-colors px-4 py-2 rounded-full ${isActive ? 'text-[#722E85] bg-[#F6ECF8]' : 'text-[#808080] hover:text-[#7D3C98]'}`;
    }

    const baseClasses = "flex flex-col items-center justify-center h-full w-full transition-all duration-300 rounded-xl mx-1";
    const activeClasses = "text-[#722E85] bg-[#F6ECF8] font-bold";
    const inactiveClasses = "text-[#808080] hover:text-[#7D3C98]";
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  const handleProfileClick = () => {
    if (user) {
      router.push('/profile?tab=profile');
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <div ref={navRef} className="w-full bg-white">
      
      {/* ==============================================
          1. QUOTATION HEADER
          Desktop: Fixed height 68px (same as navbar)
          Mobile: Auto height
         ============================================== */}
      <div className="w-full bg-[#F9F5E8] border-b border-[#ebdcb2]">
        <div className="max-w-[1440px] mx-auto text-center px-4 flex items-center justify-center h-auto min-h-[40px] md:h-[68px]">
          <p className="text-[#7D3C98] font-serif italic font-medium text-xs sm:text-sm md:text-lg">
            “Prudent crafting, stunning art, Rhayze Studio captures every heart”
          </p>
        </div>
      </div>
      
      {/* ==============================================
          2. DESKTOP & TABLET NAVBAR 
          Max Width: 1440px | Height: 68px
         ============================================== */}
      <div className="hidden md:block w-full shadow-sm sticky top-0 z-50 bg-white">
        <nav className="max-w-[1440px] mx-auto flex justify-between items-center px-6 md:px-8 h-[68px]">
          <Link href="/" className="text-xl md:text-2xl font-bold font-serif text-gray-900 shrink-0">
            Rhayze Studio
          </Link>
          
          <div className="flex gap-6 lg:gap-8 font-medium text-xs lg:text-sm uppercase tracking-wider">
            {desktopLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={getLinkClasses(link.href, true)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                   setIsNotificationOpen(!isNotificationOpen);
                   setProfileOpen(false);
                }}
                className={`relative p-2 rounded-full transition-colors ${isNotificationOpen ? 'bg-purple-50 text-[#7D3C98]' : 'text-gray-400 hover:text-[#7D3C98]'}`}
              >
                <BellIcon className="w-6 h-6" />
                {user && <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>}
              </button>
              <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
            </div>

            {/* User Profile */}
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
                  <div className={`p-2 rounded-full border transition-all duration-200 ${isProfileOpen ? 'bg-[#722E85] border-[#722E85]' : 'bg-purple-50 border-purple-100 group-hover:border-[#722E85]'}`}>
                     <UserIcon className={`w-6 h-6 transition-colors ${isProfileOpen ? 'text-white' : 'text-[#722E85]'}`} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 max-w-[100px] truncate hidden lg:block">
                    {user ? user.name : "Sign in"}
                  </span>
               </button>

               {/* Profile Dropdown */}
               {isProfileOpen && user && (
                 <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
                   <Link href="/profile?tab=profile" onClick={() => setProfileOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">My Profile</Link>
                   <Link href="/profile?tab=consultations" onClick={() => setProfileOpen(false)} className="block px-4 py-3 text-sm hover:bg-gray-50 border-b">My Consultations</Link>
                   <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-sm hover:bg-red-50 text-red-500 font-bold">Logout</button>
                 </div>
               )}
            </div>
          </div>
        </nav>
      </div>

      {/* ==============================================
          3. MOBILE HEADER (Below Quote)
          Sticky Top | Height: 56px | Contains: Logo + Wishlist + Bell
         ============================================== */}
      <div className="md:hidden flex justify-between items-center px-4 h-[56px] border-b bg-white sticky top-0 z-40">
         <Link href="/" className="text-lg font-bold font-serif text-gray-900">
           Rhayze Studio
         </Link>
         
         {/* Right Side: Wishlist & Notification */}
         <div className="flex items-center gap-3">
            <Link href="/wishlist" className="text-gray-500 hover:text-[#722E85] transition-colors">
              <WishlistIcon className="w-6 h-6" />
            </Link>
            
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)} 
              className={`text-gray-500 hover:text-[#722E85] relative ${isNotificationOpen ? 'text-[#722E85]' : ''}`}
            >
              <BellIcon className="w-6 h-6" />
              {user && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
            </button>
         </div>
      </div>

      {/* ==============================================
          4. MOBILE BOTTOM NAVIGATION 
          Fixed Bottom | Height: 56px
         ============================================== */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-[56px] bg-white border-t border-gray-200 z-50 flex justify-around items-center px-1 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        
        {/* Design */}
        <Link href="/design" className={getLinkClasses('/design')}>
           <DesignIcon className="w-6 h-6 mb-0.5" />
           <span className="text-[10px] leading-none">Design</span>
        </Link>

        {/* Catalogue */}
        <Link href="/catalogue" className={getLinkClasses('/catalogue')}>
           <CatalogueIcon className="w-6 h-6 mb-0.5" />
           <span className="text-[10px] leading-none">Catalogue</span>
        </Link>

        {/* Consultation */}
        <Link href="/profile?tab=consultations" className={getLinkClasses('/profile?tab=consultations')}>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mb-0.5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
           </svg>
           <span className="text-[10px] leading-none">Consult</span>
        </Link>

        {/* Profile */}
        <button onClick={handleProfileClick} className={getLinkClasses('/profile?tab=profile')}>
           <UserIcon className="w-6 h-6 mb-0.5" />
           <span className="text-[10px] leading-none">{user ? 'Profile' : 'Sign In'}</span>
        </button>
      </div>

      {/* Notification Panel Mobile (renders relatively if open) */}
      <div className="md:hidden fixed top-[100px] right-0 z-40 w-full px-2">
         <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={(u) => { setUser({ name: u.full_name }); setIsAuthOpen(false); }} />
    </div>
  );
}