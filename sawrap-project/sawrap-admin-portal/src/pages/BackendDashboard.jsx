import { useCallback, useEffect, useState } from 'react';
import {
  loadAdminData, publicImage, replyToCustomer, saveAddon, saveBanner, saveProduct,
  saveStore, saveVoucher, setAddonDeleted, setBannerDeleted, setProductDeleted,
  setVoucherDeleted, signedPaymentProof, transitionOrder, verifyPayment,
} from '../lib/api';

const emptyProduct = { name: '', category: 'Sakto', description: '', price: '', stock: 0,
  sort_order: 0, is_available: true, image_path: null };
const emptyAddon = { name: '', price: '', is_available: true };
const emptyBanner = { image_path: '', sort_order: 0, is_active: true };
const emptyVoucher = { code: '', discount_type: 'fixed', discount_value: '', min_spend: 0,
  starts_at: '', ends_at: '', max_redemptions: '', is_active: true };

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-amber-400';
const buttonClass = 'rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-gray-900 hover:bg-amber-300 disabled:opacity-50';
const secondaryButton = 'rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-gray-50';
const cardClass = 'rounded-2xl border border-gray-200 bg-white p-4 shadow-sm';
const pesos = (centavos) => `₱${((centavos || 0) / 100).toFixed(2)}`;
const paymentOf = (order) => Array.isArray(order.payments) ? order.payments[0] : order.payments;

function Field({ label, children }) {
  return <label className="block space-y-1 text-xs font-semibold text-gray-600"><span>{label}</span>{children}</label>;
}

export default function BackendDashboard({ onLogout }) {
  const [tab, setTab] = useState('Orders');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [productDraft, setProductDraft] = useState(emptyProduct);
  const [productFile, setProductFile] = useState(null);
  const [addonDraft, setAddonDraft] = useState(emptyAddon);
  const [bannerDraft, setBannerDraft] = useState(emptyBanner);
  const [bannerFile, setBannerFile] = useState(null);
  const [voucherDraft, setVoucherDraft] = useState(emptyVoucher);
  const [storeDraft, setStoreDraft] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [reply, setReply] = useState('');
  const [cancelReasons, setCancelReasons] = useState({});

  const refresh = useCallback(async () => {
    try {
      const rows = await loadAdminData();
      setData(rows);
      setStoreDraft((previous) => previous || rows.store);
      setError('');
    } catch (cause) {
      setError(cause.message || 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const firstLoad = setTimeout(refresh, 0);
    const timer = setInterval(refresh, 10000);
    window.addEventListener('focus', refresh);
    return () => { clearTimeout(firstLoad); clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [refresh]);

  const run = async (action, success) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
      await refresh();
      setNotice(success);
    } catch (cause) {
      setError(cause.message || 'The change could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const tabs = ['Orders', 'Products', 'Add-ons', 'Banners', 'Vouchers', 'Messages', 'Settings'];
  const selectedChat = data?.conversations.find((item) => item.id === selectedConversation);

  return <div className="min-h-screen bg-gray-50 text-gray-900">
    <header className="border-b border-gray-200 bg-gray-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div><h1 className="text-xl font-black">SaWrap Admin</h1><p className="text-xs text-gray-400">Live store operations</p></div>
        <button type="button" onClick={onLogout} className="rounded-xl border border-gray-600 px-3 py-2 text-sm hover:bg-gray-800">Sign out</button>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-6 flex gap-2 overflow-x-auto pb-2" aria-label="Admin sections">
        {tabs.map((name) => <button key={name} type="button" onClick={() => setTab(name)}
          className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold ${tab === name ? 'bg-amber-400 text-gray-900' : 'bg-white text-gray-600 border border-gray-200'}`}>{name}</button>)}
      </nav>
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</div>}
      {loading && <p className="text-sm text-gray-500">Loading store data...</p>}

      {data && tab === 'Orders' && <section className="space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-black">Orders</h2><button className={secondaryButton} onClick={refresh}>Refresh</button></div>
        {data.orders.length === 0 && <p className={cardClass}>No orders yet.</p>}
        {data.orders.map((order) => {
          const payment = paymentOf(order);
          const nextStatus = { Pending: 'Preparing', Preparing: 'Ready', Ready: 'Completed' }[order.status];
          return <article key={order.id} className={cardClass}>
            <div className="flex flex-wrap justify-between gap-3 border-b border-gray-100 pb-3">
              <div><h3 className="font-black text-amber-700">{order.order_code}</h3><p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p></div>
              <div className="text-right"><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">{order.status}</span><p className="mt-2 font-black">{pesos(order.total_centavos)}</p></div>
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div className="text-sm"><p className="font-bold">{order.customer_name}</p><p>{order.phone}</p><p>{order.fulfillment === 'courier' ? order.address : 'Store pickup'}</p>
                {order.order_note && <p className="mt-2 rounded-lg bg-amber-50 p-2">Note: {order.order_note}</p>}
                {order.courier_reference && <p className="mt-2">Courier reference: {order.courier_reference}</p>}
                {order.cancel_reason && <p className="mt-2 text-red-700">Cancellation: {order.cancel_reason}</p>}
              </div>
              <div className="text-sm">{order.order_items?.map((item) => <p key={item.id}>{item.quantity} × {item.product_name}
                {item.order_item_addons?.length > 0 && <span className="text-gray-500"> (+ {item.order_item_addons.map((addon) => addon.addon_name).join(', ')})</span>}
              </p>)}<p className="mt-2 border-t pt-2">Subtotal {pesos(order.subtotal_centavos)} · Discount {pesos(order.discount_centavos)}</p></div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 text-xs">
              <span className="font-bold">{payment?.method}: {payment?.state || 'unknown'}</span>
              {payment?.reference && <span>Reference: {payment.reference}</span>}
              {payment?.proof_path && <button className={secondaryButton} onClick={() => run(async () => {
                const url = await signedPaymentProof(payment.proof_path);
                window.open(url, '_blank', 'noopener,noreferrer');
              }, 'Payment proof opened.')}>View proof</button>}
              {payment?.method === 'E-Wallet' && payment.state === 'unverified' && !payment.reference && <span className="text-amber-700">Awaiting customer reference</span>}
              {payment?.method === 'E-Wallet' && payment.state === 'unverified' && payment.reference && <>
                <button disabled={busy} className={secondaryButton} onClick={() => run(() => verifyPayment(order.id, 'verified'), 'Payment verified.')}>Verify payment</button>
                <button disabled={busy} className={secondaryButton} onClick={() => run(() => verifyPayment(order.id, 'rejected'), 'Payment rejected.')}>Reject payment</button>
              </>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {nextStatus && <button disabled={busy} className={buttonClass} onClick={() => run(() => transitionOrder(order.id, nextStatus), `Order moved to ${nextStatus}.`)}>
                {order.status === 'Pending' ? 'Accept and deduct stock' : `Mark ${nextStatus}`}</button>}
              {order.status === 'Pending' && <><input className={`${inputClass} max-w-xs`} placeholder="Cancellation reason"
                value={cancelReasons[order.id] || ''} onChange={(event) => setCancelReasons({ ...cancelReasons, [order.id]: event.target.value })} />
                <button disabled={busy || !cancelReasons[order.id]?.trim()} className={secondaryButton}
                  onClick={() => run(() => transitionOrder(order.id, 'Cancelled', cancelReasons[order.id]), 'Order cancelled.')}>Cancel order</button></>}
            </div>
          </article>;
        })}
      </section>}

      {data && tab === 'Products' && <section className="grid gap-5 lg:grid-cols-[minmax(280px,350px)_1fr]">
        <form className={`${cardClass} h-fit space-y-3`} onSubmit={(event) => { event.preventDefault(); run(async () => {
          await saveProduct(productDraft, productFile); setProductDraft(emptyProduct); setProductFile(null);
        }, 'Product saved.'); }}>
          <h2 className="font-black">{productDraft.id ? 'Edit product' : 'Add product'}</h2>
          <Field label="Name"><input required className={inputClass} value={productDraft.name} onChange={(e) => setProductDraft({ ...productDraft, name: e.target.value })} /></Field>
          <Field label="Category"><select className={inputClass} value={productDraft.category} onChange={(e) => setProductDraft({ ...productDraft, category: e.target.value })}>
            {['Sakto', 'Sarap', 'Sagad'].map((value) => <option key={value}>{value}</option>)}</select></Field>
          <Field label="Description"><textarea className={inputClass} value={productDraft.description} onChange={(e) => setProductDraft({ ...productDraft, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2"><Field label="Price (PHP)"><input required type="number" min="0" step="0.01" className={inputClass} value={productDraft.price} onChange={(e) => setProductDraft({ ...productDraft, price: e.target.value })} /></Field>
            <Field label="Stock"><input required type="number" min="0" step="1" className={inputClass} value={productDraft.stock} onChange={(e) => setProductDraft({ ...productDraft, stock: e.target.value })} /></Field></div>
          <Field label="Sort order"><input type="number" className={inputClass} value={productDraft.sort_order} onChange={(e) => setProductDraft({ ...productDraft, sort_order: e.target.value })} /></Field>
          <Field label="Image"><input type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} onChange={(e) => setProductFile(e.target.files[0] || null)} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={productDraft.is_available} onChange={(e) => setProductDraft({ ...productDraft, is_available: e.target.checked })} />Available</label>
          <div className="flex gap-2"><button disabled={busy} className={buttonClass}>Save product</button><button type="button" className={secondaryButton} onClick={() => { setProductDraft(emptyProduct); setProductFile(null); }}>Clear</button></div>
        </form>
        <div className="space-y-3">{data.products.map((item) => <article key={item.id} className={`${cardClass} flex gap-4`}>
          {item.image_url && <img src={item.image_url} alt="" className="h-20 w-20 rounded-xl object-cover" />}
          <div className="min-w-0 flex-1"><h3 className="font-bold">{item.name}</h3><p className="text-xs text-gray-500">{item.category} · {pesos(item.price_centavos)} · Stock {item.stock} · {item.is_available ? 'Available' : 'Unavailable'}</p>
            {item.deleted_at && <p className="text-xs text-red-600">In trash</p>}
            <div className="mt-2 flex gap-2"><button className={secondaryButton} onClick={() => setProductDraft({ ...item, price: item.price_centavos / 100 })}>Edit</button>
              <button disabled={busy} className={secondaryButton} onClick={() => run(() => setProductDeleted(item.id, !item.deleted_at), item.deleted_at ? 'Product restored.' : 'Product moved to trash.')}>
                {item.deleted_at ? 'Restore' : 'Trash'}</button></div></div></article>)}
          {data.products.length === 0 && <p className={cardClass}>No products yet. Add the confirmed menu here.</p>}</div>
      </section>}

      {data && tab === 'Add-ons' && <section className="grid gap-5 lg:grid-cols-[minmax(280px,350px)_1fr]">
        <form className={`${cardClass} h-fit space-y-3`} onSubmit={(event) => { event.preventDefault(); run(async () => {
          await saveAddon(addonDraft); setAddonDraft(emptyAddon);
        }, 'Add-on saved.'); }}><h2 className="font-black">{addonDraft.id ? 'Edit add-on' : 'Add add-on'}</h2>
          <Field label="Name"><input required className={inputClass} value={addonDraft.name} onChange={(e) => setAddonDraft({ ...addonDraft, name: e.target.value })} /></Field>
          <Field label="Price (PHP)"><input required type="number" min="0" step="0.01" className={inputClass} value={addonDraft.price} onChange={(e) => setAddonDraft({ ...addonDraft, price: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addonDraft.is_available} onChange={(e) => setAddonDraft({ ...addonDraft, is_available: e.target.checked })} />Available</label>
          <button disabled={busy} className={buttonClass}>Save add-on</button></form>
        <div className="space-y-3">{data.addons.map((item) => <article key={item.id} className={`${cardClass} flex items-center justify-between gap-3`}>
          <div><h3 className="font-bold">{item.name}</h3><p className="text-xs text-gray-500">{pesos(item.price_centavos)} · {item.is_available ? 'Available' : 'Unavailable'} {item.deleted_at && '· In trash'}</p></div>
          <div className="flex gap-2"><button className={secondaryButton} onClick={() => setAddonDraft({ ...item, price: item.price_centavos / 100 })}>Edit</button>
            <button disabled={busy} className={secondaryButton} onClick={() => run(() => setAddonDeleted(item.id, !item.deleted_at), 'Add-on updated.')}>{item.deleted_at ? 'Restore' : 'Trash'}</button></div></article>)}
          {data.addons.length === 0 && <p className={cardClass}>No add-ons yet.</p>}</div>
      </section>}

      {data && tab === 'Banners' && <section className="grid gap-5 lg:grid-cols-[minmax(280px,350px)_1fr]">
        <form className={`${cardClass} h-fit space-y-3`} onSubmit={(event) => { event.preventDefault(); run(async () => {
          await saveBanner(bannerDraft, bannerFile); setBannerDraft(emptyBanner); setBannerFile(null);
        }, 'Banner saved.'); }}><h2 className="font-black">{bannerDraft.id ? 'Edit banner' : 'Add banner'}</h2>
          <Field label="Image"><input type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} onChange={(e) => setBannerFile(e.target.files[0] || null)} /></Field>
          <Field label="Sort order"><input type="number" className={inputClass} value={bannerDraft.sort_order} onChange={(e) => setBannerDraft({ ...bannerDraft, sort_order: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={bannerDraft.is_active} onChange={(e) => setBannerDraft({ ...bannerDraft, is_active: e.target.checked })} />Active</label>
          <button disabled={busy} className={buttonClass}>Save banner</button></form>
        <div className="space-y-3">{data.banners.map((item) => <article key={item.id} className={`${cardClass} flex items-center gap-4`}>
          <img src={item.image_url} alt="Promo banner" className="h-20 w-32 rounded-xl object-cover" />
          <div className="flex-1"><p className="text-xs text-gray-500">Order {item.sort_order} · {item.is_active ? 'Active' : 'Inactive'} {item.deleted_at && '· In trash'}</p>
            <div className="mt-2 flex gap-2"><button className={secondaryButton} onClick={() => setBannerDraft(item)}>Edit</button>
              <button disabled={busy} className={secondaryButton} onClick={() => run(() => setBannerDeleted(item.id, !item.deleted_at), 'Banner updated.')}>{item.deleted_at ? 'Restore' : 'Trash'}</button></div></div></article>)}
          {data.banners.length === 0 && <p className={cardClass}>No banners yet.</p>}</div>
      </section>}

      {data && tab === 'Vouchers' && <section className="grid gap-5 lg:grid-cols-[minmax(280px,350px)_1fr]">
        <form className={`${cardClass} h-fit space-y-3`} onSubmit={(event) => { event.preventDefault(); run(async () => {
          await saveVoucher(voucherDraft); setVoucherDraft(emptyVoucher);
        }, 'Voucher saved.'); }}><h2 className="font-black">{voucherDraft.id ? 'Edit voucher' : 'Add voucher'}</h2>
          <Field label="Code"><input required className={inputClass} value={voucherDraft.code} onChange={(e) => setVoucherDraft({ ...voucherDraft, code: e.target.value.toUpperCase() })} /></Field>
          <Field label="Type"><select className={inputClass} value={voucherDraft.discount_type} onChange={(e) => setVoucherDraft({ ...voucherDraft, discount_type: e.target.value })}><option value="fixed">Fixed PHP</option><option value="percent">Percent</option></select></Field>
          <Field label={voucherDraft.discount_type === 'fixed' ? 'Discount (PHP)' : 'Discount (%)'}><input required type="number" min="1" step={voucherDraft.discount_type === 'fixed' ? '0.01' : '1'} className={inputClass} value={voucherDraft.discount_value} onChange={(e) => setVoucherDraft({ ...voucherDraft, discount_value: e.target.value })} /></Field>
          <Field label="Minimum spend (PHP)"><input type="number" min="0" step="0.01" className={inputClass} value={voucherDraft.min_spend} onChange={(e) => setVoucherDraft({ ...voucherDraft, min_spend: e.target.value })} /></Field>
          <Field label="Start"><input type="datetime-local" className={inputClass} value={voucherDraft.starts_at} onChange={(e) => setVoucherDraft({ ...voucherDraft, starts_at: e.target.value })} /></Field>
          <Field label="End"><input type="datetime-local" className={inputClass} value={voucherDraft.ends_at} onChange={(e) => setVoucherDraft({ ...voucherDraft, ends_at: e.target.value })} /></Field>
          <Field label="Max redemptions"><input type="number" min="1" className={inputClass} value={voucherDraft.max_redemptions} onChange={(e) => setVoucherDraft({ ...voucherDraft, max_redemptions: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={voucherDraft.is_active} onChange={(e) => setVoucherDraft({ ...voucherDraft, is_active: e.target.checked })} />Active</label>
          <button disabled={busy} className={buttonClass}>Save voucher</button></form>
        <div className="space-y-3">{data.vouchers.map((item) => <article key={item.id} className={`${cardClass} flex items-center justify-between gap-3`}>
          <div><h3 className="font-bold">{item.code}</h3><p className="text-xs text-gray-500">{item.discount_type === 'fixed' ? pesos(item.discount_value) : `${item.discount_value}%`} off · Min {pesos(item.min_spend_centavos)} {item.deleted_at && '· In trash'}</p></div>
          <div className="flex gap-2"><button className={secondaryButton} onClick={() => setVoucherDraft({ ...item,
            discount_value: item.discount_type === 'fixed' ? item.discount_value / 100 : item.discount_value,
            min_spend: item.min_spend_centavos / 100,
            starts_at: item.starts_at?.slice(0, 16) || '', ends_at: item.ends_at?.slice(0, 16) || '',
            max_redemptions: item.max_redemptions || '' })}>Edit</button>
            <button disabled={busy} className={secondaryButton} onClick={() => run(() => setVoucherDeleted(item.id, !item.deleted_at), 'Voucher updated.')}>{item.deleted_at ? 'Restore' : 'Trash'}</button></div></article>)}
          {data.vouchers.length === 0 && <p className={cardClass}>No vouchers yet.</p>}</div>
      </section>}

      {data && tab === 'Messages' && <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className={`${cardClass} space-y-2`}><h2 className="font-black">Conversations</h2>
          {data.conversations.map((chat) => <button key={chat.id} onClick={() => setSelectedConversation(chat.id)}
            className={`block w-full rounded-xl p-3 text-left text-sm ${chat.id === selectedConversation ? 'bg-amber-100' : 'bg-gray-50'}`}>
            <strong>{chat.customer_name || 'Customer'}</strong><span className="block text-xs text-gray-500">{chat.phone}</span></button>)}
          {data.conversations.length === 0 && <p className="text-sm text-gray-500">No conversations yet.</p>}</div>
        <div className={`${cardClass} space-y-3`}>{selectedChat ? <>
          <h2 className="font-black">{selectedChat.customer_name}</h2>
          <div className="max-h-[50vh] space-y-2 overflow-y-auto rounded-xl bg-gray-50 p-3">
            {[...(selectedChat.messages || [])].sort((a, b) => a.created_at.localeCompare(b.created_at)).map((message) =>
              <div key={message.id} className={`rounded-xl p-3 text-sm ${message.sender_role === 'staff' ? 'bg-amber-100' : 'bg-white'}`}>
                <strong>{message.sender_role === 'staff' ? 'SaWrap' : 'Customer'}:</strong> {message.body}
                <span className="mt-1 block text-[10px] text-gray-500">{new Date(message.created_at).toLocaleString()}</span>
              </div>)}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); if (!reply.trim()) return; run(async () => {
            await replyToCustomer(selectedChat.id, reply); setReply('');
          }, 'Reply sent.'); }} className="flex gap-2"><input className={inputClass} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply to customer" />
            <button disabled={busy || !reply.trim()} className={buttonClass}>Send</button></form>
        </> : <p className="text-sm text-gray-500">Choose a conversation.</p>}</div>
      </section>}

      {data && tab === 'Settings' && storeDraft && <form className={`${cardClass} max-w-xl space-y-3`} onSubmit={(event) => { event.preventDefault(); run(() => saveStore(storeDraft, qrFile), 'Store settings saved.'); }}>
        <h2 className="font-black">Store settings</h2>
        {['name', 'phone', 'address', 'hours', 'ewallet_account_name', 'ewallet_account_number'].map((field) => <Field key={field} label={field.replaceAll('_', ' ')}>
          <input className={inputClass} value={storeDraft[field] || ''} onChange={(e) => setStoreDraft({ ...storeDraft, [field]: e.target.value })} /></Field>)}
        {storeDraft.qr_image_path && <img src={publicImage('store-assets', storeDraft.qr_image_path)} alt="Store payment QR" className="h-36 w-36 rounded-xl object-contain" />}
        <Field label="Payment QR image"><input type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} onChange={(e) => setQrFile(e.target.files[0] || null)} /></Field>
        <p className="text-xs text-gray-500">E-Wallet checkout stays disabled until you enter the confirmed account number here.</p>
        <button disabled={busy} className={buttonClass}>Save settings</button>
      </form>}
    </main>
  </div>;
}
