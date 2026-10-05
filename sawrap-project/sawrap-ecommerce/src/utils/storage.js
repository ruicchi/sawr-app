// Simpleng "bridge" sa pagitan ng Storefront at ng Admin Portal.
// Pareho silang gumagamit ng parehong localStorage keys (sawrap_products,
// sawrap_banners, sawrap_addons, atbp.) kaya kailangan lang nila tumakbo sa
// parehong origin (parehong domain + port) para "magkonekta" sila.
import { PRODUCTS, INITIAL_BANNERS, INITIAL_ADDONS } from '../data/products';

function readOrSeed(key, seed) {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return seed;
    }
  }
  // Walang laman pa ang localStorage (unang beses) - i-seed natin
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function sanitizeImage(url) {
  // Alisin ang mga patay na placeholder URL (hal. via.placeholder.com, na hindi na gumagana)
  // na baka nai-save na sa localStorage mula sa mga lumang bersyon ng app.
  if (typeof url === 'string' && url.includes('via.placeholder.com')) return '';
  return url;
}

function sanitizeProductName(name) {
  // I-fix ang lumang pangalan na naka-save na sa localStorage ng mga taga-test bago
  // pa ma-update ang seed data (ang Kanafeh ay dapat add-on na lang, hindi bahagi ng pangalan).
  // Gumagamit ng "includes" sa halip na exact match, para hindi maapektuhan ng encoding
  // ng ₱ symbol o extra spacing ang pagkilala sa lumang pangalan.
  if (typeof name === 'string' && name.startsWith('Pistachiowrap') && name.includes('Kanafeh')) {
    return 'Pistachiowrap';
  }
  return name;
}

function sanitizeProductDescription(name, description) {
  if (name === 'Pistachiowrap' && description && description.includes('crispy Kanafeh crust')) {
    return 'Rich pistachio spread. Add Knafeh crust as an optional add-on!';
  }
  return description;
}

export function getProducts() {
  const rawList = readOrSeed('sawrap_products', PRODUCTS);
  let changed = false;
  const migratedList = rawList.map((p) => {
    const newName = sanitizeProductName(p.name);
    const newImage = sanitizeImage(p.image);
    const newDesc = sanitizeProductDescription(newName, p.description);
    if (newName !== p.name || newImage !== p.image || newDesc !== p.description) changed = true;
    return { ...p, name: newName, description: newDesc, image: newImage };
  });
  // I-save pabalik kung may na-migrate, para permanente na itong maayos (hindi na
  // paulit-ulit na "papatch lang" sa bawat display) at hindi na maapektuhan ng
  // ibang bahagi ng app na baka bumasa/sumulat pa rin ng lumang data.
  if (changed) writeOrSeed_internal('sawrap_products', migratedList);
  // Itago ang mga na-delete (trash) na item
  return migratedList.filter((p) => !p.isDeleted);
}

function writeOrSeed_internal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore quota errors here */ }
}

export function getBanners() {
  const list = readOrSeed('sawrap_banners', INITIAL_BANNERS);
  return list.filter((b) => !b.isDeleted && b.image).map((b) => ({ ...b, image: sanitizeImage(b.image) })).filter((b) => b.image);
}

export function getAddons() {
  const list = readOrSeed('sawrap_addons', INITIAL_ADDONS);
  return list.filter((a) => !a.isDeleted && a.inStock);
}

// I-subscribe sa pagbabago ng localStorage (hal. bumukas ang Admin Portal sa
// ibang tab at nag-edit ng produkto). Gumagana lang ito sa pagitan ng magkaibang
// TABS ng parehong origin - hindi ito gagana kung magkaiba ang port ng dalawang app.
export function subscribeToStorage(callback) {
  const handler = (e) => {
    if (['sawrap_products', 'sawrap_banners', 'sawrap_addons'].includes(e.key)) {
      callback();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export function getStoreInfo() {
  const saved = localStorage.getItem('sawrap_store_info');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { return null; }
  }
  return null;
}

// Kinukuha ang "identity" ng kasalukuyang customer (para sa Messages) -
// naka-login na account, o guest na nakapag-order na (may saved sawrap_user).
export function getCurrentIdentity() {
  const saved = localStorage.getItem('sawrap_user');
  if (saved) {
    try {
      const u = JSON.parse(saved);
      if (u?.name && u?.phone) return { name: u.name, phone: u.phone };
    } catch (e) { /* ignore */ }
  }
  return null;
}

function readMessages() {
  const saved = localStorage.getItem('sawrap_messages');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { return []; }
  }
  return [];
}

function writeMessages(conversations) {
  localStorage.setItem('sawrap_messages', JSON.stringify(conversations));
}

// Kunin ang conversation thread ng isang customer, base sa phone number (unique ID)
export function getConversation(phone) {
  const all = readMessages();
  return all.find((c) => c.phone === phone) || null;
}

export function getAllConversations() {
  return readMessages();
}

export function sendCustomerMessage(identity, text) {
  const all = readMessages();
  let convo = all.find((c) => c.phone === identity.phone);
  const newMsg = { id: Date.now(), sender: 'user', text, time: new Date().toISOString() };

  if (!convo) {
    convo = {
      phone: identity.phone,
      customerName: identity.name,
      messages: [],
      unreadByStore: false,
      unreadByCustomer: false,
    };
    all.push(convo);
  }
  convo.customerName = identity.name; // laging i-update sakaling nagpalit ng pangalan
  convo.messages.push(newMsg);
  convo.unreadByStore = true;
  writeMessages(all);
  return convo;
}

export function sendStoreReply(phone, text) {
  const all = readMessages();
  const convo = all.find((c) => c.phone === phone);
  if (!convo) return null;
  convo.messages.push({ id: Date.now(), sender: 'store', text, time: new Date().toISOString() });
  convo.unreadByCustomer = true;
  writeMessages(all);
  return convo;
}

export function markConversationRead(phone, by) {
  const all = readMessages();
  const convo = all.find((c) => c.phone === phone);
  if (!convo) return;
  if (by === 'store') convo.unreadByStore = false;
  if (by === 'customer') convo.unreadByCustomer = false;
  writeMessages(all);
}

// ===================== NOTIFICATIONS =====================
// sawrap_notifications: [{ id, phone, type, title, message, orderId, time, read }]
function readNotifications() {
  const saved = localStorage.getItem('sawrap_notifications');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { return []; }
  }
  return [];
}

function writeNotifications(list) {
  localStorage.setItem('sawrap_notifications', JSON.stringify(list));
}

export function getNotifications(phone) {
  return readNotifications()
    .filter((n) => n.phone === phone)
    .sort((a, b) => (b.time || '').localeCompare(a.time || ''));
}

export function getUnreadNotificationCount(phone) {
  return getNotifications(phone).filter((n) => !n.read).length;
}

export function markAllNotificationsRead(phone) {
  const all = readNotifications();
  all.forEach((n) => { if (n.phone === phone) n.read = true; });
  writeNotifications(all);
}

// ===================== IMAGE HELPERS =====================
// I-resize/compress ang larawan bago i-convert sa base64, para hindi ma-exceed
// ang localStorage quota (madalas ilang MB ang direktang litrato galing camera).
export function resizeImageFile(file, maxDim = 700, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Ligtas na paraan ng pagsave sa localStorage - hindi na kayang mag-crash ng
// buong app kahit ma-exceed ang storage quota. Nire-return ang true/false.
export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    return false;
  }
}
