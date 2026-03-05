"use client";
import React from 'react';

interface ProfileDetailsProps {
  userData: any;
  setUserData: any;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onSave: () => void;
}

export default function ProfileDetails({ userData, setUserData, isEditing, setIsEditing, onSave }: ProfileDetailsProps) {
  return (
    <div className="w-full max-w-3xl">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#F5EEF8] rounded-full flex items-center justify-center text-[#722E85]">
            {/* Simple User Icon */}
            <svg className="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{userData.name}</h2>
            <p className="text-sm text-gray-500">{userData.email}</p>
          </div>
        </div>
        
        <button 
            onClick={() => isEditing ? onSave() : setIsEditing(true)}
            className="text-gray-500 hover:text-[#722E85] text-sm font-medium flex items-center gap-2"
        >
            {isEditing ? "Save" : <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit
            </>}
        </button>
      </div>

      {/* Grid Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-8">
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">Name</label>
            <input 
                type="text" 
                value={userData.name} 
                disabled={!isEditing}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
                className="w-full bg-[#F9F9F9] border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#722E85] disabled:opacity-70"
            />
        </div>
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">Email</label>
            <input 
                type="email" 
                value={userData.email} 
                disabled={!isEditing}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
                className="w-full bg-[#F9F9F9] border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#722E85] disabled:opacity-70"
            />
        </div>
        <div className="flex flex-col gap-2 relative">
            <label className="text-sm font-medium text-gray-500">Mobile number</label>
            <div className="relative flex items-center">
                <span className="absolute left-4 text-sm text-gray-500">🇮🇳 +91</span>
                <input 
                    type="text" 
                    value={userData.phone ? userData.phone.replace('+91', '') : "9999 888 777"} 
                    disabled={!isEditing}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    className="w-full bg-[#F9F9F9] border border-gray-200 rounded-md pl-16 pr-24 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#722E85] disabled:opacity-70"
                />
                <span className="absolute right-4 text-xs font-bold text-[#34A853] flex items-center gap-1">
                    ✓ Verified
                </span>
            </div>
        </div>
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">Age</label>
            <input 
                type="number" 
                value={userData.age} 
                disabled={!isEditing}
                onChange={(e) => setUserData({...userData, age: e.target.value})}
                className="w-full bg-[#F9F9F9] border border-gray-200 rounded-md px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#722E85] disabled:opacity-70"
            />
        </div>
      </div>

      <hr className="border-gray-100 mb-6" />

      {/* Notifications Toggle */}
      <div className="flex items-center justify-between">
         <span className="text-sm font-medium text-gray-700">Notifications</span>
         {/* Custom Toggle Switch */}
         <div className="w-10 h-5 bg-[#E8DCEB] rounded-full relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-[#722E85] rounded-full shadow"></div>
         </div>
      </div>
    </div>
  );
}