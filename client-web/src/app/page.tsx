import Link from 'next/link';
// IMPORT FROM YOUR NEW FILE
import { ArrowRightIcon, SparklesIcon } from '@/components/Icons';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* 1. HERO SECTION */}
      <section className="w-full bg-[#FDFBF7] py-24 px-6 text-center border-b border-[#f0e6d2]">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif text-gray-900 mb-8 leading-[1.1]">
            Prudent crafting, stunning art,<br /> 
            <span className="text-[#7D3C98] italic">Rhayze Studio</span> captures every heart.
          </h1>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            We blend advanced AI with real craftsmanship to help you create pieces that are truly yours. From a simple prompt to a piece you can actually wear.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/design">
              <button className="flex items-center justify-center gap-2 bg-[#7D3C98] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#6a3281] transition shadow-lg w-full sm:w-auto">
                <SparklesIcon className="w-5 h-5" />
                Start Designing with AI
              </button>
            </Link>
            <Link href="/catalogue">
              <button className="px-8 py-4 rounded-full text-lg font-medium text-[#7D3C98] border border-[#7D3C98] hover:bg-purple-50 transition w-full sm:w-auto">
                Browse Catalogue
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* ... (Existing Grid code remains the same) ... */}
          
          <div className="text-center mt-16">
            <Link href="/about" className="text-[#7D3C98] font-bold inline-flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-widest text-sm">
              View Detailed Process <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}