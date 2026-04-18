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
