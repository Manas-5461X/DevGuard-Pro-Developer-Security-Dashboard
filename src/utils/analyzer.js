export function analyzeCode(code) {
  const lines = code.split('\n');
  const vulnerabilities = [];

  const rules = [
    {
      id: 'xss-innerhtml',
      pattern: /\.innerHTML\s*=/i,
      type: 'Cross-Site Scripting (XSS)',
      severity: 'high',
      message: 'Usage of innerHTML can lead to XSS attacks if data is unescaped.',
      fix: 'Use textContent or a secure DOM manipulation library.'
    },
    {
      id: 'eval-usage',
      pattern: /eval\s*\(/i,
      type: 'Arbitrary Code Execution',
      severity: 'critical',
      message: 'Using eval() is highly dangerous and allows arbitrary code execution.',
      fix: 'Refactor logic to avoid dynamic code evaluation completely.'
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
      id: 'hardcoded-api-key',
      pattern: /(?:\bapi[_-]?key\b|\bsecret\b|\btoken\b)\s*[:=]\s*['"][a-zA-Z0-9-_]{10,}['"]/i,
      type: 'Sensitive Data Exposure',
      severity: 'critical',
      message: 'Hardcoded credentials or API keys were detected in the code.',
      fix: 'Use environment variables to inject sensitive data.'
    },
    {
      id: 'insecure-http',
      pattern: /['"]http:\/\/[^'"]+['"]/i,
      type: 'Insecure Communication',
      severity: 'medium',
      message: 'Usage of hardcoded HTTP links instead of HTTPS.',
      fix: 'Always use HTTPS for secure transmission.'
    },
    {
      id: 'local-storage-token',
      pattern: /localStorage\.setItem\([^,]*,.*(?:token|secret|password|key).*[)]/i,
      type: 'Insecure Storage',
      severity: 'high',
      message: 'Storing sensitive tokens in localStorage is susceptible to XSS extraction.',
      fix: 'Use secure, HttpOnly cookies for session tokens.'
    },
    {
      id: 'console-log-sensitive',
      pattern: /console\.log\([^)]*(?:password|secret|token|key|credit)[^)]*\)/i,
      type: 'Information Leakage',
      severity: 'low',
      message: 'Sensitive information appears to be logged to the console.',
      fix: 'Remove console.log statements before deploying to production.'
    },
    {
      id: 'inline-handler',
      pattern: /\bon[A-Za-z]+\s*=\s*(?:'|")[^'"]+(?:'|")/i,
      type: 'Poor Practice / XSS Risk',
      severity: 'low',
      message: 'Inline event handlers prevent Content-Security Policy (CSP) enforcement.',
      fix: 'Attach event listeners dynamically via addEventListener.'
    },
    {
      id: 'weak-password',
      pattern: /password\s*=\s*['"](?:123456|password|qwerty)['"]/i,
      type: 'Weak Credentials',
      severity: 'high',
      message: 'Extremely weak or simple default password detected.',
      fix: 'Enforce strong password policies or do not hardcode passwords.'
    },
    {
      id: 'unsafe-dom-location',
      pattern: /window\.location\.(?:search|hash|pathname).*innerHTML/i,
      type: 'DOM-based XSS',
      severity: 'high',
      message: 'Directly injecting unsanitized URL parameters into the DOM.',
      fix: 'Sanitize URL parameters before altering the DOM or use textContent.'
    },
    {
      id: 'sql-injection-concat',
      pattern: /(?:SELECT|UPDATE|DELETE|INSERT).*(?:WHERE|VALUES).*(?:\s*\+\s*[a-zA-Z0-9_$.]+|\$\{[^}]+\})/i,
      type: 'SQL Injection',
      severity: 'critical',
      message: 'String concatenation or interpolation detected in SQL query. Vulnerable to SQL injection.',
      fix: 'Use parameterized queries or prepared statements.'
    },
    {
      id: 'command-injection',
      pattern: /(?:exec|system|popen|subprocess\.run|shell_exec|Runtime\.getRuntime\(\)\.exec)\s*\((?![^)]*['"][a-zA-Z0-9_/-]*['"]\s*\)).*(?:\+|%s|\$|\{)/i,
      type: 'Command Injection',
      severity: 'critical',
      message: 'Dynamically constructed OS command detected. Vulnerable to command injection.',
      fix: 'Use specific API methods or safely escape all user input provided to OS commands.'
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
      id: 'react-dangerouslysetinnerhtml',
      pattern: /dangerouslySetInnerHTML/i,
      type: 'React XSS Risk',
      severity: 'high',
      message: 'Using dangerouslySetInnerHTML bypasses React\'s built-in XSS protection.',
      fix: 'Sanitize input rigorously before rendering, or refactor to avoid raw HTML injection.'
    },
    {
      id: 'angular-bypasssecurity',
      pattern: /bypassSecurityTrust(?:Html|Script|Style|Url|ResourceUrl)/i,
      type: 'Angular Injection Risk',
      severity: 'high',
      message: 'Explicitly bypassing Angular\'s DOM Sanitizer is extremely dangerous.',
      fix: 'Ensure the data passed to the bypass function is 100% strictly validated.'
    },
    {
       id: 'destructive-command',
       pattern: /rm\s+-r?[f]*\s+(?:\/|\.\/?\w*\*?|\*|\$[a-zA-Z0-9_]+)/i,
       type: 'Destructive Command Execution',
       severity: 'critical',
       message: 'Highly destructive command detected (e.g. rm -rf on root, wildcard, or unquoted variable).',
       fix: 'Remove this command or strictly validate the target path to prevent automated data loss.'
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
       id: 'cpp-buffer-overflow',
       pattern: /\b(?:strcpy|gets|sprintf|scanf)\b/i,
       type: 'Buffer Overflow Risk',
       severity: 'critical',
       message: 'Usage of inherently unsafe C/C++ memory functions susceptible to buffer overflows.',
       fix: 'Use bounded safe variants like strncpy, fgets, or snprintf.'
    },
    {
      id: 'insecure-deserialization',
      pattern: /(?:pickle\.loads|yaml\.load|ObjectInputStream|unserialize\s*\()/i,
      type: 'Insecure Deserialization',
      severity: 'high',
      message: 'Reading serialized objects from untrusted sources can lead to remote code execution.',
      fix: 'Validate signatures of serialized streams or use safer data formats like JSON.'
    },
    {
      id: 'vue-vhtml',
      pattern: /\bv-html\s*=/i,
      type: 'Vue XSS Risk',
      severity: 'high',
      message: 'Using v-html directive allows arbitrary HTML rendering and is prone to XSS.',
      fix: 'Use text interpolation ({{ }}) instead or aggressively sanitize input using DOMPurify.'
    },
    {
      id: 'svelte-at-html',
      pattern: /\{@html\s+[^}]+\}/i,
      type: 'Svelte XSS Risk',
      severity: 'high',
      message: 'The {@html} tag renders raw HTML directly into the DOM.',
      fix: 'Sanitize content heavily before rendering or avoid using {@html} for user input.'
    },
    {
      id: 'devops-chmod-777',
      pattern: /chmod\s+(?:-\w+\s+)?777/i,
      type: 'Insecure Permissions',
      severity: 'high',
      message: 'Granting full read/write/execute permissions (777) is a massive security risk.',
      fix: 'Apply the principle of least privilege using strict access modifiers (e.g., 644 or 755).'
    },
    {
      id: 'mobile-insecure-storage',
      pattern: /(?:UserDefaults.*?\.set|putString)\([^,]+,\s*(?:['"])(?:AI|ya29|sk_live_|eyJ|password|top_|secret)[^'"]*/i,
      type: 'Insecure Mobile Storage',
      severity: 'medium',
      message: 'Storing sensitive information in cleartext shared preferences is vulnerable to device extraction.',
      fix: 'Use encrypted storage like Android EncryptedSharedPreferences or iOS Keychain.'
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
