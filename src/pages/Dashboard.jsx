import React, { useMemo } from 'react';
import { useScans } from '../hooks/useScans';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, FileCode2, History } from 'lucide-react';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { scans, loading, getStats } = useScans();
  
  const stats = useMemo(() => getStats(), [scans, getStats]);

  if (loading) {
    return <div className="text-white flex items-center justify-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome, {currentUser?.email?.split('@')[0]}</h1>
        <p className="text-gray-400">Here's an overview of your code security posture.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-[#252526] border border-[#3c3c3c] rounded-xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-[#3c3c3c] group-hover:text-blue-500/20 transition-colors">
            <History size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 font-medium mb-1">Total Scans</p>
            <h3 className="text-4xl font-bold text-white mb-2">{stats.totalScans}</h3>
            <p className="text-sm text-blue-400 font-medium">Recorded in history</p>
          </div>
        </div>

        <div className="bg-[#252526] border border-[#3c3c3c] rounded-xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-[#3c3c3c] group-hover:text-yellow-500/20 transition-colors">
            <FileCode2 size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 font-medium mb-1">Total Issues Found</p>
            <h3 className="text-4xl font-bold text-white mb-2">{stats.totalIssues}</h3>
            <p className="text-sm text-yellow-400 font-medium">Across all scans</p>
          </div>
        </div>

        <div className="bg-[#252526] border border-red-500/30 rounded-xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-[#3c3c3c] group-hover:text-red-500/20 transition-colors">
            <ShieldAlert size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-red-400 font-medium mb-1">Critical Vulnerabilities</p>
            <h3 className="text-4xl font-bold text-white mb-2">{stats.criticalIssues}</h3>
            <p className="text-sm text-red-500 font-medium">Requires immediate action</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-[#3c3c3c]">
        <h2 className="text-xl font-bold text-white mb-4">Recent Scans</h2>
        {scans.length === 0 ? (
           <div className="bg-[#252526] border border-[#3c3c3c] rounded-xl p-8 text-center">
             <p className="text-gray-400">No scans found. Navigate to the Scanner to get started.</p>
           </div>
        ) : (
          <div className="bg-[#252526] border border-[#3c3c3c] rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-[#1e1e1e] text-gray-400">
                <tr>
                  <th className="font-medium p-4 border-b border-[#3c3c3c]">Date</th>
                  <th className="font-medium p-4 border-b border-[#3c3c3c]">Issues Found</th>
                  <th className="font-medium p-4 border-b border-[#3c3c3c]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3c3c3c]">
                {scans.slice(0, 5).map(scan => (
                  <tr key={scan.id} className="hover:bg-[#2a2a2b] transition-colors">
                    <td className="p-4 text-gray-300">
                      {scan.createdAt ? new Date(scan.createdAt.toMillis()).toLocaleString() : 'Just now'}
                    </td>
                    <td className="p-4 text-white font-medium">{scan.issueCount}</td>
                    <td className="p-4">
                      {scan.issueCount > 0 ? (
                        <span className="px-2.5 py-1 bg-red-500/10 text-red-500 font-semibold rounded-full text-xs">Vulnerable</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-green-500/10 text-green-500 font-semibold rounded-full text-xs">Secure</span>
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

