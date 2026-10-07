import { useEffect, useState } from 'react';
import { getCurrentAccount, listMyMessages, loadCatalog, sendMyMessage } from '../lib/api';

export default function BackendMessages() {
  const [identity, setIdentity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [store, setStore] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const account = await getCurrentAccount();
        let guest = null;
        try { guest = JSON.parse(localStorage.getItem('sawrap_guest_contact') || 'null'); } catch { /* ignore */ }
        const currentIdentity = account || guest;
        const rows = currentIdentity ? await listMyMessages() : [];
        if (active) { setIdentity(currentIdentity); setMessages(rows); setError(''); }
      } catch (cause) { if (active) setError(cause.message); }
    };
    refresh();
    loadCatalog().then((catalog) => { if (active) setStore(catalog.store); }).catch(() => {});
    const timer = setInterval(refresh, 5000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const send = async (event) => {
    event.preventDefault();
    if (!identity || !text.trim() || busy) return;
    setBusy(true); setError('');
    try { setMessages(await sendMyMessage(identity, text)); setText(''); }
    catch (cause) { setError(cause.message || 'Message could not be sent.'); }
    finally { setBusy(false); }
  };

  return <div className="mx-auto max-w-2xl space-y-4 pb-12">
    <div><h1 className="text-2xl font-black">Messages</h1><p className="text-xs text-gray-500">Chat with SaWrap staff</p></div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {!identity ? <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-600">
      Sign in or place a guest order before messaging the store.
    </div> : <div className="min-w-0 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between border-b pb-3"><strong>SaWrap Store</strong>
        {store?.phone && <a className="text-sm font-bold text-amber-700" href={`tel:${store.phone}`}>Call store</a>}</div>
      <div className="my-3 h-[45vh] space-y-3 overflow-x-hidden overflow-y-auto rounded-xl bg-gray-50 p-3">
        {messages.length === 0 && <p className="text-center text-xs text-gray-500">No messages yet.</p>}
        {messages.map((message) => <div key={message.id}
          className={`min-w-0 max-w-[85%] rounded-2xl p-3 text-sm ${message.sender === 'user' ? 'ml-auto bg-amber-100' : 'mr-auto bg-white border'}`}>
          <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{message.text}</p><time className="mt-1 block text-[10px] text-gray-500">{new Date(message.time).toLocaleString()}</time>
        </div>)}
      </div>
      <form onSubmit={send} className="flex gap-2"><input className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
        value={text} onChange={(event) => setText(event.target.value)} placeholder="Type your message" maxLength={4000} />
        <button disabled={busy || !text.trim()} className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold disabled:opacity-50">Send</button></form>
    </div>}
  </div>;
}
