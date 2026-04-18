import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, History, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'DASHBOARD', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'SCANNER', path: '/scanner', icon: <Shield size={18} /> },
    { name: 'HISTORY', path: '/history', icon: <History size={18} /> },
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
    <header className="h-16 flex-shrink-0 cyber-panel !border-t-0 !border-l-0 !border-r-0 border-b flex items-center justify-between px-6 z-10 shadow-[0_4px_30px_rgba(0,255,102,0.05)]">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center bg-cyber-primary/10 border border-cyber-primary p-2">
          <Shield className="text-cyber-primary glow-text" size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-widest text-white glow-text uppercase">DevGuard<span className="text-cyber-primary">Pro</span></h1>
      </div>
      
      <nav className="hidden md:flex items-center gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-6 py-2 text-sm border transition-all duration-300 ${
                isActive
                  ? 'bg-cyber-primary/10 border-cyber-primary text-cyber-primary shadow-[0_0_15px_rgba(0,255,102,0.2)]'
                  : 'border-transparent text-cyber-dark-text hover:text-cyber-primary hover:border-cyber-primary/30 hover:bg-cyber-primary/5'
              }`
            }
          >
            {item.icon}
            <span className="tracking-widest font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div className="h-4 w-px bg-cyber-border hidden md:block"></div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 border border-cyber-border text-cyber-dark-text hover:text-cyber-error hover:border-cyber-error/50 hover:bg-cyber-error/10 transition-colors uppercase text-sm tracking-widest"
        >
          <LogOut size={16} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
}

