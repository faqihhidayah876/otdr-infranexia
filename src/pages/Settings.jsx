import { useState, useContext } from 'react';
import { Globe, Moon, Sun, Info, Shield, Check } from 'lucide-react';
import { AppContext } from '../App'; // Mengambil Context

export default function Settings() {
  // Ambil state global dari App.jsx
  const { theme, setTheme, lang, setLang, t } = useContext(AppContext);
  const [savedMessage, setSavedMessage] = useState(false);

  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="animate-page space-y-8 dark:text-white transition-colors duration-300">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t('Pengaturan Sistem', 'System Settings')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base">
          {t('Kelola preferensi bahasa, tema tampilan, dan informasi legalitas sistem.', 'Manage language preferences, display themes, and system legality information.')}
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in">
          <Check size={18} /> {t('Pengaturan berhasil disimpan!', 'Settings successfully saved!')}
        </div>
      )}

      <div className="space-y-6 max-w-4xl">
        
        {/* KARTU 1: PREFERENSI TAMPILAN */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
            {t('Preferensi Antarmuka', 'Interface Preferences')}
          </h3>
          
          <div className="space-y-6">
            {/* Mode Terang / Gelap */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-purple-50 text-purple-600'}`}>
                  {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-base">{t('Tema Tampilan', 'Display Theme')}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('Lindungi mata Anda saat bekerja di ruang server', 'Protect your eyes while working in the server room')}</p>
                </div>
              </div>
              
              <button onClick={toggleTheme} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition duration-300 shadow-md ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Bahasa Sistem */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Globe size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-base">{t('Bahasa Sistem', 'System Language')}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('Pilih bahasa pengantar aplikasi', 'Select application language')}</p>
                </div>
              </div>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors cursor-pointer"
              >
                <option value="id">🇮🇩 Bahasa Indonesia</option>
                <option value="en">🇬🇧 English (US)</option>
              </select>
            </div>
          </div>
        </div>

        {/* KARTU 2: SISTEM & LEGALITAS */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors duration-300">
           {/* ... (Sistem & Legalitas tidak perlu diubah, tetap sama) ... */}
           <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">{t('Sistem & Legalitas', 'System & Legality')}</h3>
           <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center"><Info size={24} /></div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{t('Versi Sistem', 'System Version')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('Build stabil terkini', 'Latest stable build')}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}