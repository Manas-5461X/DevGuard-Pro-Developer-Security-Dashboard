# 🛡️ DevGuard Pro – Developer Security Dashboard

**DevGuard Pro** is a modern, production-level React application designed to help developers identify, track, and manage code vulnerabilities directly in their workspace. It acts as an interactive code analyzer with real-time detection, history synchronization, and an intuitive dashboard—built for performance and scalability.

## 🎯 Problem Statement
In modern web development, poor coding practices (like insecure DOM manipulations, exposed API keys, and unsafe cross-site scripting methodologies) often slip into production undetected until it's too late. DevGuard Pro addresses the need for a **proactive, lightweight, integrated code analyzer**. It allows developers to quickly scan snippets, document findings, and analyze historical code security trends.

## ✨ Features
* **Code Scanner workspace:** Powered by Monaco Editor, providing a rich VS Code-like coding experience.
* **Analyzer Engine:** Automatically detects exactly 10 high-risk vulnerability patterns via complex regex matching (including XSS, EVAL execution, explicit storage leaks, and hardcoded keys). 
* **Real-time Results Panel:** Renders color-coded severity badges, highlights line numbers, and provides immediate fix suggestions with copy-to-clipboard functionality.
* **Secure Authentication:** Complete Firebase-backed authentication system (Signup, Login, Logout) with protected routes.
* **Interactive Dashboard:** Tracks total historical scans, calculates aggregated vulnerability statistics, and visualizes recent code scans.
* **History Management:** Fully functioning CRUD system utilizing Firebase Firestore to save scans securely per user and delete redundant logs.
* **Dynamic Design Context:** Developed meticulously with a responsive VS Code-inspired dark theme, fluid UI state transitions, and loading skeletons.

## 🧱 Tech Stack
* **Frontend Library:** React 19 (Vite)
* **Styling:** Tailwind CSS v4 & custom utility variables
* **Icons:** Lucide React
* **Code Editor:** `@monaco-editor/react`
* **Routing:** `react-router-dom` (v7)
* **Backend / BaaS:** Firebase (Auth + Firestore Data Storage)

## ⚡ React Concepts Utilized
- **Core Hooks:** `useState`, `useEffect` for data management and lifecycle tracking.
- **Advanced Hooks:** `useMemo`, `useCallback` to optimize intensive dashboard calculations and cache Firestore snapshot listeners.
- **Context API:** Global auth state decoupled cleanly into `AuthContext.jsx`.
- **Code Splitting:** Applied `React.lazy` and `Suspense` for performance-optimized route chunking.
- **Custom Hooks:** Clean separation of concerns through `useAuth.js` and `useScans.js`.

## 🚀 Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Manas-5461X/DevGuard-Pro-Developer-Security-Dashboard.git
   cd DevGuard-Pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Create a `.env` file in the root directory.
   - Using `.env.example` as a template, populate it with your Firebase project configuration keys:
     ```env
     VITE_FIREBASE_API_KEY=your_key
     VITE_FIREBASE_AUTH_DOMAIN=your_domain
     ...
     ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 🔮 Future Improvements
* Integration with Abstract Syntax Trees (AST) like Esprima for deep semantic analysis instead of just heuristic patterns.
* Export scan reports to PDF/CSV.
* Direct GitHub Repository linking to scan entire PRs.

## 👨‍💻 Author Details
Developed as a comprehensive End-Term project ensuring academic integrity and displaying production tier capabilities.
