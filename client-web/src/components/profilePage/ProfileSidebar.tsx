"use client";
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function ProfileSidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'profile', label: 'My Profile' },
    { id: 'consultations', label: 'My Consultations' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="w-full md:w-62.5 shrink-0 flex flex-col gap-1 border border-gray-100 rounded-md py-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-full text-left px-5 py-4 text-sm font-medium transition-colors ${
            activeTab === item.id 
              ? 'bg-[#F5EEF8] text-[#722E85]' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {item.label}
        </button>
      ))}
      
      {/* Divider */}
      <div className="h-px w-full bg-gray-100 my-1"></div>

      <button
        onClick={onLogout}
        className="w-full text-left px-5 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}