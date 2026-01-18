import React from 'react';
import { Calendar } from 'lucide-react';

interface BookingFormProps {
  formData: {
    name: string;
    email: string;
    date: string;
    slot: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function BookingForm({ formData, setFormData }: BookingFormProps) {
  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Name */}
      <div className="space-y-2">
        <label className="font-bold text-sm text-gray-700">Name</label>
        <input 
          type="text" 
          placeholder="Enter your name" 
          className="w-full p-3 border rounded-lg bg-gray-50 text-sm focus:border-[#7D3C98] outline-none" 
          required 
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="font-bold text-sm text-gray-700">Consultation date</label>
        <div className="relative">
          <input 
            type="date" 
            className="w-full p-3 border rounded-lg bg-gray-50 text-sm focus:border-[#7D3C98] outline-none" 
            required 
            min={new Date().toISOString().split('T')[0]} 
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
          <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="font-bold text-sm text-gray-700">Email</label>
        <input 
          type="email" 
          placeholder="Enter your email" 
          className="w-full p-3 border rounded-lg bg-gray-50 text-sm focus:border-[#7D3C98] outline-none" 
          required 
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
      </div>

      {/* Slot */}
      <div className="space-y-2">
        <label className="font-bold text-sm text-gray-700">Select slot</label>
        <select 
          className="w-full p-3 border rounded-lg bg-gray-50 text-sm text-gray-500 focus:border-[#7D3C98] outline-none"
          value={formData.slot}
          onChange={(e) => handleChange('slot', e.target.value)}
        >
          <option>10:00 AM - 10:30 AM</option>
          <option>11:00 AM - 11:30 AM</option>
          <option>02:00 PM - 02:30 PM</option>
          <option>04:00 PM - 04:30 PM</option>
        </select>
      </div>
    </div>
  );
}