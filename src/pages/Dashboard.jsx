import React, { useMemo } from 'react';
import { useScans } from '../hooks/useScans';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, FileCode2, History } from 'lucide-react';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { scans, loading, getStats } = useScans();
  
  const stats = useMemo(() => getStats(), [scans, getStats]);

  if (loading) {
    return <div className="text-cyber-primary flex items-center justify-center p-8 uppercase tracking-widest animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="border-b border-cyber-border pb-4 mb-8">
        <h1 className="text-2xl font-bold text-cyber-text tracking-widest mb-2 uppercase glow-text">Welcome, {currentUser?.email?.split('@')[0]}</h1>
        <p className="text-cyber-dark-text tracking-wider uppercase text-sm">Security posture overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="cyber-panel p-6 relative overflow-hidden group hover:border-cyber-primary transition-colors duration-300">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-cyber-border group-hover:text-cyber-primary/10 transition-colors opacity-40 group-hover:opacity-100">
            <History size={72} />
          </div>
          <div className="relative z-10">
            <p className="text-cyber-dark-text tracking-widest text-xs uppercase mb-1">Total Scans Executed</p>
            <h3 className="text-5xl font-bold text-cyber-primary mb-2 glow-text">{stats.totalScans}</h3>
            <p className="text-xs text-cyber-text tracking-widest uppercase opacity-70">Recorded in history</p>
          </div>
        </div>

        <div className="cyber-panel p-6 relative overflow-hidden group hover:border-[#ffcc00] transition-colors duration-300">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-cyber-border group-hover:text-[#ffcc00]/10 transition-colors opacity-40 group-hover:opacity-100">
            <FileCode2 size={72} />
          </div>
          <div className="relative z-10">
            <p className="text-cyber-dark-text tracking-widest text-xs uppercase mb-1">Total Issues Detected</p>
            <h3 className="text-5xl font-bold text-[#ffcc00] mb-2" style={{textShadow: '0 0 10px rgba(255,204,0,0.4)'}}>{stats.totalIssues}</h3>
            <p className="text-xs text-cyber-text tracking-widest uppercase opacity-70">Across all runs</p>
          </div>
        </div>

        <div className="cyber-panel p-6 border-cyber-error/30 relative overflow-hidden group hover:border-cyber-error transition-colors duration-300">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-cyber-border group-hover:text-cyber-error/10 transition-colors opacity-40 group-hover:opacity-100">
            <ShieldAlert size={72} />
          </div>
          <div className="relative z-10">
            <p className="text-cyber-error tracking-widest text-xs uppercase mb-1">Critical Violations</p>
            <h3 className="text-5xl font-bold text-cyber-error mb-2" style={{textShadow: '0 0 10px rgba(255,51,102,0.4)'}}>{stats.criticalIssues}</h3>
            <p className="text-xs text-cyber-error tracking-widest uppercase opacity-80">Immediate action required</p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-bold text-cyber-text mb-4 uppercase tracking-widest border-b border-cyber-border pb-2 flex items-center justify-between">
          <span>Recent Scans</span>
        </h2>
        {scans.length === 0 ? (
           <div className="cyber-panel p-8 text-center border-dashed border-cyber-border opacity-70">
             <p className="text-cyber-dark-text uppercase tracking-widest text-sm">No scans found. Navigate to the Scanner to get started.</p>
           </div>
        ) : (
          <div className="cyber-panel overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0a0f0d] text-cyber-dark-text text-xs uppercase tracking-widest border-b border-cyber-border">
                <tr>
                  <th className="font-bold p-4">Date</th>
                  <th className="font-bold p-4 text-center">Issues Found</th>
                  <th className="font-bold p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/50 text-sm">
                {scans.slice(0, 5).map(scan => (
                  <tr key={scan.id} className="hover:bg-cyber-primary/5 transition-colors">
                    <td className="p-4 text-cyber-text opacity-90">
                      {scan.createdAt ? new Date(scan.createdAt.toMillis()).toLocaleString() : 'JUST NOW'}
                    </td>
                    <td className="p-4 text-white font-bold text-center">
                      {scan.issueCount > 0 ? (
                        <span className="text-cyber-warning">{scan.issueCount}</span>
                      ) : (
                        <span className="text-cyber-dark-text">0</span>
                      )}
                    </td>
                    <td className="p-4">
                      {scan.issueCount > 0 ? (
                        <span className="border border-cyber-error text-cyber-error uppercase tracking-widest text-xs px-2 py-1 font-bold">Vulnerable</span>
                      ) : (
                        <span className="border border-cyber-primary text-cyber-primary uppercase tracking-widest text-xs px-2 py-1 font-bold">Secure</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

