import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#4ADE80 1px, transparent 1px), linear-gradient(90deg, #4ADE80 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyber-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center max-w-lg">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-cyber-primary/10 border border-cyber-primary/20 flex items-center justify-center mx-auto mb-8">
          <Shield size={36} className="text-cyber-primary" />
        </div>

        {/* 404 Number */}
        <div className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#4ADE80] to-[#4ADE80]/20 leading-none mb-4 select-none tabular-nums">
          404
        </div>

        <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
          Sector Not Found
        </h1>
        <p className="text-[#737373] text-sm leading-relaxed mb-10">
          The security node you're looking for doesn't exist or has been classified. 
          Please verify the access path and try again.
        </p>

        {/* Error code badge */}
        <div className="inline-flex items-center gap-2 bg-cyber-error/10 border border-cyber-error/20 text-cyber-error text-xs font-mono px-4 py-2 rounded-full mb-10 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-cyber-error rounded-full animate-pulse" />
          ERR_ROUTE_NOT_FOUND
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 bg-cyber-primary text-black font-bold px-6 py-3 rounded-xl hover:bg-cyber-primary-hover transition-all text-sm uppercase tracking-widest"
          >
            <Home size={16} />
            Return to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 border border-[#262626] text-[#A3A3A3] hover:text-white hover:border-[#404040] font-medium px-6 py-3 rounded-xl transition-all text-sm"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
