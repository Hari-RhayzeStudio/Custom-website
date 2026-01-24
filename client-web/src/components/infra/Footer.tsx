// client-web/app/components/Footer.tsx
"use client";

import Link from 'next/link';
import { FacebookIcon, TwitterIcon, YoutubeIcon, InstagramIcon, PinIcon, PhoneIcon, MailIcon } from '@/components/Icons'; 

export default function Footer() {
  return (
    <footer className="bg-[#f9f9f9] text-gray-700 font-sans border-t border-gray-100">
      
      {/* SECTION 1: NEWSLETTER */}
      <div className="py-16 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-medium mb-8 text-black">
            Get <span className="text-[#D4AF37] font-bold">Free consultation</span> on your sign up
          </h2>
          
          <form className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto mb-4">
            <input 
              type="email" 
              placeholder="Enter Phone number*" 
              className="flex-1 p-4 border border-gray-300 outline-none focus:border-gray-500 bg-white text-sm"
              required
            />
            <button className="bg-[#111111] text-white px-8 py-4 text-sm font-bold tracking-wide hover:bg-black transition">
              SIGN UP
            </button>
          </form>
          
          <p className="text-xs text-gray-500 mb-8">
            Your privacy matters. For details, see our <Link href="/privacy" className="underline hover:text-gray-800">Privacy Policy</Link>.
          </p>

          <div className="flex items-center justify-center gap-6">
            <span className="text-sm font-medium text-gray-600">Follow Us:</span>
            <div className="flex gap-4">
               <Link href="#" className="hover:text-black transition"><FacebookIcon className="w-5 h-5" /></Link>
               <Link href="#" className="hover:text-black transition"><TwitterIcon className="w-5 h-5" /></Link>
               <Link href="#" className="hover:text-black transition"><YoutubeIcon className="w-5 h-5" /></Link>
               <Link href="#" className="hover:text-black transition"><PinIcon className="w-5 h-5" /></Link>
               <Link href="#" className="hover:text-black transition"><InstagramIcon className="w-5 h-5" /></Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: LINKS & CONTACT */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Contact */}
          <div className="space-y-6">
            <h3 className="text-lg font-normal text-black mb-4">Contact</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                <span>+1 (832) 878-2877</span>
              </li>
              <li className="flex items-center gap-2">
                <MailIcon className="w-4 h-4" />
                <a href="mailto:hari@rhayzestudio.com" className="hover:underline">support@rhayzestudio.com</a>
              </li>
              <li>Custom Jewellery</li>
              <li>20 x 7 support</li>
            </ul>
          </div>

          {/* Column 2: Useful Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-normal text-black mb-4">Useful links</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><Link href="/design" className="hover:text-[#7D3C98] transition">Design</Link></li>
              <li><Link href="/catalogue" className="hover:text-[#7D3C98] transition">Catalogue</Link></li>
              <li><Link href="/wishlist" className="hover:text-[#7D3C98] transition">Wishlist</Link></li>
              <li><Link href="/about" className="hover:text-[#7D3C98] transition">About us</Link></li>
            </ul>
          </div>

          {/* Column 3: Products */}
          <div className="space-y-6">
            <h3 className="text-lg font-normal text-black mb-4">Products</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><Link href="/catalogue?category=Ladies-rings" className="hover:text-[#7D3C98] transition">Ladies-rings</Link></li>
              <li><Link href="/catalogue?category=Men-rings" className="hover:text-[#7D3C98] transition">Men-rings</Link></li>
              <li><Link href="/catalogue?category=Bands" className="hover:text-[#7D3C98] transition">Bands</Link></li>
              <li><Link href="/catalogue?category=Bracelets" className="hover:text-[#7D3C98] transition">Bracelets</Link></li>
              <li><Link href="/catalogue?category=Earrings" className="hover:text-[#7D3C98] transition">Earrings</Link></li>
            </ul>
          </div>

          {/* Column 4: Brand Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-normal text-black mb-4">Rhayze Studio</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              We are a jewellery design-first studio that blends advanced AI with real craftsmanship to help you create pieces that are truly yours.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-200 py-6 text-center">
        <p className="text-xs text-gray-400">©2025 All rights reserved Rhayze Studio</p>
      </div>
    </footer>
  );
}