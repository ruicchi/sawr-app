import React from 'react';
import { X, Trash2, Ticket, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartModal({ isOpen, onClose, onProceedToCheckout }) {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    grandTotal,
    voucherCode,
    setVoucherCode,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-0 md:items-center md:p-4 font-sans">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col bg-white shadow-2xl border border-gray-100 overflow-hidden rounded-t-3xl md:rounded-3xl">
        
        {/* Header with Remove All Option */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">My Cart</h2>
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 transition-all"
                title="Remove all items"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove All</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Your cart is empty. Add some delicious wraps!
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.cartId}
                className="flex items-center justify-between rounded-2xl bg-gray-50/80 p-3 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-amber-100 overflow-hidden flex items-center justify-center text-[10px] font-bold text-amber-700">
                    Wrap
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-800">{item.name}</h3>
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <p className="text-[10px] text-gray-400">
                        + {item.selectedAddons.join(', ')}
                      </p>
                    )}
                    <p className="text-xs font-semibold text-amber-500 mt-0.5">
                      ₱ {item.itemTotal.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-lg bg-white px-2 py-1 border border-gray-200 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.cartId, -1)}
                      className="text-xs font-bold text-gray-500 hover:text-amber-500"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-gray-800 w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartId, 1)}
                      className="text-xs font-bold text-gray-500 hover:text-amber-500"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartId)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Voucher & Checkout Footer */}
        <div className="border-t border-gray-100 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Ticket className="h-4 w-4 text-amber-500" /> Voucher
            </span>
            <input
              type="text"
              placeholder="Enter code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="text-right font-medium text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-gray-800">Total</span>
            <span className="text-lg font-black text-amber-500">
              ₱ {grandTotal.toFixed(2)}
            </span>
          </div>

          <button
            onClick={onProceedToCheckout}
            disabled={cartItems.length === 0}
            className="w-full rounded-2xl bg-amber-400 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-amber-500 disabled:opacity-40 transition-all"
          >
            Order Now
          </button>
        </div>

      </div>
    </div>
  );
}