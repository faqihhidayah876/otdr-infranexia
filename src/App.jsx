import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import History from './pages/History';
import Login from './pages/auth/Login';
import FloatingChatbot from './components/FloatingChatbot';
import Settings from './pages/Settings';

// Komponen Pelindung Halaman
const ProtectedRoute = ({ children }) => {
  // Mengecek apakah sudah login (sementara menggunakan localStorage)
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#fee2e2] font-sans text-gray-800 selection:bg-red-200">
      <Sidebar />
      <main className="flex-1 relative overflow-x-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
      <FloatingChatbot />
    </div>
  );
};

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