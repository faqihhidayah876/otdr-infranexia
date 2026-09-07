import { useState } from 'react';
import { Globe, Moon, Sun, Info, Shield, FileText, Check } from 'lucide-react';

export default function Settings() {
  const [language, setLanguage] = useState('id');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="animate-page space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h2>
        <p className="text-gray-500 mt-1 text-sm md:text-base">Kelola preferensi bahasa, tampilan, dan informasi sistem Infranexia OTDR.</p>
      </div>

      {savedMessage && (
        <div className="p-4 bg-green-100 text-green-700 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in">
          <Check size={18} /> Pengaturan berhasil disimpan!
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-3">Preferensi Umum</h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Globe size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Bahasa Sistem</p>
                <p className="text-xs text-gray-500">Pilih bahasa antarmuka aplikasi</p>
              </div>
            </div>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English (US)</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <p className="font-semibold text-gray-800">Mode Tampilan</p>
                <p className="text-xs text-gray-500">Sesuaikan tema terang atau gelap</p>
              </div>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                isDarkMode ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {isDarkMode ? '🌙 Mode Gelap Aktif' : '☀️ Mode Terang Aktif'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-3">Sistem & Legalitas</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                <Info size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Versi Sistem</p>
                <p className="text-xs text-gray-500">Build stabil terkini</p>
              </div>
            </div>
            <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">v2.1.1-enterprise</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Shield size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Kebijakan Privasi</p>
                <p className="text-xs text-gray-500">Perlindungan data dan telemetri jaringan</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-red-600 hover:underline">Lihat Detail</button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Syarat & Ketentuan</p>
                <p className="text-xs text-gray-500">Ketentuan penggunaan platform Infranexia</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-red-600 hover:underline">Lihat Detail</button>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-red-600/20 cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}