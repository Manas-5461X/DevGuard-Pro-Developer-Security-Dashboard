import React, { useState } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { analyzeCode } from '../utils/analyzer';
import { useScans } from '../hooks/useScans';
import { analyzeWithGemini } from '../utils/ai';
import { ShieldAlert, CheckCircle, Copy, AlertTriangle, Info, Play, Trash2, Code2, Bot, Bookmark, BookmarkCheck } from 'lucide-react';

const DEFAULT_CODE = {
  javascript: '// Paste your JavaScript code here\n\nconst API_KEY = "12345678901234";\ndocument.write("Hello User");\n',
  python: '# Paste your Python code here\n\nimport sqlite3\nconn = sqlite3.connect("users.db")\npassword = "supersecretpassword"\nquery = "SELECT * FROM users WHERE root = " + user_input\n',
  java: '// Paste your Java code here\n\nString AWS_SECRET = "AKIAIOSFODNN7EXAMPLE";\nStatement statement = connection.createStatement();\nResultSet resultSet = statement.executeQuery("SELECT * FROM users WHERE name = \'" + userName + "\'");\n',
  php: '<?php\n// Paste your PHP code here\n$secret = "my_database_password";\necho "Hello " . $_GET["name"];\n?>',
  shell: '# Paste your Shell script here\n\nexport PROD_TOKEN="ghp_123456789"\neval $USER_INPUT\nrm -rf $UNQUOTED_VAR/*',
  go: '// Paste your Go code here\n\npassword := "admin123"\nquery := fmt.Sprintf("SELECT * FROM users WHERE username=\'%s\'", userInput)\ndb.Query(query)',
  cpp: '// Paste your C/C++ code here\n\nchar buffer[50];\nchar* secret = "MY_STATIC_KEY";\ngets(buffer); // Unsafe!',
  rust: '// Paste your Rust code here\n\nlet secret_token = "1234567890";\nunsafe {\n    // Bypassing safety checks\n    std::ptr::read(ptr);\n}',
  ruby: '# Paste your Ruby code here\n\nAWS_KEY = "AKIAIOSFODNN7EXAMPLE"\nsystem("ping -c 1 " + user_input)',
  swift: '// Paste your Swift mobile code here\n\nlet password = "supersecretpassword"\nUserDefaults.standard.set(password, forKey: "user_password")',
  kotlin: '// Paste your Kotlin Android code here\n\nval sharedPref = activity?.getPreferences(Context.MODE_PRIVATE)\nwith (sharedPref.edit()) {\n    putString("user_password", "top_secret123")\n    apply()\n}',
  vue: '<!-- Paste your Vue template here -->\n\n<template>\n  <div v-html="userProvidedMarkup"></div>\n</template>',
  svelte: '<!-- Paste your Svelte code here -->\n\n<script>\n  export let userHtml = "<script>alert(1)<\\/script>";\n</script>\n\n<div>{@html userHtml}</div>',
  docker: '# Paste your Dockerfile or Config here\n\nFROM ubuntu:latest\nRUN chmod 777 /etc/config\nCMD ["node", "app.js"]',
  react: '// Paste your React JSX code here\n\nconst userComment = "<img src=x onerror=alert(1)>";\nreturn <div dangerouslySetInnerHTML={{ __html: userComment }} />;',
  angular: '// Paste your Angular TypeScript code here\n\nimport { DomSanitizer } from "@angular/platform-browser";\nthis.sanitizer.bypassSecurityTrustHtml(userInput);'
};

export default function Scanner() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE['javascript']);
  const [results, setResults] = useState([]);
  const [hasScanned, setHasScanned] = useState(false);
  
  // AI and History States
  const [currentScanId, setCurrentScanId] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [aiSuggestedCode, setAiSuggestedCode] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);

  const { saveScan, toggleBookmark } = useScans();

  const getMonacoLanguage = (lang) => {
    switch(lang) {
      case 'react': return 'javascript';
      case 'angular': return 'typescript';
      case 'vue': return 'html';
      case 'svelte': return 'html';
      case 'docker': return 'dockerfile';
      case 'ruby': return 'ruby';
      case 'swift': return 'swift';
      case 'kotlin': return 'kotlin';
      case 'cpp': return 'cpp';
      default: return lang;
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang]);
    setResults([]);
    setHasScanned(false);
    setAiSuggestedCode(null);
    setCurrentScanId(null);
    setIsBookmarked(false);
    setAiError(null);
  };

  const handleScan = async () => {
    const findings = analyzeCode(code);
    setResults(findings);
    setHasScanned(true);
    setAiSuggestedCode(null);
    setIsBookmarked(false);
    setAiError(null);
    
    // Auto-audit logs background save
    if (findings.length > 0) {
      try {
        const scanId = await saveScan(code, findings);
        setCurrentScanId(scanId);
      } catch (err) {
        console.error('Audit log auto-save failed', err);
      }
    } else {
      setCurrentScanId(null);
    }
  };

  const handleClear = () => {
    setCode(DEFAULT_CODE[language]);
    setResults([]);
    setHasScanned(false);
    setAiSuggestedCode(null);
    setCurrentScanId(null);
    setIsBookmarked(false);
  };

  const handleBookmarkToggle = async () => {
    if (!currentScanId) return;
    try {
      await toggleBookmark(currentScanId, isBookmarked);
      setIsBookmarked(!isBookmarked);
    } catch(err) {
      console.error(err);
    }
  };

  const handleGeminiAnalyze = async () => {
    if (!results.length) return;
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const fixedCode = await analyzeWithGemini(code, results);
      setAiSuggestedCode(fixedCode);
    } catch (err) {
      setAiError(err.message);
    }
    setIsAnalyzing(false);
  };

  const handleAcceptFix = () => {
    setCode(aiSuggestedCode);
    setAiSuggestedCode(null);
    setResults([]);
    setHasScanned(false);
    setCurrentScanId(null);
  };

  const handleRejectFix = () => {
    setAiSuggestedCode(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-cyber-error border-cyber-error bg-cyber-error/10';
      case 'high': return 'text-[#ff6600] border-[#ff6600] bg-[#ff6600]/10';
      case 'medium': return 'text-cyber-warning border-cyber-warning bg-cyber-warning/10';
      case 'low': return 'text-cyber-primary border-cyber-primary bg-cyber-primary/10';
      default: return 'text-cyber-dark-text border-cyber-dark-text bg-cyber-surface';
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
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Editor Section */}
      <div className="flex-1 flex flex-col cyber-panel overflow-hidden shadow-2xl">
        <div className="h-12 border-b border-cyber-border flex items-center justify-between px-4 z-20 bg-cyber-surface">
          <div className="flex items-center gap-3">
            <h2 className="text-cyber-text font-bold text-sm tracking-widest flex items-center gap-2 uppercase">
              <Code2 size={16} className="text-cyber-primary glow-text" />
              Workspace
            </h2>
            <div className="h-4 w-px bg-cyber-border"></div>
            <select 
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-cyber-primary text-sm border-none outline-none cursor-pointer tracking-wider focus:outline-none"
            >
              <option value="javascript" className="bg-cyber-bg text-cyber-text">JavaScript / TypeScript</option>
              <option value="python" className="bg-cyber-bg text-cyber-text">Python</option>
              <option value="java" className="bg-cyber-bg text-cyber-text">Java / C#</option>
              <option value="php" className="bg-cyber-bg text-cyber-text">PHP</option>
              <option value="shell" className="bg-cyber-bg text-cyber-text">Shell Script</option>
              <option value="go" className="bg-cyber-bg text-cyber-text">Go (Golang)</option>
              <option value="cpp" className="bg-cyber-bg text-cyber-text">C / C++</option>
              <option value="rust" className="bg-cyber-bg text-cyber-text">Rust</option>
              <option value="react" className="bg-cyber-bg text-cyber-text">React (JSX)</option>
              <option value="angular" className="bg-cyber-bg text-cyber-text">Angular</option>
              <option value="vue" className="bg-cyber-bg text-cyber-text">Vue.js</option>
              <option value="svelte" className="bg-cyber-bg text-cyber-text">Svelte</option>
              <option value="ruby" className="bg-cyber-bg text-cyber-text">Ruby</option>
              <option value="swift" className="bg-cyber-bg text-cyber-text">Swift</option>
              <option value="kotlin" className="bg-cyber-bg text-cyber-text">Kotlin</option>
              <option value="docker" className="bg-cyber-bg text-cyber-text">Dockerfile / Shell</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-1.5 border border-cyber-border text-cyber-dark-text hover:text-cyber-text transition-colors text-sm uppercase tracking-widest"
            >
              <Trash2 size={16} />
              CLEAR
            </button>
            <button
              onClick={handleScan}
              disabled={aiSuggestedCode !== null}
              className="flex items-center gap-2 px-6 py-1.5 bg-cyber-primary text-[#000] hover:bg-cyber-primary-hover transition-colors text-sm font-bold shadow-[0_0_15px_rgba(0,255,102,0.4)] uppercase tracking-widest disabled:opacity-50"
            >
              <Play size={16} />
              Run Scan
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          {aiError && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1a0f0f] border border-cyber-error p-4 text-cyber-error shadow-2xl flex items-start gap-4 inline-block max-w-[80%] rounded-sm">
               <ShieldAlert size={24} className="shrink-0 animate-pulse" />
               <div className="flex-1 relative top-0.5">
                  <h3 className="font-bold uppercase tracking-widest text-[13px] mb-1">Inference Execution Failed</h3>
                  <p className="text-xs opacity-90 leading-relaxed font-mono">{aiError}</p>
               </div>
               <button onClick={() => setAiError(null)} className="ml-2 text-cyber-error/70 hover:text-cyber-error transition-colors p-1" title="Dismiss">
                 <Trash2 size={16} />
               </button>
             </div>
          )}
          {aiSuggestedCode ? (
            <>
              <DiffEditor
                height="100%"
                language={getMonacoLanguage(language)}
                theme="vs-dark"
                original={code}
                modified={aiSuggestedCode}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Space Mono', monospace",
                  padding: { top: 16 },
                  renderSideBySide: false,
                  readOnly: false
                }}
              />
              <div className="absolute bottom-6 right-6 flex gap-4 z-10 p-4 cyber-panel border-cyber-primary shadow-2xl">
                <button onClick={handleRejectFix} className="px-6 py-2 border flex items-center gap-2 border-cyber-error text-cyber-error uppercase tracking-widest font-bold hover:bg-cyber-error/10 text-sm">
                  Reject Fix
                </button>
                <button onClick={handleAcceptFix} className="px-6 py-2 flex items-center gap-2 bg-cyber-primary text-[#000] uppercase tracking-widest font-bold hover:bg-cyber-primary-hover shadow-[0_0_15px_rgba(0,255,102,0.4)] text-sm">
                  <CheckCircle size={18} />
                  Accept Fix
                </button>
              </div>
            </>
          ) : (
            <Editor
              height="100%"
              language={getMonacoLanguage(language)}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Space Mono', monospace",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true
              }}
            />
          )}
        </div>
      </div>

      <div className="xl:w-1/3 flex flex-col h-full min-h-[500px]">
        <h2 className="text-lg font-bold text-cyber-text mb-4 tracking-widest uppercase flex items-center gap-2 border-b border-cyber-border pb-2 shrink-0">
          Analysis Results
          {hasScanned && (
            <span className="text-xs font-normal px-2 py-0 border border-cyber-primary text-cyber-primary">
              [{results.length} ENTRIES]
            </span>
          )}
        </h2>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {!hasScanned ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-cyber-dark-text gap-4 border border-dashed border-cyber-border p-8 cyber-panel">
              <ShieldAlert size={48} className="opacity-50" />
              <p className="tracking-widest uppercase text-sm">Ready to scan.<br/>Run a scan to see results here.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-cyber-primary gap-4 border border-cyber-primary p-8 cyber-panel shadow-[inset_0_0_30px_rgba(0,255,102,0.05)]">
              <CheckCircle size={48} className="glow-text" />
              <h3 className="text-lg font-bold tracking-widest uppercase">System Secure</h3>
              <p className="text-sm opacity-80">No vulnerabilities detected matching current heuristics.</p>
            </div>
          ) : (
            results.map((issue, idx) => (
              <div key={idx} className="cyber-panel p-4 group hover:border-cyber-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-3 border-b border-cyber-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold uppercase tracking-wider border ${getSeverityColor(issue.severity)}`}>
                      {getSeverityIcon(issue.severity)}
                      {issue.severity}
                    </span>
                    <span className="text-cyber-dark-text text-sm">src:{issue.line}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(issue.codeSnippet)}
                    className="text-cyber-dark-text hover:text-cyber-primary transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                
                <h3 className="text-white font-bold mb-2 uppercase tracking-wide text-sm">{issue.type}</h3>
                <p className="text-cyber-text text-sm mb-4 leading-relaxed opacity-80 glow-text">{issue.message}</p>
                
                <div className="bg-[#000] p-3 border border-cyber-border/50">
                  <div className="text-xs text-cyber-primary font-bold mb-1 tracking-widest">Recommended Fix:</div>
                  <p className="text-sm text-cyber-text opacity-90">{issue.fix}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Bottom Bar */}
        {hasScanned && results.length > 0 && (
          <div className="mt-4 flex gap-3 border-t border-cyber-border pt-4 shrink-0">
            <button
               onClick={handleBookmarkToggle}
               disabled={!currentScanId}
               className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border transition-colors uppercase tracking-widest font-bold text-sm disabled:opacity-50 ${isBookmarked ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary shadow-[0_0_10px_rgba(0,255,102,0.2)]' : 'border-cyber-border text-cyber-dark-text hover:text-cyber-text hover:border-cyber-primary/50'}`}
            >
              {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              {isBookmarked ? 'Bookmarked' : 'Bookmark Scan'}
            </button>
            <button
               onClick={handleGeminiAnalyze}
               disabled={isAnalyzing || aiSuggestedCode !== null}
               className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyber-primary text-[#000] hover:bg-cyber-primary-hover shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-colors uppercase tracking-widest font-bold text-sm disabled:opacity-50"
            >
               <Bot size={18} />
               {isAnalyzing ? 'Analyzing Code...' : 'Analyze with Gemini'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
