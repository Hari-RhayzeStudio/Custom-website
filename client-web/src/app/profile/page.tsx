"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Calendar, CheckCircle2, Save, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ExpertConsultation from '@/components/ExpertConsultation';

export default function ProfilePage() {
  const router = useRouter();
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
    
    // 2. If no ID, open the modal logic (or redirect home)
    if (!userId) {
      router.push('/'); 
      return;
    }

    // 3. Fetch full details from Backend
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
        // Optional: Logout if token/user invalid
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
        // Backend expects 'dob' or we update backend to accept 'age'
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
      <main className="max-w-4xl mx-auto px-6 pt-10">
        <header className="flex items-center justify-between mb-8">
          <Link href="/"><ArrowLeft className="w-6 h-6 text-gray-600" /></Link>
          <h1 className="text-2xl font-bold font-serif text-gray-800">Your Profile</h1>
          <div className="w-6" />
        </header>

        <section className="bg-white rounded-2xl p-8 shadow-sm">
          {/* Profile Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-3xl border-2 border-white shadow-sm">
                👤
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
                <p className="text-gray-500 text-sm font-medium">{userData.phone}</p>
              </div>
            </div>
            <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="flex items-center gap-2 text-[#7D3C98] font-bold hover:bg-purple-50 px-4 py-2 rounded-lg transition"
            >
              {isEditing ? <><Save className="w-4 h-4" /> Save</> : <><Edit3 className="w-4 h-4" /> Edit</>}
            </button>
          </div>

          {/* User Details Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 pb-8 border-b border-gray-100">
            {/* Name Field */}
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Full Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  className="w-full bg-gray-50 p-3 rounded-lg border focus:border-[#7D3C98] outline-none"
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                />
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg text-gray-800 font-medium">{userData.name}</div>
              )}
            </div>

            {/* Phone Field (Locked) */}
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Mobile Number</label>
              <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between border border-gray-200 cursor-not-allowed">
                <span className="font-medium text-gray-600">{userData.phone}</span>
                <span className="text-green-600 text-xs flex items-center gap-1 font-bold bg-green-100 px-2 py-1 rounded-full">
                   <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>
            
             {/* Email Field */}
             <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Email</label>
              {isEditing ? (
                <input 
                  type="email" 
                  className="w-full bg-gray-50 p-3 rounded-lg border focus:border-[#7D3C98] outline-none"
                  value={userData.email}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                />
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg text-gray-800 font-medium">{userData.email || "Not Provided"}</div>
              )}
            </div>

            {/* Age Field */}
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Age</label>
              {isEditing ? (
                <input 
                  type="number" 
                  className="w-full bg-gray-50 p-3 rounded-lg border focus:border-[#7D3C98] outline-none"
                  value={userData.age}
                  onChange={(e) => setUserData({...userData, age: e.target.value})}
                />
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg text-gray-800 font-medium">{userData.age || "Not Provided"}</div>
              )}
            </div>
          </div>

          <button onClick={handleLogout} className="w-full flex items-center py-4 px-2 hover:bg-red-50 transition rounded-lg group text-left gap-2 text-red-500 font-bold">
              <LogOut className="w-5 h-5" /> Logout
          </button>
        </section>
        
        <ExpertConsultation />
      </main>
    </div>
  );
}