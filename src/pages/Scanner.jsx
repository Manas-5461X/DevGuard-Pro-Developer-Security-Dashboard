import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { analyzeCode } from '../utils/analyzer';
import { useScans } from '../hooks/useScans';
import { ShieldAlert, CheckCircle, Copy, AlertTriangle, Info, Play, Trash2, Save, Code2 } from 'lucide-react';

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
  const [isSaving, setIsSaving] = useState(false);
  const { saveScan } = useScans();

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
  };

  const handleScan = () => {
    const findings = analyzeCode(code);
    setResults(findings);
    setHasScanned(true);
  };

  const handleClear = () => {
    setCode(DEFAULT_CODE[language]);
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
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Editor Section */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e] rounded-xl border border-[#3c3c3c] overflow-hidden shadow-2xl">
        <div className="h-12 bg-[#252526] border-b border-[#3c3c3c] flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <h2 className="text-gray-300 font-medium text-sm flex items-center gap-2">
              <Code2 size={16} />
              Workspace
            </h2>
            <div className="h-4 w-px bg-[#3c3c3c]"></div>
            <select 
              value={language}
              onChange={handleLanguageChange}
              className="bg-[#1e1e1e] text-gray-300 text-sm border border-[#3c3c3c] rounded px-2 py-1 outline-none focus:border-blue-500 transition-colors"
            >
              <option value="javascript">JavaScript / TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java / C#</option>
              <option value="php">PHP</option>
              <option value="shell">Shell Script</option>
              <option value="go">Go (Golang)</option>
              <option value="cpp">C / C++</option>
              <option value="rust">Rust</option>
              <option value="react">React (JSX)</option>
              <option value="angular">Angular</option>
              <option value="vue">Vue.js</option>
              <option value="svelte">Svelte</option>
              <option value="ruby">Ruby</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="docker">Dockerfile / Shell</option>
            </select>
          </div>
          <div className="flex gap-3">
            {hasScanned && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-1.5 bg-[#252526] hover:bg-[#2d2d2d] text-green-500 border border-green-500/30 hover:border-green-500/60 rounded-lg transition-colors text-sm disabled:opacity-50"
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
            language={getMonacoLanguage(language)}
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

