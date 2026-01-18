"use client";
import { useState, useEffect, useRef } from 'react';
import { X, Loader2, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoginMode, setIsLoginMode] = useState(false);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsLoginMode(false); 
      setOtp(["", "", "", "", "", ""]);
      setPhone("");
      setName("");
    }
  }, [isOpen]);

  // --- 1. SEND OTP (Call your Node API) ---
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length < 10) return alert("Please enter a valid phone number");
    if (!isLoginMode && !name.trim()) return alert("Please enter your name");

    setIsLoading(true);
    // Format: +919999999999
    const formattedNumber = `${countryCode}${phone.replace(/\D/g, '')}`;
    
    try {
      // Call your backend Twilio route
      const res = await axios.post('http://localhost:3001/api/auth/send-otp', {
        phoneNumber: formattedNumber
      });

      if (res.data.success) {
        setStep(2);
      } else {
        alert("Failed to send OTP.");
      }
    } catch (error: any) {
      console.error("Send OTP Error:", error);
      alert(error.response?.data?.error || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. VERIFY OTP (Call your Node API) ---
  const handleVerifyOTP = async () => {
    const enteredCode = otp.join("");
    if (enteredCode.length !== 6) return alert("Enter full 6-digit code");

    setIsLoading(true);
    const formattedNumber = `${countryCode}${phone.replace(/\D/g, '')}`;

    try {
      const res = await axios.post('http://localhost:3001/api/auth/verify-otp', {
        phoneNumber: formattedNumber,
        code: enteredCode,
        name: isLoginMode ? undefined : name // Send name only if registering
      });

      if (res.data.success) {
        const dbUser = res.data.user;
        
        // Save session
        localStorage.setItem('user_id', dbUser.id);
        localStorage.setItem('user_name', dbUser.full_name);
        
        onLoginSuccess(dbUser);
        onClose();
        router.push('/profile');
      }
    } catch (error: any) {
      console.error("Verify Error:", error);
      alert(error.response?.data?.error || "Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for auto-focusing OTP inputs
  const handleOtpChange = (val: string, index: number) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl transition-all">
        <button onClick={onClose} className="absolute right-5 top-5 text-gray-400 hover:text-gray-800 transition">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold font-serif text-gray-900 mb-2 text-center">
          {step === 1 ? (isLoginMode ? "Welcome Back" : "Create Account") : "Verify Phone"}
        </h2>
        
        {step === 1 && (
          <p className="text-center text-gray-500 text-sm mb-6">
            {isLoginMode ? "Enter your number to sign in" : "Enter details to get started"}
          </p>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            
            {!isLoginMode && (
              <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" placeholder="Enter your name" 
                  className="w-full p-4 bg-gray-50 rounded-xl outline-none border focus:border-purple-300 transition"
                  value={name} onChange={(e) => setName(e.target.value)} required 
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</label>
              <div className="flex bg-gray-50 rounded-xl overflow-hidden border focus-within:border-purple-300 transition">
                <div className="flex items-center gap-1 px-4 border-r border-gray-200">
                   <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="bg-transparent text-sm font-bold outline-none cursor-pointer">
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                   </select>
                   <ChevronDown className="w-4 h-4 text-gray-400"/>
                </div>
                <input type="tel" placeholder="99999 88888" className="w-full p-4 bg-transparent outline-none"
                  value={phone} onChange={(e) => setPhone(e.target.value)} required 
                />
              </div>
            </div>

            <button disabled={isLoading} className="w-full bg-[#7D3C98] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#6a3281] transition flex justify-center items-center gap-2 disabled:opacity-70">
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Sending OTP..." : "Continue"}
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-[#7D3C98] font-bold hover:underline"
                >
                  {isLoginMode ? "Sign Up" : "Log In"}
                </button>
              </p>
            </div>
          </form>
        ) : (
          <div className="space-y-8 mt-4">
            <p className="text-center text-gray-500 text-sm">Code sent to {countryCode} {phone}</p>
            <div className="flex gap-2 justify-center">
              {otp.map((d, i) => (
                <input 
                  key={i} 
                  ref={el => {inputRefs.current[i] = el}}
                  type="text" maxLength={1} 
                  className="w-12 h-14 border-2 rounded-xl text-center text-2xl font-bold outline-none focus:border-[#7D3C98] bg-gray-50" 
                  value={d} 
                  onChange={e => handleOtpChange(e.target.value, i)} 
                  onKeyDown={(e) => handleKeyDown(e, i)}
                />
              ))}
            </div>

            <button onClick={handleVerifyOTP} disabled={isLoading} className="w-full bg-[#7D3C98] text-white py-4 rounded-xl font-bold shadow-lg flex justify-center items-center gap-2 disabled:opacity-70">
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Verifying..." : "Verify & Login"}
            </button>
            
            <button onClick={() => setStep(1)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600">Change Number</button>
          </div>
        )}
      </div>
    </div>
  );
}