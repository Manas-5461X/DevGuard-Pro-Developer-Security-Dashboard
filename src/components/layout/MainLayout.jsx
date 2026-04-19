import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NameModal from '../ui/NameModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  return (
    <div className="flex h-screen bg-[#0A0A0A] text-[#E5E5E5] font-sans overflow-hidden relative">
      <Sidebar isCollapsed={isCollapsed} />
      
      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute top-1/2 -translate-y-1/2 z-[51] w-6 h-12 bg-[#121212] border border-[#262626] rounded-full flex items-center justify-center text-cyber-primary hover:bg-[#1A1A1A] transition-all duration-300 hidden lg:flex ${isCollapsed ? 'left-[78px]' : 'left-[248px]'}`}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full transition-all duration-300">
        <Outlet />
      </main>
      <NameModal />
    </div>
  );
}
