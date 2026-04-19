import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, History, LogOut, BookOpen, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

export default function Sidebar({ isCollapsed, isMobileOpen, onMobileClose }) {
  const { logout, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} />, exact: true },
    { name: 'Scanner', path: '/scanner', icon: <Shield size={18} /> },
    { name: 'History', path: '/history', icon: <History size={18} /> },
    { name: 'Documentation', path: '/docs', icon: <BookOpen size={18} /> },
  ];

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  }

  const displayName = currentUser?.displayName || 'User';
  const userInitial = displayName ? displayName.charAt(0).toUpperCase() : 'U';
  const displayEmail = currentUser?.email || '';

  // Shared nav link component
  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      end={item.exact}
      onClick={onMobileClose}
      title={isCollapsed ? item.name : ''}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${
          isActive
            ? 'bg-cyber-primary/10 text-cyber-primary'
            : 'text-cyber-dark-text hover:text-cyber-text hover:bg-cyber-surface-hover'
        } ${isCollapsed ? 'justify-center' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyber-primary rounded-full" />
          )}
          <span className={isActive ? 'text-cyber-primary' : 'text-cyber-dark-text group-hover:text-cyber-text'}>
            {item.icon}
          </span>
          {!isCollapsed && <span className="truncate">{item.name}</span>}
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile sidebar (fixed overlay) */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 w-[260px] bg-cyber-bg border-r border-cyber-border
        flex flex-col transition-transform duration-300 ease-in-out
        lg:hidden
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent
          navItems={navItems}
          NavItem={NavItem}
          displayName={displayName}
          userInitial={userInitial}
          displayEmail={displayEmail}
          handleLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          isCollapsed={false}
          showClose={true}
          onClose={onMobileClose}
        />
      </aside>

      {/* Desktop sidebar (sticky left panel) */}
      <aside className={`
        hidden lg:flex flex-col flex-shrink-0 h-full border-r border-cyber-border
        bg-cyber-bg transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[72px]' : 'w-[256px]'}
      `}>
        <SidebarContent
          navItems={navItems}
          NavItem={NavItem}
          displayName={displayName}
          userInitial={userInitial}
          displayEmail={displayEmail}
          handleLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          isCollapsed={isCollapsed}
          showClose={false}
        />
      </aside>
    </>
  );
}

function SidebarContent({ navItems, NavItem, displayName, userInitial, displayEmail, handleLogout, theme, toggleTheme, isCollapsed, showClose, onClose }) {
  return (
    <>
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-cyber-border ${isCollapsed ? 'justify-center' : ''}`}>
        {showClose && (
          <button onClick={onClose} className="mr-auto text-cyber-dark-text hover:text-cyber-text transition-colors p-1">
            <X size={18} />
          </button>
        )}
        {!isCollapsed && !showClose && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyber-primary/20 border border-cyber-primary/30 flex items-center justify-center">
              <Shield size={14} className="text-cyber-primary" />
            </div>
            <span className="text-cyber-text font-bold text-sm tracking-tight">DevGuard</span>
            <span className="text-cyber-primary font-bold text-sm tracking-tight">Pro</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-xl bg-cyber-primary/20 border border-cyber-primary/30 flex items-center justify-center">
            <Shield size={15} className="text-cyber-primary" />
          </div>
        )}
      </div>

      {/* User profile */}
      <div className={`px-3 py-4 border-b border-cyber-border ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center gap-3 ${isCollapsed ? '' : 'px-1'}`}>
          <div className="w-9 h-9 rounded-xl bg-cyber-primary flex items-center justify-center text-black font-bold text-sm shrink-0 shadow-[0_0_12px_rgba(74,222,128,0.15)]">
            {userInitial}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-cyber-text font-semibold text-[13px] truncate">{displayName}</p>
              <p className="text-cyber-dark-text text-[10px] truncate">{displayEmail}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <p className="text-cyber-dark-text/30 text-[10px] font-semibold uppercase tracking-[0.15em] px-3 mb-3">Navigation</p>
        )}
        {navItems.map(item => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className={`px-3 py-4 border-t border-cyber-border space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <button
          onClick={toggleTheme}
          title={isCollapsed ? `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode` : ''}
          className={`flex items-center gap-2 text-cyber-dark-text hover:text-cyber-primary hover:bg-cyber-primary/10 rounded-xl transition-all text-[13px] font-medium ${isCollapsed ? 'w-10 h-10 justify-center' : 'w-full px-3 py-2.5'}`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Sign Out' : ''}
          className={`flex items-center gap-2 text-cyber-dark-text hover:text-cyber-error hover:bg-cyber-error/10 rounded-xl transition-all text-[13px] font-medium ${isCollapsed ? 'w-10 h-10 justify-center' : 'w-full px-3 py-2.5'}`}
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
        {!isCollapsed && (
          <p className="text-cyber-dark-text/40 text-[9px] text-center mt-4 tracking-widest uppercase">DevGuard Pro v1.0</p>
        )}
      </div>
    </>
  );
}
