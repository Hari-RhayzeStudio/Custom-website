// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; // Assuming fonts
import "./globals.css";
import Navbar from "@/components/Navbar";
import FloatingButton from "@/components/FloatingButton"; // <--- Import here

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
        
        {/* Main Content */}
        {children}
        
        {/* Global Floating Button - Visible on ALL pages */}
        <FloatingButton /> 
      </body>
    </html>
  );
}