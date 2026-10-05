import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, CreditCard, User, Phone, Ticket, MessageSquare, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import OrderSuccessModal from '../components/OrderSuccessModal';
import Toast from '../components/Toast';
import { safeSetItem } from '../utils/storage';

export default function Checkout({ onBack, onOrderSuccess }) {
  const { cartItems, grandTotal, voucherCode, setVoucherCode, clearCart } = useCart();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isEWalletModalOpen, setIsEWalletModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showErrorToast = (msg) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 2500);
  };
  
  const [fulfillmentMethod, setFulfillmentMethod] = useState('pickup'); // 'pickup' or 'courier'
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // E-Wallet Details State
  const [eWalletRef, setEWalletRef] = useState('');
  const [eWalletProof, setEWalletProof] = useState(null);
  const [adminQrCode, setAdminQrCode] = useState('');

  // Customer State
  const [user, setUser] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [orderMessage, setOrderMessage] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedUser = localStorage.getItem('sawrap_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    const savedQr = localStorage.getItem('sawrap_admin_qr');
    if (savedQr) {
      setAdminQrCode(savedQr);
    }
  }, []);

  const handleFulfillmentChange = (method) => {
    setFulfillmentMethod(method);
    if (method === 'courier') {
      setPaymentMethod('E-Wallet');
    }
  };

  const validateCheckout = () => {
    const newErrors = {};
    const activeName = user ? user.name : guestName;
    if (!activeName || !activeName.trim()) {
      newErrors.name = 'Recipient name is required.';
    } else if (!/^[a-zA-Z\s]+$/.test(activeName)) {
      newErrors.name = 'Name must contain letters only.';
    }

    const activePhone = user ? user.phone.replace(/[^0-9]/g, '') : guestPhone.replace(/[^0-9]/g, '');
    if (!activePhone) {
      newErrors.phone = 'Contact number is required.';
    } else if (activePhone.length < 10 || !activePhone.slice(-10).startsWith('9')) {
      newErrors.phone = 'Enter valid 10-digit number (e.g. 9399030522).';
    }

    if (fulfillmentMethod === 'courier') {
      const activeAddress = user ? (user.location || user.address) : guestAddress;
      if (!activeAddress || !activeAddress.trim()) {
        newErrors.address = 'Delivery address is required for courier delivery.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrderClick = () => {
    if (!validateCheckout()) return;
    if (paymentMethod === 'E-Wallet') {
      setIsEWalletModalOpen(true);
    } else {
      saveOrderToLocalStorage();
    }
  };

  const saveOrderToLocalStorage = () => {
    const activeName = user ? user.name : guestName;
    const activePhone = user ? user.phone : guestPhone;
    const activeAddress = fulfillmentMethod === 'courier' ? (user ? (user.location || user.address) : guestAddress) : 'Store Pick-up';

    // Eksaktong tugma sa schema na binabasa ng Admin Portal (sawrap_orders)
    const newOrder = {
      id: 'SW-' + Math.floor(100000 + Math.random() * 900000),
      customer: activeName,
      phone: activePhone,
      location: activeAddress,
      type: fulfillmentMethod === 'courier' ? 'Courier' : 'Pick-Up',
      paymentMethod: paymentMethod,
      eWalletRef: eWalletRef || 'N/A',
      items: cartItems.map((item) => ({
        name: item.name,
        category: item.category || '',
        qty: item.quantity,
        price: item.price,
        addons: item.selectedAddons || [],
      })),
      total: grandTotal,
      status: 'Pending', // Magsisimula sa Pending hanggang i-accept ng store (Admin: Pending -> Preparing -> Ready -> Completed)
      time: new Date().toLocaleString(),
      date: new Date().toISOString(),
      cancelReason: '',
    };

    // I-save sa localStorage para mabasa ng admin portal at order history
    const existingOrders = JSON.parse(localStorage.getItem('sawrap_orders') || '[]');
    safeSetItem('sawrap_orders', JSON.stringify([newOrder, ...existingOrders]));

    // Kung guest checkout ito at wala pang naka-save na identity, i-save ang
    // pangalan/phone para malaman ng Store kung sino sila kapag nag-message
    // (requirement: dapat may kilalang pangalan bago makapag-message)
    if (!user && !localStorage.getItem('sawrap_user')) {
      safeSetItem('sawrap_user', JSON.stringify({
        name: guestName,
        email: '',
        phone: guestPhone,
        location: guestAddress,
        avatar: '',
        createdAt: new Date().toISOString(),
      }));
    }

    clearCart();
    setIsEWalletModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleConfirmEWalletPayment = (e) => {
    e.preventDefault();
    if (!eWalletRef.trim()) {
      showErrorToast('Please enter your E-Wallet reference number.');
      return;
    }
    saveOrderToLocalStorage();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-28 pt-4 px-4 md:px-8 font-sans">
      <Toast message={toastMessage} isVisible={isToastVisible} title="Missing Info" variant="error" />
      <div className="mx-auto max-w-2xl space-y-5">
        
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-2xs hover:bg-amber-50 hover:border-amber-400 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-800">Checkout</h1>
            <p className="text-xs text-gray-500 font-medium">
              {user ? 'Ordering as Registered User' : 'Ordering as Guest'}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Customer Details</h2>
          <div className="space-y-3">
            <div>
              <div className={`flex items-center rounded-2xl bg-gray-100 px-3.5 py-2.5 border transition-all ${
                errors.name ? 'border-red-400 bg-red-50/30' : 'border-gray-200/80 focus-within:border-amber-400'
              }`}>
                <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Recipient Name (Letters only)"
                  value={user ? user.name : guestName}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    user ? setUser({ ...user, name: val }) : setGuestName(val);
                  }}
                  className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
                />
              </div>
              {errors.name && <p className="text-[10px] text-red-500 font-bold px-2 mt-1">{errors.name}</p>}
            </div>

            <div>
              <div className={`flex items-center rounded-2xl bg-gray-100 px-3.5 py-2.5 border transition-all ${
                errors.phone ? 'border-red-400 bg-red-50/30' : 'border-gray-200/80 focus-within:border-amber-400'
              }`}>
                <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-600 mr-2 border-r border-gray-300 pr-2">+63</span>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="9XXXXXXXXX (10 digits)"
                  value={user ? user.phone.replace(/[^0-9]/g, '').slice(-10) : guestPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    user ? setUser({ ...user, phone: `+63 ${val}` }) : setGuestPhone(val);
                  }}
                  className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
                />
              </div>
              {errors.phone && <p className="text-[10px] text-red-500 font-bold px-2 mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 border border-gray-100 shadow-xs space-y-3 divide-y divide-gray-100">
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-amber-500" /> Voucher
            </span>
            <input
              type="text"
              placeholder="Enter code"
              value={voucherCode || ''}
              onChange={(e) => setVoucherCode(e.target.value)}
              className="text-right text-xs font-medium text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber-500" /> Message
            </span>
            <input
              type="text"
              placeholder="Additional requests"
              value={orderMessage}
              onChange={(e) => setOrderMessage(e.target.value)}
              className="text-right text-xs font-medium text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-500" /> Payment option
            </span>
            <div className="flex items-center gap-2">
              {['Cash', 'E-Wallet'].map((method) => (
                <button
                  key={method}
                  type="button"
                  disabled={fulfillmentMethod === 'courier' && method === 'Cash'}
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-xl px-3 py-1 text-xs font-bold border transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-gray-200 bg-white text-gray-500'
                  } ${fulfillmentMethod === 'courier' && method === 'Cash' ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-2 border border-amber-400 shadow-xs flex items-center">
          <button
            type="button"
            onClick={() => handleFulfillmentChange('pickup')}
            className={`flex-1 rounded-2xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
              fulfillmentMethod === 'pickup'
                ? 'bg-amber-400 text-white shadow-xs'
                : 'bg-transparent text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pick up
          </button>
          <button
            type="button"
            onClick={() => handleFulfillmentChange('courier')}
            className={`flex-1 rounded-2xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
              fulfillmentMethod === 'courier'
                ? 'bg-amber-400 text-white shadow-xs'
                : 'bg-transparent text-gray-700 hover:bg-gray-50'
            }`}
          >
            Book own courier
          </button>
        </div>

        <div className="rounded-3xl bg-gray-50/80 p-5 border border-gray-100 space-y-3">
          {fulfillmentMethod === 'pickup' ? (
            <div>
              <h3 className="text-xs font-bold text-gray-800">SaWrap Address</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Pamantasan ng Lungsod ng Maynila, General Luna Street, Intramuros, Manila, Metro Manila.
              </p>
              <div className="mt-3">
                <h4 className="text-[11px] font-bold text-gray-700">Contact No.</h4>
                <p className="text-xs font-semibold text-gray-500">09399030522</p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-bold text-gray-800 mb-2">Delivery Address</h3>
              <div className={`flex items-center rounded-2xl bg-white px-3.5 py-2.5 border transition-all ${
                errors.address ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus-within:border-amber-400'
              }`}>
                <MapPin className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter complete delivery location"
                  value={user ? (user.location || user.address) : guestAddress}
                  onChange={(e) => user ? setUser({ ...user, location: e.target.value }) : setGuestAddress(e.target.value)}
                  className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
                />
              </div>
              {errors.address && <p className="text-[10px] text-red-500 font-bold px-2 mt-1">{errors.address}</p>}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handlePlaceOrderClick}
          disabled={cartItems.length === 0}
          className="w-full rounded-2xl bg-amber-400 py-3.5 text-center font-bold text-white shadow-md hover:bg-amber-500 active:scale-[0.98] transition-all cursor-pointer"
        >
          Place Order (₱ {grandTotal.toFixed(2)})
        </button>

      </div>

      {isEWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-800">E-Wallet Transfer</h3>
              <button 
                onClick={() => setIsEWalletModalOpen(false)} 
                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
              <p className="text-xs text-amber-900 font-bold">Scan QR or Send payment to official SaWrap account:</p>
              
              {adminQrCode ? (
                <div className="mx-auto w-36 h-36 bg-white rounded-xl border border-amber-200 p-2 shadow-sm flex items-center justify-center overflow-hidden">
                  <img src={adminQrCode} alt="E-Wallet QR Code" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="py-2 text-xs text-gray-400 italic">No QR code uploaded by admin yet. Use number below:</div>
              )}

              <div>
                <span className="text-2xl font-black text-amber-600 tracking-wider">0939-903-0522</span>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">Account Name: John Andrei T. (SaWrap)</p>
              </div>
              <p className="text-xs font-black text-gray-800 pt-1">Total Amount Due: ₱ {grandTotal.toFixed(2)}</p>
            </div>

            <form onSubmit={handleConfirmEWalletPayment} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">E-Wallet Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1029384756"
                  value={eWalletRef}
                  onChange={(e) => setEWalletRef(e.target.value)}
                  className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs font-bold text-gray-800 outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Upload Receipt (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEWalletProof(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-amber-400 py-3.5 text-xs font-black text-white shadow-md hover:bg-amber-500 transition-all cursor-pointer"
                >
                  Confirm Payment & Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onViewOrders={() => {
          setIsSuccessModalOpen(false);
          onOrderSuccess();
        }}
      />
    </div>
  );
}