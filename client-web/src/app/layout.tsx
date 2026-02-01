// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/infra/Navbar";
import Footer from "@/components/infra/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rhayze Studio",
  description: "Custom Jewellery Design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        
        {/* ADDED: padding-bottom only on mobile (md:pb-0) so the bottom nav doesn't hide content */}
        <div className="pb-[56px] md:pb-0 min-h-screen">
           {children}
        </div>
        
        {/* Footer will now sit above the mobile nav */}
        <Footer/>
      </body>
    </html>
  );
}