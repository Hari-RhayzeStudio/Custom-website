import { User, ShoppingBag, Settings, LogOut, ChevronRight } from 'lucide-react';

interface SidebarProps {
  user: { name: string; email: string; phone: string };
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group ${active ? 'bg-[#7D3C98] text-white shadow-lg shadow-purple-200' : 'hover:bg-purple-50 text-gray-600 hover:text-[#7D3C98]'}`}>
    <div className="flex items-center gap-4 font-medium"><Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-[#7D3C98]'}`} />{label}</div>
    {!active && <ChevronRight className="w-4 h-4 text-gray-300" />}
  </button>
);

export default function ProfileSidebar({ user, activeTab, setActiveTab, onLogout }: SidebarProps) {
  return (
    <aside className="w-full md:w-80 flex flex-col gap-2 shrink-0">
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-4 border border-gray-50 flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl font-bold text-[#7D3C98]">{user.name.charAt(0)}</div>
        <div className="overflow-hidden">
          <h2 className="font-bold text-gray-800 truncate">{user.name}</h2>
          <p className="text-xs text-gray-500 truncate">{user.email || user.phone}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex flex-col gap-2">
        <SidebarItem icon={User} label="Profile Details" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        <SidebarItem icon={ShoppingBag} label="My consultations" active={activeTab === 'consultations'} onClick={() => setActiveTab('consultations')} />
        <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-50 mt-2">
        <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500 font-bold hover:bg-red-50 transition">
           <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  );
}