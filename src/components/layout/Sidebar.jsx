import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, History, Menu, X, Settings, LogOut, HelpCircle, AlertTriangle } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', name: 'Upload Data', icon: UploadCloud },
    { path: '/history', name: 'History', icon: History },
  ];

  // Menutup menu pop-up jika diklik di luar area menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConfirmLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <>
      {/* Tombol Hamburger untuk Mobile */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2 bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-gray-200 text-red-600"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay Gelap */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Area Sidebar Utama */}
      <div className={`
        fixed md:sticky top-0 left-0 z-50 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-white/95 md:bg-white/40 backdrop-blur-xl border-r border-gray-200 md:border-white/60 h-[100dvh] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.05)]
      `}>
        {/* Logo */}
        <div className="px-8 py-8 border-b border-gray-200/50 flex justify-center mt-12 md:mt-0 shrink-0">
          <img 
            src="https://i.ibb.co.com/pjrL2fjV/logo-infranexia.png" 
            alt="Infranexia Logo" 
            className="h-12 w-auto object-contain drop-shadow-sm" 
          />
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20' 
                    : 'text-gray-600 hover:bg-white/80 hover:text-red-600'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* PROFIL USER DI KIRI BAWAH (Bisa diklik untuk Pop-up) */}
        <div className="relative p-4 m-4 shrink-0 mt-auto" ref={menuRef}>
          
          {/* POP-UP MENU (Muncul saat profil diklik) */}
          {showMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => { setShowMenu(false); navigate('/settings'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors font-medium text-left"
              >
                <Settings size={18} className="text-gray-400" />
                <span>Settings</span>
              </button>

              <button 
                onClick={() => { setShowMenu(false); }} // Kosong dahulu sesuai permintaan
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors font-medium text-left"
              >
                <HelpCircle size={18} className="text-gray-400" />
                <span>Bantuan & Masukan</span>
              </button>

              <div className="h-px bg-gray-100 my-1"></div>

              <button 
                onClick={() => { setShowMenu(false); setShowLogoutModal(true); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Tombol Profil Utama */}
          <div 
            onClick={() => setShowMenu(!showMenu)}
            className="bg-white/80 hover:bg-white backdrop-blur-md border border-gray-200 md:border-white/50 rounded-2xl p-3 flex items-center gap-3 shadow-sm cursor-pointer transition-all hover:shadow-md select-none group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-red-700 flex items-center justify-center text-white font-bold shadow-inner shrink-0">
              AD
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-gray-800 truncate group-hover:text-red-600 transition-colors">Admin</p>
              <p className="text-xs text-gray-500 truncate">Teknisi Infranexia</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Konfirmasi Keluar</h3>
              <p className="text-sm text-gray-500 mt-1">Apakah yakin ingin keluar dari sistem?</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
              >
                Tidak
              </button>
              <button 
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-md shadow-red-600/20"
              >
                Iya
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}