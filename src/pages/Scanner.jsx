import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { analyzeCode } from '../utils/analyzer';
import { useScans } from '../hooks/useScans';
import { analyzeWithGemini } from '../utils/ai';
import { ShieldAlert, CheckCircle, Copy, AlertTriangle, Info, Play, Trash2, Code2, Bot, Bookmark, BookmarkCheck, Download, RotateCcw, Eye } from 'lucide-react';
import CustomDropdown from '../components/ui/CustomDropdown';

const DEFAULT_CODE = {
  javascript: '// Paste your JavaScript code here\n\nconst API_KEY = "12345678901234";\ndocument.write("Hello User");\n',
  python: '# Paste your Python code here\n\nimport sqlite3\npassword = "supersecretpassword"\nquery = "SELECT * FROM users WHERE root = " + user_input\n',
  java: '// Paste your Java code here\n\nString AWS_SECRET = "AKIAIOSFODNN7EXAMPLE";\nstatement.executeQuery("SELECT * FROM users WHERE name = \'" + userName + "\'");\n',
  php: '<?php\n$secret = "my_database_password";\necho "Hello " . $_GET["name"];\n?>',
  shell: '# Paste your Shell script here\n\nexport PROD_TOKEN="ghp_123456789"\neval $USER_INPUT',
  go: '// Paste your Go code here\n\npassword := "admin123"\ndb.Query(fmt.Sprintf("SELECT * FROM users WHERE username=\'%s\'", userInput))',
  cpp: '// C/C++ code here\n\nchar buffer[50];\nchar* secret = "MY_STATIC_KEY";\ngets(buffer); // Unsafe!',
  rust: '// Rust code here\n\nlet secret_token = "1234567890";\nunsafe { std::ptr::read(ptr); }',
  ruby: '# Ruby code here\n\nAWS_KEY = "AKIAIOSFODNN7EXAMPLE"\nsystem("ping -c 1 " + user_input)',
  swift: '// Swift code here\n\nlet password = "supersecretpassword"\nUserDefaults.standard.set(password, forKey: "user_password")',
  kotlin: '// Kotlin Android code here\n\nval sharedPref = activity?.getPreferences(Context.MODE_PRIVATE)\nsharedPref?.edit()?.putString("user_password", "top_secret123")?.apply()',
  vue: '<!-- Vue template here -->\n\n<template>\n  <div v-html="userProvidedMarkup"></div>\n</template>',
  svelte: '<!-- Svelte code here -->\n\n<script>\n  export let userHtml = "";\n</script>\n\n<div>{@html userHtml}</div>',
  docker: '# Dockerfile here\n\nFROM ubuntu:latest\nRUN chmod 777 /etc/config',
  react: '// React JSX code here\n\nconst userComment = "<img src=x onerror=alert(1)>";\nreturn <div dangerouslySetInnerHTML={{ __html: userComment }} />;',
  angular: '// Angular TypeScript code here\n\nthis.sanitizer.bypassSecurityTrustHtml(userInput);'
};

export default function Scanner() {
  const location = useLocation();
  const { scans, saveScan, updateScan, toggleBookmark } = useScans();

  // ─── CENTRALIZED STATE: Per-Language Storage ───
  const [language, setLanguage] = useState(() => {
    // Restore exact language if navigation state provides it (from History)
    if (location.state?.restoreLanguage) return location.state.restoreLanguage;
    const saved = sessionStorage.getItem('devguard_scanner_state_v2');
    return saved ? JSON.parse(saved).currentLanguage : 'javascript';
  });

  const [workspace, setWorkspace] = useState(() => {
    const saved = sessionStorage.getItem('devguard_scanner_state_v2');
    const base = saved ? JSON.parse(saved).workspace : {};
    // Ensure all defaults are populated
    Object.keys(DEFAULT_CODE).forEach(lang => {
      if (!base[lang]) base[lang] = { code: DEFAULT_CODE[lang], results: [], hasScanned: false, aiResult: null };
    });
    // Immediate restoration from History
    if (location.state?.restoreCode && location.state?.restoreLanguage) {
      const l = location.state.restoreLanguage;
      base[l] = { ...base[l], code: location.state.restoreCode, results: [], hasScanned: false, aiResult: null };
    }
    return base;
  });

  const [currentScanId, setCurrentScanId] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Gemini loading state
  const [isScanning, setIsScanning] = useState(false);   // Heuristic UX delay state
  const [isEscalating, setIsEscalating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [showEditor, setShowEditor] = useState(true);
  const [showDiff, setShowDiff] = useState(false);

  // Deriving current active state from workspace
  const current = workspace[language] || { code: DEFAULT_CODE[language], results: [], hasScanned: false, aiResult: null };
  const { code, results, hasScanned, aiResult } = current;

  // Persistence Sync
  useEffect(() => {
    sessionStorage.setItem('devguard_scanner_state_v2', JSON.stringify({ currentLanguage: language, workspace }));
  }, [language, workspace]);

  // Handle Restore (External Navigation)
  useEffect(() => {
    if (location.state?.restoreCode && location.state?.restoreLanguage) {
      const l = location.state.restoreLanguage;
      const c = location.state.restoreCode;
      setLanguage(l);
      setWorkspace(prev => ({
        ...prev,
        [l]: { code: c, results: [], hasScanned: false, aiResult: null }
      }));
      setCurrentScanId(null);
    }
  }, [location.state]);

  // Sync bookmark/scanId state with current code
  useEffect(() => {
    const existing = scans.find(s => s.code === code && s.language === language);
    if (existing) {
      setCurrentScanId(existing.id);
      setIsBookmarked(existing.isBookmarked);
    } else {
      setCurrentScanId(null);
      setIsBookmarked(false);
    }
  }, [code, language, scans]);

  const updateCurrentWorkspace = (updates) => {
    setWorkspace(prev => ({
      ...prev,
      [language]: { ...prev[language], ...updates }
    }));
  };

  const handleLanguageChange = (val) => {
    setLanguage(val);
    setShowDiff(false);
    setAiError(null);
  };

  const handleScan = async () => {
    if (!code.trim()) return;
    
    setIsScanning(true);
    updateCurrentWorkspace({ results: [], hasScanned: false, aiResult: null });
    setAiError(null);
    setShowDiff(false);
    
    // Snappy UX for local audit
    await new Promise(r => setTimeout(r, 800));
    
    const findings = analyzeCode(code);
    setIsScanning(false);
    updateCurrentWorkspace({ results: findings, hasScanned: true });
    setShowEditor(false);
    
    // Auto-save to History in background (non-blocking)
    saveScan(code, findings, language).then(id => {
      setCurrentScanId(id);
      // AI ESCALATION BRIDGE: Trigger deep audit if local findings are 0
      if (findings.length === 0) {
        handleGeminiAnalyze(code, findings, true, id);
      }
    }).catch(e => {
      console.error('Background save failed', e);
      // Even if save fails, check if we should escalate to AI
      if (findings.length === 0) {
        handleGeminiAnalyze(code, findings, true, null);
      }
    });
  };

  const handleGeminiAnalyze = async (customCode, customResults, auto = false, passedScanId) => {
    const activeCode = customCode || code;
    const activeResults = customResults || results;
    const activeScanId = passedScanId || currentScanId;

    setIsAnalyzing(true);
    if (auto) setIsEscalating(true);
    setAiError(null);

    try {
      const result = await analyzeWithGemini(activeCode, activeResults);
      updateCurrentWorkspace({ aiResult: result });
      
      // SYNC: Push AI fix back to history record for 360-degree persistence
      if (activeScanId) {
        await updateScan(activeScanId, { 
          fixedCode: result.fixedCode, 
          aiAnalysis: result.analysis,
          hasAiRemediation: true 
        });
      }
    } catch (err) {
      setAiError(err.message);
      if (auto) updateCurrentWorkspace({ hasScanned: true });
    } finally {
      setIsAnalyzing(false);
      setIsEscalating(false);
    }
  };

  const handleClear = () => {
    updateCurrentWorkspace({ code: '', results: [], hasScanned: false, aiResult: null });
    setShowEditor(true);
    setShowDiff(false);
  };

  const handleReset = () => {
    updateCurrentWorkspace({ code: DEFAULT_CODE[language], results: [], hasScanned: false, aiResult: null });
    setShowDiff(false);
  };

  const handleBookmarkToggle = async () => {
    if (!currentScanId) {
      const scanId = await saveScan(code, results, language);
      setCurrentScanId(scanId);
      await toggleBookmark(scanId, false);
      setIsBookmarked(true);
    } else {
      await toggleBookmark(currentScanId, isBookmarked);
      setIsBookmarked(!isBookmarked);
    }
  };

  const getMonacoLanguage = (lang) => {
    const map = { react: 'javascript', angular: 'typescript', vue: 'html', svelte: 'html', docker: 'dockerfile' };
    return map[lang] || lang;
  };

  const getSeverityStyle = (s) => ({
    critical: 'text-cyber-error border-cyber-error bg-cyber-error/10',
    high: 'text-[#f97316] border-[#f97316] bg-[#f97316]/10',
    medium: 'text-cyber-warning border-cyber-warning bg-cyber-warning/10',
    low: 'text-cyber-primary border-cyber-primary bg-cyber-primary/10',
  }[s] || 'text-[#737373] border-[#737373] bg-[#737373]/10');

  return (
    <div className="h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-0 lg:gap-6 -m-4 md:-m-8 lg:m-0">
      
      {/* Mobile Nav */}
      <div className="lg:hidden flex border-b border-cyber-border bg-cyber-bg shrink-0">
        <button onClick={() => setShowEditor(true)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${showEditor ? 'text-cyber-primary border-b-2 border-cyber-primary' : 'text-cyber-dark-text'}`}>
          <Code2 size={14} /> Editor
        </button>
        <button onClick={() => setShowEditor(false)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 ${!showEditor ? 'text-cyber-primary border-b-2 border-cyber-primary' : 'text-cyber-dark-text'}`}>
          <ShieldAlert size={14} /> Results
        </button>
      </div>

      {/* Editor Area */}
      <div className={`flex-1 flex flex-col bg-cyber-surface border border-cyber-border rounded-none lg:rounded-2xl overflow-hidden ${showEditor ? 'flex' : 'hidden lg:flex'}`}>
        <div className="shrink-0 h-12 border-b border-cyber-border flex items-center justify-between px-3 md:px-4 gap-2 bg-[#0D0D0D]">
          <div className="flex items-center gap-2 min-w-0">
            <Code2 size={15} className="text-cyber-primary shrink-0" />
            <CustomDropdown
              options={Object.keys(DEFAULT_CODE).map(k => ({ value: k, label: k.toUpperCase() }))}
              value={language}
              onChange={handleLanguageChange}
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 border border-cyber-border text-cyber-dark-text hover:text-cyber-text rounded-lg text-[11px] font-semibold transition-all"><RotateCcw size={13} /></button>
            <button onClick={handleClear} className="flex items-center gap-1.5 px-3 py-1.5 border border-cyber-border text-cyber-dark-text hover:text-cyber-text rounded-lg text-[11px] font-semibold transition-all"><Trash2 size={13} /></button>
            <button
              onClick={handleScan}
              disabled={isScanning || isAnalyzing}
              className="px-4 py-1.5 bg-cyber-primary text-black font-bold rounded-lg text-[11px] uppercase tracking-widest hover:bg-cyber-primary-hover transition-all disabled:opacity-50"
            >
              {isScanning ? 'Scanning...' : 'Scan'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-[#1E1E1E]">
          {showDiff && aiResult ? (
            <DiffEditor height="100%" language={getMonacoLanguage(language)} theme="vs-dark" original={code} modified={aiResult.fixedCode} options={{ renderSideBySide: false, minimap: { enabled: false } }} />
          ) : (
            <Editor height="100%" language={getMonacoLanguage(language)} theme="vs-dark" value={code} onChange={v => updateCurrentWorkspace({ code: v || '' })} options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }} />
          )}
        </div>
      </div>

      {/* Results Area */}
      <div className={`w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col py-4 md:py-0 overflow-hidden ${!showEditor ? 'flex' : 'hidden lg:flex'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-cyber-text uppercase tracking-widest flex items-center gap-2">
            {aiResult ? <><Bot size={16} className="text-cyber-primary" /> AI Audit</> : <><ShieldAlert size={16} className="text-cyber-primary" /> Analysis</>}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 md:pr-0">
          {isScanning ? (
             <div className="h-full flex flex-col items-center justify-center text-center gap-6 p-8">
              <div className="relative"><div className="w-20 h-20 border-4 border-cyber-primary/10 border-t-cyber-primary rounded-full animate-spin" /><div className="absolute inset-0 flex items-center justify-center"><ShieldAlert size={28} className="text-cyber-primary animate-pulse" /></div></div>
              <div><h3 className="text-cyber-text font-bold text-sm tracking-widest uppercase mb-2 animate-pulse">Running Deep Scan</h3><p className="text-cyber-dark-text text-xs">Checking for vulnerabilities...</p></div>
            </div>
          ) : isEscalating && isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6 p-8">
              <div className="relative"><div className="w-20 h-20 border-4 border-cyber-primary/10 border-b-cyber-primary rounded-full animate-spin" /><div className="absolute inset-0 flex items-center justify-center"><Bot size={28} className="text-cyber-primary animate-pulse" /></div></div>
              <div><h3 className="text-cyber-primary font-bold text-sm tracking-widest uppercase mb-2">AI Escalation</h3><p className="text-cyber-dark-text text-xs">Heuristics clear. Escalating to Deep AI Audit Engine...</p></div>
            </div>
          ) : aiResult ? (
            <div className="bg-cyber-primary/5 border border-cyber-primary/30 rounded-2xl p-5">
              <div className="text-cyber-primary text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Bot size={12}/> Executive Summary</div>
              <FormattedAnalysis text={aiResult.analysis} />
              <div className="mt-5 pt-4 border-t border-cyber-primary/20 flex gap-2">
                 <button onClick={() => updateCurrentWorkspace({ aiResult: null })} className="flex-1 py-2 border border-cyber-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-cyber-dark-text hover:text-cyber-text">Dismiss</button>
                 <button onClick={() => setShowDiff(!showDiff)} className="flex-[1.5] py-2 bg-cyber-primary text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-cyber-primary-hover flex items-center justify-center gap-1.5 overflow-hidden">
                    {showDiff ? 'Hide Fix' : 'Review & Apply Fix'}
                 </button>
              </div>
            </div>
          ) : hasScanned && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-cyber-primary gap-3 border border-cyber-primary/20 bg-cyber-primary/5 rounded-2xl p-8">
              <CheckCircle size={40} /><div><h3 className="text-sm font-bold tracking-widest uppercase mb-1">System Secure</h3><p className="text-xs opacity-70">Deep audit confirmed 0 vulnerabilities.</p></div>
            </div>
          ) : results.length > 0 ? (
            results.map((issue, idx) => (
              <div key={idx} className="bg-cyber-surface border border-cyber-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border rounded ${getSeverityStyle(issue.severity)}`}>{issue.severity}</span>
                  <button onClick={() => navigator.clipboard.writeText(issue.codeSnippet)} className="text-cyber-dark-text hover:text-cyber-primary"><Copy size={13} /></button>
                </div>
                <h3 className="text-cyber-text font-bold text-xs mb-1">{issue.type}</h3>
                <p className="text-cyber-dark-text text-[11px] leading-relaxed mb-3">{issue.message}</p>
                {!aiResult && (
                   <button onClick={() => handleGeminiAnalyze()} disabled={isAnalyzing} className="w-full flex items-center justify-center gap-2 py-1.5 bg-cyber-primary/10 border border-cyber-primary/20 text-cyber-primary text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-cyber-primary/20 transition-all">
                     <Bot size={13}/> AI Remediation
                   </button>
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-cyber-dark-text gap-4 border border-dashed border-cyber-border rounded-3xl p-8">
              <ShieldAlert size={36} className="opacity-20" /><div><p className="text-sm font-bold mb-1 opacity-40">Ready to Scan</p><p className="text-[11px] opacity-40">Paste code to begin audit.</p></div>
            </div>
          )}
        </div>

        {/* Global actions */}
        {hasScanned && !isScanning && !isAnalyzing && (
           <div className="shrink-0 pt-4 flex gap-2">
             <button onClick={handleBookmarkToggle} className={`flex-1 py-2.5 border rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-all ${isBookmarked ? 'bg-cyber-primary/10 border-cyber-primary text-cyber-primary' : 'border-cyber-border text-cyber-dark-text hover:text-cyber-text'}`}>
               {isBookmarked ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>} {isBookmarked ? 'Saved' : 'Bookmark'}
             </button>
             {results.length > 0 && !aiResult && (
                <button onClick={() => handleGeminiAnalyze()} className="flex-[1.2] py-2.5 bg-cyber-primary text-black rounded-xl text-[10px] uppercase font-bold tracking-widest hover:bg-cyber-primary-hover flex items-center justify-center gap-2">
                  <Bot size={14}/> Deep AI Analyze
                </button>
             )}
             {aiResult && (
                <button onClick={() => { setWorkspace(prev => ({ ...prev, [language]: { ...prev[language], code: aiResult.fixedCode, results: [], hasScanned: false, aiResult: null } })); setShowDiff(false); setTimeout(() => handleScan(), 50); }} className="flex-[1.2] py-2.5 bg-cyber-primary text-black rounded-xl text-[10px] uppercase font-bold tracking-widest hover:bg-cyber-primary-hover flex items-center justify-center gap-2">
                  <CheckCircle size={14}/> Apply Fix
                </button>
             )}
           </div>
        )}
      </div>
    </div>
  );
}

// ─── HELPER: AI ANALYSIS FORMATTER ───
function FormattedAnalysis({ text }) {
  if (!text) return null;
  const elements = text.split('\n').map((line, i) => {
    const l = line.trim();
    if (!l) return null;
    const bulletMatch = l.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) return <div key={i} className="flex gap-2 py-0.5"><span className="w-1.5 h-1.5 bg-cyber-primary rounded-full mt-1.5 shrink-0" /><span className="text-[12px] text-[#D4D4D4]">{bulletMatch[1]}</span></div>;
    return <p key={i} className="text-[12px] text-[#D4D4D4] py-0.5 leading-relaxed">{l}</p>;
  });
  return <div className="space-y-1">{elements}</div>;
}
