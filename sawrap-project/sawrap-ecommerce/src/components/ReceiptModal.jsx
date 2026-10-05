import React from 'react';
import { X, ReceiptText, Store } from 'lucide-react';

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-amber-50">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-white">
              <ReceiptText className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-800">Order Receipt</h2>
              <p className="text-[10px] text-gray-500">{order.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-white p-2 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-200">
            <div className="flex items-center justify-center gap-1.5 text-amber-600 font-black text-sm">
              <Store className="h-4 w-4" /> SaWrap
            </div>
            <p className="text-[10px] text-gray-400">{formatDate(order.date)}</p>
            <span className="inline-block mt-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider px-3 py-1">
              {order.status}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="font-bold text-gray-800">{order.customer}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-bold text-gray-800">{order.phone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Fulfillment</span><span className="font-bold text-gray-800">{order.type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-bold text-gray-800 text-right max-w-[60%]">{order.location}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="font-bold text-gray-800">{order.paymentMethod}</span></div>
            {order.eWalletRef && order.eWalletRef !== 'N/A' && (
              <div className="flex justify-between"><span className="text-gray-500">Ref No.</span><span className="font-bold text-gray-800">{order.eWalletRef}</span></div>
            )}
          </div>

          <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-800">{item.qty}x {item.name}</p>
                  {item.addons?.length > 0 && (
                    <p className="text-[10px] text-gray-400">+ {item.addons.join(', ')}</p>
                  )}
                </div>
                <span className="font-bold text-gray-800">₱ {(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-gray-300 pt-3 flex justify-between items-center">
            <span className="text-sm font-black text-gray-800">Total</span>
            <span className="text-lg font-black text-amber-500">₱ {order.total?.toFixed(2)}</span>
          </div>

          <p className="text-center text-[10px] text-gray-400 pt-2">Thank you for ordering with SaWrap! 🍌</p>
        </div>

      </div>
    </div>
  );
}
