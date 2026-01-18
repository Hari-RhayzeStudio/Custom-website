"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ProfileSidebar from '@/components/profilePage/ProfileSidebar';
import ProfileDetails from '@/components/profilePage/ProfileDetails';
import EmptyTab from '@/components/profilePage/EmptyTab';

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({ id: "", name: "", email: "", phone: "", age: "" });

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) { router.push('/'); return; }

    axios.get(`http://localhost:3001/api/user/${userId}`)
      .then(res => {
        const d = res.data;
        setUserData({ id: d.id, name: d.full_name || "Guest", email: d.email || "", phone: d.phone_number || "", age: d.age ? String(d.age) : "" });
      })
      .catch(() => { localStorage.clear(); router.push('/'); })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3001/api/user/${userData.id}`, {
        name: userData.name, email: userData.email, age: userData.age ? parseInt(userData.age) : null
      });
      setIsEditing(false);
      localStorage.setItem('user_name', userData.name);
    } catch { alert("Failed to save changes"); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]"><div className="w-8 h-8 border-4 border-[#7D3C98] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-20 font-sans">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/"><ArrowLeft className="w-6 h-6 text-gray-600 hover:text-[#7D3C98] transition" /></Link>
          <h1 className="text-xl font-bold font-serif text-gray-800">My Account</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 items-start">
        <ProfileSidebar user={userData} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => { localStorage.clear(); router.push('/'); }} />
        
        <section className="flex-1 w-full">
          {activeTab === 'profile' && (
            <ProfileDetails userData={userData} setUserData={setUserData} isEditing={isEditing} setIsEditing={setIsEditing} onSave={handleSave} />
          )}
          {activeTab === 'consultations' && <EmptyTab icon={ShoppingBag} title="No previous consultations" desc="Your past jewelry purchases will appear here." />}
          {activeTab === 'settings' && <EmptyTab icon={Settings} title="Account Settings" desc="Manage notifications and privacy settings here." />}
        </section>
      </main>
    </div>
  );
}