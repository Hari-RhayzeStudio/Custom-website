"use client";
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { auth } from '../firebase'; 
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // 1. Initialize Recaptcha Once
  useEffect(() => {
    // Clear any existing verifier to prevent "re-initialization" error
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = undefined;
    }

    // Initialize new verifier
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': () => console.log("✅ reCAPTCHA solved"),
      'expired-callback': () => console.log("⚠️ reCAPTCHA expired")
    });

    return () => {
      // Cleanup on unmount
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    }
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Input
    if (phone.length < 10) return alert("Please enter a valid phone number");
    if (!name.trim()) return alert("Please enter your name");

    setIsLoading(true);

    // Clean Format: Remove spaces/dashes (e.g., "+91 999" -> "+91999")
    const formattedNumber = `${countryCode}${phone.replace(/\D/g, '')}`; 
    console.log(`Sending OTP to ${formattedNumber}...`);

    const appVerifier = window.recaptchaVerifier;

    try {
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep(2); // Move to OTP screen
    } catch (error: any) {
      console.error("Firebase Send Error:", error);
      
      // Reset ReCAPTCHA so user can try again
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }

      if (error.code === 'auth/quota-exceeded') {
        alert("Daily SMS quota exceeded. Please use the Test Number (+91 9999999999 / 123456) for now.");
      } else if (error.code === 'auth/too-many-requests') {
        alert("Too many requests. Please wait 15 minutes before trying again.");
      } else {
        alert("Failed to send OTP: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const enteredCode = otp.join("");
    if (enteredCode.length !== 6) return alert("Enter full 6-digit code");
    if (!confirmationResult) return;

    setIsLoading(true);
    try {
      // 1. Verify with Firebase
      const result = await confirmationResult.confirm(enteredCode);
      const user = result.user;
      const idToken = await user.getIdToken();

      // 2. Sync with Backend
      const res = await axios.post('http://localhost:3001/api/auth/verify-user', {
        idToken,
        name
      });

      if (res.data.success) {
        const dbUser = res.data.user;
        localStorage.setItem('user_id', dbUser.id);
        localStorage.setItem('user_name', dbUser.full_name);
        router.push('/profile');
      }
    } catch (error: any) {
      console.error("Verify Error:", error);
      alert("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-sans">
      <header className="p-6">
        <Link href="/"><ArrowLeft className="w-6 h-6 text-gray-600" /></Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-10">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold font-serif text-gray-900 mb-2">
            {step === 1 ? "Welcome" : "Verify Phone"}
          </h1>
          
          <div id="recaptcha-container"></div> {/* Invisible ReCAPTCHA Anchor */}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6 mt-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" placeholder="Enter your name" className="w-full p-4 bg-gray-50 rounded-xl outline-none border focus:border-purple-300"
                  value={name} onChange={(e) => setName(e.target.value)} required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</label>
                <div className="flex bg-gray-50 rounded-xl overflow-hidden border focus-within:border-purple-300">
                  <div className="flex items-center gap-1 px-4 border-r border-gray-200">
                     <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="bg-transparent text-sm font-bold outline-none">
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                     </select>
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
            </form>
          ) : (
            <div className="space-y-8 mt-6">
              <p className="text-sm text-gray-500 text-center">Code sent to {countryCode} {phone}</p>
              <div className="flex gap-2 justify-center">
                {otp.map((d, i) => (
                  <input 
                    key={i} 
                    id={`otp-${i}`}
                    type="text" maxLength={1} 
                    className="w-12 h-14 border-2 rounded-xl text-center text-2xl font-bold outline-none focus:border-[#7D3C98] bg-gray-50" 
                    value={d} onChange={e => handleOtpChange(e.target.value, i)} 
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
      </main>
    </div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}