import { useEffect, useState } from 'react';
import { listMyNotifications, markNotificationsRead } from '../lib/api';

export default function BackendNotificationModal({ isOpen, onClose, onGoToProfile, onViewReceipt }) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const refresh = () => listMyNotifications().then((rows) => { if (active) { setNotifications(rows); setError(''); } })
      .catch((cause) => { if (active) setError(cause.message); });
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [isOpen]);

  if (!isOpen) return null;
  const markRead = async () => {
    try { await markNotificationsRead(); setNotifications(await listMyNotifications()); }
    catch (cause) { setError(cause.message); }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
      <div className="flex items-center justify-between"><h2 className="text-xl font-black">Notifications</h2>
        <button onClick={onClose} className="rounded-full bg-gray-100 px-3 py-1 text-lg" aria-label="Close">×</button></div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      {notifications.length === 0 && <div className="py-8 text-center text-sm text-gray-500">
        <p>No notifications yet.</p><button className="mt-3 font-bold text-amber-700" onClick={() => { onClose(); onGoToProfile(); }}>View profile</button>
      </div>}
      <div className="mt-4 space-y-2">{notifications.map((item) => <button key={item.id}
        className={`w-full rounded-xl border p-3 text-left ${item.read ? 'border-gray-100' : 'border-amber-200 bg-amber-50'}`}
        onClick={() => { if (item.orderId) { onClose(); onViewReceipt(item.orderId); } }}>
        <strong className="text-sm">{item.title}</strong><p className="text-xs text-gray-600">{item.message}</p>
        <time className="text-[10px] text-gray-400">{new Date(item.time).toLocaleString()}</time>
      </button>)}</div>
      {notifications.length > 0 && <button className="mt-4 text-sm font-bold text-amber-700" onClick={markRead}>Mark all as read</button>}
    </div>
  </div>;
}
