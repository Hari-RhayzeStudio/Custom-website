"use client";
import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: any) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      // BACKEND CALL: Replace with your actual API (e.g., Twilio or Firebase)
      // await fetch('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone: countryCode + phone }) });
      console.log(`Sending real OTP to ${countryCode}${phone}`);
      setTimer(30);
      setCanResend(false);
      setStep(2);
    }
  };

  const handleResend = () => {
    if (canResend) {
      setTimer(30);
      setCanResend(false);
      // Trigger API call again here
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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>

        {step === 1 ? (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-6 uppercase tracking-wider">Login</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your mobile number to continue</p>
            <form onSubmit={handleSendOTP}>
              <div className="flex border rounded-lg p-3 mb-6 items-center">
                <div className="flex items-center gap-1 border-r pr-3 mr-3 cursor-pointer group">
                  <select 
                    value={countryCode} 
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-transparent outline-none text-sm font-medium appearance-none cursor-pointer"
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
                  placeholder="9999 888 777" 
                  className="outline-none w-full"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <button className="w-full bg-[#7D3C98] text-white py-3 rounded-lg font-bold hover:bg-[#6a3281] transition shadow-lg">
                SEND OTP
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 uppercase tracking-wider">Verify the OTP</h2>
            <p className="text-sm text-gray-500 mb-6 flex items-center justify-center gap-2">
              {countryCode} {phone} 
              <button onClick={() => setStep(1)} className="text-[#7D3C98] hover:scale-110 transition-transform">✎</button>
            </p>
            
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((data, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  className="w-10 h-12 border rounded-lg text-center font-bold focus:border-[#7D3C98] outline-none bg-gray-50 text-xl"
                  value={data}
                  onChange={e => handleOtpChange(e.target.value, index)}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
                  }}
                />
              ))}
            </div>

            <button onClick={() => onLoginSuccess({name: "Customer", phone: `${countryCode} ${phone}`})} className="w-full bg-[#7D3C98] text-white py-3 rounded-lg font-bold hover:bg-[#6a3281] transition mb-4">
              VERIFY
            </button>
            
            <button 
              onClick={handleResend}
              disabled={!canResend}
              className={`text-xs font-bold transition-colors ${canResend ? 'text-[#7D3C98] underline cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
            >
              {canResend ? "Resend OTP" : `Resend OTP in (00:${timer < 10 ? `0${timer}` : timer})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}