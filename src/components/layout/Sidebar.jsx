import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, History, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Scanner', path: '/scanner', icon: <Shield size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
    { name: 'Docs', path: '/docs', icon: <BookOpen size={20} /> },
  ];

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  }

  return (
    <aside className="w-64 flex-shrink-0 cyber-panel flex flex-col z-10 border-r border-t-0 border-b-0 border-l-0 shadow-[4px_0_30px_rgba(0,255,102,0.02)]">
      <div className="p-6 flex items-center gap-4 border-b border-cyber-border">
        <div className="flex items-center justify-center bg-cyber-primary/10 border border-cyber-primary p-2">
          <Shield className="text-cyber-primary glow-text" size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-widest text-white glow-text uppercase">DevGuard<span className="text-cyber-primary">Pro</span></h1>
      </div>
      
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm border-l-2 transition-all duration-300 ${
                isActive
                  ? 'bg-cyber-primary/10 border-cyber-primary text-cyber-primary shadow-[inset_4px_0_15px_rgba(0,255,102,0.1)]'
                  : 'border-transparent text-cyber-dark-text hover:text-cyber-primary hover:border-cyber-primary/30 hover:bg-cyber-primary/5'
              }`
            }
          >
            {item.icon}
            <span className="tracking-widest font-medium uppercase">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-cyber-border">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 px-4 py-3 border border-cyber-border text-cyber-dark-text hover:text-cyber-error hover:border-cyber-error/50 hover:bg-cyber-error/10 transition-colors uppercase text-sm tracking-widest"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

