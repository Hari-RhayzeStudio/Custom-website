"use client";
import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Montaga, Montserrat } from 'next/font/google';

const montaga = Montaga({ 
  weight: '400', 
  subsets: ['latin'],
  display: 'swap',
});

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

interface LifecycleProduct {
  sketch_image_url?: string;
  sketch_image_alt_text?: string; 
  wax_image_url?: string;
  wax_image_alt_text?: string;    
  cast_image_url?: string;
  cast_image_alt_text?: string;   
  final_image_url?: string;
  final_image_alt_text?: string;  
}

interface TimelineProps {
  product: LifecycleProduct | null;
  mode?: 'full' | 'design-only';
}

export default function TimelineSection({ product, mode = 'full' }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 30%", "end 70%"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const dotY = useTransform(scaleY, [0, 1], ["0%", "100%"]);
  const placeholderImg = "/assets/placeholder-jewelry.jpg";

  const allSteps = [
    {
      id: "1",
      label: "Step-1: Consultation",
      title: "Book Consultation",
      desc: "Book free-consultation and discuss your requirement with us",
      img: "/assets/google-meet-icon.png",
      alt: "Meet Consultation",
    },
    {
      id: "2",
      label: "Step-2: Requirements",
      title: "Choose Design or tell us custom requirements",
      desc: "We have a wide-range of designs in catalogue or generate with us or we do create \"Custom Designs\"",
      img: "/assets/requirements.png", 
      alt: "Requirements",
    },
    {
      id: "header",
      label: "Step-3: Designing",
      type: "header"
    },
    {
      id: "3.1",
      label: mode === 'design-only' ? "Step-1: Rendering" : "3.1: Rendering",
      title: "Design Render",
      desc: "Professional jewellery sketches with technical precision to communicate design intent clearly.",
      img: product?.sketch_image_url,
      alt: product?.sketch_image_alt_text,
    },
    {
      id: "3.2",
      label: mode === 'design-only' ? "Step-2: Wax Design" : "3.2: Wax Design",
      title: "Wax Model Creation",
      desc: "Shaping the design in wax, either hand-carved or 3D-printed from CAD.",
      img: product?.wax_image_url,
      alt: product?.wax_image_alt_text,
    },
    {
      id: "3.3",
      label: mode === 'design-only' ? "Step-3: Cast Design" : "3.3: Cast Design",
      title: "Casting Model",
      desc: "Molten gold or platinum is poured into the cavity, creating the raw metal form.",
      img: product?.cast_image_url,
      alt: product?.cast_image_alt_text,
    },
    {
      id: "3.4",
      label: mode === 'design-only' ? "Step-4: Polished Design" : "3.4: Polished Design",
      title: "Finished Piece",
      desc: "Final touches like setting stones, polishing, and engraving bring the piece to life.",
      img: product?.final_image_url,
      alt: product?.final_image_alt_text,
    }
  ];

  const displayedSteps = mode === 'design-only' 
    ? allSteps.filter(step => !['1', '2', 'header'].includes(step.id)) 
    : allSteps;

  return (
    <div className="w-full bg-white">
      <div ref={containerRef} className="relative max-w-6xl mx-auto px-4 py-10 md:py-24 overflow-hidden">
        
        {/* TIMELINE LINE & CIRCLE */}
        <div className={`absolute left-8 md:left-1/2 bottom-0 w-px md:w-0.5 md:-ml-px z-0 h-[calc(100%-80px)] ${mode === 'design-only' ? 'top-10' : 'top-0'}`}>
          <div className="absolute inset-0 w-full h-full bg-[#FBF8EF]" />
          
          <motion.div 
            style={{ scaleY, transformOrigin: "top" }}
            className="absolute top-0 left-0 w-full h-full bg-[#722E85] origin-top"
          />

          <motion.div 
            style={{ top: dotY }}
            className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-[#722E85] rounded-full shadow-[0_0_8px_#722E85] z-10"
          />
        </div>

        <div className="flex flex-col gap-16 md:gap-20 relative z-10">
          {displayedSteps.map((step, index) => {
            if (step.type === "header") {
               return (
                 <div key={step.id} className="text-center py-8 relative z-20">
                    <span className={`${montaga.className} inline-block bg-[#FBF8EF] px-8 py-3 rounded-full text-[24px] md:text-[32px] text-[#722E85]`}>
                      {step.label}
                    </span>
                 </div>
               );
            }

            const visualIndex = displayedSteps.slice(0, index).filter(s => s.type !== 'header').length;
            const isEven = visualIndex % 2 === 0;

            return (
              <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`flex flex-col md:flex-row items-center w-full ${!isEven ? 'md:flex-row-reverse' : ''}`}
              >
                
                <div className={`w-full md:w-1/2 pl-16 md:pl-0 relative group ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'} flex flex-col items-center ${isEven ? 'md:items-end' : 'md:items-start'}`}>
                   
                   {/* Centered label inside the half-column */}
                   <div className={`${montaga.className} text-[24px] md:text-[32px] text-[#722E85] mb-4 text-center w-full max-w-md`}>
                      {step.label}
                   </div>

                   {/* ✅ FIX: Added 'max-w-md' and 'mx-auto' to constrain the box size while maintaining padding */}
                   <div className="bg-[#FBF8EF] p-6 md:py-[36px] md:px-[20px] rounded-4xl border border-transparent transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center w-full max-w-md">
                      
                      <div className="mb-6">
                          <div className="bg-white p-3 rounded-2xl inline-flex items-center justify-center border border-gray-100 shadow-sm">
                              <img 
                                src={step.img || placeholderImg} 
                                alt={step.alt || step.title}
                                className="w-16 h-16 md:w-20 md:h-20 object-contain mix-blend-multiply" 
                              />
                          </div>
                      </div>
                      
                      <h3 className={`${montserrat.className} text-[20px] font-medium text-gray-900 mb-3`}>
                          {step.title}
                      </h3>
                      
                      <p className={`${montserrat.className} text-[16px] text-gray-500 text-justify md:text-center leading-relaxed max-w-[280px]`}>
                          {step.desc}
                      </p>
                   </div>
                </div>

                <div className="w-full md:w-1/2 hidden md:block"></div>
                
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}