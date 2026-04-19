import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, AlertTriangle, Terminal, Code2, CheckCircle2, XCircle } from 'lucide-react';

export default function Docs() {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction & Methodology', icon: <Shield size={16} /> },
    { id: 'owasp-top-10', title: 'OWASP Top 10 Context', icon: <AlertTriangle size={16} /> },
    { id: 'xss-prevention', title: 'XSS & Injection Defense', icon: <Code2 size={16} /> },
    { id: 'secrets-management', title: 'Secrets & Cryptography', icon: <Lock size={16} /> },
    { id: 'ai-heuristics', title: 'AI Remediation Engine', icon: <Eye size={16} /> },
    { id: 'best-practices', title: 'Language Architectures', icon: <Terminal size={16} /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-12 pb-32 max-w-7xl mx-auto">
      {/* Sticky Table of Contents */}
      <nav className="hidden lg:block w-64 shrink-0 pt-8">
        <div className="sticky top-8 bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl">
          <h3 className="text-[#A3A3A3] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
            Documentation Base
          </h3>
          <ul className="flex flex-col gap-2">
            {sections.map(section => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-full text-[13px] font-medium transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-cyber-primary text-[#000] shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                      : 'text-[#737373] hover:text-[#F5F5F5] hover:bg-white/5'
                  }`}
                >
                  {section.icon}
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 pt-8">
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">System Documentation</h1>
          <p className="text-[#A3A3A3] text-lg leading-relaxed">
            Welcome to the DevGuard Pro architectural documentation. This encyclopedia covers
            static application security testing (SAST) methodologies, mitigation techniques, and the underlying heuristic engine.
          </p>
        </div>

        <div className="space-y-32">
          {/* SECTION 1: INTRODUCTION */}
          <section id="introduction" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#262626] pb-4 mb-8">
              <Shield className="text-cyber-primary" size={28} />
              <h2 className="text-2xl font-bold text-[#F5F5F5]">1. Introduction & Methodology</h2>
            </div>
            
            <div className="prose prose-invert max-w-none text-[#A3A3A3] text-[15px] leading-8 space-y-6">
              <p>
                DevGuard Pro operates as a sophisticated hybrid engine combining lightning-fast regular expression based 
                pattern matching (Heuristics) with Large Language Model (LLM) contextual remediation workflows. The primary 
                objective of this system is to push security "Left" in the software development lifecycle (SDLC), providing 
                developers with immediate feedback regarding cryptographic failures, injection vulnerabilities, and bad data handling.
              </p>
              
              <h3 className="text-white text-lg font-semibold mt-8 mb-4">1.1 Static Analysis (SAST) Overview</h3>
              <p>
                Static Application Security Testing (SAST) evaluates source code without executing it. Our heuristic engine 
                reads raw source code and evaluates it against thousands of recognized vulnerability signatures. Unlike Dynamic 
                Analysis (DAST), SAST provides an immediate 100% code coverage scan identifying insecure library usages, dangerous 
                DOM manipulations, and plaintext secret exposures immediately during the pre-commit or CI/CD stage.
              </p>

              <h3 className="text-white text-lg font-semibold mt-8 mb-4">1.2 Heuristic Signature Matching</h3>
              <p>
                Our pipeline utilizes highly optimized regex constraints mapped directly against CVE (Common Vulnerabilities and Exposures) 
                and CWE (Common Weakness Enumeration) frameworks. By mapping strings to known bad practices—such as evaluating arbitrary 
                user input via <code className="bg-[#121212] px-2 py-1 rounded text-cyber-primary">eval()</code> in Node.js, or passing unsanitized SQL variables—the engine achieves sub-millisecond alerting.
              </p>
            </div>
          </section>

          {/* SECTION 2: OWASP */}
          <section id="owasp-top-10" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#262626] pb-4 mb-8">
              <AlertTriangle className="text-cyber-primary" size={28} />
              <h2 className="text-2xl font-bold text-[#F5F5F5]">2. OWASP Top 10 Context</h2>
            </div>
            
            <div className="prose prose-invert max-w-none text-[#A3A3A3] text-[15px] leading-8 space-y-6">
              <p>
                The Open Web Application Security Project (OWASP) Top 10 defines the preeminent standard for web application security.
                DevGuard Pro heuristics are explicitly tailored to detect anti-patterns related directly to the OWASP framework.
              </p>

              <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 mt-6">
                <h4 className="text-white font-bold mb-2">A01:2021-Broken Access Control</h4>
                <p className="text-sm">Failures typically lead to unauthorized information disclosure, modification, or destruction of all data. Avoid predictable IDs, utilize JWT effectively, and enforce server-side routing guards.</p>
              </div>

              <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6">
                <h4 className="text-white font-bold mb-2">A03:2021-Injection</h4>
                <p className="text-sm">Occurs when user-supplied data is not validated, filtered, or sanitized by the application. SQL Injection (SQLi), NoSQLi, OS Command Injection, and LDAP injections fall under this massive category.</p>
              </div>

              <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6">
                <h4 className="text-white font-bold mb-2">A07:2021-Identification and Authentication Failures</h4>
                <p className="text-sm">Confirming user identity and session management is paramount. Implementing stateless secure protocols like OAuth 2.0 or properly signed JSON Web Tokens (JWT) prevents session hijacking.</p>
              </div>
            </div>
          </section>

          {/* SECTION 3: XSS & Injection */}
          <section id="xss-prevention" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#262626] pb-4 mb-8">
              <Code2 className="text-cyber-primary" size={28} />
              <h2 className="text-2xl font-bold text-[#F5F5F5]">3. XSS & Injection Defense</h2>
            </div>
            
            <div className="prose prose-invert max-w-none text-[#A3A3A3] text-[15px] leading-8 space-y-6">
              <p>
                Cross-Site Scripting (XSS) remains one of the most prolific client-side vulnerabilities. It allows an attacker 
                to execute malicious JavaScript within the victim's browser context, often leading to session hijacking.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                {/* Anti-Pattern */}
                <div className="bg-[#0A0A0A] border border-[#ef4444]/30 rounded-xl overflow-hidden">
                  <div className="bg-[#ef4444]/10 p-3 flex items-center gap-2 border-b border-[#ef4444]/30">
                    <XCircle className="text-[#ef4444]" size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#ef4444]">Vulnerable Code</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-[#F5F5F5] overflow-x-auto">
{`// React Anti-Pattern
function Comment({ userInput }) {
  // This executes arbitrary scripts!
  return <div dangerouslySetInnerHTML={{ 
    __html: userInput 
  }} />;
}`}
                  </pre>
                </div>

                {/* Secure Pattern */}
                <div className="bg-[#0A0A0A] border border-cyber-primary/30 rounded-xl overflow-hidden">
                  <div className="bg-cyber-primary/10 p-3 flex items-center gap-2 border-b border-cyber-primary/30">
                    <CheckCircle2 className="text-cyber-primary" size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest text-cyber-primary">Secure Implementation</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-[#F5F5F5] overflow-x-auto">
{`import DOMPurify from 'dompurify';

function Comment({ userInput }) {
  // Purify raw payload before injection
  const safeHtml = DOMPurify.sanitize(userInput);
  return <div dangerouslySetInnerHTML={{ 
    __html: safeHtml 
  }} />;
}`}
                  </pre>
                </div>
              </div>
              
              <h3 className="text-white text-lg font-semibold mt-8 mb-4">3.2 SQL Injection Mechanics</h3>
              <p>
                SQLi occurs when string payload concatenation destroys query structure, converting string payloads into executable database commands.
                NEVER concatenate user input to queries. ALWAYS use Parameterized Queries or an ORM (Prisma, EntityFramework).
              </p>
            </div>
          </section>

          {/* SECTION 4: Secrets Management */}
          <section id="secrets-management" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#262626] pb-4 mb-8">
              <Lock className="text-cyber-primary" size={28} />
              <h2 className="text-2xl font-bold text-[#F5F5F5]">4. Cryptographic & Secrets Management</h2>
            </div>
            
            <div className="prose prose-invert max-w-none text-[#A3A3A3] text-[15px] leading-8 space-y-6">
              <p>
                Hardcoding API keys, passwords, Database URIs, and AWS Secret Identifiers directly to source control constitutes
                a CRITICAL severity vulnerability. Botnets scan public repositories across GitHub 24/7. Hardcoded credentials will be
                cloned and exploited generally within 3 to 5 minutes of repository publication.
              </p>
              
              <blockquote className="border-l-4 border-cyber-primary bg-[#121212] p-6 rounded-r-xl my-6">
                "Secrets must never touch the codebase. Rely on environment variables (.env files via dotenv) locally, and utilize CI/CD injected pipeline secrets or Key Vaults (AWS Secrets Manager / Vault) in production environments."
              </blockquote>

              <ul className="list-disc pl-6 space-y-2 mt-4 text-[#F5F5F5]">
                <li>Always include <code className="bg-[#121212] px-2 rounded">.env</code> in your <code className="bg-[#121212] px-2 rounded">.gitignore</code> file.</li>
                <li>Utilize bcrypt (with cost &gt; 10) or Argon2 for hashing static passwords; never hash with MD5 or SHA1.</li>
                <li>Rotate asymmetric access keys strictly on 90-day lifecycles.</li>
              </ul>
            </div>
          </section>

          {/* SECTION 5: AI Engine */}
          <section id="ai-heuristics" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#262626] pb-4 mb-8">
              <Eye className="text-cyber-primary" size={28} />
              <h2 className="text-2xl font-bold text-[#F5F5F5]">5. AI Remediation Engine (Gemini)</h2>
            </div>
            
            <div className="prose prose-invert max-w-none text-[#A3A3A3] text-[15px] leading-8 space-y-6">
              <p>
                The DevGuard Pro remediation system interfaces directly with the ultra-modern Google Gemini 2.5 Flash LLM infrastructure via the <code className="bg-[#121212] px-2 rounded">@google/genai</code> HTTP framework.
              </p>
              <p>
                When a user executes <strong>"Analyze with AI"</strong>, the DevGuard Pro client marshals the raw stringified code alongside string references of every static AST heuristic match. Gemini operates within a strict zero-shot system prompt demanding a purely structured <code className="bg-[#121212] px-2 rounded">application/json</code> response constraint containing the vulnerability explanation and a completely repaired raw code patch. This establishes our automated 1-click CI/CD remediation pipeline via the Monaco Diff editor framework.
              </p>
            </div>
          </section>

          {/* SECTION 6: Best Practices */}
          <section id="best-practices" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#262626] pb-4 mb-8">
              <Terminal className="text-cyber-primary" size={28} />
              <h2 className="text-2xl font-bold text-[#F5F5F5]">6. Language Specific Security</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Card 1 */}
               <div className="bg-[#121212] p-6 rounded-2xl border border-[#262626]">
                 <h4 className="text-white font-bold mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Python (Django/Flask)</h4>
                 <p className="text-sm text-[#A3A3A3]">Avoid utilizing `os.system()` or `subprocess.Popen(shell=True)`. Ensure the `pickle` module is never utilized for un-trusted data deserialization.</p>
               </div>
               {/* Card 2 */}
               <div className="bg-[#121212] p-6 rounded-2xl border border-[#262626]">
                 <h4 className="text-white font-bold mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> C & C++</h4>
                 <p className="text-sm text-[#A3A3A3]">Buffer overflows plague native code. Ban `gets()` and `strcpy()`. Strictly enforce `strncpy()` or Modern C++ `std::string` buffers.</p>
               </div>
               {/* Card 3 */}
               <div className="bg-[#121212] p-6 rounded-2xl border border-[#262626]">
                 <h4 className="text-white font-bold mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400"></div> Node.js & React</h4>
                 <p className="text-sm text-[#A3A3A3]">Avoid SSR injections. Configure Helmet.js to enforce strict Content Security Policies (CSP). Guard against NoSQL injection in Mongoose queries.</p>
               </div>
               {/* Card 4 */}
               <div className="bg-[#121212] p-6 rounded-2xl border border-[#262626]">
                 <h4 className="text-white font-bold mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div> Java / JVM</h4>
                 <p className="text-sm text-[#A3A3A3]">Log4Shell and object injection are highly prevalent. Restrict deserialization libraries like Jackson with strict type mapping configurations.</p>
               </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
