import { Edit3, Save, CheckCircle2 } from 'lucide-react';
import ExpertConsultation from '@/components/ExpertConsultation';

interface Props {
  userData: any;
  setUserData: (data: any) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  onSave: () => void;
}

export default function ProfileDetails({ userData, setUserData, isEditing, setIsEditing, onSave }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-50">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <div><h2 className="text-2xl font-serif font-bold text-gray-800">Personal Information</h2><p className="text-sm text-gray-500 mt-1">Manage your personal details</p></div>
          <button onClick={() => isEditing ? onSave() : setIsEditing(true)} className="flex items-center gap-2 text-[#7D3C98] font-bold hover:bg-purple-50 px-5 py-2.5 rounded-full transition border border-transparent hover:border-purple-100">
            {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field label="Full Name" value={userData.name} isEditing={isEditing} onChange={(v: any) => setUserData({...userData, name: v})} />
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</label>
            <div className="bg-gray-50/50 p-4 rounded-xl flex items-center justify-between border border-gray-100 cursor-not-allowed">
              <span className="font-medium text-gray-500">{userData.phone}</span>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold tracking-wide uppercase"><CheckCircle2 className="w-3 h-3" /> Verified</div>
            </div>
          </div>

          <Field label="Email Address" value={userData.email} isEditing={isEditing} type="email" onChange={(v: any) => setUserData({...userData, email: v})} />
          <Field label="Age" value={userData.age} isEditing={isEditing} type="number" onChange={(v: any) => setUserData({...userData, age: v})} />
        </div>
      </div>
      <ExpertConsultation />
    </div>
  );
}

const Field = ({ label, value, isEditing, type = "text", onChange }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
    {isEditing ? (
      <input type={type} className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 focus:border-[#7D3C98] focus:ring-4 focus:ring-purple-50 outline-none transition-all" value={value} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <div className="p-4 bg-gray-50 rounded-xl font-medium text-gray-700">{value || "Not Provided"}</div>
    )}
  </div>
);