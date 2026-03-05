"use client";
import { useState, useEffect, Suspense } from 'react';
import { ArrowLeftIcon } from '@/components/Icons'; 
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import ProfileSidebar from '@/components/profilePage/ProfileSidebar';
import ProfileDetails from '@/components/profilePage/ProfileDetails';
import EmptyTab from '@/components/profilePage/EmptyTab';
import ConsultationsTab from '@/components/profilePage/ConsultationsTab';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({ id: "", name: "", email: "", phone: "", age: "" });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'consultations') setActiveTab('consultations');
    else if (tab === 'settings') setActiveTab('settings');
    else setActiveTab('profile');
  }, [searchParams]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) { 
        router.push('/'); 
        return; 
    }

    axios.get(`${API_BASE_URL}/api/user/${userId}`)
      .then(res => {
        const d = res.data;
        setUserData({ 
            id: d.id, 
            name: d.full_name || "Guest", 
            email: d.email || "", 
            phone: d.phone_number || "", 
            age: d.age ? String(d.age) : "" 
        });
      })
      .catch(() => { 
          localStorage.clear(); 
          router.push('/'); 
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/user/${userData.id}`, {
        name: userData.name, email: userData.email, age: userData.age ? parseInt(userData.age) : null
      });
      setIsEditing(false);
      localStorage.setItem('user_name', userData.name);
      alert("Profile updated successfully");
    } catch { alert("Failed to save changes"); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-[#722E85] border-t-transparent rounded-full animate-spin"></div></div>;

  // Dynamic Title based on tab
  const getTitle = () => {
    if (activeTab === 'consultations') return 'My Consultation';
    if (activeTab === 'settings') return 'Settings';
    return 'Your Profile';
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Main Content Container - Aligned with your standard site margins */}
      <div className="max-w-300 mx-auto px-6 md:px-12 py-8 md:py-12">
        
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="cursor-pointer">
              <ArrowLeftIcon className="w-5 h-5 text-gray-800 hover:text-[#722E85] transition" />
            </button>
            <h1 className="text-2xl font-medium text-gray-800">{getTitle()}</h1>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
          <ProfileSidebar 
              activeTab={activeTab} 
              setActiveTab={(tab) => {
                  setActiveTab(tab);
                  router.push(`/profile?tab=${tab}`, { scroll: false });
              }} 
              onLogout={() => { localStorage.clear(); router.push('/'); }} 
          />
          
          <section className="flex-1 w-full">
            {activeTab === 'profile' && (
              <ProfileDetails userData={userData} setUserData={setUserData} isEditing={isEditing} setIsEditing={setIsEditing} onSave={handleSave} />
            )}
            
            {activeTab === 'consultations' && (
              <ConsultationsTab userId={userData.id} userEmail={userData.email} />
            )}

            {activeTab === 'settings' && <EmptyTab icon={null} title="Account Settings" desc="Manage notifications and privacy settings here." />}
          </section>
        </main>

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}