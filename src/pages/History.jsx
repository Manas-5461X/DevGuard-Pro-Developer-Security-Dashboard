import React, { useState } from 'react';
import { useScans } from '../hooks/useScans';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Bookmark, BookmarkCheck, RotateCcw } from 'lucide-react';
import { HistorySkeleton } from '../components/ui/Skeleton';

export default function History() {
  const { scans, loading, removeScan, toggleBookmark } = useScans();
  const [expandedScan, setExpandedScan] = useState(null);
  const navigate = useNavigate();

  const toggleExpand = (id) => {
    setExpandedScan(prev => prev === id ? null : id);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this log? This action cannot be undone.')) {
      await removeScan(id);
    }
  };

  const handleRestore = (e, code) => {
    e.stopPropagation();
    navigate('/scanner', { state: { restoreCode: code } });
  };

  if (loading) {
    return <HistorySkeleton />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
      <div className="border-b border-[#262626] pb-4 mb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Scan History</h1>
        <p className="text-[#A3A3A3] text-sm">Archived vulnerability reports and historical code snippets.</p>
      </div>

      <div className="flex-1 mt-6">
        {scans.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#737373] gap-4 cyber-panel border-dashed p-8">
             <CheckCircle size={48} className="opacity-50" />
             <p className="tracking-widest uppercase text-sm">Log completely empty.<br/>Execute a scan to generate records.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {scans.map(scan => (
              <div key={scan.id} className="cyber-panel overflow-hidden transition-colors">
                <div 
                  className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => toggleExpand(scan.id)}
                >
                  <div className="flex items-center gap-8 mb-4 md:mb-0">
                    <div className="w-56 shrink-0">
                      <p className="text-xs font-bold text-[#737373] tracking-widest uppercase mb-1">Snippet ID</p>
                      <p className="text-[#F5F5F5] font-semibold text-[13px] truncate" title={scan.title}>
                        {scan.title || 'Legacy Script'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#737373] tracking-widest uppercase mb-1">Timestamp</p>
                      <p className="text-[#A3A3A3] text-[13px]">
                        {scan.createdAt ? new Date(scan.createdAt.toMillis()).toLocaleString() : 'JUST NOW'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#737373] tracking-widest uppercase mb-1">Status</p>
                      {scan.issueCount > 0 ? (
                        <span className="flex items-center gap-1.5 text-cyber-error font-bold uppercase tracking-widest text-xs">
                          <AlertTriangle size={14} /> {scan.issueCount} Issues
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-cyber-primary font-bold uppercase tracking-widest text-xs">
                          <CheckCircle size={14} /> Secure
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleRestore(e, scan.code)}
                      className="hover:bg-white/10 transition-colors p-2 rounded-full border border-[#262626] text-[#A3A3A3] hover:text-white flex items-center gap-2 px-3"
                      title="Load this code back into the Scanner"
                    >
                      <RotateCcw size={14} /> <span className="text-[10px] tracking-widest uppercase font-bold">Restore</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(scan.id, scan.isBookmarked); }}
                      className={`hover:bg-white/10 transition-colors p-2 rounded-full border border-[#262626] ${scan.isBookmarked ? 'text-cyber-primary border-cyber-primary/50' : 'text-[#A3A3A3] hover:text-white'}`}
                      title={scan.isBookmarked ? "Remove Bookmark" : "Bookmark this Scan"}
                    >
                      {scan.isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, scan.id)}
                      className="text-[#A3A3A3] hover:text-cyber-error hover:border-cyber-error/50 hover:bg-cyber-error/10 transition-colors p-2 rounded-full border border-[#262626]"
                      title="Delete Record"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="text-white p-2 rounded-full border border-transparent hover:bg-white/5 ml-2">
                      {expandedScan === scan.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>
                
                {expandedScan === scan.id && (
                  <div className="p-6 border-t border-[#262626] bg-[#000]">
                    {scan.vulnerabilities?.length > 0 ? (
                       <>
                         <h3 className="text-cyber-primary font-bold tracking-widest uppercase mb-4 text-[11px]">Vulnerability Analysis Report</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {scan.vulnerabilities.map((v, i) => (
                              <div key={i} className="bg-[#121212] p-4 border border-cyber-error/30 rounded-xl hover:border-cyber-error transition-colors">
                                <div className="flex items-center justify-between mb-3 border-b border-[#262626] pb-2">
                                  <span className="text-cyber-error font-bold uppercase tracking-wider text-xs">{v.type}</span>
                                  <span className="text-[#A3A3A3] text-[10px] tracking-widest bg-[#1A1A1A] px-2 py-0.5 rounded">src:{v.line}</span>
                                </div>
                                <p className="text-[#F5F5F5] text-[13px] opacity-90 leading-relaxed font-mono">{v.message}</p>
                              </div>
                           ))}
                         </div>
                       </>
                    ) : (
                       <p className="text-[#737373] text-sm">This snippet safely passed heuristic checks without throwing critical errors.</p>
                    )}
                    
                    <div className="mt-8">
                      <h3 className="text-[#737373] font-bold tracking-widest uppercase mb-3 text-[11px]">Raw Code Source</h3>
                      <pre className="text-[11px] font-mono text-[#A3A3A3] bg-[#121212] p-4 rounded-xl border border-[#262626] overflow-x-auto">
                        {scan.code}
                      </pre>
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
