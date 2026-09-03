import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Logika otentikasi akan disambungkan ke API Laravel nanti
    // Untuk saat ini, langsung arahkan ke Dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
            <Activity className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Infranexia</h1>
          <p className="text-sm text-gray-500">Masuk ke Dashboard OTDR</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Email/Username" 
            type="text" 
            placeholder="Masukkan email Anda" 
            required 
          />
          <Input 
            label="Kata Sandi" 
            type="password" 
            placeholder="Masukkan kata sandi" 
            required 
          />
          
          <Button type="submit" className="w-full">
            Masuk
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          © 2026 Infranexia - Telkomsel. All rights reserved.
        </p>
      </div>
    </div>
  );
}