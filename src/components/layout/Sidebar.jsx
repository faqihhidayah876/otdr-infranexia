import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, History, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', name: 'Upload Data', icon: UploadCloud },
    { path: '/history', name: 'History', icon: History },
  ];

  return (
    <>
      {/* Tombol Hamburger untuk Mobile */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-gray-200 text-red-600"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay Gelap saat menu terbuka di Mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Area Sidebar Utama */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-white/40 backdrop-blur-xl border-r border-white/60 h-screen flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]
      `}>
        {/* Logo Infranexia (Tanpa efek hover) */}
        <div className="px-8 py-8 border-b border-gray-200/50 flex justify-center mt-12 md:mt-0">
          <img 
            src="https://i.ibb.co.com/pjrL2fjV/logo-infranexia.png" 
            alt="Infranexia Logo" 
            className="h-12 w-auto object-contain drop-shadow-sm" 
          />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)} // Tutup menu saat diklik di HP
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20' 
                    : 'text-gray-600 hover:bg-white/60 hover:text-red-600'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Profil User */}
        <div className="p-4 m-4 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-red-700 flex items-center justify-center text-white font-bold shadow-inner shrink-0">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-800 truncate">Admin</p>
            <p className="text-xs text-gray-500 truncate">Teknisi Infranexia</p>
          </div>
        </div>
      </div>
    </>
  );
}