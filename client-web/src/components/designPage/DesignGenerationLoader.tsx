"use client";
import { LoaderIcon, SparklesIcon } from '@/components/Icons';

export default function DesignGenerationLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-white p-5 rounded-full shadow-sm border border-purple-100">
           <LoaderIcon className="w-10 h-10 text-purple-600 animate-spin" />
        </div>
      </div>
      <div className="text-center space-y-3">
         <h3 className="text-2xl font-serif text-gray-800 font-medium">Generating Design...</h3>
         <p className="text-gray-500 text-sm flex items-center gap-2 justify-center bg-white px-4 py-1 rounded-full shadow-sm border border-gray-100">
            <SparklesIcon className="w-4 h-4 text-amber-400" /> 
            Crafting your unique piece
         </p>
      </div>
    </div>
  );
}