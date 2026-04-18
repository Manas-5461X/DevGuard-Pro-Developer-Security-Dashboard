import React, { useState } from 'react';
import { useScans } from '../hooks/useScans';
import { Trash2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function History() {
  const { scans, loading, removeScan } = useScans();
  const [expandedScan, setExpandedScan] = useState(null);

  const toggleExpand = (id) => {
    setExpandedScan(prev => prev === id ? null : id);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this scan? This cannot be undone.')) {
      await removeScan(id);
    }
  };

  if (loading) {
    return <div className="text-white flex items-center justify-center p-8">Loading history...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Scan History</h1>
        <p className="text-gray-400">View your past code scans, their vulnerability reports, and track improvements over time.</p>
      </div>

      <div className="flex-1 mt-6">
        {scans.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-4 border border-dashed border-[#3c3c3c] rounded-xl p-8 bg-[#252526]/50">
             <CheckCircle size={48} className="text-gray-600" />
             <p>Your history is clean. Save scans from the Scanner page to see them here.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {scans.map(scan => (
              <div key={scan.id} className="bg-[#252526] border border-[#3c3c3c] rounded-xl overflow-hidden shadow-lg transition-colors">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#2a2a2b] transition-colors"
                  onClick={() => toggleExpand(scan.id)}
                >
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Date</p>
                      <p className="text-white font-medium">
                        {scan.createdAt ? new Date(scan.createdAt.toMillis()).toLocaleString() : 'Recent'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                      {scan.issueCount > 0 ? (
                        <span className="flex items-center gap-1.5 text-red-500 font-medium">
                          <AlertTriangle size={16} /> {scan.issueCount} Issues Found
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-green-500 font-medium">
                          <CheckCircle size={16} /> Secure
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => handleDelete(e, scan.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                      title="Delete Scan"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="text-gray-500">
                      {expandedScan === scan.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>
                
                {expandedScan === scan.id && scan.vulnerabilities?.length > 0 && (
                  <div className="p-5 border-t border-[#3c3c3c] bg-[#1e1e1e]/50">
                    <h3 className="text-white font-medium mb-3 text-sm">Vulnerability Report:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scan.vulnerabilities.map((v, i) => (
                         <div key={i} className="bg-[#1e1e1e] p-4 rounded-lg border border-[#3c3c3c]">
                           <div className="flex items-center justify-between mb-2">
                             <span className="text-red-400 font-medium">{v.type}</span>
                             <span className="text-gray-500 text-xs font-mono">Line {v.line}</span>
                           </div>
                           <p className="text-gray-400 text-sm">{v.message}</p>
                         </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

