import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/BackendDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { getStaffSession, signOutStaff } from './lib/api';
import { supabase } from './lib/supabase';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    getStaffSession().then((session) => { if (active) setIsAuthenticated(!!session); })
      .catch(() => { if (active) setIsAuthenticated(false); })
      .finally(() => { if (active) setChecking(false); });
    const { data } = supabase?.auth.onAuthStateChange(() => {
      setTimeout(() => getStaffSession().then((session) => {
        if (active) setIsAuthenticated(!!session);
      }).catch(() => { if (active) setIsAuthenticated(false); }), 0);
    }) || {};
    return () => { active = false; data?.subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    await signOutStaff();
    setIsAuthenticated(false);
  };

  return (
    <ErrorBoundary>
      {checking ? (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Checking staff access...</div>
      ) : !isAuthenticated ? (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </ErrorBoundary>
  );
}
