import { createContext, useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Home, Sun, Moon, Globe } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import History from './pages/History';
import Login from './pages/auth/Login';
import Settings from './pages/Settings';
import FloatingChatbot from './components/FloatingChatbot';

// === 1. MEMBUAT GLOBAL CONTEXT (Untuk Tema & Bahasa) ===
export const AppContext = createContext();

// === KOMPONEN NAVIGASI HALAMAN (Sangat Rapi & Profesional) ===
const PageNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme, lang, setLang, t } = useContext(AppContext);
  const pathNames = location.pathname.split('/').filter(x => x);

  return (
    <div className="mb-6 sm:mb-8 animate-page mt-2">
      
      {/* BARIS 1: Tombol Back (Kiri) & Switchers (Kanan) */}
      <div className="flex items-center justify-between gap-4 mb-4">
        
        {/* Sisi Kiri: Tombol Back (Hanya muncul jika bukan di Dashboard) */}
        <div>
          {pathNames.length > 0 && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1A2332] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-900/50 rounded-full transition-all shadow-sm text-sm font-bold"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">{t('Kembali', 'Back')}</span>
            </button>
          )}
        </div>

        {/* Sisi Kanan: Switcher Bahasa & Tema */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1A2332] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all text-sm font-bold shadow-sm"
          >
            <Globe size={16} className="text-blue-500 dark:text-blue-400" />
            {lang === 'id' ? 'ID' : 'EN'}
          </button>

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 bg-white dark:bg-[#1A2332] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm"
            title={t('Ubah Tema', 'Toggle Theme')}
          >
            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-500" />}
          </button>
        </div>
      </div>

      {/* BARIS 2: Breadcrumbs (Garis bawah hanya ada di sini) */}
      <nav className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 overflow-x-auto hide-scrollbar whitespace-nowrap pb-4 border-b border-gray-100 dark:border-gray-800 w-full">
        <Link to="/" className="flex items-center gap-1.5 hover:text-red-600 dark:hover:text-red-400 transition-colors">
          <Home size={16} />
          <span>Dashboard</span>
        </Link>

        {pathNames.map((value, index) => {
          const to = `/${pathNames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathNames.length - 1;
          
          let title = value.charAt(0).toUpperCase() + value.slice(1);
          if (value === 'upload') title = t('Upload Data', 'Upload Data');
          if (value === 'history') title = t('Riwayat Kalkulasi', 'Calculation History');
          if (value === 'settings') title = t('Pengaturan Sistem', 'System Settings');

          return (
            <div key={to} className="flex items-center">
              <ChevronRight size={16} className="mx-2 text-gray-400 dark:text-gray-600 shrink-0" />
              {isLast ? (
                <span className="text-gray-800 dark:text-gray-200 font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">{title}</span>
              ) : (
                <Link to={to} className="hover:text-red-600 dark:hover:text-red-400 transition-colors">{title}</Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

// === KOMPONEN PELINDUNG HALAMAN (LAYOUT UTAMA) ===
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-[#FDFDFD] dark:bg-[#0B1120] font-sans text-gray-800 dark:text-gray-200 selection:bg-red-200 dark:selection:bg-red-900 transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 relative flex flex-col overflow-hidden">
        
        {/* MOBILE TOP HEADER (Perbaikan Logo Dark Mode) */}
        <div className="md:hidden h-16 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-center sticky top-0 z-30 shadow-sm shrink-0 transition-colors">
           <div className="dark:bg-white/95 dark:px-3 dark:py-1.5 dark:rounded-xl dark:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all flex items-center justify-center">
             <img src="https://i.ibb.co.com/pjrL2fjV/logo-infranexia.png" alt="Infranexia" className="h-6 object-contain transition-all" />
           </div>
        </div>

        {/* AREA KONTEN UTAMA */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-8 lg:p-10 pb-20">
          <div className="max-w-6xl mx-auto w-full relative">
            <PageNavigation />
            {children}
          </div>
        </div>
      </main>

      <FloatingChatbot />
    </div>
  );
};

// === ROUTING & PROVIDER UTAMA ===
export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'id');

  // Menjalankan Perubahan Tema
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Menyimpan Perubahan Bahasa
  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  // Fungsi Penerjemah Sederhana: t('Teks Indo', 'Teks Inggris')
  const t = (idText, enText) => {
    return lang === 'id' ? idText : enText;
  };

  return (
    <AppContext.Provider value={{ theme, setTheme, lang, setLang, t }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </AppContext.Provider>
  );
}