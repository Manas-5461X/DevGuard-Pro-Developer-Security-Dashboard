import React, { useState } from 'react';
import { useScans } from '../hooks/useScans';
import { Trash2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Bookmark, BookmarkCheck } from 'lucide-react';

export default function History() {
  const { scans, loading, removeScan, toggleBookmark } = useScans();
  const [expandedScan, setExpandedScan] = useState(null);

  const toggleExpand = (id) => {
    setExpandedScan(prev => prev === id ? null : id);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this log? This action cannot be undone.')) {
      await removeScan(id);
    }
  };

  if (loading) {
    return <div className="text-cyber-primary flex items-center justify-center p-8 uppercase tracking-widest animate-pulse">Loading history...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
      <div className="border-b border-cyber-border pb-4 mb-4">
        <h1 className="text-2xl font-bold text-cyber-text tracking-widest mb-2 uppercase glow-text">Scan History</h1>
        <p className="text-cyber-dark-text tracking-wider uppercase text-sm">Archived vulnerability reports and system scans.</p>
      </div>

      <div className="flex-1 mt-6">
        {scans.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-cyber-dark-text gap-4 border border-dashed border-cyber-border p-8 cyber-panel">
             <CheckCircle size={48} className="opacity-50" />
             <p className="tracking-widest uppercase text-sm">Log completely empty.<br/>Execute a scan to generate records.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {scans.map(scan => (
              <div key={scan.id} className="cyber-panel overflow-hidden transition-colors border-l-4 hover:border-cyber-primary">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-cyber-primary/5 transition-colors border-l border-transparent hover:border-cyber-primary"
                  onClick={() => toggleExpand(scan.id)}
                >
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-xs font-bold text-cyber-dark-text tracking-widest uppercase mb-1">TIMESTAMP</p>
                      <p className="text-cyber-text font-bold uppercase tracking-wider text-sm">
                        {scan.createdAt ? new Date(scan.createdAt.toMillis()).toLocaleString() : 'JUST NOW'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-cyber-dark-text tracking-widest uppercase mb-1">Status</p>
                      {scan.issueCount > 0 ? (
                        <span className="flex items-center gap-1.5 text-cyber-error font-bold uppercase tracking-widest text-sm">
                          <AlertTriangle size={16} /> {scan.issueCount} Issues
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-cyber-primary font-bold uppercase tracking-widest text-sm">
                          <CheckCircle size={16} /> Secure
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(scan.id, scan.isBookmarked); }}
                      className={`hover:bg-cyber-primary/10 transition-colors p-2 border border-transparent hover:border-cyber-primary ${scan.isBookmarked ? 'text-cyber-primary' : 'text-cyber-dark-text hover:text-cyber-primary'}`}
                      title={scan.isBookmarked ? "Remove Bookmark" : "Bookmark this Scan"}
                    >
                      {scan.isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, scan.id)}
                      className="text-cyber-dark-text hover:text-cyber-error hover:bg-cyber-error/10 transition-colors p-2 border border-transparent hover:border-cyber-error"
                      title="Delete Record"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="text-cyber-primary p-1 border border-cyber-primary/30">
                      {expandedScan === scan.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>
                
                {expandedScan === scan.id && scan.vulnerabilities?.length > 0 && (
                  <div className="p-5 border-t border-cyber-border bg-[#0a0f0d]">
                    <h3 className="text-cyber-primary font-bold tracking-widest uppercase mb-4 text-sm">Vulnerability Report</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {scan.vulnerabilities.map((v, i) => (
                         <div key={i} className="bg-[#141b18] p-4 border border-cyber-error/50 hover:border-cyber-error transition-colors">
                           <div className="flex items-center justify-between mb-2 border-b border-cyber-border pb-2">
                             <span className="text-cyber-error font-bold uppercase tracking-wider text-sm">{v.type}</span>
                             <span className="text-cyber-dark-text text-xs tracking-widest">src:{v.line}</span>
                           </div>
                           <p className="text-cyber-text text-sm opacity-90">{v.message}</p>
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

