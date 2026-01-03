"use client";
import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Loader2 } from 'lucide-react';
import axios from 'axios';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // --- API HANDLERS ---

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return alert("Please enter a valid phone number");

    setIsLoading(true);
    const fullPhone = `${countryCode}${phone}`;

    try {
      // Call Backend to Send OTP via Twilio
      const res = await axios.post('http://localhost:3001/api/auth/send-otp', {
        phone: fullPhone
      });

      if (res.data.success) {
        setStep(2);
        setTimer(30);
        setCanResend(false);
      }
    } catch (error: any) {
      console.error("Send OTP Error:", error);
      alert(error.response?.data?.error || "Failed to send OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const fullPhone = `${countryCode}${phone}`;
    const enteredCode = otp.join("");

    if (enteredCode.length !== 6) return alert("Please enter the full 6-digit code");

    setIsLoading(true);

    try {
      // Call Backend to Verify OTP
      const res = await axios.post('http://localhost:3001/api/auth/verify-otp', {
        phone: fullPhone,
        code: enteredCode
      });

      if (res.data.success) {
        const user = res.data.user;
        
        // Save Session Locally
        localStorage.setItem('user_id', user.id.toString());
        localStorage.setItem('user_name', user.name || "User");
        
        onLoginSuccess(user);
        onClose();
      }
    } catch (error: any) {
      console.error("Verify OTP Error:", error);
      alert(error.response?.data?.error || "Invalid Code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (canResend) {
      handleSendOTP({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition">
          <X className="w-6 h-6" />
        </button>

        {step === 1 ? (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-6 uppercase tracking-wider text-gray-800">Login / Signup</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your mobile number to verify</p>
            <form onSubmit={handleSendOTP}>
              <div className="flex border rounded-xl p-3 mb-6 items-center bg-gray-50 focus-within:bg-white focus-within:ring-2 ring-purple-100 transition">
                <div className="flex items-center gap-1 border-r border-gray-300 pr-3 mr-3 cursor-pointer group">
                  <select 
                    value={countryCode} 
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-transparent outline-none text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-[#7D3C98]" />
                </div>
                <input 
                  type="tel" 
                  placeholder="99999 88888" 
                  className="outline-none w-full bg-transparent font-medium text-gray-800 tracking-wide"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <button 
                disabled={isLoading}
                className="w-full bg-[#7D3C98] text-white py-3.5 rounded-xl font-bold hover:bg-[#6a3281] transition shadow-lg shadow-purple-200 disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? "SENDING..." : "SEND OTP"}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 uppercase tracking-wider text-gray-800">Verify OTP</h2>
            <div className="text-sm text-gray-500 mb-8 flex items-center justify-center gap-2 bg-gray-50 py-2 rounded-full w-fit mx-auto px-4">
              {countryCode} {phone} 
              <button onClick={() => setStep(1)} className="text-[#7D3C98] hover:text-[#6a3281] font-bold text-xs">EDIT</button>
            </div>
            
            <div className="flex gap-2 justify-center mb-8">
              {otp.map((data, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  className="w-12 h-14 border-2 border-gray-200 rounded-xl text-center font-bold text-2xl focus:border-[#7D3C98] focus:ring-4 focus:ring-purple-50 outline-none bg-white transition-all"
                  value={data}
                  onChange={e => handleOtpChange(e.target.value, index)}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
                  }}
                />
              ))}
            </div>

            <button 
              onClick={handleVerifyOTP} 
              disabled={isLoading}
              className="w-full bg-[#7D3C98] text-white py-3.5 rounded-xl font-bold hover:bg-[#6a3281] transition shadow-lg shadow-purple-200 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "VERIFYING..." : "VERIFY & PROCEED"}
            </button>
            
            <div className="mt-6">
              <button 
                onClick={handleResend}
                disabled={!canResend}
                className={`text-sm font-medium transition-colors ${canResend ? 'text-[#7D3C98] hover:underline cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
              >
                {canResend ? "Resend OTP" : `Resend code in 00:${timer < 10 ? `0${timer}` : timer}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}