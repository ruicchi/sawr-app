import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('sawrap_owner_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('sawrap_owner_token');
    setIsAuthenticated(false);
  };

  return (
    <ErrorBoundary>
      {!isAuthenticated ? (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </ErrorBoundary>
  );
}