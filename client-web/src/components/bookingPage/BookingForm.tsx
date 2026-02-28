import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon } from '@/components/Icons'; 

interface BookingFormProps {
  formData: {
    name: string;
    email: string;
    date: string;
    slot: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

// Generate slots from 10 AM to 10 PM
const TIME_SLOTS = [
  "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM",
  "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM",
  "12:00 PM - 12:30 PM", "12:30 PM - 01:00 PM",
  "01:00 PM - 01:30 PM", "01:30 PM - 02:00 PM",
  "02:00 PM - 02:30 PM", "02:30 PM - 03:00 PM",
  "03:00 PM - 03:30 PM", "03:30 PM - 04:00 PM",
  "04:00 PM - 04:30 PM", "04:30 PM - 05:00 PM",
  "05:00 PM - 05:30 PM", "05:30 PM - 06:00 PM",
  "06:00 PM - 06:30 PM", "06:30 PM - 07:00 PM",
  "07:00 PM - 07:30 PM", "07:30 PM - 08:00 PM",
  "08:00 PM - 08:30 PM", "08:30 PM - 09:00 PM",
  "09:00 PM - 09:30 PM", "09:30 PM - 10:00 PM"
];

export default function BookingForm({ formData, setFormData }: BookingFormProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            min={minDate} /* ✅ 2. Use the variable here */
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
          <CalendarIcon className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
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

      {/* Custom Slot Dropdown */}
      <div className="space-y-2" ref={dropdownRef}>
        <label className="font-bold text-sm text-gray-700">Select slot</label>
        <div className="relative">
          <button 
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full p-3 border rounded-lg bg-gray-50 text-sm outline-none text-left flex justify-between items-center transition-colors ${
              isDropdownOpen ? 'border-[#7D3C98] ring-1 ring-[#7D3C98]' : 'border-gray-200'
            }`}
          >
            <span className="text-gray-700">{formData.slot}</span>
            {/* Custom Chevron Icon */}
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu (max-h-[180px] roughly equals 4 items) */}
          {isDropdownOpen && (
            <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-45 overflow-y-auto py-1 custom-scrollbar">
              {TIME_SLOTS.map(slot => (
                <li 
                  key={slot}
                  onClick={() => {
                    handleChange('slot', slot);
                    setIsDropdownOpen(false);
                  }}
                  className={`p-3 text-sm cursor-pointer transition-colors ${
                    formData.slot === slot 
                      ? 'bg-purple-50 text-[#7D3C98] font-bold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {slot}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}