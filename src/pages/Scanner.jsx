import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { analyzeCode } from '../utils/analyzer';
import { useScans } from '../hooks/useScans';
import { ShieldAlert, CheckCircle, Copy, AlertTriangle, Info, Play, Trash2, Save } from 'lucide-react';

export default function Scanner() {
  const [code, setCode] = useState('// Paste or write your JavaScript code here\n\nconst API_KEY = "12345678901234";\ndocument.write("Hello User");\n');
  const [results, setResults] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { saveScan } = useScans();

  const handleScan = () => {
    const findings = analyzeCode(code);
    setResults(findings);
    setHasScanned(true);
  };

  const handleClear = () => {
    setCode('// Paste or write your JavaScript code here\n');
    setResults([]);
    setHasScanned(false);
  };

  const handleSave = async () => {
    if (!hasScanned) return;
    setIsSaving(true);
    try {
      await saveScan(code, results);
      alert('Scan saved successfully to your history.');
    } catch (err) {
      alert('Failed to save scan.');
    }
    setIsSaving(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <ShieldAlert size={18} />;
      case 'high': return <AlertTriangle size={18} />;
      case 'medium': return <AlertTriangle size={18} />;
      case 'low': return <Info size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6">
      <div className="flex-1 flex flex-col h-full min-h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Workspace
          </h2>
          <div className="flex gap-3">
            {hasScanned && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-[#252526] hover:bg-[#2d2d2d] text-green-500 border border-green-500/30 hover:border-green-500/60 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Scan'}
              </button>
            )}
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 bg-[#252526] hover:bg-[#2d2d2d] text-gray-300 border border-[#3c3c3c] rounded-lg transition-colors text-sm"
            >
              <Trash2 size={16} />
              Clear
            </button>
            <button
              onClick={handleScan}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-900/20"
            >
              <Play size={16} />
              Scan Code
            </button>
          </div>
        </div>
        
        <div className="flex-1 rounded-xl overflow-hidden border border-[#3c3c3c] shadow-2xl">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>

      <div className="xl:w-1/3 flex flex-col h-full min-h-[500px]">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          Analysis Results
          {hasScanned && (
            <span className="text-sm font-normal px-2.5 py-0.5 bg-[#252526] border border-[#3c3c3c] rounded-full text-gray-400">
              {results.length} found
            </span>
          )}
        </h2>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {!hasScanned ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-4 border border-dashed border-[#3c3c3c] rounded-xl p-8 bg-[#252526]/50">
              <ShieldAlert size={48} className="text-gray-600" />
              <p>Run a scan to see vulnerability detection results here.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-green-500 gap-4 border border-[#3c3c3c] rounded-xl p-8 bg-[#252526]">
              <CheckCircle size={48} />
              <h3 className="text-lg font-medium text-white">No vulnerabilities found!</h3>
              <p className="text-green-500/80">Your code looks secure based on our checks.</p>
            </div>
          ) : (
            results.map((issue, idx) => (
              <div key={idx} className="bg-[#252526] border border-[#3c3c3c] rounded-xl p-5 shadow-lg group hover:border-[#4d4d4d] transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(issue.severity)}`}>
                      {getSeverityIcon(issue.severity)}
                      {issue.severity.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm font-mono">Line {issue.line}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(issue.codeSnippet)}
                    className="text-gray-500 hover:text-white transition-colors"
                    title="Copy vulnerable snippet"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                
                <h3 className="text-white font-medium mb-1">{issue.type}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{issue.message}</p>
                
                <div className="bg-[#1e1e1e] p-3 rounded-lg border border-[#3c3c3c]">
                  <div className="text-xs text-green-500 font-medium mb-1">Recommended Fix:</div>
                  <p className="text-sm text-gray-300 font-mono">{issue.fix}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

