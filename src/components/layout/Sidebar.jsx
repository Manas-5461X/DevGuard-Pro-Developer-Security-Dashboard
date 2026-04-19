import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, History, LogOut, BookOpen, Settings, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Scanner', path: '/scanner', icon: <Shield size={18} /> },
    { name: 'History', path: '/history', icon: <History size={18} /> },
  ];

  const docsItem = { name: 'Documentation', path: '/docs', icon: <BookOpen size={18} /> };

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  }

  const displayName = currentUser?.displayName || 'User Account';
  const userInitial = currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U');
  const displayEmail = currentUser?.email || 'user@devguard.pro';

  return (
    <aside className="w-[260px] flex-shrink-0 bg-[#0A0A0A] flex flex-col z-10 border-r border-[#262626]">
      {/* User Block like NXUS */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyber-primary flex items-center justify-center text-[#000] font-bold text-lg shrink-0">
            {userInitial}
          </div>
          <div className="overflow-hidden">
            <p className="text-[#F5F5F5] font-semibold text-[13px] truncate">{displayName}</p>
            <p className="text-[#737373] text-[9px] truncate tracking-wider">{displayEmail}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-6 overflow-y-auto pt-2">
        {/* Navigation Section */}
        <div>
          <h3 className="text-[#737373] text-[10px] font-bold tracking-[0.2em] uppercase px-3 mb-3">
            Core Protocol
          </h3>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-cyber-primary/10 text-cyber-primary'
                      : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/5'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Resources Section */}
        <div>
          <h3 className="text-[#737373] text-[10px] font-bold tracking-[0.2em] uppercase px-3 mb-3">
            Resources
          </h3>
          <div className="flex flex-col gap-1">
            <NavLink
              to={docsItem.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-cyber-primary/10 text-cyber-primary'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-white/5'
                }`
              }
            >
              {docsItem.icon}
              <span>{docsItem.name}</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Logout Actions */}
      <div className="p-4 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors text-[13px] font-medium"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
        <p className="text-center text-[10px] text-[#737373] mt-4 tracking-widest uppercase">
          DevGuard Pro V1.0
        </p>
      </div>
    </aside>
  );
}
