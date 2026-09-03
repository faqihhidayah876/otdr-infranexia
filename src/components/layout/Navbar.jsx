import { Bell, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-6">
        <button className="text-gray-400 hover:text-red-600 relative transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-px h-6 bg-gray-200"></div>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
            <User size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700 leading-none">Admin</span>
            <span className="text-xs text-gray-500 mt-1">Teknisi Infranexia</span>
          </div>
        </div>
      </div>
    </header>
  );
}