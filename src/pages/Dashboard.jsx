import React, { useMemo } from 'react';
import { useScans } from '../hooks/useScans';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, FileCode2, History } from 'lucide-react';
import { DashboardSkeleton } from '../components/ui/Skeleton';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { scans, loading, getStats } = useScans();
  
  const stats = useMemo(() => getStats(), [scans, getStats]);
  const bookmarkedScans = useMemo(() => scans.filter(s => s.isBookmarked), [scans]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="border-b border-[#262626] pb-4 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome, {currentUser?.displayName || currentUser?.email?.split('@')[0]}</h1>
        <p className="text-[#A3A3A3] text-sm tracking-wide">Security posture overview.</p>
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
        <h2 className="text-lg font-bold text-white mb-6 tracking-tight flex items-center justify-between">
          <span>Bookmarked Scans (Executive Summary)</span>
        </h2>
        {bookmarkedScans.length === 0 ? (
           <div className="cyber-panel p-8 text-center border-dashed border-[#262626] opacity-70">
             <p className="text-[#737373] text-sm">No bookmarked scans found. Pin an audit log from the Scanner or History to see it here.</p>
           </div>
        ) : (
          <div className="cyber-panel overflow-hidden border-[#262626]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#000] text-[#737373] text-[10px] uppercase tracking-[0.2em] border-b border-[#262626]">
                <tr>
                  <th className="font-bold p-4">Date / Source</th>
                  <th className="font-bold p-4 text-center">Issues Found</th>
                  <th className="font-bold p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]/50 text-[13px]">
                {bookmarkedScans.slice(0, 5).map(scan => (
                  <tr key={scan.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="text-[#F5F5F5] font-medium">{scan.title}</p>
                      <p className="text-[#737373] text-[11px] mt-0.5">{scan.createdAt ? new Date(scan.createdAt.toMillis()).toLocaleString() : 'JUST NOW'}</p>
                    </td>
                    <td className="p-4 text-white font-bold text-center">
                      {scan.issueCount > 0 ? (
                        <span className="text-cyber-warning">{scan.issueCount}</span>
                      ) : (
                        <span className="text-[#737373]">0</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {scan.issueCount > 0 ? (
                        <span className="text-cyber-error uppercase tracking-widest text-[10px] font-bold">Vulnerable</span>
                      ) : (
                        <span className="text-cyber-primary uppercase tracking-widest text-[10px] font-bold">Secure</span>
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

