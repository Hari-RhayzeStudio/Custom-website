// client-web/app/components/CraftingProcess.tsx
import React from 'react';

interface LifecycleProduct {
  sketch_image_url?: string;
  wax_image_url?: string;
  cast_image_url?: string;
  final_image_url?: string;
}

export default function CraftingProcess({ product }: { product: LifecycleProduct | null }) {
  const purpleText = "text-[#7D3C98]";
  const placeholderImg = "/placeholder-jewelry.jpg";

  if (!product) return <div className="text-center py-20 text-gray-400">Loading process visualization...</div>;

  const steps = [
    {
      id: "3.1",
      title: "Rendering",
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
      heading: "3.3: Caste Design",
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
    <section className="max-w-5xl mx-auto px-6 py-20">
      <h3 className={`text-4xl font-serif text-center ${purpleText} mb-16`}>Step-3: Designing</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-24 relative">
        {/* Background Decorative Lines */}
        <div className="absolute inset-0 hidden md:block pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 25,20 L 75,45 M 75,45 L 25,70 M 25,70 L 75,95" stroke="#E9E9E9" strokeWidth="0.5" strokeDasharray="4 4" fill="none" />
          </svg>
        </div>

        {steps.map((step, idx) => (
          <div key={step.id} className={`text-center relative z-10 ${idx % 2 !== 0 ? 'md:mt-20' : ''}`}>
            <h4 className={`text-2xl font-serif ${purpleText} mb-6`}>{step.heading}</h4>
            <div className="bg-gray-50 p-8 rounded-2xl mb-6 max-w-sm mx-auto shadow-sm">
              <img 
                src={step.img || placeholderImg} 
                className="w-32 h-32 object-contain mx-auto" 
                alt={step.title} 
              />
            </div>
            <h5 className="text-lg font-bold mb-2">{step.title}</h5>
            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}