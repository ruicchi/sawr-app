import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, PackageCheck, ReceiptText } from 'lucide-react';
import { OrderListSkeleton } from '../components/Skeletons';
import Toast from '../components/Toast';
import { listMyOrders, saveCourierReference, submitPaymentReference, uploadPaymentProof } from '../lib/api';

// Simpleng 3-stage progress bar: Order Placed -> Preparing -> Ready for Pick-up
function OrderProgressBar({ status }) {
  const steps = ['Pending', 'Preparing', 'Ready'];
  const labels = ['Order Placed', 'Preparing', 'Ready for Pickup'];
  const currentIndex = status === 'Completed' ? 2 : steps.indexOf(status);

  return (
    <div className="py-1">
      <div className="flex items-center">
        {labels.map((label, idx) => {
          const isDone = idx <= currentIndex;
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 ${
                    isDone ? 'bg-amber-400 border-amber-400 text-white' : 'bg-white border-gray-200 text-gray-300'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span className={`text-[9px] font-bold text-center leading-tight w-16 ${isDone ? 'text-amber-600' : 'text-gray-300'}`}>
                  {label}
                </span>
              </div>
              {idx < labels.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 ${idx < currentIndex ? 'bg-amber-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderHistory({ onViewReceipt }) {
  const [orders, setOrders] = useState([]);
  const [courierRefs, setCourierRefs] = useState({});
  const [paymentRefs, setPaymentRefs] = useState({});
  const [proofFiles, setProofFiles] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (msg, variant = 'success') => {
    setToastMessage(msg);
    setToastVariant(variant);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 2500);
  };

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      try {
        const rows = await listMyOrders();
        if (active) setOrders(rows);
      } catch (error) {
        if (active) showToast(error.message || 'Could not load orders.', 'error');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadOrders();
    window.addEventListener('focus', loadOrders);
    const interval = setInterval(loadOrders, 10000);
    return () => {
      active = false;
      window.removeEventListener('focus', loadOrders);
      clearInterval(interval);
    };
  }, []);

  const handleSaveCourierRef = async (orderId) => {
    const ref = courierRefs[orderId];
    if (!ref || !ref.trim()) {
      showToast('Please enter a valid booking reference or tracking number.', 'error');
      return;
    }

    try {
      const order = orders.find((entry) => entry.id === orderId);
      await saveCourierReference(order.databaseId, ref);
      setOrders(await listMyOrders());
      showToast('Courier tracking reference saved successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Could not save reference.', 'error');
    }
  };

  const handleSubmitPayment = async (order) => {
    const reference = paymentRefs[order.id]?.trim();
    if (!reference) { showToast('Enter your E-Wallet reference.', 'error'); return; }
    try {
      await submitPaymentReference(order.databaseId, reference);
      if (proofFiles[order.id]) await uploadPaymentProof(order.databaseId, proofFiles[order.id]);
      setOrders(await listMyOrders());
      showToast('Payment details sent. The store will verify them.');
    } catch (error) {
      setOrders(await listMyOrders());
      showToast(error.message || 'Could not submit payment details.', 'error');
    }
  };

  const handleUploadProof = async (order) => {
    if (!proofFiles[order.id]) { showToast('Choose a receipt image first.', 'error'); return; }
    try {
      await uploadPaymentProof(order.databaseId, proofFiles[order.id]);
      setOrders(await listMyOrders());
      showToast('Payment receipt uploaded.');
    } catch (error) { showToast(error.message || 'Could not upload receipt.', 'error'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-12 font-sans">
      <Toast message={toastMessage} isVisible={isToastVisible} title={toastVariant === 'error' ? 'Missing Info' : 'Saved!'} variant={toastVariant} />
      <h1 className="text-xl font-black text-gray-800">My Orders & History</h1>

      {isLoading ? (
        <OrderListSkeleton />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-2xs space-y-3">
          <Package className="h-12 w-12 text-amber-400 mx-auto opacity-50" />
          <p className="text-xs font-bold text-gray-500">No active orders found.</p>
        </div>
      ) : (
        orders.map((order) => {
          const isPending = order.status === 'Pending';
          const isAccepted = order.status === 'Preparing' || order.status === 'Ready' || order.status === 'Completed';
          const isCancelled = order.status === 'Cancelled';

          return (
            <div key={order.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-xs font-black text-amber-600">{order.id}</span>
                  <p className="text-[11px] text-gray-400">{order.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isPending ? 'bg-amber-100 text-amber-800' :
                  isCancelled ? 'bg-red-100 text-red-600' :
                  isAccepted ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Dahilan ng pag-cancel (galing sa Admin Portal) */}
              {isCancelled && order.cancelReason && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2">
                  <p className="text-[11px] font-bold text-red-600">Reason: {order.cancelReason}</p>
                </div>
              )}

              {/* Progress bar - hindi na ipinapakita kapag Cancelled */}
              {!isCancelled && <OrderProgressBar status={order.status} />}

              {/* Items Summary */}
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-medium text-gray-700">
                    <span>
                      {item.qty || 1}x {item.name}
                      {item.addons?.length > 0 ? ` (+ ${item.addons.join(', ')})` : ''}
                    </span>
                    <span className="font-bold">₱ {((item.price + (item.addonPrices || []).reduce((sum, price) => sum + price, 0)) * (item.qty || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs font-bold text-gray-800">
                <span>Total Amount ({order.paymentMethod})</span>
                <span className="text-amber-500 text-sm font-black">₱ {order.total.toFixed(2)}</span>
              </div>

              {order.paymentMethod === 'E-Wallet' && !isCancelled && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs space-y-2">
                  {order.eWalletRef ? (
                    <p className="font-bold text-amber-900">Payment reference {order.eWalletRef} · {order.paymentState === 'verified' ? 'Verified' : order.paymentState === 'rejected' ? 'Rejected — contact the store' : 'Waiting for staff verification'}</p>
                  ) : (
                    <><p className="font-bold text-amber-900">Payment reference needed for order {order.id}. Amount due: ₱ {order.total.toFixed(2)}</p>
                      <input className="w-full rounded-xl border border-amber-200 bg-white p-2" placeholder="E-Wallet reference number" value={paymentRefs[order.id] || ''}
                        onChange={(e) => setPaymentRefs({ ...paymentRefs, [order.id]: e.target.value })} />
                      <button className="rounded-xl bg-amber-400 px-4 py-2 font-bold text-white" onClick={() => handleSubmitPayment(order)}>Submit reference</button></>
                  )}
                  {order.paymentState === 'unverified' && !order.proofPath && <div className="space-y-2">
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="w-full" onChange={(e) => setProofFiles({ ...proofFiles, [order.id]: e.target.files[0] || null })} />
                    {order.eWalletRef && <button className="rounded-xl border border-amber-300 bg-white px-4 py-2 font-bold text-amber-800" onClick={() => handleUploadProof(order)}>Upload receipt</button>}
                  </div>}
                </div>
              )}

              {/* View Receipt - lumalabas lang kapag Completed na ang order */}
              {order.status === 'Completed' && (
                <button
                  onClick={() => onViewReceipt && onViewReceipt(order.id)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 py-2 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer"
                >
                  <ReceiptText className="h-3.5 w-3.5" /> View Receipt
                </button>
              )}

              {/* COURIER BOOKING CONTROL */}
              {order.type === 'Courier' && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <Truck className="h-4 w-4 text-amber-600" />
                    <span>Book Own Courier</span>
                  </div>

                  {isPending ? (
                    <p className="text-[11px] text-amber-700 italic">
                      ⏳ Waiting for store confirmation. Once accepted by the admin, you can proceed to book your courier.
                    </p>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <p className="text-[11px] text-gray-700 font-semibold flex items-start gap-1.5">
                        <PackageCheck className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Store accepted your order! You may now book your courier to pick up from the store address below:</span>
                      </p>
                      <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-[11px] text-gray-600 font-medium">
                        📍 <strong>SaWrap Store:</strong> Pamantasan ng Lungsod ng Maynila, Intramuros, Manila
                      </div>

                      {/* Input para sa Booking Reference / Tracking Number galing sa rider app ng customer */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] font-black uppercase text-gray-500 block">Enter Courier Booking Reference / Tracking No.</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. LM-123456 or Tracking ID"
                            value={order.courierReference || courierRefs[order.id] || ''}
                            onChange={(e) => setCourierRefs({ ...courierRefs, [order.id]: e.target.value })}
                            disabled={!!order.courierReference}
                            className="flex-1 rounded-xl bg-white border border-gray-200 px-3 py-2 text-xs font-bold text-gray-800 outline-none focus:border-amber-400 disabled:bg-gray-100"
                          />
                          {!order.courierReference && (
                            <button
                              type="button"
                              onClick={() => handleSaveCourierRef(order.id)}
                              className="bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                            >
                              Save
                            </button>
                          )}
                        </div>
                        {order.courierReference && (
                          <p className="text-[10px] text-green-600 font-bold flex items-center gap-1 pt-0.5">
                            <CheckCircle className="h-3 w-3" /> Tracking reference submitted to store.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })
      )}
    </div>
  );
}
