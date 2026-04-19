import React, { useState } from 'react';
import { useScans } from '../hooks/useScans';
import { useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Bookmark, BookmarkCheck, RotateCcw, RefreshCw, Clock, Shield, Eye } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

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
        <p className="text-white font-semibold text-sm mb-1">Loading Scan History</p>
        <p className="text-[#525252] text-xs">Retrieving your archived security reports...</p>
      </div>
      {/* Skeleton rows */}
      <div className="w-full max-w-4xl mt-4 space-y-3 px-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-[#121212] border border-[#1A1A1A] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-[shimmer_1.5s_infinite]" style={{ animationDelay: `${i * 0.15}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function History() {
  const { scans, loading, refreshing, removeScan, toggleBookmark, refetch } = useScans();
  const [expandedScan, setExpandedScan] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const navigate = useNavigate();

  const toggleExpand = (id) => setExpandedScan(prev => prev === id ? null : id);

  const confirmDelete = async () => {
    if (deleteModal.id) {
      await removeScan(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const handleRestore = (e, code) => {
    e.stopPropagation();
    navigate('/scanner', { state: { restoreCode: code } });
  };

  // Only show full loading screen on very first load (no cached data)
  if (loading) return <FirstLoadScreen />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#1A1A1A] pb-5 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Scan History</h1>
          <p className="text-[#737373] text-sm">Archived vulnerability reports and code snapshots.</p>
        </div>
        <button
          onClick={() => refetch(false)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 border border-[#262626] text-[#737373] hover:text-white hover:border-[#404040] rounded-xl text-xs font-semibold transition-all disabled:opacity-40 mt-1"
          title="Refresh history"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">{refreshing ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Subtle sync indicator */}
      {refreshing && (
        <div className="flex items-center gap-2 text-[#525252] text-xs py-1">
          <RefreshCw size={11} className="animate-spin" />
          <span>Syncing with cloud...</span>
        </div>
      )}

      {/* Empty state */}
      {scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-4 border border-dashed border-[#262626] rounded-2xl p-14">
          <CheckCircle size={40} className="text-[#262626]" />
          <div>
            <p className="text-[#737373] font-semibold text-sm mb-1">No scan history yet</p>
            <p className="text-[#404040] text-xs">Run a scan in the Scanner to start building your security log.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 pb-8">
          {scans.map(scan => (
            <div key={scan.id} className="bg-[#0D0D0D] border border-[#1A1A1A] hover:border-[#262626] rounded-2xl overflow-hidden transition-colors">
              {/* Scan row */}
              <div
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors gap-4"
                onClick={() => toggleExpand(scan.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 flex-1 min-w-0">
                  {/* Title */}
                  <div className="min-w-0 sm:w-52">
                    <p className="text-[#737373] text-[10px] font-bold uppercase tracking-widest mb-0.5">Snippet</p>
                    <p className="text-white font-semibold text-sm truncate" title={scan.title}>
                      {scan.title || 'Unnamed Scan'}
                    </p>
                  </div>
                  {/* Timestamp */}
                  <div className="shrink-0">
                    <p className="text-[#737373] text-[10px] font-bold uppercase tracking-widest mb-0.5">Date</p>
                    <p className="text-[#A3A3A3] text-[12px] flex items-center gap-1">
                      <Clock size={11} className="text-[#525252]" />
                      {scan.createdAt ? new Date(scan.createdAt.toMillis()).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                  {/* Status badge */}
                  <div className="shrink-0">
                    {scan.issueCount > 0 ? (
                      <span className="flex items-center gap-1.5 text-cyber-error font-bold text-[11px] uppercase tracking-widest bg-cyber-error/10 border border-cyber-error/20 px-2.5 py-1 rounded-full">
                        <AlertTriangle size={11} /> {scan.issueCount} Issues
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-cyber-primary font-bold text-[11px] uppercase tracking-widest bg-cyber-primary/10 border border-cyber-primary/20 px-2.5 py-1 rounded-full">
                        <CheckCircle size={11} /> Secure
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={e => handleRestore(e, scan.code)}
                    className="p-1.5 border border-[#262626] text-[#737373] hover:text-cyber-primary hover:border-cyber-primary/40 rounded-lg transition-all"
                    title="View Code in Scanner"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); toggleBookmark(scan.id, scan.isBookmarked); }}
                    className={`p-1.5 border rounded-lg transition-all ${scan.isBookmarked ? 'text-cyber-primary border-cyber-primary/40 bg-cyber-primary/10' : 'text-[#737373] border-[#262626] hover:text-white hover:border-[#404040]'}`}
                    title={scan.isBookmarked ? 'Remove bookmark' : 'Bookmark this scan'}
                  >
                    {scan.isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteModal({ isOpen: true, id: scan.id }); }}
                    className="p-1.5 border border-[#262626] text-[#737373] hover:text-cyber-error hover:border-cyber-error/40 rounded-lg transition-all"
                    title="Delete this record"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="text-[#525252] p-1 ml-1">
                    {expandedScan === scan.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedScan === scan.id && (
                <div className="border-t border-[#1A1A1A] bg-[#080808] p-5">
                  {scan.vulnerabilities?.length > 0 ? (
                    <>
                      <p className="text-cyber-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                        {scan.vulnerabilities.length} Vulnerabilities Found
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {scan.vulnerabilities.map((v, i) => (
                          <div key={i} className="bg-[#0D0D0D] rounded-xl p-4 border border-[#1A1A1A]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-cyber-error font-bold text-[11px] uppercase tracking-wider">{v.type}</span>
                              <span className="text-[#525252] text-[10px] font-mono bg-[#1A1A1A] px-2 py-0.5 rounded">Line {v.line}</span>
                            </div>
                            <p className="text-[#A3A3A3] text-[12px] leading-relaxed">{v.message}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-[#525252] text-sm mb-4">This snippet passed all heuristic checks — no vulnerabilities detected.</p>
                  )}
                  <div>
                    <p className="text-[#525252] text-[10px] font-bold uppercase tracking-widest mb-2">Code Snapshot</p>
                    <pre className="text-[12px] font-mono text-[#A3A3A3] bg-[#0A0A0A] p-4 rounded-xl border border-[#1A1A1A] overflow-x-auto leading-relaxed">
                      {scan.code}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Scan Log?"
        message="This will permanently remove this record from your security history. This action cannot be undone."
        confirmText="Permanently Delete"
      />
    </div>
  );
}
