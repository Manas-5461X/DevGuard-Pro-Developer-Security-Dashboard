import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ScanProvider } from './context/ScanContext';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { DashboardSkeleton, HistorySkeleton } from './components/ui/Skeleton';

// Auth pages — load eagerly (small, needed immediately)
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

// App pages — lazy loaded for instant perceived performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Scanner = lazy(() => import('./pages/Scanner'));
const History = lazy(() => import('./pages/History'));
const Docs = lazy(() => import('./pages/Docs'));

// Generic page loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-cyber-primary/30 border-t-cyber-primary rounded-full animate-spin" />
        <p className="text-[#737373] text-xs tracking-widest uppercase">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScanProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={
                  <Suspense fallback={<DashboardSkeleton />}>
                    <Dashboard />
                  </Suspense>
                } />
                <Route path="/scanner" element={
                  <Suspense fallback={<PageLoader />}>
                    <Scanner />
                  </Suspense>
                } />
                <Route path="/history" element={
                  <Suspense fallback={<HistorySkeleton />}>
                    <History />
                  </Suspense>
                } />
                <Route path="/docs" element={
                  <Suspense fallback={<PageLoader />}>
                    <Docs />
                  </Suspense>
                } />
              </Route>
            </Route>

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ScanProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
