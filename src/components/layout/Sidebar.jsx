import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, History, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Scanner', path: '/scanner', icon: <Shield size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
  ];

  return (
    <aside className="w-64 bg-[#252526] border-r border-[#3c3c3c] flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-[#3c3c3c]">
        <Shield className="text-blue-500" size={28} />
        <h1 className="text-xl font-bold tracking-tight">DevGuard Pro</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600/10 text-blue-500 font-medium'
                  : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#3c3c3c]">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-400 hover:bg-[#2a2d2e] hover:text-white w-full">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
