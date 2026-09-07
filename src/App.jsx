import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import History from './pages/History';
import Login from './pages/auth/Login';
import Settings from './pages/Settings';
import FloatingChatbot from './components/FloatingChatbot';

// === KOMPONEN HEADER NAVIGASI (BACK & BREADCRUMBS) - VERSI MODERN ===
const TopHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathNames = location.pathname.split('/').filter(x => x);

  return (
    // Header dengan efek kaca (glassmorphism)
    <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-lg border-b border-gray-100 flex items-center h-16 pl-16 md:pl-8 pr-4">
      {/* Tombol Back Bulat Estetik */}
      <button 
        onClick={() => navigate(-1)} 
        className="w-9 h-9 flex items-center justify-center mr-3 bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-full transition-all shadow-sm shrink-0"
        title="Kembali"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Breadcrumbs Modern */}
      <nav className="flex items-center text-xs sm:text-sm font-medium text-gray-500 overflow-x-auto hide-scrollbar whitespace-nowrap">
        <Link to="/" className="flex items-center gap-1.5 hover:text-red-600 transition-colors">
          <Home size={16} />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        
        {pathNames.map((value, index) => {
          const to = `/${pathNames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathNames.length - 1;
          
          let title = value.charAt(0).toUpperCase() + value.slice(1);
          if (value === 'upload') title = 'Upload Data';
          if (value === 'history') title = 'Riwayat Kalkulasi';
          if (value === 'settings') title = 'Pengaturan Sistem';

          return (
            <div key={to} className="flex items-center">
              <ChevronRight size={14} className="mx-1 sm:mx-2 text-gray-300 shrink-0" />
              {isLast ? (
                <span className="text-gray-900 font-bold bg-gray-100/50 px-2 py-1 rounded-md">{title}</span>
              ) : (
                <Link to={to} className="hover:text-red-600 transition-colors">{title}</Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

// === KOMPONEN PELINDUNG HALAMAN (LAYOUT UTAMA) - VERSI MODERN ===
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-[#FDFDFD] font-sans text-gray-800 selection:bg-red-200">
      <Sidebar />
      <main className="flex-1 relative flex flex-col overflow-hidden">
        <TopHeader />
        
        {/* Area konten dengan padding yang rapi dan batas lebar maksimal */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 lg:px-10 pb-20">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      <FloatingChatbot />
    </div>
  );
};

// === ROUTING UTAMA ===
function App() {
  return (
    <Routes>
      {/* Rute Publik */}
      <Route path="/login" element={<Login />} />

      {/* Rute Privat (Terkunci) */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;