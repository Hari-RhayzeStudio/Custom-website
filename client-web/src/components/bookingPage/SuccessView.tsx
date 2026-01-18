import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function SuccessView({ email }: { email: string }) {
  return (
    <div className="text-center py-10">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-in zoom-in">
        <Check className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-xl font-bold text-green-600 mb-2">Booking confirmed</h3>
      <p className="text-gray-500 text-sm mb-12 max-w-md mx-auto">
        Meet link will be sent to <strong>{email}</strong>.
      </p>
      <Link href="/catalogue">
        <button className="border-2 border-[#7D3C98] text-[#7D3C98] px-10 py-3 rounded-full font-bold hover:bg-purple-50 transition">
          Explore more designs
        </button>
      </Link>
    </div>
  );
}