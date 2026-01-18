"use client";
import Link from 'next/link';
import { ArrowLeft, Undo2 } from 'lucide-react';

interface DesignHeaderProps {
  prompt: string;
  canUndo: boolean;
  onUndo: () => void;
}

export default function DesignHeader({ prompt, canUndo, onUndo }: DesignHeaderProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/design" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg text-gray-700 font-medium truncate max-w-[500px] capitalize">
            {prompt}
          </h1>
        </div>
        {canUndo && (
          <button onClick={onUndo} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-purple-700 transition">
            <Undo2 className="w-4 h-4" /> Undo Last Edit
          </button>
        )}
      </div>
    </div>
  );
}