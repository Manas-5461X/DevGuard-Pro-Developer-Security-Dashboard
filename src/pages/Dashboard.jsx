import React, { useMemo } from 'react';
import { useScans } from '../hooks/useScans';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, FileCode2, History, RefreshCw, Shield } from 'lucide-react';

function LoadingBar() {
  return (
    <div className="flex items-center gap-2 text-[#525252] text-xs mb-6 animate-pulse">
      <RefreshCw size={12} className="animate-spin" />
      <span>Syncing your security data...</span>
    </div>
  );
}

function FirstLoadScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-5">
      <div className="relative">
        <Shield size={40} className="text-cyber-primary/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyber-primary/20 border-t-cyber-primary rounded-full animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-white font-semibold text-sm mb-1">Loading Security Dashboard</p>
        <p className="text-[#525252] text-xs">Fetching your scan history from the cloud...</p>
      </div>
      {/* Shimmer skeleton preview */}
      <div className="w-full max-w-4xl mt-4 space-y-4 px-4">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-[#121212] border border-[#1A1A1A] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_1.5s_infinite]" style={{ animationDelay: `${i * 0.2}s` }} />
            </div>
          ))}
        </div>
        <div className="h-48 rounded-xl bg-[#121212] border border-[#1A1A1A] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { scans, loading, refreshing, getStats } = useScans();
  
  const stats = useMemo(() => getStats(), [scans, getStats]);
  const bookmarkedScans = useMemo(() => scans.filter(s => s.isBookmarked), [scans]);

  // Only show the full loading screen on absolute first load (no cached data)
  if (loading) {
    return <FirstLoadScreen />;
  }

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Developer';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Subtle refresh indicator */}
      {refreshing && <LoadingBar />}

      <div className="border-b border-[#262626] pb-4 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Welcome, {displayName}</h1>
        <p className="text-[#737373] text-sm">Security posture overview · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
        <div className="bg-[#0D1A12] border border-cyber-primary/20 rounded-2xl p-6 relative overflow-hidden group hover:border-cyber-primary/50 transition-colors duration-300">
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-cyber-primary/5 group-hover:text-cyber-primary/10 transition-colors">
            <History size={72} />
          </div>
          <div className="relative z-10">
            <p className="text-[#737373] text-xs uppercase tracking-widest mb-2 font-semibold">Total Scans</p>
            <h3 className="text-5xl font-bold text-cyber-primary mb-1" style={{ textShadow: '0 0 20px rgba(74,222,128,0.3)' }}>{stats.totalScans}</h3>
            <p className="text-[#525252] text-xs font-medium">Recorded in history</p>
          </div>
        </div>

        <div className="bg-[#1A150A] border border-[#f59e0b]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#f59e0b]/50 transition-colors duration-300">
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[#f59e0b]/5 group-hover:text-[#f59e0b]/10 transition-colors">
            <FileCode2 size={72} />
          </div>
          <div className="relative z-10">
            <p className="text-[#737373] text-xs uppercase tracking-widest mb-2 font-semibold">Total Issues</p>
            <h3 className="text-5xl font-bold text-[#f59e0b] mb-1" style={{ textShadow: '0 0 20px rgba(245,158,11,0.3)' }}>{stats.totalIssues}</h3>
            <p className="text-[#525252] text-xs font-medium">Across all runs</p>
          </div>
        </div>

        <div className="bg-[#1A0A0A] border border-cyber-error/20 rounded-2xl p-6 relative overflow-hidden group hover:border-cyber-error/50 transition-colors duration-300">
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-cyber-error/5 group-hover:text-cyber-error/10 transition-colors">
            <ShieldAlert size={72} />
          </div>
          <div className="relative z-10">
            <p className="text-cyber-error/70 text-xs uppercase tracking-widest mb-2 font-semibold">Critical Violations</p>
            <h3 className="text-5xl font-bold text-cyber-error mb-1" style={{ textShadow: '0 0 20px rgba(239,68,68,0.3)' }}>{stats.criticalIssues}</h3>
            <p className="text-[#525252] text-xs font-medium">Immediate action required</p>
          </div>
        </div>
      </div>

      {/* Bookmarked Scans */}
      <div className="mt-10 pt-8 border-t border-[#1A1A1A]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white tracking-tight">Bookmarked Scans</h2>
          <span className="text-xs text-[#525252] bg-[#121212] border border-[#1A1A1A] px-3 py-1 rounded-full">
            {bookmarkedScans.length} saved
          </span>
        </div>

        {bookmarkedScans.length === 0 ? (
          <div className="border border-dashed border-[#262626] rounded-2xl p-10 text-center">
            <p className="text-[#525252] text-sm">No bookmarked scans yet.</p>
            <p className="text-[#404040] text-xs mt-1">Pin a scan from the Scanner or History page to see it here.</p>
          </div>
        ) : (
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1A1A1A]">
                  <th className="text-[#525252] font-semibold text-[10px] uppercase tracking-widest p-4">Snippet</th>
                  <th className="text-[#525252] font-semibold text-[10px] uppercase tracking-widest p-4 text-center">Issues</th>
                  <th className="text-[#525252] font-semibold text-[10px] uppercase tracking-widest p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {bookmarkedScans.slice(0, 5).map(scan => (
                  <tr key={scan.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium text-sm">{scan.title}</p>
                      <p className="text-[#525252] text-[11px] mt-0.5">
                        {scan.createdAt ? new Date(scan.createdAt.toMillis()).toLocaleString() : 'Just now'}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-bold text-sm ${scan.issueCount > 0 ? 'text-[#f59e0b]' : 'text-[#525252]'}`}>
                        {scan.issueCount}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {scan.issueCount > 0 ? (
                        <span className="text-cyber-error text-[10px] font-bold uppercase tracking-widest bg-cyber-error/10 px-2 py-1 rounded-full">Vulnerable</span>
                      ) : (
                        <span className="text-cyber-primary text-[10px] font-bold uppercase tracking-widest bg-cyber-primary/10 px-2 py-1 rounded-full">Secure</span>
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
