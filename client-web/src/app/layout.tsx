// Inside src/app/layout.tsx

// 1. Ensure you have these imports
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

// 2. Configure the fonts
const serifFont = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-serif' // <--- Must match css
});

const sansFont = Lato({ 
  weight: ['400', '700'], 
  subsets: ['latin'], 
  variable: '--font-sans' // <--- Must match css
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 3. Inject the variables into the class string below */}
      <body className={`${serifFont.variable} ${sansFont.variable} font-sans antialiased`}>
        <Navbar /> 
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}