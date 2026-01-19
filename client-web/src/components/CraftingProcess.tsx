"use client";
import React, { useEffect, useRef, useState } from 'react';

interface LifecycleProduct {
  sketch_image_url?: string;
  wax_image_url?: string;
  cast_image_url?: string;
  final_image_url?: string;
}

export default function CraftingProcess({ product }: { product: LifecycleProduct | null }) {
  const purpleText = "text-[#7D3C98]";
  const containerRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  // --- SCROLL EFFECT LOGIC ---
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the section has scrolled into view
      // We start filling when the top of the section hits the middle of the screen
      const startOffset = windowHeight * 0.6; 
      const scrollY = windowHeight - rect.top - startOffset;
      
      // Calculate percentage (0 to 100%)
      const progress = (scrollY / rect.height) * 100;
      
      // Clamp between 0 and 100
      const clampedHeight = Math.min(Math.max(progress, 0), 100);
      setLineHeight(clampedHeight);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product) return <div className="text-center py-20 text-gray-400">Loading process visualization...</div>;

  const steps = [
    {
      id: "3.1",
      title: "Design Render",
      heading: "3.1: Rendering",
      img: product.sketch_image_url,
      desc: "Professional jewellery sketches with technical precision to communicate design intent clearly."
    },
    {
      id: "3.2",
      title: "Wax Model Creation",
      heading: "3.2: Wax Design",
      img: product.wax_image_url,
      desc: "Shaping the design in wax either hand carved or 3D-printed from CAD. This precise wax model forms the foundation."
    },
    {
      id: "3.3",
      title: "Casting Model Creation",
      heading: "3.3: Cast Design",
      img: product.cast_image_url,
      desc: "Gold, platinum, or silver is poured into the cavity, creating a raw metal version of your jewellery design."
    },
    {
      id: "3.4",
      title: "Finished Design",
      heading: "3.4: Polished Design",
      img: product.final_image_url,
      desc: "Final touches like rhodium plating, texturing, or engraving enhance the beauty and character of the jewellery."
    }
  ];

  return (
    <section ref={containerRef} className="max-w-4xl mx-auto px-6 py-20 relative overflow-hidden">
      
      {/* Section Header */}
      <h3 className={`text-4xl font-serif text-center ${purpleText} mb-24`}>Step-3: Designing</h3>

      {/* --- CENTRAL LINE CONTAINER --- */}
      <div className="absolute left-1/2 top-[180px] bottom-20 w-1 -translate-x-1/2 hidden md:block">
        {/* Background Gray Line (Always visible) */}
        <div className="w-full h-full bg-gray-200 rounded-full"></div>
        
        {/* Active Purple Scroll Line (Dynamic Height) */}
        <div 
          className="absolute top-0 left-0 w-full bg-[#7D3C98] rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(125,60,152,0.5)]"
          style={{ height: `${lineHeight}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 relative">
        {steps.map((step, idx) => {
          const isEven = idx % 2 === 0; // True for Left side (0, 2), False for Right side (1, 3)
          
          return (
            <React.Fragment key={step.id}>
              {/* If Left Side Item */}
              {isEven ? (
                <>
                  <div className="md:pr-16 md:text-right text-center mb-16 md:mb-0">
                    <StepCard step={step} purpleText={purpleText} />
                  </div>
                  <div className="hidden md:block"></div> {/* Empty Right Col */}
                </>
              ) : (
                /* If Right Side Item */
                <>
                  <div className="hidden md:block"></div> {/* Empty Left Col */}
                  <div className="md:pl-16 text-center md:text-left mt-0 md:mt-32 mb-16 md:mb-0">
                    <StepCard step={step} purpleText={purpleText} />
                  </div>
                </>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}

// Reusable Card Component to keep main clean
function StepCard({ step, purpleText }: { step: any, purpleText: string }) {
  return (
    <div className="group">
      <h4 className={`text-2xl font-serif ${purpleText} mb-6`}>{step.heading}</h4>
      
      <div className="bg-[#FAF9F6] p-8 rounded-[2rem] mb-6 shadow-sm border border-gray-100 inline-block transition-transform duration-500 group-hover:-translate-y-2 relative z-10">
        <img 
          src={step.img || "/placeholder-jewelry.jpg"} 
          className="w-40 h-40 object-contain mx-auto mix-blend-multiply" 
          alt={step.title} 
        />
      </div>
      
      <div className="max-w-xs mx-auto md:mx-0">
        <h5 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h5>
        <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
      </div>
    </div>
  );
}