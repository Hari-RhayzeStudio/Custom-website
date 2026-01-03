// app/login/page.tsx
"use client";
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((p) => p - 1), 1000);
    } else if (timer === 0) setCanResend(true);
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return alert("Please enter a valid phone number");
    if (!name.trim()) return alert("Please enter your name");

    setIsLoading(true);
    const fullPhone = `${countryCode}${phone}`;

    try {
      await axios.post('http://localhost:3001/api/auth/send-otp', { phone: fullPhone });
      setStep(2);
      setTimer(30);
      setCanResend(false);
    } catch (error: any) {
      alert("Failed to send OTP. " + (error.response?.data?.error || ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const fullPhone = `${countryCode}${phone}`;
    const enteredCode = otp.join("");
    if (enteredCode.length !== 6) return alert("Enter full code");

    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:3001/api/auth/verify-otp', {
        phone: fullPhone,
        code: enteredCode,
        name: name // Send name to update/create profile
      });

      if (res.data.success) {
        const user = res.data.user;
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('user_name', user.full_name);
        router.push('/profile'); // Redirect to profile
      }
    } catch (error: any) {
      alert("Verification failed. " + (error.response?.data?.error || ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-sans">
      <header className="p-6">
        <Link href="/"><ArrowLeft className="w-6 h-6 text-gray-600" /></Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-10">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold font-serif text-gray-900 mb-2">
            {step === 1 ? "Welcome to Rhayze" : "Verify Phone"}
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            {step === 1 ? "Enter your details to sign in or sign up." : `Code sent to ${countryCode} ${phone}`}
          </p>

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your name" 
                  className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-purple-100 outline-none transition font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</label>
                <div className="flex bg-gray-50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-100 transition">
                  <div className="flex items-center gap-1 px-4 border-r border-gray-200 cursor-pointer">
                     <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="bg-transparent text-sm font-bold outline-none appearance-none cursor-pointer">
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                     </select>
                     <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="99999 88888" 
                    className="w-full p-4 bg-transparent outline-none font-medium"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <button disabled={isLoading} className="w-full bg-[#7D3C98] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#6a3281] transition flex justify-center items-center gap-2">
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? "Sending..." : "Continue"}
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex gap-2 justify-center">
                {otp.map((d, i) => (
                  <input key={i} ref={el => {inputRefs.current[i] = el}} type="text" maxLength={1} className="w-12 h-14 border-2 rounded-xl text-center text-2xl font-bold outline-none focus:border-[#7D3C98] bg-gray-50" value={d} onChange={e => handleOtpChange(e.target.value, i)} onKeyDown={e => {if(e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i-1]?.focus()}} />
                ))}
              </div>

              <button onClick={handleVerifyOTP} disabled={isLoading} className="w-full bg-[#7D3C98] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#6a3281] transition flex justify-center items-center gap-2">
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? "Verifying..." : "Verify & Login"}
              </button>

              <button onClick={() => setStep(1)} className="w-full text-sm font-bold text-gray-400 hover:text-[#7D3C98]">Change Number</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}