import { useEffect, useState } from 'react';
import { getCurrentAccount, requestPasswordReset, setNewPassword, signInCustomer,
  signOutCustomer, signUpCustomer, updateCustomerProfile } from '../lib/api';
import { supabase } from '../lib/supabase';

const fieldClass = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400';
const buttonClass = 'w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-gray-900 hover:bg-amber-300 disabled:opacity-50';

export default function BackendProfile({ onNavigate }) {
  const [account, setAccount] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '', address: '' });

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const current = await getCurrentAccount();
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        setAccount(current);
        setIsGuest(!!session?.user?.is_anonymous);
        if (current) {
          setMode('profile');
          setForm((previous) => ({ ...previous, name: current.name || '', email: current.email || '',
            phone: current.phone || '', address: current.location || '' }));
        }
      } catch (cause) { if (active) setError(cause.message); }
    };
    refresh();
    const { data } = supabase?.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('reset');
      else setTimeout(refresh, 0);
    }) || {};
    return () => { active = false; data?.subscription.unsubscribe(); };
  }, []);

  const change = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const perform = async (action) => {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (cause) { setError(cause.message || 'Something went wrong.'); }
    finally { setBusy(false); }
  };

  const logIn = (event) => { event.preventDefault(); perform(async () => {
    const current = await signInCustomer(form.email.trim(), form.password);
    setAccount(current); setMode('profile'); setForm({ ...form, password: '' });
  }); };

  const signUp = (event) => { event.preventDefault(); perform(async () => {
    if (!form.name.trim() || !form.email.trim() || !/^9\d{9}$/.test(form.phone.replace(/\D/g, '').slice(-10))) {
      throw new Error('Enter your name, email, and a valid Philippine mobile number.');
    }
    if (!isGuest && (form.password.length < 8 || form.password !== form.confirm)) {
      throw new Error('Use a matching password of at least 8 characters.');
    }
    const result = await signUpCustomer({ name: form.name.trim(), email: form.email.trim(),
      password: form.password, phone: form.phone.trim(), address: form.address.trim() });
    setNotice(result.upgradingGuest
      ? 'Check your email to attach it to your guest account. After confirming, return here to set a password.'
      : result.needsConfirmation ? 'Check your email to confirm your new account.' : 'Account created.');
    if (!result.needsConfirmation) setMode('profile');
    setForm({ ...form, password: '', confirm: '' });
  }); };

  const saveProfile = (event) => { event.preventDefault(); perform(async () => {
    const current = await updateCustomerProfile({ name: form.name.trim(), phone: form.phone.trim(),
      address: form.address.trim(), email: form.email.trim() });
    setAccount(current); setNotice('Profile saved. An email change may need confirmation.');
  }); };

  const resetRequest = (event) => { event.preventDefault(); perform(async () => {
    await requestPasswordReset(form.email.trim());
    setNotice('If this email has an account, a password reset link is on its way.');
  }); };

  const resetPassword = (event) => { event.preventDefault(); perform(async () => {
    if (form.password.length < 8 || form.password !== form.confirm) throw new Error('Passwords must match and have at least 8 characters.');
    await setNewPassword(form.password);
    setForm({ ...form, password: '', confirm: '' });
    setNotice('Password saved.'); setMode('profile');
  }); };

  return <div className="mx-auto max-w-md space-y-5 pb-12">
    <h1 className="text-2xl font-black text-gray-900">My profile</h1>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</div>}
    {isGuest && mode !== 'profile' && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">Your guest orders are tied to this browser. You can attach an email to keep this guest account.</p>}

    {mode === 'profile' && account && <>
      <form onSubmit={saveProfile} className="space-y-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="font-bold">Account details</h2>
        <label className="block text-xs font-bold">Name<input required className={fieldClass} value={form.name} onChange={change('name')} /></label>
        <label className="block text-xs font-bold">Email<input required type="email" className={fieldClass} value={form.email} onChange={change('email')} /></label>
        <label className="block text-xs font-bold">Mobile number<input required className={fieldClass} value={form.phone} onChange={change('phone')} /></label>
        <label className="block text-xs font-bold">Address<input className={fieldClass} value={form.address} onChange={change('address')} /></label>
        <button disabled={busy} className={buttonClass}>Save profile</button>
      </form>
      <button type="button" onClick={() => onNavigate?.('orders')} className={buttonClass}>My orders</button>
      <button type="button" onClick={() => setMode('reset')} className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-bold">Set or change password</button>
      <button type="button" onClick={() => perform(async () => { await signOutCustomer(); setAccount(null); setMode('login'); })}
        className="w-full rounded-xl border border-red-200 bg-white p-3 text-sm font-bold text-red-600">Sign out</button>
    </>}

    {mode === 'login' && <form onSubmit={logIn} className="space-y-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="font-bold">Log in</h2>
      <input required type="email" placeholder="Email" className={fieldClass} value={form.email} onChange={change('email')} />
      <input required type="password" placeholder="Password" className={fieldClass} value={form.password} onChange={change('password')} />
      <button disabled={busy} className={buttonClass}>Log in</button>
      <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="block text-sm font-bold text-amber-700">Create an account</button>
      <button type="button" onClick={() => { setMode('forgot'); setError(''); }} className="block text-xs text-gray-500">Forgot password?</button>
    </form>}

    {mode === 'signup' && <form onSubmit={signUp} className="space-y-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="font-bold">{isGuest ? 'Keep your guest account' : 'Create an account'}</h2>
      <input required placeholder="Full name" className={fieldClass} value={form.name} onChange={change('name')} />
      <input required type="email" placeholder="Email" className={fieldClass} value={form.email} onChange={change('email')} />
      <input required placeholder="Mobile number" className={fieldClass} value={form.phone} onChange={change('phone')} />
      <input placeholder="Address" className={fieldClass} value={form.address} onChange={change('address')} />
      {!isGuest && <><input required type="password" placeholder="Password (8+ characters)" className={fieldClass} value={form.password} onChange={change('password')} />
        <input required type="password" placeholder="Confirm password" className={fieldClass} value={form.confirm} onChange={change('confirm')} /></>}
      <button disabled={busy} className={buttonClass}>{isGuest ? 'Send confirmation email' : 'Sign up'}</button>
      <button type="button" onClick={() => setMode('login')} className="block text-sm text-gray-500">Back to login</button>
    </form>}

    {mode === 'forgot' && <form onSubmit={resetRequest} className="space-y-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="font-bold">Reset password</h2>
      <input required type="email" placeholder="Your account email" className={fieldClass} value={form.email} onChange={change('email')} />
      <button disabled={busy} className={buttonClass}>Email me a reset link</button>
      <button type="button" onClick={() => setMode('login')} className="block text-sm text-gray-500">Back to login</button>
    </form>}

    {mode === 'reset' && <form onSubmit={resetPassword} className="space-y-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="font-bold">Set a new password</h2>
      <input required type="password" placeholder="New password" className={fieldClass} value={form.password} onChange={change('password')} />
      <input required type="password" placeholder="Confirm password" className={fieldClass} value={form.confirm} onChange={change('confirm')} />
      <button disabled={busy} className={buttonClass}>Save password</button>
    </form>}
  </div>;
}
