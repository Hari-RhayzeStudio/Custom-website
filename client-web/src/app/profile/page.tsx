"use client";
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit3, CheckCircle2, Save, LogOut, 
  User, ShoppingBag, Settings, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ExpertConsultation from '@/components/ExpertConsultation';

// --- SIDEBAR COMPONENT ---
const SidebarItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-[#7D3C98] text-white shadow-lg shadow-purple-200' 
        : 'hover:bg-purple-50 text-gray-600 hover:text-[#7D3C98]'
    }`}
  >
    <div className="flex items-center gap-4 font-medium">
      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-[#7D3C98]'}`} />
      {label}
    </div>
    {!active && <ChevronRight className="w-4 h-4 text-gray-300" />}
  </button>
);

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'consultations' | 'settings'
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    age: ""
  });

  useEffect(() => {
    // 1. Get ID from LocalStorage
    const userId = localStorage.getItem('user_id');
    if (!userId) { router.push('/'); return; }

    // 2. Fetch full details from Backend
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/user/${userId}`);
        const data = res.data;
        setUserData({
            id: data.id,
            name: data.full_name || "Guest",
            email: data.email || "",
            phone: data.phone_number || "",
            age: data.age ? String(data.age) : ""
        });
      } catch (error) {
        console.error("Error loading profile", error);
        localStorage.clear();
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3001/api/user/${userData.id}`, {
        name: userData.name,
        email: userData.email,
        age: userData.age ? parseInt(userData.age) : null
      });
      setIsEditing(false);
      localStorage.setItem('user_name', userData.name);
    } catch (error) {
      alert("Failed to save changes");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-[#7D3C98] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#7D3C98] font-bold">Loading Profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-20 font-sans">
      
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/"><ArrowLeft className="w-6 h-6 text-gray-600 hover:text-[#7D3C98] transition" /></Link>
          <h1 className="text-xl font-bold font-serif text-gray-800">My Account</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 items-start">
        
        {/* --- LEFT SIDEBAR PANEL --- */}
        <aside className="w-full md:w-80 flex flex-col gap-2 shrink-0">
            {/* User Mini Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm mb-4 border border-gray-50 flex items-center gap-4">
               <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl font-bold text-[#7D3C98]">
                 {userData.name.charAt(0)}
               </div>
               <div className="overflow-hidden">
                 <h2 className="font-bold text-gray-800 truncate">{userData.name}</h2>
                 <p className="text-xs text-gray-500 truncate">{userData.email || userData.phone}</p>
               </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex flex-col gap-2">
               <SidebarItem 
                 icon={User} 
                 label="Profile Details" 
                 active={activeTab === 'profile'} 
                 onClick={() => setActiveTab('profile')} 
               />
               
               {/* Placeholder tabs for future expansion */}
               <SidebarItem 
                 icon={ShoppingBag} 
                 label="My consultations" 
                 active={activeTab === 'consultations'} 
                 onClick={() => setActiveTab('consultations')} 
               />
               
               <SidebarItem 
                 icon={Settings} 
                 label="Settings" 
                 active={activeTab === 'settings'} 
                 onClick={() => setActiveTab('settings')} 
               />
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-50 mt-2">
               <button 
                 onClick={handleLogout} 
                 className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500 font-bold hover:bg-red-50 transition"
               >
                  <LogOut className="w-5 h-5" /> Logout
               </button>
            </div>
        </aside>

        {/* --- RIGHT CONTENT AREA --- */}
        <section className="flex-1 w-full">
          
          {/* PROFILE TAB CONTENT */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                
                {/* Main Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-gray-800">Personal Information</h2>
                      <p className="text-sm text-gray-500 mt-1">Manage your personal details</p>
                    </div>
                    <button 
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      className="flex items-center gap-2 text-[#7D3C98] font-bold hover:bg-purple-50 px-5 py-2.5 rounded-full transition border border-transparent hover:border-purple-100"
                    >
                      {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
                    </button>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 focus:border-[#7D3C98] focus:ring-4 focus:ring-purple-50 outline-none transition-all"
                          value={userData.name}
                          onChange={(e) => setUserData({...userData, name: e.target.value})}
                        />
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-xl font-medium text-gray-700">{userData.name}</div>
                      )}
                    </div>

                    {/* Phone (Read Only) */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</label>
                      <div className="bg-gray-50/50 p-4 rounded-xl flex items-center justify-between border border-gray-100 cursor-not-allowed">
                        <span className="font-medium text-gray-500">{userData.phone}</span>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold tracking-wide uppercase">
                           <CheckCircle2 className="w-3 h-3" /> Verified
                        </div>
                      </div>
                    </div>
                    
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                      {isEditing ? (
                        <input 
                          type="email" 
                          className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 focus:border-[#7D3C98] focus:ring-4 focus:ring-purple-50 outline-none transition-all"
                          value={userData.email}
                          onChange={(e) => setUserData({...userData, email: e.target.value})}
                        />
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-xl font-medium text-gray-700">{userData.email || "Not Provided"}</div>
                      )}
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Age</label>
                      {isEditing ? (
                        <input 
                          type="number" 
                          className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 focus:border-[#7D3C98] focus:ring-4 focus:ring-purple-50 outline-none transition-all"
                          value={userData.age}
                          onChange={(e) => setUserData({...userData, age: e.target.value})}
                        />
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-xl font-medium text-gray-700">{userData.age || "Not Provided"}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Component */}
                <ExpertConsultation />
            </div>
          )}

          {/* consultations TAB PLACEHOLDER */}
          {activeTab === 'consultations' && (
             <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-50 text-center animate-in fade-in zoom-in duration-300">
                <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">No previous consultations</h3>
                <p className="text-gray-500">Your past jewelry purchases will appear here.</p>
             </div>
          )}
          
          {/* SETTINGS TAB PLACEHOLDER */}
          {activeTab === 'settings' && (
             <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-50 text-center animate-in fade-in zoom-in duration-300">
                <Settings className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">Account Settings</h3>
                <p className="text-gray-500">Manage notifications and privacy settings here.</p>
             </div>
          )}

        </section>
      </main>
    </div>
  );
}