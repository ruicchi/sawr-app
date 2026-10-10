import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/BackendDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { getStaffSession, signOutStaff } from './lib/api';
import { supabase } from './lib/supabase';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authLinkType, setAuthLinkType] = useState(() => {
    const type = window.__SAWRAP_AUTH_LINK_TYPE__;
    return type === 'invite' || type === 'recovery' ? type : null;
  });

  useEffect(() => {
    let active = true;
    getStaffSession().then((session) => { if (active) setIsAuthenticated(!!session); })
      .catch(() => { if (active) setIsAuthenticated(false); })
      .finally(() => { if (active) setChecking(false); });
    const { data } = supabase?.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setAuthLinkType('recovery');
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

  const handleSetupComplete = async () => {
    setAuthLinkType(null);
    const staff = await getStaffSession();
    setIsAuthenticated(!!staff);
  };

  return (
    <ErrorBoundary>
      {checking ? (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Checking staff access...</div>
      ) : authLinkType || !isAuthenticated ? (
        <Login key={authLinkType || 'login'} authLinkType={authLinkType} onSetupComplete={handleSetupComplete}
          onCancelSetup={() => setAuthLinkType(null)}
          onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </ErrorBoundary>
  );
}
