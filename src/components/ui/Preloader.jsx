import React from 'react';
import { Shield } from 'lucide-react';

export default function Preloader() {
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] z-[9999] flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-2xl md:rounded-[2rem] bg-cyber-primary/10 blur-xl animate-pulse"></div>
        <div className="relative bg-[#121212] p-4 rounded-2xl border border-[#262626] shadow-2xl overflow-hidden">
             {/* Scanner line going down */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyber-primary shadow-[0_0_10px_#4ADE80] animate-[scan_2s_ease-in-out_infinite]"></div>
            <Shield size={48} className="text-cyber-primary" strokeWidth={1.5} />
        </div>
      </div>
      
      <h1 className="text-base font-bold tracking-[0.3em] text-[#E5E5E5] uppercase flex items-center gap-2">
        DevGuard<span className="text-cyber-primary">Pro</span>
      </h1>
      
      <p className="mt-4 text-[#737373] text-xs tracking-widest uppercase animate-pulse">
        Initializing Security Environment...
      </p>


    </div>
  );
}
