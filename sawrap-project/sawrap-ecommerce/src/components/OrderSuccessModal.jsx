import { CheckCircle2, ShoppingBag, Clock, ArrowRight } from 'lucide-react';

export default function OrderSuccessModal({ isOpen, onClose, onViewOrders, orderCode, total }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-0 md:items-center md:p-4 font-sans">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex w-full max-w-md flex-col rounded-t-3xl md:rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 text-center space-y-5 overflow-hidden">
        
        {/* Animated Checkmark Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-500 border-4 border-amber-100">
          <CheckCircle2 className="h-12 w-12 stroke-[2.5]" />
        </div>

        {/* Success Message */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Order Placed!</h2>
          <p className="text-xs text-gray-500 font-medium">
            Salamat sa pag-order sa SaWrap! Hinihintay pa ang kumpirmasyon ng store.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
            <span className="text-gray-400 font-medium">Order Reference:</span>
            <span className="font-extrabold text-gray-800">{orderCode}</span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-gray-400 font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" /> Confirmed Total:
            </span>
            <span className="font-bold text-amber-600">₱ {total?.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400 font-medium flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5 text-amber-500" /> Status:
            </span>
            <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              Pending
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="w-full rounded-2xl bg-amber-400 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Track Order Status</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-gray-100 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
