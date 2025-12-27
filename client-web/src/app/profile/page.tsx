// app/profile/page.tsx
"use client";
import { useState } from 'react';
import { ArrowLeft, Edit3, Calendar, CheckCircle2, Save, HelpCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import ExpertConsultation from '@/components/ExpertConsultation';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userData, setUserData] = useState({
    name: "Hari",
    email: "hari@xyz.com",
    phone: "+91 9999 888 777",
    dob: "2001-08-29"
  });

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/"><ArrowLeft className="w-6 h-6 text-gray-600" /></Link>
          <h1 className="text-2xl font-bold font-serif text-gray-800">Your Profile</h1>
          <div className="w-6" />
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-2xl shadow-inner">👤</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
                <p className="text-gray-500">{userData.email}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 text-[#7D3C98] font-bold hover:opacity-80 transition"
            >
              {isEditing ? <><Save className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit</>}
            </button>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 pb-8 border-b border-gray-100">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 outline-none focus:border-[#7D3C98] transition"
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                />
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg text-gray-700 font-medium">{userData.name}</div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Email</label>
              {isEditing ? (
                <input 
                  type="email" 
                  className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 outline-none focus:border-[#7D3C98] transition"
                  value={userData.email}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                />
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg text-gray-700 font-medium">{userData.email}</div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Mobile number</label>
              <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between opacity-70 cursor-not-allowed border border-gray-200">
                <span className="font-medium text-gray-600">{userData.phone}</span>
                <span className="text-green-600 text-xs flex items-center gap-1 font-bold">
                   <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Date of Birth</label>
              {isEditing ? (
                <input 
                  type="date" 
                  className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200 outline-none focus:border-[#7D3C98] transition"
                  value={userData.dob}
                  onChange={(e) => setUserData({...userData, dob: e.target.value})}
                />
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between border border-gray-50">
                  <span className="font-medium text-gray-700">{userData.dob.split('-').reverse().join('/')}</span>
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-4 border-b border-gray-50 px-2">
              <span className="text-gray-700 font-medium">Notifications</span>
              <button 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${notificationsEnabled ? 'bg-[#7D3C98]' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <button className="w-full flex items-center justify-between py-4 border-b border-gray-50 px-2 hover:bg-gray-50 transition rounded-lg">
              <span className="text-gray-700 font-medium">Help and support</span>
            </button>
            
            <button className="w-full flex items-center py-4 px-2 hover:bg-red-50 transition rounded-lg group">
              <span className="text-red-500 font-bold group-hover:underline">Logout</span>
            </button>
          </div>
        </div>

        {/* Expert Consultation Section */}
        <ExpertConsultation />
      </div>
    </div>
  );
}