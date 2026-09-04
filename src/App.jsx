import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import History from './pages/History';
import FloatingChatbot from './components/FloatingChatbot';

function App() {
  return (
    /* Background Gradien Halus sebagai kanvas Glassmorphism (Tanpa bungkus <Router> lagi) */
    <div className="flex min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#fee2e2] font-sans text-gray-800 selection:bg-red-200">
      
      <Sidebar />
      
      <main className="flex-1 relative overflow-x-hidden">
        <div className="h-full overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
      </main>

      {/* Pasang Chatbot di luar Main Content agar menimpa seluruh elemen */}
      <FloatingChatbot />
    </div>
  );
}

export default App;