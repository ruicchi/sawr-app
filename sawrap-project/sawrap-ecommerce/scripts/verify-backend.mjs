import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .split(/\r?\n/)
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => {
    const separator = line.indexOf('=');
    return [line.slice(0, separator), line.slice(separator + 1)];
  }));
const db = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const results = await Promise.all([
  db.from('products').select('id'),
  db.from('addons').select('id'),
  db.from('banners').select('id'),
  db.from('store_settings').select('id, name'),
  db.from('orders').select('id'),
  db.from('staff_members').select('user_id'),
  db.rpc('submit_payment_reference', {
    p_order_id: '00000000-0000-0000-0000-000000000000', p_reference: 'NO_ORDER',
  }),
]);
const [products, addons, banners, store, orders, staff, paymentReference] = results;
for (const [name, result] of [['products', products], ['addons', addons],
  ['banners', banners], ['store_settings', store]]) {
  if (result.error) throw new Error(`${name}: ${result.error.message}`);
}
if (!orders.error || !staff.error || !paymentReference.error) {
  throw new Error('Anonymous clients should not have access to orders, staff, or payment RPCs.');
}
console.log(JSON.stringify({
  catalogReadable: true,
  productCount: products.data.length,
  addonCount: addons.data.length,
  bannerCount: banners.data.length,
  storeSettingsCount: store.data.length,
  ordersProtected: true,
  staffProtected: true,
  paymentRpcProtected: true,
}, null, 2));
