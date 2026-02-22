"use client";
import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { MeetIcon, RequirementsIcon } from '@/components/Icons';

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

  // Calculate the dot's position strictly alongside the scroll progress
  const dotY = useTransform(scaleY, [0, 1], ["0%", "100%"]);

  const placeholderImg = "/placeholder-jewelry.jpg";

  // Renamed steps for design-only mode
  const allSteps = [
    {
      id: "1",
      label: "Consultation",
      title: "Book Consultation",
      desc: "Book free-consultation and discuss your requirement with us",
      icon: <MeetIcon className="w-10 h-10 text-blue-600" />,
      type: "card",
    },
    {
      id: "2",
      label: "Requirements",
      title: "Choose Design or Custom Request",
      desc: "Browse our catalogue or share your unique vision for a 'Custom Design'.",
      icon: <RequirementsIcon className="w-10 h-10 text-purple-600" />,
      type: "card",
    },
    {
      id: "header",
      label: "Designing Phase",
      type: "header"
    },
    {
      id: "3.1",
      label: mode === 'design-only' ? "Step 1: Rendering" : "3.1: Rendering",
      title: "Design Render",
      desc: "Professional jewellery sketches with technical precision to communicate design intent.",
      img: product?.sketch_image_url,
      alt: product?.sketch_image_alt_text,
      type: "image",
    },
    {
      id: "3.2",
      label: mode === 'design-only' ? "Step 2: Wax Design" : "3.2: Wax Design",
      title: "Wax Model Creation",
      desc: "Shaping the design in wax, either hand-carved or 3D-printed from CAD.",
      img: product?.wax_image_url,
      alt: product?.wax_image_alt_text,
      type: "image",
    },
    {
      id: "3.3",
      label: mode === 'design-only' ? "Step 3: Cast Design" : "3.3: Cast Design",
      title: "Casting Model",
      desc: "Molten gold or platinum is poured into the cavity, creating the raw metal form.",
      img: product?.cast_image_url,
      alt: product?.cast_image_alt_text,
      type: "image",
    },
    {
      id: "3.4",
      label: mode === 'design-only' ? "Step 4: Polished Design" : "3.4: Polished Design",
      title: "Finished Piece",
      desc: "Final touches like setting stones, polishing, and engraving bring the piece to life.",
      img: product?.final_image_url,
      alt: product?.final_image_alt_text,
      type: "image",
    }
  ];

  const displayedSteps = mode === 'design-only' 
    ? allSteps.filter(step => !['1', '2', 'header'].includes(step.id)) 
    : allSteps;

  return (
    <div ref={containerRef} className="relative max-w-6xl mx-auto px-4 py-10 md:py-24 overflow-hidden">
      
      {/* TIMELINE LINE & CIRCLE */}
      <div className={`absolute left-8 md:left-1/2 bottom-0 w-1 md:-ml-0.5 z-0 h-[calc(100%-80px)] ${mode === 'design-only' ? 'top-10' : 'top-0'}`}>
        {/* Background track */}
        <div className="absolute inset-0 w-full h-full bg-gray-100 rounded-full" />
        
        {/* Moving filled track */}
        <motion.div 
          style={{ scaleY, transformOrigin: "top" }}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#7D3C98] to-purple-400 rounded-full origin-top"
        />

        {/* ✅ Glowing moving circle at the end of the line */}
        <motion.div 
          style={{ top: dotY }}
          className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-4 border-[#7D3C98] rounded-full shadow-[0_0_12px_#7D3C98] z-10"
        />
      </div>

      <div className="flex flex-col gap-24 relative z-10">
        {displayedSteps.map((step, index) => {
          if (step.type === "header") {
             return (
               <div key={step.id} className="text-center py-8 relative z-20">
                  <span className="inline-block bg-white px-6 py-2 rounded-full border border-purple-100 shadow-sm text-2xl md:text-3xl font-serif font-bold text-[#7D3C98]">
                    {step.label}
                  </span>
               </div>
             );
          }

          const isEven = index % 2 === 0;

          return (
            <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`flex flex-col md:flex-row items-center w-full ${!isEven ? 'md:flex-row-reverse' : ''}`}
            >
              <div className={`w-full md:w-1/2 pl-20 md:pl-0 relative group ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                 <div className="text-sm font-bold text-[#7D3C98] uppercase tracking-widest mb-2 text-left md:text-center">
                    {step.label}
                 </div>

                 <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden text-center">
                    <div className={`absolute top-0 w-24 h-24 bg-[#F9F5E8] rounded-full z-0 opacity-50 ${!isEven ? '-right-10 -top-10' : '-left-10 -top-10'}`} />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="mb-5">
                            {step.type === 'image' ? (
                                <div className="bg-[#FAF9F6] p-4 rounded-2xl inline-block shadow-inner border border-gray-50">
                                    <img 
                                      src={step.img || placeholderImg} 
                                      alt={step.alt || step.title}
                                      className="w-32 h-32 md:w-40 md:h-40 object-contain mix-blend-multiply" 
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-[#F9F5E8] rounded-2xl flex items-center justify-center text-[#7D3C98]">
                                    {step.icon}
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-3">{step.title}</h3>
                        <p className="text-gray-500 leading-relaxed max-w-sm text-sm md:text-base">{step.desc}</p>
                    </div>
                 </div>
              </div>
              <div className="w-full md:w-1/2 hidden md:block"></div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}