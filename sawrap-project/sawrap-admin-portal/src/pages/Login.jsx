import { useState } from 'react';
import { Store, KeyRound, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import sawrapLogo from '../assets/sawrap-logo.png';
import { signInStaff } from '../lib/api';
import { requireSupabase } from '../lib/supabase';

export default function Login({ authLinkType, onLoginSuccess, onSetupComplete, onCancelSetup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState(() => authLinkType ? 'setup' : 'login');
  const [notice, setNotice] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signInStaff(email.trim(), password);
      setError('');
      onLoginSuccess();
    } catch (cause) {
      setError(cause.message || 'Sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestLink = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setNotice('');
    try {
      const { error: authError } = await requireSupabase().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://sawrap-admin.vercel.app/',
      });
      if (authError) throw authError;
      setNotice('If this address has a SaWrap account, a new password setup link is on its way.');
    } catch (cause) {
      setError(cause.message || 'Could not send a new link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8 || password !== confirmPassword) {
      setError('Use matching passwords of at least 8 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      const db = requireSupabase();
      const { data: { session }, error: sessionError } = await db.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session || session.user.is_anonymous) {
        throw new Error('This setup link has expired or was already used. Request a new link below.');
      }
      const { error: authError } = await db.auth.updateUser({ password });
      if (authError) throw authError;
      setPassword('');
      setConfirmPassword('');
      await onSetupComplete();
    } catch (cause) {
      setError(cause.message || 'Could not save your password.');
    } finally {
      setIsSubmitting(false);
    }
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

        {notice && <div role="status" className="rounded-2xl border border-green-200 bg-green-50 p-3 text-xs font-bold text-green-700">{notice}</div>}

        <form onSubmit={mode === 'setup' ? handleSetPassword : mode === 'request' ? handleRequestLink : handleLogin} className="space-y-4">
          {mode === 'setup' && <p className="text-center text-sm font-semibold text-gray-700">Set your password to activate your SaWrap owner access.</p>}
          {mode === 'request' && <p className="text-center text-sm font-semibold text-gray-700">Enter your invited email address to get a fresh setup link.</p>}
          {mode !== 'setup' && <div className="space-y-1">
            <label className="text-[11px] font-extrabold uppercase text-gray-400 px-1">Staff Email</label>
            <div className="flex items-center rounded-2xl bg-gray-50 px-4 py-3 border border-gray-200 focus-within:border-amber-400 focus-within:bg-white transition-all">
              <Store className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                autoComplete="username"
                className="w-full bg-transparent text-xs text-gray-800 font-bold outline-none placeholder:font-normal placeholder:text-gray-400"
              />
            </div>
          </div>}

          {mode !== 'request' && <div className="space-y-1">
            <label className="text-[11px] font-extrabold uppercase text-gray-400 px-1">Password</label>
            <div className="flex items-center rounded-2xl bg-gray-50 px-4 py-3 border border-gray-200 focus-within:border-amber-400 focus-within:bg-white transition-all">
              <KeyRound className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'setup' ? 'Create a password (8+ characters)' : 'Enter your password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
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
          </div>}

          {mode === 'setup' && <div className="space-y-1">
            <label className="text-[11px] font-extrabold uppercase text-gray-400 px-1">Confirm password</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password" className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-amber-400" />
          </div>}

          <button
            type="submit"
            disabled={isSubmitting || (mode === 'request' ? !email : mode === 'setup' ? !password || !confirmPassword : !email || !password)}
            className="w-full rounded-2xl bg-amber-400 py-3.5 text-xs font-extrabold text-white shadow-md hover:bg-amber-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            ) : (
              <>
                <span>{mode === 'request' ? 'Send setup link' : mode === 'setup' ? 'Save password' : 'Access Portal'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {mode === 'login' && <button type="button" onClick={() => { setMode('request'); setError(''); setNotice(''); }}
          className="w-full text-center text-xs font-bold text-amber-700">Invitation expired or forgot password?</button>}
        {mode === 'setup' && <button type="button" onClick={() => { setMode('request'); setError(''); setNotice(''); }}
          className="w-full text-center text-xs font-bold text-amber-700">Setup link expired? Request a new one</button>}
        {mode === 'request' && <button type="button" onClick={() => { setMode('login'); setError(''); setNotice(''); onCancelSetup?.(); }}
          className="w-full text-center text-xs font-bold text-gray-500">Back to sign in</button>}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Authorized SaWrap Personnel Only</span>
        </div>

      </div>
    </div>
  );
}
