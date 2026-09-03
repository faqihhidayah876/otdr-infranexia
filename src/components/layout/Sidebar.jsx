import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, Clock, Activity } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Upload Data', icon: Upload },
    { to: '/history', label: 'History', icon: Clock },
  ];

  return (
    <aside className="w-64 bg-red-600 h-screen fixed left-0 top-0 flex flex-col text-white shadow-xl z-20">
      <div className="flex items-center gap-3 p-6 border-b border-red-500">
        <Activity className="text-white" size={28} />
        <div>
          <h1 className="font-bold text-xl tracking-wide leading-tight">Infranexia</h1>
          <p className="text-xs text-red-200">OTDR Dashboard</p>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                    isActive 
                      ? 'bg-white text-red-600 shadow-md' 
                      : 'text-red-100 hover:bg-red-700 hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}