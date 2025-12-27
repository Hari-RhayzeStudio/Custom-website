// src/app/layout.tsx
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar'; 

const serifFont = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-serif' 
});

const sansFont = Lato({ 
  weight: ['400', '700'], 
  subsets: ['latin'], 
  variable: '--font-sans'
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable}`}>
      <body className="font-sans antialiased bg-white">
        {/* Navbar stays at the top of every single page */}
        <Navbar /> 
        
        <main className="min-h-screen">
          {children}
        </main>

        {/* Floating Book Consultation - Global FAB */}
        <div className="fixed bottom-8 right-8 z-100">
          <button className="flex items-center gap-2 bg-[#7D3C98] text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition">
             <img src="/assets/google-meet-icon.png" alt="" className="w-5 h-5 invert" />
             Book Consultation
          </button>
        </div>
      </body>
    </html>
  );
}