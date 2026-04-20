import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { analyzeCode } from '../utils/analyzer';
import { useScans } from '../hooks/useScans';
import { useTheme } from '../context/ThemeContext';
import { analyzeWithGemini } from '../utils/ai';
import { ShieldAlert, CheckCircle, Copy, AlertTriangle, Info, Play, Trash2, Code2, Bot, Bookmark, BookmarkCheck, Download, RotateCcw, Eye, ChevronRight } from 'lucide-react';
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

// ─── RICH AI ANALYSIS FORMATTER ───
function FormattedAnalysis({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    // Bullet list item
    const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) {
      elements.push(
        <div key={i} className="flex gap-3 py-1.5 group/line transition-all">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-primary mt-2 shrink-0 shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
          <span className="text-[13px] leading-relaxed text-[#D4D4D4]">{renderInline(bulletMatch[1])}</span>
        </div>
      );
      i++; continue;
    }

    // Bold heading
    const boldMatch = line.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) {
      elements.push(
        <p key={i} className="text-cyber-primary text-[10px] font-bold tracking-[0.2em] uppercase mt-6 mb-2 first:mt-0 flex items-center gap-2">
          <ChevronRight size={10} /> {boldMatch[1]}
        </p>
      );
      i++; continue;
    }

    // Numbered list item
    const numMatch = line.match(/^(\d+)[.:]\s+(.+)$/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex gap-3 py-2 border-l border-white/5 pl-4 ml-1">
          <span className="text-cyber-primary font-mono text-[11px] font-bold mt-0.5">{numMatch[1].padStart(2, '0')}</span>
          <span className="text-[13px] leading-relaxed text-[#D4D4D4]">{renderInline(numMatch[2])}</span>
        </div>
      );
      i++; continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-[13px] leading-relaxed text-[#A3A3A3] py-1.5">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

/**
 * ISSUE 5: Monaco suggestion widget layering fix. 
 * Ensures autocomplete popups appear above the editor content.
 */
const editorStyles = `
  .monaco-editor {
    font-family: monospace !important;
  }
  * {
    letter-spacing: normal;
  }
  .monaco-editor .suggest-widget {
    z-index: 9999 !important;
  }
  .monaco-editor {
    position: relative;
    z-index: 1;
  }
`;

const EmptyState = ({ title, subtitle, onAIAction }) => (
  <div className="flex flex-col items-center justify-center text-center text-cyber-primary gap-4 border border-cyber-primary/20 bg-cyber-primary/5 rounded-2xl p-10">
    <CheckCircle size={48} className="drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
    <div>
      <h3 className="text-sm font-bold tracking-widest uppercase mb-1">{title}</h3>
      <p className="text-[11px] opacity-70 mb-4">{subtitle}</p>
      <button 
        onClick={onAIAction}
        className="px-6 py-2 bg-cyber-primary text-black text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-cyber-primary-hover transition-all flex items-center gap-2 mx-auto shadow-[0_0_15px_rgba(74,222,128,0.2)]"
      >
        <Bot size={14} /> Audit with Deep AI
      </button>
    </div>
  </div>
);

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-black/40 border border-white/10 text-cyber-primary text-[11px] px-1.5 py-0.5 rounded font-mono mx-1">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function Scanner() {
  const location = useLocation();
  const { scans, saveScan, updateScan, toggleBookmark } = useScans();
  const { theme } = useTheme();

  // Injecting Monaco styles
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = editorStyles;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  // ─── CENTRALIZED STATE ───
  const [language, setLanguage] = useState(() => {
    if (location.state?.restoreLanguage) return location.state.restoreLanguage;
    const saved = sessionStorage.getItem('devguard_scanner_state_v2');
    return saved ? JSON.parse(saved).currentLanguage : 'javascript';
  });

  const [workspace, setWorkspace] = useState(() => {
    const saved = sessionStorage.getItem('devguard_scanner_state_v2');
    const base = saved ? JSON.parse(saved).workspace : {};
    Object.keys(DEFAULT_CODE).forEach(lang => {
      if (!base[lang]) base[lang] = { code: DEFAULT_CODE[lang], results: [], hasScanned: false, aiResult: null };
    });
    if (location.state?.restoreCode && location.state?.restoreLanguage) {
      const l = location.state.restoreLanguage;
      base[l] = { ...base[l], code: location.state.restoreCode, results: [], hasScanned: false, aiResult: null };
    }
    return base;
  });

  const [currentScanId, setCurrentScanId] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [scanState, setScanState] = useState("idle");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiFailCount, setAiFailCount] = useState(0); // Track consecutive failures
  const [retryCooldown, setRetryCooldown] = useState(0);
  const [showEditor, setShowEditor] = useState(true);
  const [showDiff, setShowDiff] = useState(false);

  // Handle Retry Cooldown Timer
  useEffect(() => {
    if (retryCooldown > 0) {
      const timer = setInterval(() => setRetryCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [retryCooldown]);

  const current = workspace[language] || { code: DEFAULT_CODE[language], results: [], hasScanned: false, aiResult: null };
  const { code, results, hasScanned, aiResult } = current;

  useEffect(() => {
    sessionStorage.setItem('devguard_scanner_state_v2', JSON.stringify({ currentLanguage: language, workspace }));
  }, [language, workspace]);

  // Handle Restoration with cleanup
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
      // Clean up location state path after picking up values
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const existing = scans.find(s => s.code === code && s.language === language);
    if (existing) {
      setCurrentScanId(existing.id);
      setBookmarked(existing.isBookmarked);
    } else {
      setCurrentScanId(null);
      setBookmarked(false);
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
    setScanState("idle");
    updateCurrentWorkspace({ results: [], hasScanned: false, aiResult: null });
    setAiError(null); setShowDiff(false);
    
    await new Promise(r => setTimeout(r, 1200));
    
    const findings = analyzeCode(code);
    setIsScanning(false);
    
    if (findings.length > 0) {
      setScanState("hasResults");
      updateCurrentWorkspace({ results: findings, hasScanned: true });
    } else {
      setScanState("noResults");
      setIsEscalating(true);
    }
    setShowEditor(false);
    
    try {
      const id = await saveScan(code, findings, language);
      setCurrentScanId(id);
      if (findings.length === 0) {
        handleGeminiAnalyze(code, findings, true, id);
      }
    } catch (e) {
      console.error('Background save failed', e);
      if (findings.length === 0) {
        setIsEscalating(false);
        handleGeminiAnalyze(code, findings, true, null);
      }
    }
  };

  const handleGeminiAnalyze = async (customCode, customResults, auto = false, passedScanId, force = false) => {
    const activeCode = customCode || code;
    const activeResults = customResults || results;
    const activeScanId = passedScanId || currentScanId;

    setIsAnalyzing(true);
    if (auto) setIsEscalating(true);
    setAiError(null);

    try {
      const result = await analyzeWithGemini(activeCode, activeResults, force);
      updateCurrentWorkspace({ aiResult: result, hasScanned: true });
      setAiFailCount(0); // Reset on success
      if (activeScanId) {
        await updateScan(activeScanId, { fixedCode: result.fixedCode, aiAnalysis: result.analysis, hasAiRemediation: true });
      }
    } catch (err) {
      setAiError(err.message);
      setAiFailCount(prev => prev + 1);
      if (auto) updateCurrentWorkspace({ hasScanned: true });
    } finally {
      setIsAnalyzing(false); setIsEscalating(false);
    }
  };

  const handleClear = () => {
    updateCurrentWorkspace({ code: '', results: [], hasScanned: false, aiResult: null });
    setShowEditor(true); setShowDiff(false);
  };

  const handleReset = () => {
    updateCurrentWorkspace({ code: DEFAULT_CODE[language], results: [], hasScanned: false, aiResult: null });
    setShowDiff(false);
  };

  const handleBookmark = async () => {
    if (isScanning || isAnalyzing) return;
    try {
      setBookmarked(prev => !prev);
      if (currentScanId) {
        await toggleBookmark(currentScanId, bookmarked);
      } else {
        const scanId = await saveScan(code, results, language);
        if (scanId) {
          setCurrentScanId(scanId);
          await toggleBookmark(scanId, false);
        }
      }
    } catch (error) {
      console.error("Bookmark error:", error);
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
      
      {/* ── Editor Workspace ── */}
      <div className={`flex-1 flex flex-col bg-cyber-surface border border-cyber-border rounded-none lg:rounded-2xl overflow-hidden ${showEditor ? 'flex' : 'hidden lg:flex'}`}>
        <div className="shrink-0 h-12 border-b border-cyber-border flex items-center justify-between px-3 md:px-4 gap-2 bg-cyber-surface">
          <div className="flex items-center gap-2 min-w-0">
            <Code2 size={15} className="text-cyber-primary shrink-0" />
            <CustomDropdown
              options={Object.keys(DEFAULT_CODE).map(k => ({ value: k, label: k.toUpperCase() }))}
              value={language}
              onChange={handleLanguageChange}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleReset} className="p-2 border border-cyber-border text-cyber-dark-text hover:text-cyber-text rounded-lg transition-all" title="Reset Default"><RotateCcw size={14} /></button>
            <button onClick={handleClear} className="p-2 border border-cyber-border text-cyber-dark-text hover:text-cyber-text rounded-lg transition-all" title="Clear Code"><Trash2 size={14} /></button>
            <button
              onClick={handleScan}
              disabled={isScanning || isAnalyzing}
              className="px-5 py-1.5 bg-cyber-primary text-black font-bold rounded-lg text-[11px] uppercase tracking-widest hover:bg-cyber-primary-hover transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isScanning ? <><span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Scanning</> : <><Play size={13} fill="currentColor" /> Scan</>}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-cyber-bg">
          {showDiff && aiResult ? (
            <DiffEditor 
              height="100%" 
              language={getMonacoLanguage(language)} 
              theme={theme === 'dark' ? 'vs-dark' : 'vs'} 
              original={code} 
              modified={aiResult.fixedCode} 
              options={{ 
                renderSideBySide: false, 
                minimap: { enabled: false }, 
                fontSize: 14, 
                fontFamily: "Fira Code, monospace",
                lineHeight: 20,
                automaticLayout: true,
                scrollBeyondLastLine: false
              }} 
            />
          ) : (
            <Editor 
              height="100%" 
              language={getMonacoLanguage(language)} 
              theme={theme === 'dark' ? 'vs-dark' : 'vs'} 
              value={code} 
              onMount={(editor) => editor.layout()}
              onChange={v => updateCurrentWorkspace({ code: v || '' })} 
              options={{
                fontFamily: "Fira Code, monospace",
                fontLigatures: false,
                fontSize: 14,
                lineHeight: 20,
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false
              }} 
            />
          )}
        </div>
      </div>

      {/* ── Results Column ── */}
      <div className={`w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col py-4 md:py-0 overflow-hidden relative ${!showEditor ? 'flex' : 'hidden lg:flex'}`}>
        <div className="flex items-center justify-between mb-4 border-b border-cyber-border pb-3">
          <h2 className="text-[11px] font-bold text-cyber-primary uppercase tracking-[0.2em] flex items-center gap-2">
            {aiResult ? <><Bot size={14} /> Intelligence Report</> : <><ShieldAlert size={14} /> Security Matrix</>}
          </h2>
          {hasScanned && (
            <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase transition-all ${
              (aiResult || results.length === 0) 
                ? 'bg-cyber-primary/10 border-cyber-primary/20 text-cyber-primary shadow-[0_0_10px_rgba(74,222,128,0.1)]' 
                : 'bg-cyber-error/10 border-cyber-error/20 text-cyber-error'
            }`}>
              {aiResult ? 'Secure' : results.length === 0 ? 'Verified' : `${results.length} Found`}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide pb-20">
          {aiError && (
            <div className="bg-cyber-error/10 border border-cyber-error/30 p-4 rounded-xl text-cyber-error text-[12px] flex flex-col gap-3 mb-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex gap-3">
                <AlertTriangle size={16} className="shrink-0" />
                <p className="flex-1">{aiError}</p>
              </div>
              <button 
                onClick={() => {
                  if (aiError.toLowerCase().includes('quota') || aiError.includes('429')) {
                    setRetryCooldown(60);
                  }
                  handleGeminiAnalyze();
                }}
                disabled={retryCooldown > 0 || isAnalyzing}
                className="w-full py-2 bg-cyber-error/20 hover:bg-cyber-error/30 border border-cyber-error/40 text-cyber-error font-bold uppercase tracking-widest text-[10px] rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {retryCooldown > 0 ? (
                  <><RotateCcw size={12} className="animate-spin" /> Unlock in {retryCooldown}s...</>
                ) : (
                  <><RotateCcw size={12} /> Try Again Now</>
                )}
              </button>

              {aiFailCount >= 2 && (
                <div className="mt-2 border-t border-cyber-error/20 pt-3">
                  <p className="text-[10px] text-[#A3A3A3] mb-2 leading-relaxed">
                    Persistent quota issues? Use **Simulation Mode** to generate a high-fidelity deep audit report locally for your presentation.
                  </p>
                  <button 
                    onClick={() => handleGeminiAnalyze(null, null, false, null, true)}
                    className="w-full py-2 bg-cyber-primary/10 hover:bg-cyber-primary/20 border border-cyber-primary/30 text-cyber-primary font-bold uppercase tracking-widest text-[10px] rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Bot size={12} /> Activate Simulation Mode
                  </button>
                </div>
              )}
            </div>
          )}
          {isScanning ? (
             <div className="h-full flex flex-col items-center justify-center text-center gap-6 p-8">
              <div className="relative"><div className="w-20 h-20 border-4 border-cyber-primary/10 border-t-cyber-primary rounded-full animate-spin" /><div className="absolute inset-0 flex items-center justify-center"><ShieldAlert size={28} className="text-cyber-primary animate-pulse" /></div></div>
              <div><h3 className="text-cyber-text font-bold text-sm tracking-widest uppercase mb-2">Analyzing Patterns...</h3><p className="text-cyber-dark-text text-xs">Running Heuristic Engine Layer 1</p></div>
            </div>
          ) : isAnalyzing && (isEscalating || !aiResult) ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6 p-8">
              <div className="relative"><div className="w-20 h-20 border-4 border-cyber-primary/10 border-b-cyber-primary rounded-full animate-spin" /><div className="absolute inset-0 flex items-center justify-center"><Bot size={28} className="text-cyber-primary animate-pulse" /></div></div>
              <div><h3 className="text-cyber-primary font-bold text-sm tracking-widest uppercase mb-2">AI Deep Audit</h3><p className="text-cyber-dark-text text-xs">Querying Gemini 2.5 Intelligence Layer...</p></div>
            </div>
          ) : aiResult ? (
            <div className="bg-cyber-surface border border-cyber-border rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyber-primary to-transparent opacity-30" />
              <div className="text-cyber-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-5 flex items-center gap-2 border-b border-cyber-border pb-3">
                <Bot size={13} className="animate-pulse" /> Executive Summary
              </div>
              <FormattedAnalysis text={aiResult.analysis} />
            </div>
          ) : scanState === "noResults" ? (
            <EmptyState 
              title="No vulnerabilities detected" 
              subtitle="Run Deep AI analysis for advanced detection" 
              onAIAction={() => handleGeminiAnalyze()} 
            />
          ) : results.length > 0 ? (
            results.map((issue, idx) => (
              <div key={idx} className="bg-cyber-surface border border-cyber-border hover:border-cyber-primary/30 rounded-xl p-4 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border rounded ${getSeverityStyle(issue.severity)}`}>{issue.severity}</span>
                    <span className="text-[#525252] text-[10px] font-mono uppercase">Line {issue.line}</span>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(issue.codeSnippet)} className="text-cyber-dark-text hover:text-cyber-primary transition-colors"><Copy size={13} /></button>
                </div>
                <h3 className="text-cyber-text font-bold text-sm mb-2 group-hover:text-cyber-primary transition-colors">{issue.type}</h3>
                <p className="text-cyber-dark-text text-[12px] leading-relaxed mb-4">{issue.message}</p>
                <div className="bg-cyber-bg/50 rounded-lg p-3 border border-cyber-border group-hover:border-cyber-primary/20 transition-all">
                   <p className="text-cyber-dark-text text-[9px] font-bold uppercase tracking-widest mb-1">Recommended Fix</p>
                   <p className="text-cyber-text text-[11px] leading-relaxed">{issue.fix}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-cyber-dark-text gap-4 border border-dashed border-cyber-border rounded-3xl p-12">
              <div className="relative">
                <ShieldAlert size={48} className="opacity-10" />
                <div className="absolute inset-0 border-2 border-cyber-border rounded-full animate-ping opacity-5" />
              </div>
              <div><p className="text-xs font-bold mb-1 opacity-50 uppercase tracking-[0.2em]">Ready for Injection</p><p className="text-[10px] opacity-30 mt-2">Awaiting source code for multi-layer security analysis.</p></div>
            </div>
          )}
        </div>

        {/* ── FIXED ACTION BAR (BOTTOM) ── */}
        {hasScanned && !isScanning && !(isAnalyzing && (isEscalating || !aiResult)) && (
           <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-cyber-bg via-cyber-bg to-transparent pt-10">
             <div className="flex gap-2">
               {showDiff && aiResult ? (
                 <>
                   <button onClick={() => setShowDiff(false)} className="flex-1 py-3 border border-cyber-error/30 text-cyber-error hover:bg-cyber-error/10 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">
                     Reject Fix
                   </button>
                   <button 
                     onClick={() => { 
                       updateCurrentWorkspace({ code: aiResult.fixedCode, results: [], hasScanned: false, aiResult: null }); 
                       setShowDiff(false); 
                       setTimeout(() => handleScan(), 50); 
                     }} 
                     className="flex-[1.8] py-3 bg-cyber-primary text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-cyber-primary-hover shadow-[0_0_15px_rgba(74,222,128,0.3)] flex items-center justify-center gap-2"
                   >
                     <CheckCircle size={14} /> Accept & Rescan
                   </button>
                 </>
               ) : aiResult ? (
                 aiResult.fixedCode === code || aiResult.analysis.toLowerCase().includes("no issues found") || aiResult.analysis.toLowerCase().includes("zero vulnerabilities") ? (
                   <div className="flex-1 flex gap-2">
                      <div className="flex-1 py-3 bg-cyber-primary/10 border border-cyber-primary/30 text-cyber-primary rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <CheckCircle size={14} /> No Changes Required
                      </div>
                      <button onClick={() => updateCurrentWorkspace({ aiResult: null })} className="px-4 py-3 border border-cyber-border text-cyber-dark-text hover:text-cyber-text rounded-xl transition-all" title="Clear Report">
                        Dismiss
                      </button>
                   </div>
                 ) : (
                   <>
                     <button onClick={() => updateCurrentWorkspace({ aiResult: null })} className="flex-1 py-3 border border-cyber-border text-cyber-dark-text hover:text-cyber-text rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">
                       Dismiss
                     </button>
                     <button onClick={() => setShowDiff(true)} className="flex-[1.8] py-3 bg-cyber-primary text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-cyber-primary-hover shadow-[0_0_15px_rgba(74,222,128,0.3)] flex items-center justify-center gap-2">
                       <Code2 size={14} /> Review & Apply Fix
                     </button>
                   </>
                 )
               ) : (
                 <>
                    <button
                      onClick={handleBookmark}
                      className={`flex-1 py-3 border rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${bookmarked ? 'bg-cyber-primary/10 border-cyber-primary text-cyber-primary' : 'border-cyber-border text-[#525252] hover:text-white hover:border-[#404040]'}`}
                    >
                      {bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />} {bookmarked ? 'Saved' : 'Bookmark'}
                    </button>
                    <button
                      onClick={() => handleGeminiAnalyze()}
                      disabled={isAnalyzing}
                      className="flex-[1.8] py-3 bg-cyber-primary text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-cyber-primary-hover shadow-[0_0_15px_rgba(74,222,128,0.3)] flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center gap-3">
                          <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Analyzing...
                        </span>
                      ) : (
                        <><Bot size={14} /> Deep AI Analyze</>
                      )}
                    </button>
                  </>
               )}
             </div>
           </div>
          )}
        </div>
      </div>
  );
}
