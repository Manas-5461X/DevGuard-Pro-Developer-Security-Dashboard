import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { analyzeCode } from '../utils/analyzer';
import { useScans } from '../hooks/useScans';
import { analyzeWithGemini } from '../utils/ai';
import { ShieldAlert, CheckCircle, Copy, AlertTriangle, Info, Play, Trash2, Code2, Bot, Bookmark, BookmarkCheck, Download, ChevronDown, ChevronUp } from 'lucide-react';

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

// Renders AI analysis text with rich formatting
function FormattedAnalysis({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) { i++; continue; }

    // Numbered list item (1. or 1:)
    const numMatch = line.match(/^(\d+)[.:]\s+(.+)$/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex gap-3 py-1.5">
          <span className="w-6 h-6 rounded-full bg-cyber-primary/15 border border-cyber-primary/30 text-cyber-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <span className="text-[14px] leading-relaxed text-[#D4D4D4]">{renderInline(numMatch[2])}</span>
        </div>
      );
      i++; continue;
    }

    // Bullet list item
    const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) {
      elements.push(
        <div key={i} className="flex gap-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-primary mt-2 shrink-0" />
          <span className="text-[14px] leading-relaxed text-[#D4D4D4]">{renderInline(bulletMatch[1])}</span>
        </div>
      );
      i++; continue;
    }

    // Bold heading (ALL CAPS or **text**)
    const boldMatch = line.match(/^\*\*(.+)\*\*$/) || (line === line.toUpperCase() && line.length < 60 && line.length > 3);
    if (boldMatch) {
      const heading = typeof boldMatch === 'boolean' ? line : boldMatch[1];
      elements.push(
        <p key={i} className="text-cyber-primary text-[11px] font-bold tracking-widest uppercase mt-4 mb-1 first:mt-0">
          {heading}
        </p>
      );
      i++; continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-[14px] leading-relaxed text-[#D4D4D4] py-1">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text) {
  // Replace `code` with styled span
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-[#0A0A0A] border border-[#262626] text-cyber-primary text-[12px] px-1.5 py-0.5 rounded font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function Scanner() {
  const location = useLocation();
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE['javascript']);
  const [results, setResults] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [showEditor, setShowEditor] = useState(true); // Mobile toggle

  const [currentScanId, setCurrentScanId] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [showDiff, setShowDiff] = useState(false);

  const { scans, saveScan, toggleBookmark } = useScans();

  useEffect(() => {
    const existingScan = scans.find(s => s.code === code);
    if (existingScan) {
      setCurrentScanId(existingScan.id);
      setIsBookmarked(existingScan.isBookmarked);
    } else {
      setCurrentScanId(null);
      setIsBookmarked(false);
    }
  }, [code, scans]);

  useEffect(() => {
    if (location.state?.restoreCode) {
      setCode(location.state.restoreCode);
      resetScanState();
    }
  }, [location.state]);

  const getMonacoLanguage = (lang) => {
    const map = { react: 'javascript', angular: 'typescript', vue: 'html', svelte: 'html', docker: 'dockerfile' };
    return map[lang] || lang;
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setCode(DEFAULT_CODE[e.target.value]);
    resetScanState();
  };

  const resetScanState = () => {
    setResults([]); setHasScanned(false); setAiResult(null);
    setShowDiff(false); setCurrentScanId(null); setIsBookmarked(false); setAiError(null);
  };

  const handleScan = async () => {
    const findings = analyzeCode(code);
    setResults(findings);
    setHasScanned(true);
    setAiResult(null); setShowDiff(false); setIsBookmarked(false); setAiError(null);
    // On mobile: switch to results panel
    setShowEditor(false);
    if (findings.length > 0) {
      try {
        const scanId = await saveScan(code, findings);
        setCurrentScanId(scanId);
      } catch (err) { console.error('Auto-save failed', err); }
    }
  };

  const handleClear = () => { setCode(DEFAULT_CODE[language]); resetScanState(); setShowEditor(true); };

  const handleBookmarkToggle = async () => {
    if (!currentScanId) return;
    try { await toggleBookmark(currentScanId, isBookmarked); setIsBookmarked(!isBookmarked); }
    catch(err) { console.error(err); }
  };

  const handleGeminiAnalyze = async () => {
    if (!results.length) return;
    setIsAnalyzing(true); setAiError(null);
    try { setAiResult(await analyzeWithGemini(code, results)); }
    catch (err) { setAiError(err.message); }
    setIsAnalyzing(false);
  };

  const handleDownload = () => {
    const ext = { javascript:'js',python:'py',java:'java',php:'php',shell:'sh',go:'go',cpp:'cpp',rust:'rs',react:'jsx',angular:'ts',vue:'vue',svelte:'svelte',ruby:'rb',swift:'swift',kotlin:'kt',docker:'Dockerfile' };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit_source.${ext[language] || 'txt'}`; a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (s) => ({
    critical: 'text-cyber-error border-cyber-error bg-cyber-error/10',
    high: 'text-[#f97316] border-[#f97316] bg-[#f97316]/10',
    medium: 'text-cyber-warning border-cyber-warning bg-cyber-warning/10',
    low: 'text-cyber-primary border-cyber-primary bg-cyber-primary/10',
  }[s] || 'text-[#737373] border-[#737373] bg-[#737373]/10');

  const getSeverityIcon = (s) => ({
    critical: <ShieldAlert size={14} />,
    high: <AlertTriangle size={14} />,
    medium: <AlertTriangle size={14} />,
    low: <Info size={14} />,
  }[s] || <Info size={14} />);

  return (
    <div className="h-[calc(100vh-5rem)] lg:h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-0 lg:gap-6 -m-4 md:-m-8 lg:m-0">

      {/* ── Mobile Tab Toggle ── */}
      <div className="lg:hidden flex border-b border-[#1A1A1A] bg-[#0A0A0A] shrink-0">
        <button
          onClick={() => setShowEditor(true)}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${showEditor ? 'text-cyber-primary border-b-2 border-cyber-primary' : 'text-[#737373]'}`}
        >
          <Code2 size={14} /> Editor
        </button>
        <button
          onClick={() => setShowEditor(false)}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${!showEditor ? 'text-cyber-primary border-b-2 border-cyber-primary' : 'text-[#737373]'}`}
        >
          <ShieldAlert size={14} /> Results
          {hasScanned && results.length > 0 && (
            <span className="w-4 h-4 bg-cyber-error text-white text-[10px] rounded-full flex items-center justify-center">
              {results.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Editor Panel ── */}
      <div className={`flex-1 flex flex-col bg-[#121212] border border-[#262626] rounded-none lg:rounded-2xl overflow-hidden ${showEditor ? 'flex' : 'hidden lg:flex'}`}>
        {/* Editor Toolbar */}
        <div className="shrink-0 h-12 border-b border-[#262626] flex items-center justify-between px-3 md:px-4 gap-2 bg-[#0D0D0D]">
          <div className="flex items-center gap-2 min-w-0">
            <Code2 size={15} className="text-cyber-primary shrink-0" />
            <span className="text-white text-xs font-bold tracking-widest uppercase hidden sm:block">Workspace</span>
            <div className="w-px h-4 bg-[#262626] hidden sm:block" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-cyber-primary text-xs border-none outline-none cursor-pointer min-w-0 max-w-[120px] md:max-w-none"
            >
              {[
                ['javascript','JavaScript / TypeScript'],['python','Python'],['java','Java / C#'],
                ['php','PHP'],['shell','Shell Script'],['go','Go'],['cpp','C / C++'],
                ['rust','Rust'],['react','React (JSX)'],['angular','Angular'],
                ['vue','Vue.js'],['svelte','Svelte'],['ruby','Ruby'],
                ['swift','Swift'],['kotlin','Kotlin'],['docker','Dockerfile'],
              ].map(([v, l]) => <option key={v} value={v} className="bg-[#0A0A0A]">{l}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={handleDownload} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-[#262626] text-[#737373] hover:text-white hover:bg-white/5 rounded-lg text-[11px] font-semibold transition-all" title="Download">
              <Download size={13} /> <span className="hidden md:inline">Download</span>
            </button>
            <button onClick={handleClear} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#262626] text-[#737373] hover:text-white hover:bg-white/5 rounded-lg text-[11px] font-semibold transition-all">
              <Trash2 size={13} /> <span className="hidden md:inline">Clear</span>
            </button>
            <button
              onClick={handleScan}
              disabled={showDiff}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-cyber-primary text-black font-bold rounded-lg text-[11px] uppercase tracking-widest hover:bg-cyber-primary-hover transition-all disabled:opacity-50 shadow-[0_0_12px_rgba(74,222,128,0.3)]"
            >
              <Play size={13} fill="currentColor" /> <span>Scan</span>
            </button>
          </div>
        </div>

        {/* AI Error Banner */}
        {aiError && (
          <div className="shrink-0 flex items-start gap-3 p-3 bg-cyber-error/10 border-b border-cyber-error/30">
            <ShieldAlert size={16} className="text-cyber-error shrink-0 mt-0.5" />
            <p className="text-cyber-error text-xs leading-relaxed flex-1">{aiError}</p>
            <button onClick={() => setAiError(null)} className="text-cyber-error/60 hover:text-cyber-error shrink-0">✕</button>
          </div>
        )}

        {/* Monaco Editor / Diff */}
        <div className="flex-1 overflow-hidden">
          {showDiff && aiResult ? (
            <DiffEditor
              height="100%"
              language={getMonacoLanguage(language)}
              theme="vs-dark"
              original={code}
              modified={aiResult.fixedCode}
              options={{ minimap:{enabled:false}, fontSize:13, fontFamily:"'JetBrains Mono', monospace", padding:{top:12}, renderSideBySide:false }}
            />
          ) : (
            <Editor
              height="100%"
              language={getMonacoLanguage(language)}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{ minimap:{enabled:false}, fontSize:13, fontFamily:"'JetBrains Mono', monospace", padding:{top:12}, scrollBeyondLastLine:false }}
            />
          )}
        </div>
      </div>

      {/* ── Results Panel ── */}
      <div className={`w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col p-4 md:p-0 overflow-hidden ${!showEditor ? 'flex' : 'hidden lg:flex'}`}>

        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            {aiResult ? (
              <><Bot size={16} className="text-cyber-primary" /> AI Report</>
            ) : (
              <><ShieldAlert size={16} className="text-cyber-primary" /> Analysis Results</>
            )}
          </h2>
          {hasScanned && !aiResult && (
            <span className="text-[10px] font-bold px-2 py-1 border border-[#404040] text-[#737373] rounded-full">
              {results.length} issues
            </span>
          )}
        </div>

        {/* Results scroll area */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {!hasScanned ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#525252] gap-4 border border-dashed border-[#262626] rounded-2xl p-8">
              <ShieldAlert size={40} className="text-[#262626]" />
              <div>
                <p className="text-sm font-semibold text-[#737373] mb-1">Ready to Scan</p>
                <p className="text-xs text-[#525252]">Paste code into the editor and click Scan to detect vulnerabilities.</p>
              </div>
            </div>
          ) : aiResult ? (
            /* ── AI Executive Summary ── */
            <div className="bg-[#0D1A12] border border-cyber-primary/30 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-cyber-primary/20 bg-cyber-primary/5">
                <Bot size={16} className="text-cyber-primary" />
                <span className="text-cyber-primary text-xs font-bold tracking-widest uppercase">Executive Summary</span>
              </div>
              <div className="p-5">
                <FormattedAnalysis text={aiResult.analysis} />
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-cyber-primary gap-3 border border-cyber-primary/20 bg-cyber-primary/5 rounded-2xl p-8">
              <CheckCircle size={40} />
              <div>
                <h3 className="text-sm font-bold tracking-widest uppercase mb-1">System Secure</h3>
                <p className="text-xs text-cyber-primary/70">No vulnerabilities detected in this scan.</p>
              </div>
            </div>
          ) : (
            results.map((issue, idx) => (
              <div key={idx} className="bg-[#121212] border border-[#262626] hover:border-[#404040] rounded-xl p-4 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-md ${getSeverityColor(issue.severity)}`}>
                      {getSeverityIcon(issue.severity)} {issue.severity}
                    </span>
                    <span className="text-[#525252] text-[11px] font-mono">Line {issue.line}</span>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(issue.codeSnippet)} className="text-[#525252] hover:text-cyber-primary transition-colors p-1">
                    <Copy size={14} />
                  </button>
                </div>
                <h3 className="text-white font-bold text-sm mb-1.5">{issue.type}</h3>
                <p className="text-[#A3A3A3] text-[13px] leading-relaxed mb-3">{issue.message}</p>
                <div className="bg-[#0A0A0A] rounded-lg p-3 border border-[#1A1A1A]">
                  <p className="text-[10px] text-cyber-primary font-bold uppercase tracking-widest mb-1.5">Recommended Fix</p>
                  <p className="text-[#A3A3A3] text-[12px] leading-relaxed">{issue.fix}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action bar */}
        {hasScanned && results.length > 0 && (
          <div className="mt-3 shrink-0 flex gap-2 pt-3 border-t border-[#1A1A1A]">
            {showDiff ? (
              <>
                <button onClick={() => { setAiResult(null); setShowDiff(false); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-cyber-error text-cyber-error hover:bg-cyber-error/10 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all">
                  Reject
                </button>
                <button onClick={() => { setCode(aiResult.fixedCode); resetScanState(); }} className="flex-[1.5] flex items-center justify-center gap-1.5 py-2.5 bg-cyber-primary text-black rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-cyber-primary-hover transition-all">
                  <CheckCircle size={14} /> Accept Fix
                </button>
              </>
            ) : aiResult ? (
              <>
                <button onClick={() => { setAiResult(null); setShowDiff(false); }} className="flex-1 flex items-center justify-center py-2.5 border border-[#262626] text-[#737373] hover:text-white rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all">
                  Dismiss
                </button>
                <button onClick={() => setShowDiff(true)} className="flex-[1.5] flex items-center justify-center gap-1.5 py-2.5 bg-cyber-primary text-black rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-cyber-primary-hover transition-all">
                  <Code2 size={14} /> Review Fix
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBookmarkToggle}
                  disabled={!currentScanId}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 border rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all disabled:opacity-40 ${isBookmarked ? 'bg-cyber-primary/10 border-cyber-primary text-cyber-primary' : 'border-[#262626] text-[#737373] hover:text-white hover:border-[#404040]'}`}
                >
                  {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                </button>
                <button
                  onClick={handleGeminiAnalyze}
                  disabled={isAnalyzing}
                  className="flex-[1.5] flex items-center justify-center gap-1.5 py-2.5 bg-cyber-primary text-black rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-cyber-primary-hover transition-all disabled:opacity-50 shadow-[0_0_12px_rgba(74,222,128,0.25)]"
                >
                  <Bot size={14} />
                  {isAnalyzing ? (
                    <><span className="w-3 h-3 border border-black/30 border-t-black rounded-full animate-spin" /> Analyzing</>
                  ) : 'AI Analyze'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
