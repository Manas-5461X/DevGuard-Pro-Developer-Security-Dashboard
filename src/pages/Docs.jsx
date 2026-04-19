import React from 'react';
import { BookOpen, ShieldAlert, Code2, Cpu } from 'lucide-react';

export default function Docs() {
  const sections = [
    {
      title: "Injection & Execution",
      icon: <Cpu className="text-cyber-error" size={24} />,
      heuristics: [
        {
          name: "Arbitrary Code Execution (eval)",
          desc: "Using eval() is highly dangerous as it executes arbitrary strings as code, giving an attacker full scope execution.",
          bad: "eval(userInput);",
          good: "JSON.parse(userInput);"
        },
        {
          name: "Command Injection",
          desc: "Dynamically constructing OS commands (like exec, system, shell_exec) with unescaped input allows Remote Code Execution.",
          bad: "exec('ping ' + req.body.ip);",
          good: "execFile('ping', [req.body.ip]);"
        },
        {
          name: "SQL Injection",
          desc: "String concatenation or interpolation in SQL queries allows attackers to bypass logic and drop tables.",
          bad: "db.query('SELECT * FROM users WHERE id = ' + req.query.id);",
          good: "db.query('SELECT * FROM users WHERE id = ?', [req.query.id]);"
        }
      ]
    },
    {
      title: "Cross-Site Scripting (XSS)",
      icon: <Code2 className="text-[#ffcc00]" size={24} />,
      heuristics: [
        {
          name: "Unsafe DOM Manipulation",
          desc: "Using innerHTML, document.write, or dangerouslySetInnerHTML bypassing browser & framework safeties.",
          bad: "element.innerHTML = userInput;\n<div dangerouslySetInnerHTML={{__html: data}} />",
          good: "element.textContent = userInput;\n<div>{data}</div>"
        },
        {
          name: "Vue / Svelte At-HTML bindings",
          desc: "Using v-html in Vue or {@html} in Svelte blindly trusts the variable string.",
          bad: "<div v-html='userHtml'></div>",
          good: "<div>{{ userHtml }}</div> // Or use DOMPurify"
        }
      ]
    },
    {
      title: "Cryptography & Secrets",
      icon: <ShieldAlert className="text-cyber-primary" size={24} />,
      heuristics: [
        {
          name: "Hardcoded API Keys",
          desc: "Checking passwords, secrets, or API tokens into source control leads to massive supply chain attacks.",
          bad: "const STRIPE_KEY = 'sk_live_123456789';",
          good: "const STRIPE_KEY = process.env.STRIPE_KEY;"
        },
        {
          name: "Weak Hashing Algorithms",
          desc: "Using MD5 or SHA1 to hash passwords. These algorithms have cryptographic collisions and can be cracked rapidly.",
          bad: "const hash = crypto.createHash('md5').update(password).digest('hex');",
          good: "const hash = await bcrypt.hash(password, 10);"
        },
        {
          name: "Insecure Randomness",
          desc: "Using Math.random() to generate tokens or cryptography. PRNGs are entirely predictable.",
          bad: "const resetToken = Math.random().toString(36);",
          good: "const resetToken = crypto.randomBytes(32).toString('hex');"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col pb-12">
      <div className="border-b border-cyber-border pb-4 mb-4">
        <h1 className="text-2xl font-bold text-cyber-text tracking-widest mb-2 uppercase glow-text flex items-center gap-3">
          <BookOpen /> System Heuristics
        </h1>
        <p className="text-cyber-dark-text tracking-wider uppercase text-sm">Documentation of rules analyzed by DevGuard Pro</p>
      </div>

      <div className="space-y-12 mt-8">
        {sections.map((section, idx) => (
          <div key={idx} className="cyber-panel p-6 border-l-4 border-cyber-border hover:border-cyber-primary transition-colors">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-cyber-border/50 pb-4 text-white">
              {section.icon}
              {section.title}
            </h2>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {section.heuristics.map((h, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <h3 className="text-cyber-text font-bold tracking-widest uppercase text-sm glow-text">{h.name}</h3>
                  <p className="text-cyber-dark-text text-sm mb-2 h-10">{h.desc}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                    <div className="bg-[#1a0f0f] border border-cyber-error/30 p-3 flex flex-col">
                      <span className="text-cyber-error text-xs font-bold uppercase tracking-widest mb-2 border-b border-cyber-error/20 pb-1">Vulnerable</span>
                      <pre className="text-[#ff99a8] font-mono text-xs whitespace-pre-wrap flex-1">{h.bad}</pre>
                    </div>
                    <div className="bg-[#0a1410] border border-cyber-primary/30 p-3 flex flex-col">
                      <span className="text-cyber-primary text-xs font-bold uppercase tracking-widest mb-2 border-b border-cyber-primary/20 pb-1">Secure</span>
                      <pre className="text-[#99ffcc] font-mono text-xs whitespace-pre-wrap flex-1">{h.good}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
