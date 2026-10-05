import React, { useState } from 'react';
import { Store, KeyRound, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import sawrapLogo from '../assets/sawrap-logo.png';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Maikling delay para may bahagyang feedback bago mag-login (UX polish)
    setTimeout(() => {
      // Kunin ang kasalukuyang credentials (baka na-palitan na ng Owner sa Settings)
      let validCreds = { username: 'admin', password: 'sawrap2026' };
      const saved = localStorage.getItem('sawrap_admin_credentials');
      if (saved) {
        try { validCreds = JSON.parse(saved); } catch (e) { /* gamitin na lang ang default */ }
      }

      if (username === validCreds.username && password === validCreds.password) {
        setError('');
        sessionStorage.setItem('sawrap_owner_token', 'AUTH_TOKEN_SECURE_SW');
        onLoginSuccess();
      } else {
        setError('Invalid Owner Credentials. Please try again.');
        setIsSubmitting(false);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4 font-sans text-gray-800 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-gray-800/50 space-y-6 animate-in fade-in zoom-in-95 duration-300">

        <div className="text-center space-y-2">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 border border-amber-100 mb-1">
            <img src={sawrapLogo} alt="SaWrap" className="h-11 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">SaWrap Owner Portal</h1>
          <p className="text-xs text-gray-500 font-semibold">Store Management & Order Fulfillments</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold uppercase text-gray-400 px-1">Owner Username</label>
            <div className="flex items-center rounded-2xl bg-gray-50 px-4 py-3 border border-gray-200 focus-within:border-amber-400 focus-within:bg-white transition-all">
              <Store className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                autoComplete="username"
                className="w-full bg-transparent text-xs text-gray-800 font-bold outline-none placeholder:font-normal placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-extrabold uppercase text-gray-400 px-1">Master Password</label>
            <div className="flex items-center rounded-2xl bg-gray-50 px-4 py-3 border border-gray-200 focus-within:border-amber-400 focus-within:bg-white transition-all">
              <KeyRound className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
                className="w-full bg-transparent text-xs text-gray-800 font-bold outline-none placeholder:font-normal placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !username || !password}
            className="w-full rounded-2xl bg-amber-400 py-3.5 text-xs font-extrabold text-white shadow-md hover:bg-amber-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <>
                <span>Access Portal</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Authorized SaWrap Personnel Only</span>
        </div>

      </div>
    </div>
  );
}
