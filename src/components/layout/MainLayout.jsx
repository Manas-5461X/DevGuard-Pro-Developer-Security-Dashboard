import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NameModal from '../ui/NameModal';
import { Menu, X } from 'lucide-react';

export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu on route change (when Outlet content changes)
  useEffect(() => {
    setIsMobileOpen(false);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setIsMobileOpen(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-[#E5E5E5] font-sans overflow-hidden relative">
      
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Desktop Sidebar Toggle (floating pill) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-30 w-5 h-10 bg-[#1A1A1A] border border-[#303030] rounded-full items-center justify-center text-[#737373] hover:text-cyber-primary hover:border-cyber-primary/50 transition-all duration-300 ${isCollapsed ? 'left-[68px]' : 'left-[248px]'}`}
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
          {isCollapsed
            ? <path d="M2 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            : <path d="M6 2L2 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          }
        </svg>
      </button>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto w-full min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#1A1A1A]">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#262626] text-[#A3A3A3] hover:text-white hover:bg-white/5 transition-all"
          >
            <Menu size={18} />
          </button>
          <span className="text-white font-bold tracking-tight text-sm">DevGuard Pro</span>
        </div>

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      <NameModal />
    </div>
  );
}
