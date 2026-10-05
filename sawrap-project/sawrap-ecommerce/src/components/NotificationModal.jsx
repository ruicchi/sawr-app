import React, { useState, useEffect } from 'react';
import { X, Bell, ShoppingBag, Tag, CheckCircle2, Lock, LogIn, XCircle, ReceiptText } from 'lucide-react';
import { getCurrentIdentity, getNotifications, markAllNotificationsRead } from '../utils/storage';

export default function NotificationModal({ isOpen, onClose, onGoToProfile, onViewReceipt }) {
  const [identity, setIdentity] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const loadData = () => {
    const id = getCurrentIdentity();
    setIdentity(id);
    if (id) setNotifications(getNotifications(id.phone));
  };

  // I-refresh tuwing bubuksan ang modal
  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen]);

  // Habang bukas, mag-poll para makita agad ang bagong notification (hal. status update ng Admin)
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllAsRead = () => {
    if (!identity) return;
    markAllNotificationsRead(identity.phone);
    loadData();
  };

  const iconFor = (item) => {
    if (item.type === 'promo') return Tag;
    if (item.title?.includes('Cancelled')) return XCircle;
    if (item.title?.includes('Completed')) return ReceiptText;
    if (item.title?.includes('Ready')) return ShoppingBag;
    return CheckCircle2;
  };

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      const diffMs = Date.now() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
      return d.toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-0 md:items-center md:p-4 font-sans">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col bg-white shadow-2xl border border-gray-100 overflow-hidden rounded-t-3xl md:rounded-3xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Bell className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content View: Guest Prompt vs Notifications Stream */}
        {!identity ? (
          /* GUEST MODE PROMPT */
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 border border-amber-200">
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-gray-800">Log in to view notifications</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Log in or sign up to receive real-time updates on your order status and store promos!
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  onClose();
                  onGoToProfile();
                }}
                className="w-full rounded-2xl bg-amber-400 py-3 text-xs font-bold text-white shadow-md hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Log In / Sign Up</span>
              </button>
            </div>
          </div>
        ) : (
          /* REGISTERED USER NOTIFICATIONS STREAM */
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-10">No notifications yet. Order something to get started!</p>
              )}
              {notifications.map((item) => {
                const Icon = iconFor(item);
                const isCompleted = item.title?.includes('Completed');
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (isCompleted && onViewReceipt) {
                        onClose();
                        onViewReceipt(item.orderId);
                      }
                    }}
                    className={`flex gap-3 p-3.5 rounded-2xl transition-all ${
                      item.read
                        ? 'bg-white border border-gray-100'
                        : 'bg-amber-50/60 border border-amber-200/80 shadow-2xs'
                    } ${isCompleted ? 'cursor-pointer hover:border-amber-300' : ''}`}
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${
                        item.title?.includes('Cancelled')
                          ? 'bg-red-100 text-red-600'
                          : item.type === 'promo'
                          ? 'bg-amber-400 text-white'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-800">{item.title}</h3>
                        <span className="text-[10px] text-gray-400 font-medium flex-shrink-0 ml-2">{formatTime(item.time)}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{item.message}</p>
                      {isCompleted && (
                        <span className="inline-block text-[10px] font-bold text-amber-600 mt-1">View Receipt &rarr;</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-100 bg-gray-50/80 px-6 py-3.5 text-center">
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors"
              >
                Mark all as read
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
