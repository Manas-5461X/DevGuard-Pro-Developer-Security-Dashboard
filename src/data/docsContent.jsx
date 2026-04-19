import React from 'react';
import { Shield, Lock, Eye, AlertTriangle, Terminal, Code2, HeartPulse, Globe, Server, Database, Key, ShieldCheck } from 'lucide-react';

export const docsContent = [
  {
    id: 'introduction',
    title: 'Introduction & Methodology',
    icon: <Shield size={18} />,
    description: 'A comprehensive overview of the DevGuard Pro security engine and its application in modern DevSecOps.',
    sections: [
      {
        subtitle: '1.1 System Architecture',
        content: `DevGuard Pro is engineered as a zero-trust, local-first security platform. It utilizes a three-tier analysis pipeline designed to minimize false positives while ensuring extreme throughput for large-scale source code repositories. 
        
        The first layer consists of the **Heuristic Pattern Engine**, which uses high-performance regular expressions to identify low-hanging fruit such as hardcoded credentials and unsafe function calls. The second layer is the **AI Contextual Remediation Engine**, which leverages Google Gemini 2.5 Flash to understand the intent behind the code and provide human-readable fixes. The final layer is the **User Governance Layer**, where security engineers review and approve remediation patches.`
      },
      {
        subtitle: '1.2 SAST vs. DAST',
        content: `Static Application Security Testing (SAST) is our core focus. Unlike Dynamic Testing (DAST), which requires a running environment and attempts to exploit live endpoints, SAST scans the "blueprints" of your application.
        
        This approach offers several critical advantages:
        - **Left-Shift Integration**: Catch vulnerabilities before a single line of code is pushed to production.
        - **100% Code Path Coverage**: SAST can analyze edge cases that might never be triggered during dynamic execution.
        - **Precise Location**: SAST points directly to the line of code causing the risk, reducing Mean Time to Repair (MTTR).`
      }
    ]
  },
  {
    id: 'owasp-top-10',
    title: 'OWASP Top 10 Context',
    icon: <AlertTriangle size={18} />,
    description: 'Alignment with the industry-standard framework for web application security.',
    sections: [
      {
        subtitle: '2.1 Broken Access Control (A01)',
        content: `Broken Access Control is the most common vulnerability in modern applications. It occurs when a user can access a resource or perform an action that they shouldn't be allowed to. 
        
        DevGuard Pro scans for patterns like:
        - Hardcoded admin flags.
        - Predictable resource identifiers.
        - Lack of authorization checks on sensitive API routes.`
      },
      {
        subtitle: '2.2 Cryptographic Failures (A02)',
        content: `Encryption is only as strong as its implementation. Many developers use outdated algorithms or insecure storage methods for sensitive data. 
        
        Our engine detects:
        - Usage of deprecated algorithms (MD5, SHA1).
        - Plaintext storage of JWT secrets.
        - Insufficient salt lengths in password hashing implementations.`
      }
    ]
  },
  {
    id: 'xss-prevention',
    title: 'XSS & Injection Defense',
    icon: <Code2 size={18} />,
    description: 'Deep dive into Cross-Site Scripting (XSS) and SQL Injection (SQLi) mitigation.',
    sections: [
      {
        subtitle: '3.1 Understanding Injection',
        content: `Injection vulnerabilities occur when untrusted data is sent to an interpreter as part of a command or query. The attacker's hostile data can trick the interpreter into executing unintended commands or accessing data without proper authorization.`
      },
      {
        subtitle: '3.2 Sanitization with DOMPurify',
        content: `For React applications, using 'dangerouslySetInnerHTML' is often necessary but inherently risky. We recommend always wrapping your input in a sanitizer like DOMPurify.
        
        \`\`\`javascript
        import DOMPurify from 'dompurify';
        
        function UserBio({ bio }) {
          const safeHTML = DOMPurify.sanitize(bio);
          return <div dangerouslySetInnerHTML={{ __html: safeHTML }} />;
        }
        \`\`\``
      }
    ]
  },
  {
    id: 'secrets-management',
    title: 'Secrets & Cryptography',
    icon: <Lock size={18} />,
    description: 'Best practices for handling API keys, tokens, and sensitive credentials.',
    sections: [
      {
        subtitle: '4.1 The .env Protocol',
        content: `Environment variables should be the ONLY place secrets reside. Never commit a .env file to version control. Use a .env.example file to guide other developers on which variables are needed without including the sensitive values themselves.`
      }
    ]
  },
  {
    id: 'secure-yourself',
    title: 'How to Secure Yourself (Mega Guide)',
    icon: <ShieldCheck size={18} />,
    description: 'The ultimate survival guide for developers in the modern age of cyber warfare.',
    sections: [
      {
        subtitle: '7.1 What to NEVER do',
        content: `Security is often about avoiding convenience traps. 
        
        1. **NEVER Trust User Input**: Assume every string coming from a client is a payload designed to destroy your database.
        2. **NEVER use Eval()**: Arbitrary code execution is the "God Mode" for hackers.
        3. **NEVER hardcode secrets**: Even for internal tools. If it's in the code, it's public.
        4. **NEVER skip HTTPS**: SSL/TLS is not optional in 2026. Non-secure traffic is trivial to hijack via Man-In-The-Middle (MITM) attacks.
        5. **NEVER expose your server version**: Remove headers like 'X-Powered-By' which tell attackers exactly which exploits to use against your stack.`
      },
      {
        subtitle: '7.2 Backend Hardening',
        content: `Protecting your infrastructure from the inside out. 
        
        - **Rate Limiting**: Prevent Brute Force and DoS attacks by limiting requests per IP.
        - **CORS Policies**: Explicitly define which domains are allowed to talk to your API. Never use '*'.
        - **Input Validation**: Use libraries like Zod or Joi to enforce strict schemas on all body/query parameters.`
      },
      {
        subtitle: '7.3 Frontend Resilience',
        content: `The browser is a hostile environment. 
        
        - **Content Security Policy (CSP)**: Implement strict headers to prevent unauthorized script execution.
        - **Secure Cookies**: Use HttpOnly, Secure, and SameSite=Strict flags to prevent cookie theft via XSS.
        - **Dependency Audits**: Run 'npm audit' weekly. A secure app built on a compromised library is still vulnerable.`
      },
      {
        subtitle: '7.4 Development Lifecycle Safety',
        content: `Integrating security into your daily workflow.
        
        - **Pre-commit Hooks**: Use tools like Husky to run DevGuard Pro before every commit.
        - **CI/CD Integration**: Fail builds automatically if critical vulnerabilities are found.
        - **Secret Rotation**: Change your API keys every 90 days. If a key was leaked but you didn't know, rotation limits the damage.`
      }
    ]
  }
];
