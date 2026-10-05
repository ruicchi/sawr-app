import { requireSupabase } from './supabase';

const fail = ({ error, data }) => {
  if (error) throw error;
  return data;
};

export function publicImage(bucket, path) {
  if (!path) return '';
  if (/^https:\/\//i.test(path)) return path;
  return requireSupabase().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function loadCatalog() {
  const db = requireSupabase();
  const [productsResult, addonsResult, bannersResult, storeResult] = await Promise.all([
    db.from('products').select('*').order('sort_order').order('created_at'),
    db.from('addons').select('*').order('name'),
    db.from('banners').select('*').order('sort_order'),
    db.from('store_settings').select('*').eq('id', 1).maybeSingle(),
  ]);
  const addons = fail(addonsResult).map((row) => ({
    id: row.id, name: row.name, price: row.price_centavos / 100,
    inStock: row.is_available && !row.deleted_at,
  }));
  const products = fail(productsResult).map((row) => ({
    id: row.id, name: row.name, category: row.category,
    description: row.description, price: row.price_centavos / 100,
    stock: row.stock, inStock: row.is_available && row.stock > 0,
    image: publicImage('catalog-images', row.image_path), addons,
  }));
  const banners = fail(bannersResult).map((row) => ({
    id: row.id, image: publicImage('banners', row.image_path),
  }));
  const storeRow = fail(storeResult);
  const store = storeRow ? {
    name: storeRow.name, phone: storeRow.phone, address: storeRow.address,
    hours: storeRow.hours, qr: publicImage('store-assets', storeRow.qr_image_path),
    ewalletAccountName: storeRow.ewallet_account_name,
    ewalletAccountNumber: storeRow.ewallet_account_number,
  } : null;
  return { products, addons, banners, store };
}

export async function getCurrentAccount() {
  const db = requireSupabase();
  const { data: { session }, error } = await db.auth.getSession();
  if (error) throw error;
  if (!session || session.user.is_anonymous) return null;
  const profile = fail(await db.from('profiles').select('*').eq('user_id', session.user.id).single());
  return {
    id: session.user.id, name: profile.full_name, email: session.user.email,
    phone: profile.phone, location: profile.address,
    avatar: publicImage('avatars', profile.avatar_path),
  };
}

export async function signUpCustomer({ name, email, password, phone, address }) {
  const db = requireSupabase();
  const { data: { session } } = await db.auth.getSession();
  if (session?.user?.is_anonymous) {
    fail(await db.from('profiles').update({ full_name: name, phone, address,
      updated_at: new Date().toISOString() }).eq('user_id', session.user.id));
    fail(await db.auth.updateUser({ email, data: { full_name: name } }));
    return { needsConfirmation: true, upgradingGuest: true };
  }
  const { data, error } = await db.auth.signUp({
    email, password,
    options: {
      emailRedirectTo: window.location.origin,
      data: { full_name: name, phone, address },
    },
  });
  if (error) throw error;
  return { needsConfirmation: !data.session, user: data.user };
}

export async function requestPasswordReset(email) {
  fail(await requireSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  }));
}

export async function setNewPassword(password) {
  fail(await requireSupabase().auth.updateUser({ password }));
}

export async function signInCustomer(email, password) {
  const db = requireSupabase();
  fail(await db.auth.signInWithPassword({ email, password }));
  return getCurrentAccount();
}

export async function signOutCustomer() {
  fail(await requireSupabase().auth.signOut());
}

export async function updateCustomerProfile({ name, phone, address, email }) {
  const db = requireSupabase();
  const { data: { user }, error: userError } = await db.auth.getUser();
  if (userError || !user || user.is_anonymous) throw userError || new Error('Sign in first.');
  fail(await db.from('profiles').update({
    full_name: name, phone, address, updated_at: new Date().toISOString(),
  }).eq('user_id', user.id));
  if (email && email !== user.email) fail(await db.auth.updateUser({ email }));
  return getCurrentAccount();
}

export async function ensureCheckoutSession() {
  const db = requireSupabase();
  const { data: { session }, error } = await db.auth.getSession();
  if (error) throw error;
  if (session) return session.user;
  const result = fail(await db.auth.signInAnonymously());
  return result.user;
}

function mapOrder(row) {
  const payment = Array.isArray(row.payments) ? row.payments[0] : row.payments;
  return {
    id: row.order_code, databaseId: row.id,
    customer: row.customer_name, phone: row.phone, location: row.address,
    type: row.fulfillment === 'courier' ? 'Courier' : 'Pick-Up',
    paymentMethod: payment?.method || '', eWalletRef: payment?.reference || '',
    paymentState: payment?.state || '', proofPath: payment?.proof_path || '',
    items: (row.order_items || []).map((item) => ({
      name: item.product_name, category: item.category, qty: item.quantity,
      price: item.unit_price_centavos / 100,
      addons: (item.order_item_addons || []).map((addon) => addon.addon_name),
      addonPrices: (item.order_item_addons || []).map((addon) => addon.unit_price_centavos / 100),
    })),
    subtotal: row.subtotal_centavos / 100, discount: row.discount_centavos / 100,
    total: row.total_centavos / 100, status: row.status,
    date: row.created_at, time: new Date(row.created_at).toLocaleString(),
    cancelReason: row.cancel_reason, courierReference: row.courier_reference || '',
  };
}

const orderSelect = '*, order_items(*, order_item_addons(*)), payments(*)';

export async function listMyOrders() {
  const db = requireSupabase();
  const { data: { session } } = await db.auth.getSession();
  if (!session) return [];
  return fail(await db.from('orders').select(orderSelect).order('created_at', { ascending: false })).map(mapOrder);
}

export async function getMyOrder(reference) {
  const column = /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(reference) ? 'id' : 'order_code';
  const row = fail(await requireSupabase().from('orders').select(orderSelect).eq(column, reference).single());
  return mapOrder(row);
}

export async function submitOrder({ cartItems, customerName, phone, address, fulfillment,
  paymentMethod, paymentReference, note, voucherCode, requestId }) {
  await ensureCheckoutSession();
  const db = requireSupabase();
  const items = cartItems.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
    addon_ids: item.addonIds || [],
  }));
  const result = fail(await db.rpc('place_order', {
    p_items: items,
    p_customer_name: customerName,
    p_phone: phone,
    p_address: address,
    p_fulfillment: fulfillment,
    p_payment_method: paymentMethod,
    p_payment_reference: paymentReference || '',
    p_order_note: note || '',
    p_voucher_code: voucherCode || null,
    p_idempotency_key: requestId,
  }));
  return result[0];
}

export async function uploadPaymentProof(orderId, file) {
  if (!file) return;
  const db = requireSupabase();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) throw error || new Error('Sign in first.');
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${user.id}/${orderId}/${crypto.randomUUID()}.${extension}`;
  fail(await db.storage.from('payment-proofs').upload(path, file, { upsert: false }));
  fail(await db.rpc('attach_payment_proof', { p_order_id: orderId, p_path: path }));
}

export async function submitPaymentReference(orderId, reference) {
  fail(await requireSupabase().rpc('submit_payment_reference', {
    p_order_id: orderId, p_reference: reference,
  }));
}

export async function saveCourierReference(orderId, reference) {
  fail(await requireSupabase().rpc('save_courier_reference', {
    p_order_id: orderId, p_reference: reference,
  }));
}

export async function listMyNotifications() {
  const db = requireSupabase();
  const { data: { session } } = await db.auth.getSession();
  if (!session) return [];
  const rows = fail(await db.from('notifications').select('*').order('created_at', { ascending: false }));
  return rows.map((row) => ({
    id: row.id, title: row.title, message: row.body, orderId: row.order_id,
    time: row.created_at, read: !!row.read_at,
  }));
}

export async function markNotificationsRead() {
  const db = requireSupabase();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) throw error || new Error('Sign in first.');
  fail(await db.from('notifications').update({ read_at: new Date().toISOString() })
    .eq('customer_id', user.id).is('read_at', null));
}

export async function listMyMessages() {
  const db = requireSupabase();
  const { data: { session } } = await db.auth.getSession();
  if (!session) return [];
  const conversations = fail(await db.from('conversations').select('id').eq('customer_id', session.user.id));
  if (!conversations.length) return [];
  const rows = fail(await db.from('messages').select('*').eq('conversation_id', conversations[0].id)
    .order('created_at'));
  return rows.map((row) => ({ id: row.id, sender: row.sender_role === 'staff' ? 'store' : 'user',
    text: row.body, time: row.created_at }));
}

export async function sendMyMessage(identity, body) {
  const db = requireSupabase();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) throw error || new Error('Sign in or place an order first.');
  let conversations = fail(await db.from('conversations').select('id').eq('customer_id', user.id));
  if (!conversations.length) {
    fail(await db.from('conversations').insert({ customer_id: user.id,
      customer_name: identity.name, phone: identity.phone }));
    conversations = fail(await db.from('conversations').select('id').eq('customer_id', user.id));
  }
  fail(await db.from('messages').insert({ conversation_id: conversations[0].id,
    sender_id: user.id, sender_role: 'customer', body: body.trim() }));
  return listMyMessages();
}
