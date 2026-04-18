export function analyzeCode(code) {
  const lines = code.split('\n');
  const vulnerabilities = [];

  const rules = [
    // === 1. INJECTION & COMMAND EXECUTION ===
    {
      id: 'eval-usage',
      pattern: /eval\s*\(/i,
      type: 'Arbitrary Code Execution',
      severity: 'critical',
      message: 'Using eval() is highly dangerous and allows arbitrary code execution.',
      fix: 'Refactor logic to avoid dynamic code evaluation completely.'
    },
    {
      id: 'command-injection',
      pattern: /(?:exec|system|popen|subprocess\.run|shell_exec|Runtime\.getRuntime\(\)\.exec|child_process\.exec)\s*\((?![^)]*['"][a-zA-Z0-9_/-]*['"]\s*\)).*(?:\+|%s|\$|\{)/i,
      type: 'Command Injection',
      severity: 'critical',
      message: 'Dynamically constructed OS command detected. Vulnerable to command injection.',
      fix: 'Use specific API methods or safely escape all user input provided to OS commands.'
    },
    {
      id: 'sql-injection-concat',
      pattern: /(?:SELECT|UPDATE|DELETE|INSERT).*(?:WHERE|VALUES).*(?:\s*\+\s*[a-zA-Z0-9_$.]+|\$\{[^}]+\})/i,
      type: 'SQL Injection',
      severity: 'critical',
      message: 'String concatenation or interpolation detected in SQL query. Vulnerable to SQL injection.',
      fix: 'Use parameterized queries, ORMs, or prepared statements.'
    },
    {
      id: 'nosql-injection',
      pattern: /\$where\s*:/i,
      type: 'NoSQL Injection',
      severity: 'high',
      message: 'Usage of the $where operator in MongoDB can allow arbitrary JavaScript execution.',
      fix: 'Use standard query operators like $eq, $gt, or $match instead of $where.'
    },

    // === 2. CROSS-SITE SCRIPTING (XSS) ===
    {
      id: 'xss-innerhtml',
      pattern: /\.innerHTML\s*=/i,
      type: 'Cross-Site Scripting (XSS)',
      severity: 'high',
      message: 'Usage of innerHTML can lead to DOM-based XSS attacks if data is unescaped.',
      fix: 'Use textContent, innerText, or a secure DOM manipulation library.'
    },
    {
      id: 'document-write',
      pattern: /document\.write\s*\(/i,
      type: 'Unsafe DOM manipulation',
      severity: 'medium',
      message: 'document.write can overwrite the document and cause XSS.',
      fix: 'Use standard DOM manipulation methods like appendChild.'
    },
    {
      id: 'unsafe-dom-location',
      pattern: /window\.location\.(?:search|hash|pathname).*innerHTML/i,
      type: 'DOM-based XSS',
      severity: 'high',
      message: 'Directly injecting unsanitized URL parameters into the DOM.',
      fix: 'Sanitize URL parameters before altering the DOM.'
    },
    {
      id: 'react-dangerouslysetinnerhtml',
      pattern: /dangerouslySetInnerHTML/i,
      type: 'React XSS Risk',
      severity: 'high',
      message: 'Using dangerouslySetInnerHTML bypasses React\'s built-in XSS protection.',
      fix: 'Sanitize input rigorously before rendering, or avoid raw HTML injection.'
    },
    {
      id: 'vue-vhtml',
      pattern: /\bv-html\s*=/i,
      type: 'Vue XSS Risk',
      severity: 'high',
      message: 'Using v-html directive allows arbitrary HTML rendering and is prone to XSS.',
      fix: 'Use text interpolation ({{ }}) instead or sanitize input using DOMPurify.'
    },
    {
      id: 'svelte-at-html',
      pattern: /\{@html\s+[^}]+\}/i,
      type: 'Svelte XSS Risk',
      severity: 'high',
      message: 'The {@html} tag renders raw HTML directly into the DOM.',
      fix: 'Sanitize content heavily before rendering or avoid using {@html}.'
    },
    {
      id: 'angular-bypasssecurity',
      pattern: /bypassSecurityTrust(?:Html|Script|Style|Url|ResourceUrl)/i,
      type: 'Angular Injection Risk',
      severity: 'high',
      message: 'Explicitly bypassing Angular\'s DOM Sanitizer is extremely dangerous.',
      fix: 'Ensure the data passed to the bypass function is 100% strictly validated.'
    },

    // === 3. CRYPTOGRAPHY & SECRETS ===
    {
      id: 'hardcoded-api-key',
      pattern: /(?:\bapi[_-]?key\b|\bsecret\b|\btoken\b|password)\s*[:=]\s*['"][a-zA-Z0-9-_]{8,}['"]/i,
      type: 'Sensitive Data Exposure',
      severity: 'critical',
      message: 'Hardcoded credentials, passwords, or API keys were detected in the codebase.',
      fix: 'Use environment variables (.env) or a secure secrets manager.'
    },
    {
      id: 'weak-crypto-hashing',
      pattern: /\b(?:md5|md4|sha1)\s*\(/i,
      type: 'Weak Cryptography',
      severity: 'high',
      message: 'Usage of outdated, collided hash functions (MD5/SHA1).',
      fix: 'Migrate to strong hashing algorithms like SHA-256, bcrypt, or Argon2.'
    },
    {
      id: 'insecure-random',
      pattern: /Math\.random\(\)|rand\(\)/i,
      type: 'Insecure Randomness',
      severity: 'low',
      message: 'Standard random functions are predictable and unsuitable for cryptographic operations.',
      fix: 'Use cryptographically secure PRNGs like crypto.getRandomValues().'
    },
    {
      id: 'hardcoded-jwt-secret',
      pattern: /jwt\.sign\([^,]+,\s*['"][^'"]+['"]/i,
      type: 'Exposed JWT Secret',
      severity: 'critical',
      message: 'JWT signing secret is hardcoded. If leaked, attackers can forge admin tokens.',
      fix: 'Move the signing secret to a highly secure Environment Variable.'
    },

    // === 4. COMMUNICATION & NETWORK ===
    {
      id: 'insecure-http',
      pattern: /['"]http:\/\/[^'"]+['"]/i,
      type: 'Insecure Communication',
      severity: 'medium',
      message: 'Usage of hardcoded unencrypted HTTP links instead of HTTPS.',
      fix: 'Always use HTTPS to prevent Man-in-the-Middle (MitM) attacks.'
    },
    {
      id: 'disable-ssl-python',
      pattern: /verify\s*=\s*False/i,
      type: 'Disabled SSL Verification',
      severity: 'high',
      message: 'Disabling SSL certificate verification allows Man-in-the-Middle attacks.',
      fix: 'Remove verify=False or provide a valid CA certificate bundle.'
    },
    {
      id: 'disable-ssl-node',
      pattern: /rejectUnauthorized\s*:\s*false/i,
      type: 'Disabled SSL Verification',
      severity: 'high',
      message: 'Setting rejectUnauthorized to false explicitly ignores invalid SSL certificates.',
      fix: 'Always enforce strict SSL/TLS validation.'
    },
    {
      id: 'cors-wildcard',
      pattern: /Access-Control-Allow-Origin['"]?\s*:\s*['"]\*['"]/i,
      type: 'CORS Misconfiguration',
      severity: 'high',
      message: 'A wildcard (*) CORS policy allows any website to read data from this API.',
      fix: 'Restrict CORS origins to explicitly trusted domains.'
    },
    {
      id: 'open-redirect',
      pattern: /(?:res\.redirect|window\.location\.(?:assign|replace)|header\(['"]Location:)\s*.*(?:req\.query|req\.body|\$_GET)/i,
      type: 'Open Redirect',
      severity: 'medium',
      message: 'Directly redirecting users based on unsanitized input enables phishing attacks.',
      fix: 'Validate the redirect URL against an allowlist of trusted, internal paths.'
    },

    // === 5. SYSTEM & OS LEVEL ===
    {
       id: 'destructive-command',
       pattern: /rm\s+-r?[f]*\s+(?:\/|\.\/?\w*\*?|\*|\$[a-zA-Z0-9_]+)/i,
       type: 'Destructive Command Execution',
       severity: 'critical',
       message: 'Highly destructive shell command detected (e.g. rm -rf on root, wildcard, or variable).',
       fix: 'Remove this command. Using automated recursive deletion scripts is extremely dangerous.'
    },
    {
       id: 'remote-shell-execution',
       pattern: /(?:curl|wget).*\|\s*(?:bash|sh|zsh)/i,
       type: 'Arbitrary Remote Execution',
       severity: 'critical',
       message: 'Piping remote scripts directly into a shell allows total system compromise.',
       fix: 'Download the script, audit its contents manually, and execute locally.'
    },
    {
      id: 'obfuscated-shell-execution',
      pattern: /(?:base64\s+-d|base64\s+--decode|atob\()/i,
      type: 'Malicious Obfuscation',
      severity: 'critical',
      message: 'Decoding Base64 data is a common technique used to hide malicious payloads.',
      fix: 'Never decode and execute blind byte streams. Validate all scripts in plaintext.'
    },
    {
      id: 'devops-chmod-777',
      pattern: /chmod\s+(?:-\w+\s+)?777/i,
      type: 'Insecure System Permissions',
      severity: 'high',
      message: 'Granting full world read/write/execute permissions (777) is a massive pivot risk.',
      fix: 'Apply the principle of least privilege using strict access modifiers (e.g., 644 or 755).'
    },
    {
      id: 'directory-traversal-fs',
      pattern: /fs\.readFile\([^)]*(?:req\.query|req\.body|req\.param)/i,
      type: 'Path Traversal',
      severity: 'critical',
      message: 'Passing raw user input into file system reads enables Directory Traversal (LFI).',
      fix: 'Sanitize file paths. Ensure base path is locked using path.basename or resolve().'
    },

    // === 6. MEMORY & DESERIALIZATION (C++/Java/PHP) ===
    {
       id: 'cpp-buffer-overflow',
       pattern: /\b(?:strcpy|gets|sprintf|scanf)\b/i,
       type: 'Buffer Overflow Risk',
       severity: 'critical',
       message: 'Usage of inherently unsafe C/C++ memory functions susceptible to buffer overflows.',
       fix: 'Use bounded safe variants like strncpy, fgets, or snprintf.'
    },
    {
      id: 'insecure-deserialization',
      pattern: /(?:pickle\.loads|yaml\.load[^_]|ObjectInputStream|unserialize\s*\()/i,
      type: 'Insecure Deserialization',
      severity: 'high',
      message: 'Reading serialized objects from untrusted sources leads to Remote Code Execution.',
      fix: 'Use safe data serialization formats like JSON, or cryptographically sign serialized states.'
    },
    {
      id: 'rust-unsafe-block',
      pattern: /\bunsafe\s*\{/i,
      type: 'Memory Safety Bypass',
      severity: 'medium',
      message: 'An unsafe block was detected in Rust, overriding compiler safety guarantees.',
      fix: 'Audit the unsafe block heavily or refactor to use safe abstractions.'
    },
    {
      id: 'xxe-vulnerability',
      pattern: /(?:libxml_disable_entity_loader\(false\)|DocumentBuilderFactory\.newInstance\(\)|xml\.etree|xml\.sax)/i,
      type: 'XML External Entity (XXE)',
      severity: 'high',
      message: 'Default XML parsers often allow external entities, leading to file reads (XXE).',
      fix: 'Explicitly disable DTDs and External Entities in the XML parser configuration.'
    },

    // === 7. MOBILE & STORAGE ===
    {
      id: 'local-storage-token',
      pattern: /localStorage\.setItem\([^,]*,.*(?:token|secret|password|key).*[)]/i,
      type: 'Insecure JWT/Session Storage',
      severity: 'high',
      message: 'Storing authentication tokens in localStorage exposes them to XSS extraction.',
      fix: 'Store session tokens in secure, HttpOnly, SameSite cookies.'
    },
    {
      id: 'mobile-insecure-storage',
      pattern: /(?:UserDefaults.*?\.set|putString)\([^,]+,\s*(?:['"])(?:AI|ya29|sk_live_|eyJ|password|top_|secret)[^'"]*/i,
      type: 'Insecure Mobile Storage',
      severity: 'medium',
      message: 'Storing sensitive information in cleartext Shared Preferences is vulnerable to device extraction.',
      fix: 'Use encrypted storage like Android EncryptedSharedPreferences or iOS Keychain.'
    },

    // === 8. MISC BAD PRACTICES ===
    {
      id: 'console-log-sensitive',
      pattern: /console\.log\([^)]*(?:password|secret|token|key|credit)[^)]*\)/i,
      type: 'Information Leakage',
      severity: 'low',
      message: 'Sensitive information appears to be logged to the console.',
      fix: 'Remove console logs for production environments or filter sensitive variables.'
    },
    {
      id: 'inline-handler',
      pattern: /\bon[A-Za-z]+\s*=\s*(?:'|")[^'"]+(?:'|")/i,
      type: 'CSP Bypass Risk',
      severity: 'low',
      message: 'Inline event handlers prevent Content-Security Policy (CSP) enforcement.',
      fix: 'Attach event listeners dynamically via addEventListener.'
    }
  ];

  lines.forEach((lineText, index) => {
    const lineNumber = index + 1;
    
    rules.forEach((rule) => {
      if (rule.pattern.test(lineText)) {
        vulnerabilities.push({
          type: rule.type,
          severity: rule.severity,
          line: lineNumber,
          message: rule.message,
          fix: rule.fix,
          codeSnippet: lineText.trim()
        });
      }
    });
  });

  return vulnerabilities;
}
