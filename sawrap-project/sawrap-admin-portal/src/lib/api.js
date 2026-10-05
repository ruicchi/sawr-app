import { requireSupabase } from './supabase';

const value = ({ data, error }) => {
  if (error) throw error;
  return data;
};

export function publicImage(bucket, path) {
  if (!path) return '';
  if (/^https:\/\//i.test(path)) return path;
  return requireSupabase().storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function getStaffSession() {
  const db = requireSupabase();
  const { data: { session }, error } = await db.auth.getSession();
  if (error) throw error;
  if (!session) return null;
  const staff = value(await db.from('staff_members').select('role, active')
    .eq('user_id', session.user.id).maybeSingle());
  return staff?.active ? { user: session.user, role: staff.role } : null;
}

export async function signInStaff(email, password) {
  const db = requireSupabase();
  value(await db.auth.signInWithPassword({ email, password }));
  const session = await getStaffSession();
  if (!session) {
    await db.auth.signOut();
    throw new Error('This account is not an active SaWrap staff member.');
  }
  return session;
}

export async function signOutStaff() {
  value(await requireSupabase().auth.signOut());
}

export async function uploadImage(bucket, file) {
  if (!file) return null;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    throw new Error('Choose a JPG, PNG, or WebP image under 5 MB.');
  }
  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${crypto.randomUUID()}.${extension}`;
  value(await requireSupabase().storage.from(bucket).upload(path, file, { upsert: false }));
  return path;
}

export async function loadAdminData() {
  const db = requireSupabase();
  const [products, addons, banners, vouchers, store, orders, conversations] = await Promise.all([
    db.from('products').select('*').order('sort_order').order('created_at'),
    db.from('addons').select('*').order('name'),
    db.from('banners').select('*').order('sort_order'),
    db.from('vouchers').select('*').order('created_at', { ascending: false }),
    db.from('store_settings').select('*').eq('id', 1).single(),
    db.from('orders').select('*, order_items(*, order_item_addons(*)), payments(*)')
      .order('created_at', { ascending: false }).limit(200),
    db.from('conversations').select('*, messages(*)').order('created_at', { ascending: false }).limit(200),
  ]);
  return {
    products: value(products).map((row) => ({ ...row, image_url: publicImage('catalog-images', row.image_path) })),
    addons: value(addons),
    banners: value(banners).map((row) => ({ ...row, image_url: publicImage('banners', row.image_path) })),
    vouchers: value(vouchers),
    store: value(store),
    orders: value(orders),
    conversations: value(conversations),
  };
}

export async function saveProduct(form, file) {
  const db = requireSupabase();
  const imagePath = file ? await uploadImage('catalog-images', file) : form.image_path || null;
  const row = {
    name: form.name.trim(), category: form.category.trim(), description: form.description.trim(),
    price_centavos: Math.round(Number(form.price) * 100), stock: Number(form.stock),
    is_available: !!form.is_available, sort_order: Number(form.sort_order) || 0,
    image_path: imagePath,
  };
  if (form.id) value(await db.from('products').update(row).eq('id', form.id));
  else value(await db.from('products').insert(row));
}

export async function setProductDeleted(id, deleted) {
  value(await requireSupabase().from('products').update({
    deleted_at: deleted ? new Date().toISOString() : null,
  }).eq('id', id));
}

export async function saveAddon(form) {
  const row = { name: form.name.trim(), price_centavos: Math.round(Number(form.price) * 100),
    is_available: !!form.is_available };
  const db = requireSupabase();
  if (form.id) value(await db.from('addons').update(row).eq('id', form.id));
  else value(await db.from('addons').insert(row));
}

export async function setAddonDeleted(id, deleted) {
  value(await requireSupabase().from('addons').update({
    deleted_at: deleted ? new Date().toISOString() : null,
  }).eq('id', id));
}

export async function saveBanner(form, file) {
  const db = requireSupabase();
  const imagePath = file ? await uploadImage('banners', file) : form.image_path;
  if (!imagePath) throw new Error('Choose a banner image.');
  const row = { image_path: imagePath, sort_order: Number(form.sort_order) || 0,
    is_active: !!form.is_active };
  if (form.id) value(await db.from('banners').update(row).eq('id', form.id));
  else value(await db.from('banners').insert(row));
}

export async function setBannerDeleted(id, deleted) {
  value(await requireSupabase().from('banners').update({
    deleted_at: deleted ? new Date().toISOString() : null,
  }).eq('id', id));
}

export async function saveVoucher(form) {
  const db = requireSupabase();
  const row = {
    code: form.code.trim().toUpperCase(), discount_type: form.discount_type,
    discount_value: form.discount_type === 'fixed' ? Math.round(Number(form.discount_value) * 100)
      : Number(form.discount_value),
    min_spend_centavos: Math.round(Number(form.min_spend) * 100),
    starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
    ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
    max_redemptions: form.max_redemptions ? Number(form.max_redemptions) : null,
    is_active: !!form.is_active,
  };
  if (form.id) value(await db.from('vouchers').update(row).eq('id', form.id));
  else value(await db.from('vouchers').insert(row));
}

export async function setVoucherDeleted(id, deleted) {
  value(await requireSupabase().from('vouchers').update({
    deleted_at: deleted ? new Date().toISOString() : null,
  }).eq('id', id));
}

export async function saveStore(form, qrFile) {
  const db = requireSupabase();
  const qrPath = qrFile ? await uploadImage('store-assets', qrFile) : form.qr_image_path;
  value(await db.from('store_settings').update({
    name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim(),
    hours: form.hours.trim(), qr_image_path: qrPath || null,
    ewallet_account_name: form.ewallet_account_name.trim(),
    ewallet_account_number: form.ewallet_account_number.trim(),
    updated_at: new Date().toISOString(),
  }).eq('id', 1));
}

export async function transitionOrder(id, status, reason = '') {
  value(await requireSupabase().rpc('transition_order', {
    p_order_id: id, p_new_status: status, p_reason: reason,
  }));
}

export async function verifyPayment(id, state) {
  value(await requireSupabase().rpc('verify_payment', { p_order_id: id, p_state: state }));
}

export async function signedPaymentProof(path) {
  if (!path) return null;
  const data = value(await requireSupabase().storage.from('payment-proofs').createSignedUrl(path, 60));
  return data.signedUrl;
}

export async function replyToCustomer(conversationId, body) {
  const db = requireSupabase();
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) throw error || new Error('Sign in first.');
  value(await db.from('messages').insert({ conversation_id: conversationId,
    sender_id: user.id, sender_role: 'staff', body: body.trim() }));
}
