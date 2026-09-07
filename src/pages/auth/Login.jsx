import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ShieldCheck, Network, Server, LineChart } from 'lucide-react';
// 1. IMPORT TURNSTILE
import { Turnstile } from '@marsidev/react-turnstile';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  
  // 2. STATE UNTUK TOKEN CLOUDFLARE
  const [turnstileToken, setTurnstileToken] = useState(null);

  // 3. LOGIKA VALIDASI: Tombol hanya aktif jika username, password, checkbox, DAN Turnstile sudah centang hijau
  const isFormValid = username.length > 0 && password.length > 0 && isChecked && turnstileToken;

  const handleLogin = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    // Nanti token ini (turnstileToken) akan dikirim ke Laravel bersama username & password
    console.log("Token Keamanan Cloudflare:", turnstileToken);
    
    // Memberi "tiket VIP" palsu sementara agar bisa menembus halaman
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/');
  };

  return (
    <div className="flex h-screen w-full bg-white text-gray-800 font-sans overflow-hidden">
      
      {/* LEFT PANEL: FORM */}
      <div className="w-full lg:w-[35%] xl:w-[400px] flex flex-col px-8 py-8 border-r border-gray-200 relative h-full overflow-y-auto z-10 bg-white">
        
        {/* Logo */}
        <div className="mb-10 mt-4">
          <img 
            src="https://i.ibb.co.com/pjrL2fjV/logo-infranexia.png" 
            alt="Infranexia Logo" 
            className="h-10 object-contain"
          />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center w-full mb-8">
          <div className="flex-1 border-b-2 border-red-500 pb-2">
            <span className="flex items-center text-red-500 text-sm font-semibold">
              <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">1</span>
              Input Data
            </span>
          </div>
          {/* <div className="flex-1 border-b-2 border-gray-200 pb-2 pl-4">
            <span className="text-gray-400 text-sm font-semibold">Verification</span>
          </div> */}
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col">
          <form onSubmit={handleLogin} className="flex flex-col flex-1">
            
            {/* Input Username */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-colors"
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} className="text-gray-400 hover:text-gray-600" /> : <Eye size={18} className="text-gray-400 hover:text-gray-600" />}
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start mb-6">
              <div className="flex items-center h-5">
                <input 
                  id="terms" 
                  type="checkbox" 
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="terms" className="text-gray-500 cursor-pointer select-none">
                  By signing in, you agree to use our <span className="font-semibold text-gray-700 underline">Terms and Condition</span>.
                </label>
              </div>
            </div>

            {/* 4. CLOUDFLARE TURNSTILE WIDGET */}
            <div className="mb-6 flex justify-center">
              <Turnstile 
                siteKey="0x4AAAAAAErHEES8eZg7mJ_M" 
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
              />
            </div>

            {/* Buttons */}
            <div className="space-y-3 mb-8">
              <button 
                type="submit" 
                disabled={!isFormValid}
                className={`w-full font-medium py-2.5 px-4 rounded-md transition duration-300 ${
                  isFormValid 
                    ? 'bg-red-600 text-white shadow-md hover:bg-red-700' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Verify Login
              </button>
              <button 
                type="button" 
                className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-md hover:bg-gray-50 transition duration-150"
              >
                Forgot Password
              </button>
            </div>
            
            <p className="text-center text-xs text-gray-500">
              Having trouble signing in? You can read the guideline <a href="#" className="font-semibold text-gray-700 underline">here</a>
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8">
          <p className="text-[10px] text-gray-400">Version v2.1.1</p>
          <p className="text-[10px] text-gray-600 font-semibold mt-0.5">PT Telkom Indonesia (Persero) Tbk.</p>
          <p className="text-[10px] text-gray-400 mt-0.5">© 2026. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT PANEL: BRANDING (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 bg-[#FDF6F3] flex-col items-center justify-center p-12 relative h-full">
        <div className="relative w-[300px] h-[400px] mb-12 flex items-center justify-center mt-20">
          <div className="w-full h-full bg-[#E42E2C] rounded-t-[150px] shadow-lg absolute bottom-0"></div>
          
          <div className="absolute top-10 -left-16 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-bold text-gray-600 flex items-center gap-2 animate-pulse" style={{ animationDuration: '4s' }}>
            <Network size={16} className="text-red-500" /> OTDR App
          </div>
          <div className="absolute top-32 -right-12 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-bold text-gray-600 flex items-center gap-2 animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }}>
            <Server size={16} className="text-red-500" /> Core System
          </div>
          <div className="absolute bottom-24 -left-10 bg-white px-3 py-2 rounded-lg shadow-md text-xs font-bold text-gray-600 flex items-center gap-2 animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
            <LineChart size={16} className="text-red-500" /> Dashboard
          </div>
        </div>

        <div className="text-center max-w-2xl px-8 z-10 relative">
          <h1 className="text-3xl font-bold text-[#E42E2C] leading-snug mb-4">
            One-stop Destination Platform To Discover Numerous Of Application
          </h1>
          <h2 className="text-lg text-gray-700 font-semibold mb-3">
            Gateway Application to Discover Integrated System
          </h2>
          <p className="text-sm text-gray-500">
            Portal simplify the process of accessing numerous of applications by centralizing and organizing application accessibility in a single platform.
          </p>
        </div>
      </div>
    </div>
  );
}