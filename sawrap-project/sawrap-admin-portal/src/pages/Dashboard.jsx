import React, { useState, useEffect } from 'react';
import sawrapLogo from '../assets/sawrap-logo.png';
import { 
  Store, ShoppingBag, Tag, Plus, Trash2, LogOut, MessageSquare, 
  Settings, Edit3, Image as ImageIcon, MapPin, DollarSign, X, Check, RotateCcw, Clock, ShieldAlert, Layers, FileText, BarChart2, Calendar, Award, Trash, AlertCircle, Bell, Eye, EyeOff, KeyRound
} from 'lucide-react';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Classic / Sugar-Coated', category: 'Sakto', price: 30.00, stock: 25, description: 'Crispy fried banana wrap with sweet classic sugar coating.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 2, name: 'Chocowrap', category: 'Sarap', price: 40.00, stock: 20, description: 'Decadent chocolate glaze over crispy banana wrap.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 3, name: 'White Chocolatewrap', category: 'Sarap', price: 40.00, stock: 15, description: 'Creamy white chocolate drizzle.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 4, name: 'Strawbewrap', category: 'Sarap', price: 40.00, stock: 18, description: 'Sweet strawberry syrup and coating.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 5, name: 'Ubewrap', category: 'Sarap', price: 40.00, stock: 30, description: 'Authentic Pinoy ube flavor wrap.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 6, name: 'Condewrap', category: 'Sarap', price: 40.00, stock: 12, description: 'Sweet condensed milk drizzled wrap.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 7, name: 'Biscowrap', category: 'Sagad', price: 50.00, stock: 10, description: 'Crunchy Biscoff spread and cookie crumbs topping.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 8, name: 'Pistachiowrap', category: 'Sagad', price: 50.00, stock: 8, description: 'Rich pistachio spread. Add Knafeh crust as an optional add-on!', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 9, name: 'Matchawrap', category: 'Sagad', price: 50.00, stock: 14, description: 'Premium Japanese Matcha drizzle.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 10, name: 'S’mowrap', category: 'Sagad', price: 50.00, stock: 22, description: 'Marshmallow and graham cracker choco delight.', image: '', inStock: true, isDeleted: false, deletedAt: null },
  { id: 11, name: 'Cream chewrap', category: 'Sagad', price: 50.00, stock: 16, description: 'Loaded with rich cream cheese filling.', image: '', inStock: true, isDeleted: false, deletedAt: null },
];

const INITIAL_BANNERS = [
  { id: 101, image: '', isDeleted: false, deletedAt: null }
];

const INITIAL_ADDONS = [
  { id: 1, name: 'Marshmallow', price: 15.00, inStock: true, isDeleted: false, deletedAt: null },
  { id: 2, name: 'Chocolate chips', price: 10.00, inStock: true, isDeleted: false, deletedAt: null },
  { id: 3, name: 'Knafeh', price: 15.00, inStock: true, isDeleted: false, deletedAt: null },
];

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsDashboardLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const sanitizeDeadImage = (url) => {
    // Alisin ang mga patay na via.placeholder.com URLs na baka nai-save sa localStorage
    // ng mga lumang bersyon ng app (ang service na 'yon ay hindi na gumagana).
    if (typeof url === 'string' && url.includes('via.placeholder.com')) return '';
    return url;
  };

  const sanitizeProductName = (name) => {
    // I-fix ang lumang pangalan na naka-save na bago pa ma-update ang seed data
    // (ang Kanafeh ay add-on na lang, hindi bahagi ng pangalan ng produkto).
    if (typeof name === 'string' && name.startsWith('Pistachiowrap') && name.includes('Kanafeh')) {
      return 'Pistachiowrap';
    }
    return name;
  };

  const sanitizeProductDescription = (name, description) => {
    if (name === 'Pistachiowrap' && description && description.includes('crispy Kanafeh crust')) {
      return 'Rich pistachio spread. Add Knafeh crust as an optional add-on!';
    }
    return description;
  };

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('sawrap_products');
    let list;
    if (saved) {
      try { list = JSON.parse(saved); } catch (e) { list = INITIAL_PRODUCTS; }
    } else {
      list = INITIAL_PRODUCTS;
    }
    return list.map((p) => {
      const newName = sanitizeProductName(p.name);
      return { ...p, name: newName, description: sanitizeProductDescription(newName, p.description), image: sanitizeDeadImage(p.image) };
    });
  });

  useEffect(() => {
    safeSetItem('sawrap_products', JSON.stringify(products));
  }, [products]);

  const [banners, setBanners] = useState(() => {
    const saved = localStorage.getItem('sawrap_banners');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_BANNERS; }
    }
    return INITIAL_BANNERS;
  });

  useEffect(() => {
    safeSetItem('sawrap_banners', JSON.stringify(banners));
  }, [banners]);

  const [addons, setAddons] = useState(() => {
    const saved = localStorage.getItem('sawrap_addons');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_ADDONS; }
    }
    return INITIAL_ADDONS;
  });

  useEffect(() => {
    safeSetItem('sawrap_addons', JSON.stringify(addons));
  }, [addons]);

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('sawrap_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      { 
        id: 'SW-06292026', 
        customer: 'John Andrei Reyes', 
        phone: '09399030522', 
        location: 'Pandacan, Manila',
        type: 'Pick-Up', 
        paymentMethod: 'E-Wallet (GCash)',
        eWalletRef: 'REF987654321',
        items: [
          { name: 'Classic / Sugar-Coated', category: 'Sakto', qty: 2, price: 30.00, addons: ['Marshmallow'] },
          { name: 'Matchawrap', category: 'Sagad', qty: 1, price: 50.00, addons: [] }
        ], 
        total: 125.00, 
        status: 'Preparing', 
        time: 'Just now',
        date: new Date().toISOString(),
        cancelReason: ''
      }
    ];
  });

  useEffect(() => {
    safeSetItem('sawrap_orders', JSON.stringify(orders));
  }, [orders]);

  const [vouchers, setVouchers] = useState(() => {
    const saved = localStorage.getItem('sawrap_vouchers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [
      { 
        id: 1, 
        code: 'SAWRAVE10', 
        discount: 10, 
        minSpend: 100, 
        status: 'Active', 
        startDate: '2026-09-01',
        endDate: '2026-09-20',
        isDeleted: false,
        deletedAt: null
      }
    ];
  });

  // Auto-expire and Auto-delete from Trash after 30 days for all items
  useEffect(() => {
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0];

    const cleanupTrash = (items) => items.filter(item => {
      if (item.isDeleted && item.deletedAt) {
        const deletedDateObj = new Date(item.deletedAt);
        const diffDays = (currentDate - deletedDateObj) / (1000 * 60 * 60 * 24);
        if (diffDays > 30) return false;
      }
      return true;
    });

    setVouchers(prev => cleanupTrash(prev).map(v => {
      if (!v.isDeleted && v.status === 'Active' && v.endDate && v.endDate < currentDateStr) {
        return { ...v, status: 'Expired' };
      }
      return v;
    }));

    setProducts(prev => cleanupTrash(prev));
    setBanners(prev => cleanupTrash(prev));
    setAddons(prev => cleanupTrash(prev));
  }, []);

  useEffect(() => {
    safeSetItem('sawrap_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('sawrap_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });
  const [selectedChatPhone, setSelectedChatPhone] = useState(null);
  const [chatReplyText, setChatReplyText] = useState('');
  const [chatView, setChatView] = useState('active'); // 'active' o 'trash'

  // I-poll ang localStorage tuwing 2s para makita agad ang bagong message ng customer
  useEffect(() => {
    const loadChats = () => {
      const saved = localStorage.getItem('sawrap_messages');
      if (saved) {
        try {
          let all = JSON.parse(saved);
          // Auto-purge: permanenteng tanggalin ang mga conversation na naka-Trash na higit 30 araw
          const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
          const now = Date.now();
          const beforeCount = all.length;
          all = all.filter((c) => {
            if (!c.isDeleted || !c.deletedAt) return true;
            return (now - new Date(c.deletedAt).getTime()) < THIRTY_DAYS_MS;
          });
          if (all.length !== beforeCount) {
            safeSetItem('sawrap_messages', JSON.stringify(all));
          }
          setChats(all);
        } catch (e) { /* ignore */ }
      }
    };
    const handler = (e) => { if (e.key === 'sawrap_messages') loadChats(); };
    window.addEventListener('storage', handler);
    const interval = setInterval(loadChats, 2000);
    loadChats();
    return () => {
      window.removeEventListener('storage', handler);
      clearInterval(interval);
    };
  }, []);

  const handleSendChatReply = (e) => {
    e.preventDefault();
    if (!chatReplyText.trim() || !selectedChatPhone) return;
    const all = JSON.parse(localStorage.getItem('sawrap_messages') || '[]');
    const convo = all.find((c) => c.phone === selectedChatPhone);
    if (!convo) return;
    convo.messages.push({ id: Date.now(), sender: 'store', text: chatReplyText, time: new Date().toISOString() });
    convo.unreadByCustomer = true;
    convo.unreadByStore = false;
    safeSetItem('sawrap_messages', JSON.stringify(all));
    setChats(all);
    setChatReplyText('');
  };

  const handleOpenChat = (phone) => {
    setSelectedChatPhone(phone);
    const all = JSON.parse(localStorage.getItem('sawrap_messages') || '[]');
    const convo = all.find((c) => c.phone === phone);
    if (convo) {
      convo.unreadByStore = false;
      safeSetItem('sawrap_messages', JSON.stringify(all));
      setChats(all);
    }
  };

  const handleDeleteChat = (phone) => {
    const all = JSON.parse(localStorage.getItem('sawrap_messages') || '[]');
    const convo = all.find((c) => c.phone === phone);
    if (!convo) return;
    convo.isDeleted = true;
    convo.deletedAt = new Date().toISOString();
    safeSetItem('sawrap_messages', JSON.stringify(all));
    setChats(all);
    if (selectedChatPhone === phone) setSelectedChatPhone(null);
    triggerToast('Conversation moved to Trash.');
  };

  const handleRestoreChat = (phone) => {
    const all = JSON.parse(localStorage.getItem('sawrap_messages') || '[]');
    const convo = all.find((c) => c.phone === phone);
    if (!convo) return;
    convo.isDeleted = false;
    convo.deletedAt = null;
    safeSetItem('sawrap_messages', JSON.stringify(all));
    setChats(all);
    triggerToast('Conversation restored.');
  };

  const initialStoreState = {
    name: 'SaWrap Main Branch',
    phone: '09399030522',
    address: 'PLM Campus Area, Intramuros, Manila',
    hours: '8:00 AM - 8:00 PM',
  };

  const [storeInfo, setStoreInfo] = useState(() => {
    const saved = localStorage.getItem('sawrap_store_info');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return initialStoreState;
  });

  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [tempStoreInfo, setTempStoreInfo] = useState(storeInfo);
  const [settingsModalMessage, setSettingsModalMessage] = useState(null);

  // Account Security (username/password ng Owner) - dating hardcoded lang sa Login.jsx,
  // ngayon nakalagay na sa localStorage para magamit palitan dito sa Settings.
  const [adminCredentials, setAdminCredentials] = useState(() => {
    const saved = localStorage.getItem('sawrap_admin_credentials');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallthrough */ }
    }
    return { username: 'admin', password: 'sawrap2026' };
  });
  const [tempAdminUsername, setTempAdminUsername] = useState(adminCredentials.username);
  const [tempAdminPassword, setTempAdminPassword] = useState('');
  const [showTempAdminPassword, setShowTempAdminPassword] = useState(false);

  // Password confirmation bago i-apply ang anumang Settings changes
  const [showSettingsPasswordConfirm, setShowSettingsPasswordConfirm] = useState(false);
  const [settingsConfirmPasswordInput, setSettingsConfirmPasswordInput] = useState('');
  const [settingsConfirmError, setSettingsConfirmError] = useState('');
  const [showSettingsConfirmPwVisible, setShowSettingsConfirmPwVisible] = useState(false);

  const handleStartEditSettings = () => {
    setTempStoreInfo(storeInfo);
    setTempAdminQrCode(adminQrCode);
    setTempAdminUsername(adminCredentials.username);
    setTempAdminPassword('');
    setIsEditingSettings(true);
  };

  const handleCancelEditSettings = () => {
    setIsEditingSettings(false);
    setTempStoreInfo(storeInfo);
    setTempAdminQrCode(adminQrCode);
    setTempAdminUsername(adminCredentials.username);
    setTempAdminPassword('');
    setSettingsModalMessage('disregarded');
  };

  const handleSaveStoreSettings = (e) => {
    e.preventDefault();
    // Palaging kailangan ng password confirmation bago ma-apply ang anumang
    // Settings changes (store info, QR, at/o credentials) - hindi lang kapag
    // may binabagong username/password.
    setSettingsConfirmPasswordInput('');
    setSettingsConfirmError('');
    setShowSettingsPasswordConfirm(true);
  };

  const handleConfirmSettingsSave = (e) => {
    e.preventDefault();
    try {
      if (!settingsConfirmPasswordInput) {
        setSettingsConfirmError('Please enter your current password.');
        return;
      }
      if (settingsConfirmPasswordInput !== adminCredentials.password) {
        setSettingsConfirmError('Incorrect password. Please try again.');
        return;
      }

      // I-apply lahat ng staged changes
      setStoreInfo(tempStoreInfo);
      safeSetItem('sawrap_store_info', JSON.stringify(tempStoreInfo));
      setAdminQrCode(tempAdminQrCode);
      safeSetItem('sawrap_admin_qr', tempAdminQrCode);

      const newCredentials = {
        username: (tempAdminUsername || '').trim() || adminCredentials.username,
        password: (tempAdminPassword || '').trim() || adminCredentials.password, // huwag palitan kung hiniwalay lang
      };
      setAdminCredentials(newCredentials);
      safeSetItem('sawrap_admin_credentials', JSON.stringify(newCredentials));

      setIsEditingSettings(false);
      setShowSettingsPasswordConfirm(false);
      setSettingsModalMessage('saved');
    } catch (err) {
      setSettingsConfirmError('Something went wrong while saving. Please try again.');
    }
  };

  const [adminQrCode, setAdminQrCode] = useState(() => {
    return localStorage.getItem('sawrap_admin_qr') || '';
  });
  // Draft lang ito habang naka-Edit mode - hindi pa ito naisasave sa localStorage
  // hanggang pindutin ang "Save Changes" (kasabay ng ibang store settings).
  const [tempAdminQrCode, setTempAdminQrCode] = useState(adminQrCode);

  const handleAdminQrUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const resized = await resizeImageFile(file, 700, 0.85);
        setTempAdminQrCode(resized);
      } catch (err) {
        triggerToast('Failed to process image. Please try another photo.');
      }
    }
  };

  const handleRemoveAdminQr = () => {
    setTempAdminQrCode('');
  };

  const [showTotalOrdersModal, setShowTotalOrdersModal] = useState(false);
  const [orderTimeFrame, setOrderTimeFrame] = useState('all');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

  const [showSalesModal, setShowSalesModal] = useState(false);
  const [salesTimeFrame, setSalesTimeFrame] = useState('7days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Sakto');
  const [itemPrice, setItemPrice] = useState('');
  const [itemStock, setItemStock] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemInStock, setItemInStock] = useState(true);
  const [productFilter, setProductFilter] = useState('Active');

  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerImage, setBannerImage] = useState('');
  const [bannerFilter, setBannerFilter] = useState('Active');

  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [addonInStock, setAddonInStock] = useState(true);
  const [addonFilter, setAddonFilter] = useState('Active');

  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [vCode, setVCode] = useState('');
  const [vDiscount, setVDiscount] = useState('');
  const [vMinSpend, setVMinSpend] = useState('100');
  const [vStatus, setVStatus] = useState('Active');
  const [vStartDate, setVStartDate] = useState('');
  const [vEndDate, setVEndDate] = useState('');
  const [voucherFilter, setVoucherFilter] = useState('All');

  // Generic Deletion & Success confirmation modal states
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState('');

  // Centered Light Toast Notification State (Top-Center, below header)
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Ligtas na paraan ng pagsave sa localStorage - hindi na kayang mag-crash ng
  // buong app (blangkong screen) kahit ma-exceed ang storage quota (hal. dahil
  // sa masyadong maraming/malaking larawan). Nagpapakita na lang ng warning toast.
  const safeSetItem = (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      triggerToast('Storage limit reached! Please use smaller images or remove old ones.');
      return false;
    }
  };

  const handleOpenAddVoucher = () => {
    setEditingVoucher(null);
    setVCode('');
    setVDiscount('');
    setVMinSpend('100');
    setVStatus('Active');
    const todayStr = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setVStartDate(todayStr);
    setVEndDate(nextWeek);
    setShowVoucherModal(true);
  };

  const handleOpenEditVoucher = (v) => {
    setEditingVoucher(v);
    setVCode(v.code);
    setVDiscount(v.discount);
    setVMinSpend(v.minSpend);
    setVStatus(v.status);
    setVStartDate(v.startDate || new Date().toISOString().split('T')[0]);
    setVEndDate(v.endDate || new Date().toISOString().split('T')[0]);
    setShowVoucherModal(true);
  };

  const handleSaveVoucher = (e) => {
    e.preventDefault();
    if (!vCode || !vDiscount) return;

    if (editingVoucher) {
      setVouchers(prev => prev.map(v => v.id === editingVoucher.id ? {
        ...v, code: vCode.toUpperCase().trim(), discount: parseFloat(vDiscount), minSpend: parseFloat(vMinSpend), status: vStatus, startDate: vStartDate, endDate: vEndDate
      } : v));
      setSuccessMessageText('Promotion successfully updated!');
    } else {
      setVouchers(prev => [...prev, {
        id: Date.now(), code: vCode.toUpperCase().trim(), discount: parseFloat(vDiscount), minSpend: parseFloat(vMinSpend), status: vStatus, startDate: vStartDate, endDate: vEndDate, isDeleted: false, deletedAt: null
      }]);
      setSuccessMessageText('Promotion successfully created!');
    }
    setShowVoucherModal(false);
    setShowSuccessModal(true);
  };

  const handlePromptDelete = (type, item) => {
    setItemToDelete({ type, item });
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const { type, item } = itemToDelete;
    const nowIso = new Date().toISOString();

    if (type === 'voucher') {
      setVouchers(prev => prev.map(v => v.id === item.id ? { ...v, isDeleted: true, deletedAt: nowIso } : v));
    } else if (type === 'product') {
      setProducts(prev => prev.map(p => p.id === item.id ? { ...p, isDeleted: true, deletedAt: nowIso } : p));
    } else if (type === 'banner') {
      setBanners(prev => prev.map(b => b.id === item.id ? { ...b, isDeleted: true, deletedAt: nowIso } : b));
    } else if (type === 'addon') {
      setAddons(prev => prev.map(a => a.id === item.id ? { ...a, isDeleted: true, deletedAt: nowIso } : a));
    }

    setShowConfirmDeleteModal(false);
    setItemToDelete(null);
    setSuccessMessageText('Item successfully moved to Trash!');
    setShowSuccessModal(true);
  };

  const handleRestore = (type, item) => {
    if (type === 'voucher') {
      setVouchers(prev => prev.map(v => v.id === item.id ? { ...v, isDeleted: false, deletedAt: null } : v));
    } else if (type === 'product') {
      setProducts(prev => prev.map(p => p.id === item.id ? { ...p, isDeleted: false, deletedAt: null } : p));
    } else if (type === 'banner') {
      setBanners(prev => prev.map(b => b.id === item.id ? { ...b, isDeleted: false, deletedAt: null } : b));
    } else if (type === 'addon') {
      setAddons(prev => prev.map(a => a.id === item.id ? { ...a, isDeleted: false, deletedAt: null } : a));
    }
    setSuccessMessageText('Item successfully restored!');
    setShowSuccessModal(true);
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState(null);
  const [cancelReasonOption, setCancelReasonOption] = useState('Out of Stock / Ingredients Unavailable');
  const [orderFilter, setOrderFilter] = useState('All');

  // I-resize/compress ang larawan bago i-convert sa base64, para hindi mabigla ang
  // localStorage quota (madalas ilang MB ang direktang litrato galing camera, na
  // kayang mag-crash ng buong app kung hindi ito lalabanan / i-resize).
  const resizeImageFile = (file, maxDim = 900, quality = 0.8) =>
    new Promise((resolve, reject) => {
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

  const handleImageUpload = async (e, setImageFn) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const resized = await resizeImageFile(file, 900, 0.8);
        setImageFn(resized);
      } catch (err) {
        triggerToast('Failed to process image. Please try another photo.');
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemCategory('Sakto');
    setItemPrice('');
    setItemStock('20');
    setItemDesc('');
    setItemImage('');
    setItemInStock(true);
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemPrice(item.price);
    setItemStock(item.stock !== undefined ? item.stock : 10);
    setItemDesc(item.description || '');
    setItemImage(item.image || '');
    setItemInStock(item.inStock !== false);
    setShowItemModal(true);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!itemName) return;

    const stockVal = parseInt(itemStock || 0);
    const computedInStock = stockVal > 0 ? (itemInStock !== false) : false;

    if (editingItem) {
      setProducts(prev => prev.map(p => p.id === editingItem.id ? {
        ...p, name: itemName, category: itemCategory, price: parseFloat(itemPrice || 0), stock: stockVal, description: itemDesc, image: itemImage, inStock: computedInStock
      } : p));
      setSuccessMessageText('Flavor item successfully updated!');
    } else {
      setProducts(prev => [...prev, {
        id: Date.now(), name: itemName, category: itemCategory, price: parseFloat(itemPrice || 0), stock: stockVal, description: itemDesc || 'Freshly wrapped item.', image: itemImage, inStock: computedInStock, isDeleted: false, deletedAt: null
      }]);
      setSuccessMessageText('Flavor item successfully added!');
    }
    setShowItemModal(false);
    setShowSuccessModal(true);
  };

  const toggleItemStock = (id) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newInStock = !p.inStock;
        // Kung ibinabalik sa in-stock at ang stock ay 0, gawin nating 1 para may stock
        const newStock = newInStock && p.stock === 0 ? 1 : p.stock;
        return { ...p, inStock: newInStock, stock: newStock };
      }
      return p;
    }));
  };

  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerImage('');
    setShowBannerModal(true);
  };

  const handleOpenEditBanner = (b) => {
    setEditingBanner(b);
    setBannerImage(b.image || '');
    setShowBannerModal(true);
  };

  const handleSaveBanner = (e) => {
    e.preventDefault();
    if (editingBanner) {
      setBanners(prev => prev.map(b => b.id === editingBanner.id ? { ...b, image: bannerImage } : b));
      setSuccessMessageText('Banner image successfully updated!');
    } else {
      setBanners(prev => [...prev, { id: Date.now(), image: bannerImage, isDeleted: false, deletedAt: null }]);
      setSuccessMessageText('Banner image successfully added!');
    }
    setShowBannerModal(false);
    setShowSuccessModal(true);
  };

  const handleOpenAddAddon = () => {
    setEditingAddon(null);
    setAddonName('');
    setAddonPrice('');
    setAddonInStock(true);
    setShowAddonModal(true);
  };

  const handleOpenEditAddon = (a) => {
    setEditingAddon(a);
    setAddonName(a.name);
    setAddonPrice(a.price);
    setAddonInStock(a.inStock !== false);
    setShowAddonModal(true);
  };

  const handleSaveAddon = (e) => {
    e.preventDefault();
    if (!addonName || addonPrice === '') return;

    if (editingAddon) {
      setAddons(prev => prev.map(a => a.id === editingAddon.id ? { ...a, name: addonName, price: parseFloat(addonPrice), inStock: addonInStock } : a));
      setSuccessMessageText('Add-on successfully updated!');
    } else {
      setAddons(prev => [...prev, { id: Date.now(), name: addonName, price: parseFloat(addonPrice), inStock: addonInStock, isDeleted: false, deletedAt: null }]);
      setSuccessMessageText('Add-on successfully added!');
    }
    setShowAddonModal(false);
    setShowSuccessModal(true);
  };

  const toggleAddonStock = (id) => {
    setAddons(prev => prev.map(a => a.id === id ? { ...a, inStock: !a.inStock } : a));
  };

  // Order action handlers with automatic stock deduction & out of stock trigger
  // Nagpapadala ng notification sa customer tuwing may pagbabago ang status ng order
  // (parehong localStorage key ('sawrap_notifications') binabasa ng Storefront)
  const pushOrderNotification = (order, newStatus, extra = {}) => {
    if (!order || !order.phone) return;
    const messages = {
      Preparing: { title: 'Order Accepted!', message: `Store accepted your order ${order.id}! We're preparing it now.` },
      Ready: { title: 'Order Ready for Pick-up!', message: `Your order ${order.id} is hot, fresh, and ready for pick-up!` },
      Completed: { title: 'Order Completed', message: `Thank you for ordering with SaWrap! Your order ${order.id} is complete. Tap to view your receipt.` },
      Cancelled: { title: 'Order Cancelled', message: `Your order ${order.id} was cancelled. Reason: ${extra.cancelReason || 'N/A'}` },
    };
    const info = messages[newStatus];
    if (!info) return;
    const all = JSON.parse(localStorage.getItem('sawrap_notifications') || '[]');
    all.push({
      id: Date.now(),
      phone: order.phone,
      type: newStatus === 'Cancelled' ? 'status' : 'order',
      title: info.title,
      message: info.message,
      orderId: order.id,
      time: new Date().toISOString(),
      read: false,
    });
    safeSetItem('sawrap_notifications', JSON.stringify(all));
  };

  const handleAcceptOrder = (orderId) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder && targetOrder.status === 'Pending') {
      // Automatic deduction of stocks based on ordered items
      setProducts(prevProds => prevProds.map(prod => {
        let deductedQty = 0;
        targetOrder.items.forEach(it => {
          if (it.name === prod.name) {
            deductedQty += it.qty;
          }
        });
        if (deductedQty > 0) {
          const updatedStock = Math.max(0, (prod.stock || 0) - deductedQty);
          return {
            ...prod,
            stock: updatedStock,
            inStock: updatedStock > 0 ? prod.inStock : false
          };
        }
        return prod;
      }));
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Preparing' } : o));
    if (targetOrder) pushOrderNotification(targetOrder, 'Preparing');
    triggerToast(`Order ${orderId} Accepted & set to Preparing! Stocks updated.`);
  };

  const handleOpenCancelModal = (order) => {
    setSelectedOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleConfirmCancelOrder = (e) => {
    e.preventDefault();
    if (!selectedOrderToCancel) return;
    setOrders(prev => prev.map(o => o.id === selectedOrderToCancel.id ? { ...o, status: 'Cancelled', cancelReason: cancelReasonOption } : o));
    pushOrderNotification(selectedOrderToCancel, 'Cancelled', { cancelReason: cancelReasonOption });
    setShowCancelModal(false);
    triggerToast(`Order ${selectedOrderToCancel.id} Declined (${cancelReasonOption}).`);
  };

  const handleOrderStatus = (orderId, newStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (targetOrder) pushOrderNotification(targetOrder, newStatus);
    triggerToast(`Order ${orderId} status updated to ${newStatus}!`);
  };

  const filterByTimeFrame = (items, tf) => {
    const now = new Date();
    return items.filter(item => {
      if (!item.date) return true;
      const itemDate = new Date(item.date);

      if (tf === 'custom') {
        if (!customStartDate && !customEndDate) return true;
        const start = customStartDate ? new Date(customStartDate) : new Date(0);
        const end = customEndDate ? new Date(customEndDate) : new Date();
        end.setHours(23, 59, 59, 999);
        return itemDate >= start && itemDate <= end;
      }

      const diffTime = now - itemDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (tf === 'today') return diffDays < 1;
      if (tf === '7days') return diffDays <= 7;
      if (tf === '6months') return diffDays <= 180;
      if (tf === '1year') return diffDays <= 365;
      return true;
    });
  };

  const filteredTotalOrders = filterByTimeFrame(orders, orderTimeFrame);
  const filteredSalesOrders = filterByTimeFrame(orders.filter(o => o.status !== 'Cancelled'), salesTimeFrame);
  const totalSalesCalculated = filteredSalesOrders.reduce((sum, o) => sum + o.total, 0);

  const categorySales = { Sakto: 0, Sarap: 0, Sagad: 0 };
  const flavorCounts = {};

  filteredSalesOrders.forEach(o => {
    o.items.forEach(it => {
      const foundProd = products.find(p => p.name === it.name);
      const cat = it.category || (foundProd ? foundProd.category : 'Sarap');
      const itemPriceVal = it.price || (foundProd ? foundProd.price : 40);
      if (categorySales[cat] !== undefined) {
        categorySales[cat] += itemPriceVal * it.qty;
      } else {
        categorySales['Sarap'] += itemPriceVal * it.qty;
      }
      flavorCounts[it.name] = (flavorCounts[it.name] || 0) + it.qty;
    });
  });

  const sortedFlavorsRanking = products.map(prod => ({
    ...prod,
    soldCount: flavorCounts[prod.name] || 0
  })).sort((a, b) => b.soldCount - a.soldCount);

  const handleGeneratePDF = () => {
    window.print();
  };

  const filteredOrders = orderFilter === 'All' ? orders : orders.filter(o => o.status.toLowerCase() === orderFilter.toLowerCase());
  
  const filteredVouchers = vouchers.filter(v => {
    if (voucherFilter === 'Trash') return v.isDeleted === true;
    if (v.isDeleted) return false;
    if (voucherFilter === 'All') return true;
    if (voucherFilter === 'Active') return v.status === 'Active';
    if (voucherFilter === 'Inactive') return v.status === 'Inactive';
    if (voucherFilter === 'Expired / Completed Promos') return v.status === 'Expired';
    return true;
  });

  const filteredProducts = products.filter(p => productFilter === 'Trash' ? p.isDeleted : !p.isDeleted);
  const filteredBanners = banners.filter(b => bannerFilter === 'Trash' ? b.isDeleted : !b.isDeleted);
  const filteredAddons = addons.filter(a => addonFilter === 'Trash' ? a.isDeleted : !a.isDeleted);

  const activeVouchersCount = vouchers.filter(v => !v.isDeleted && v.status === 'Active').length;
  const activeProductsCount = products.filter(p => !p.isDeleted).length;
  const activeBannersCount = banners.filter(b => !b.isDeleted).length;
  const activeAddonsCount = addons.filter(a => !a.isDeleted).length;
  const totalSales = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans antialiased text-gray-800 pb-20 relative">
      
      {/* CENTERED LIGHT TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2.5 bg-amber-50 text-amber-900 px-5 py-3 rounded-2xl shadow-lg border border-amber-200 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="h-6 w-6 rounded-full bg-amber-400 text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-xs">
            <Bell className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs font-bold tracking-tight">{toastMessage}</p>
        </div>
      )}

      {/* Zero-Blank-Page Strict Single-Page Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html {
            background: white !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden;
          }
          #printable-sales-report, #printable-sales-report * {
            visibility: visible;
          }
          #printable-sales-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 15px;
            margin: 0;
            background: white !important;
            color: #111827 !important;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            page-break-after: avoid;
            page-break-before: avoid;
            page-break-inside: avoid;
          }
          @page {
            size: auto;
            margin: 8mm;
          }
        }
      `}} />

      {/* Perfectly Fitted Executive Report matching exact active timeframe */}
      <div id="printable-sales-report" className="hidden print:block text-gray-900 bg-white">
        <div className="space-y-4 max-w-3xl mx-auto">
          
          {/* Executive Header */}
          <div className="border-b-2 border-amber-600 pb-3 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-amber-600 tracking-tight">SaWrap</span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Executive Business Report</span>
              </div>
              <h1 className="text-xs font-bold text-gray-600 uppercase tracking-wider mt-0.5">Sales & Best-Selling Analytics Summary</h1>
              <p className="text-[10px] text-gray-500">
                Report Date: {new Date().toLocaleDateString()} • Selected Period: <span className="uppercase font-extrabold text-amber-700">{salesTimeFrame}</span>
              </p>
            </div>
            <div className="text-right text-[11px] text-gray-700">
              <p className="font-extrabold">{storeInfo.name}</p>
              <p className="text-gray-500 text-[10px]">{storeInfo.address}</p>
            </div>
          </div>

          {/* Financial Summary Table */}
          <table className="w-full border-collapse border border-gray-300 text-xs text-left shadow-xs">
            <thead>
              <tr className="bg-amber-600 text-white font-bold">
                <th className="border border-amber-700 p-2 uppercase tracking-wider">Total Gross Revenue ({salesTimeFrame.toUpperCase()})</th>
                <th className="border border-amber-700 p-2 uppercase tracking-wider">Total Completed Transactions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-amber-50/40">
                <td className="border border-gray-300 p-2.5 font-black text-amber-700 text-sm">₱ {totalSalesCalculated.toFixed(2)}</td>
                <td className="border border-gray-300 p-2.5 font-black text-gray-800 text-sm">{filteredSalesOrders.length} Orders Recorded</td>
              </tr>
            </tbody>
          </table>

          {/* Category Breakdown Table */}
          <div className="space-y-1.5">
            <h3 className="font-black text-[11px] uppercase text-gray-700 tracking-wider">Revenue Breakdown by Product Tier</h3>
            <table className="w-full border-collapse border border-gray-300 text-xs text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-800 font-bold">
                  <th className="border border-gray-300 p-2">Category Tier</th>
                  <th className="border border-gray-300 p-2">Standard Price</th>
                  <th className="border border-gray-300 p-2">Total Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2 font-bold">Sakto</td>
                  <td className="border border-gray-300 p-2">₱30.00</td>
                  <td className="border border-gray-300 p-2 font-bold text-amber-700">₱ {categorySales.Sakto.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-bold">Sarap</td>
                  <td className="border border-gray-300 p-2">₱40.00</td>
                  <td className="border border-gray-300 p-2 font-bold text-amber-700">₱ {categorySales.Sarap.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2 font-bold">Sagad</td>
                  <td className="border border-gray-300 p-2">₱50.00</td>
                  <td className="border border-gray-300 p-2 font-bold text-amber-700">₱ {categorySales.Sagad.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Top 5 Best-Selling Flavors Executive Table */}
          <div className="space-y-1.5">
            <h3 className="font-black text-[11px] uppercase text-gray-700 tracking-wider">Top 5 Best-Selling Flavors Ranking</h3>
            <table className="w-full border-collapse border border-gray-300 text-xs text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-800 font-bold">
                  <th className="border border-gray-300 p-2 text-center w-14">Rank</th>
                  <th className="border border-gray-300 p-2">Flavor Name</th>
                  <th className="border border-gray-300 p-2">Category</th>
                  <th className="border border-gray-300 p-2">Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {sortedFlavorsRanking.slice(0, 5).map((prod, idx) => (
                  <tr key={prod.id} className={idx === 0 ? 'bg-amber-50/60 font-bold' : ''}>
                    <td className="border border-gray-300 p-2 text-center text-amber-800">#{idx + 1}</td>
                    <td className="border border-gray-300 p-2 font-bold">{prod.name}</td>
                    <td className="border border-gray-300 p-2">{prod.category}</td>
                    <td className="border border-gray-300 p-2 font-black text-amber-700">{prod.soldCount} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Executive Footer */}
          <div className="pt-4 text-center text-[9px] text-gray-400 border-t border-gray-200 flex justify-between items-center">
            <p>SaWrap Point of Sales & Inventory Management System</p>
            <p>Confidential Business Report</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 md:px-8">
          <div className="flex items-center gap-1.5">
            <img src={sawrapLogo} alt="SaWrap" className="h-6 sm:h-7 w-auto object-contain" />
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black text-amber-700 uppercase tracking-wider border border-amber-200">
              Owner
            </span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-3.5 py-1 text-xs font-bold text-red-500 hover:bg-red-100 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 md:px-8 space-y-5">
        
        {/* Analytics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div 
            onClick={() => setShowTotalOrdersModal(true)}
            className="rounded-2xl bg-white p-3.5 sm:p-5 border border-gray-100 shadow-2xs flex items-center gap-3 min-w-0 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
          >
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 font-bold group-hover:bg-amber-400 group-hover:text-white transition-all">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-extrabold uppercase text-gray-400 tracking-wider">Total Orders</p>
              <h3 className="text-lg sm:text-xl font-black text-gray-800 truncate mt-0.5">{orders.length}</h3>
              <span className="text-[10px] font-bold text-amber-600 group-hover:underline">View History →</span>
            </div>
          </div>

          <div 
            onClick={() => setShowSalesModal(true)}
            className="rounded-2xl bg-white p-3.5 sm:p-5 border border-gray-100 shadow-2xs flex items-center gap-3 min-w-0 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
          >
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 font-bold group-hover:bg-amber-400 group-hover:text-white transition-all">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-extrabold uppercase text-gray-400 tracking-wider">Gross Sales</p>
              <h3 className="text-lg sm:text-xl font-black text-gray-800 truncate mt-0.5">₱ {totalSales.toFixed(2)}</h3>
              <span className="text-[10px] font-bold text-amber-600 group-hover:underline">View Analytics →</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-3.5 sm:p-5 border border-gray-100 shadow-2xs flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 font-bold">
              <Store className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-extrabold uppercase text-gray-400 tracking-wider">Menu Flavors</p>
              <h3 className="text-lg sm:text-xl font-black text-gray-800 truncate mt-0.5">{activeProductsCount}</h3>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-3.5 sm:p-5 border border-gray-100 shadow-2xs flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 font-bold">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-extrabold uppercase text-gray-400 tracking-wider">Client Chats</p>
              <h3 className="text-lg sm:text-xl font-black text-gray-800 truncate mt-0.5">{chats.filter(c => !c.isDeleted).length}</h3>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
          {[
            { id: 'orders', label: 'Incoming Orders', icon: ShoppingBag, count: orders.length },
            { id: 'menu', label: 'Store Menu & Add-ons', icon: Store, count: activeProductsCount + activeAddonsCount },
            { id: 'banners', label: 'Promo Banners', icon: ImageIcon, count: activeBannersCount },
            { id: 'vouchers', label: 'Promos & Vouchers', icon: Tag, count: activeVouchersCount },
            { id: 'chat', label: 'Messages', icon: MessageSquare, count: chats.filter(c => !c.isDeleted).length },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-400 text-white shadow-2xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[9px] ${
                    isActive ? 'bg-white text-amber-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {isDashboardLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs h-24" />
              ))}
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs h-32" />
            ))}
          </div>
        ) : (
        <>
        {/* TAB 1: INCOMING ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h2 className="text-sm sm:text-base font-black text-gray-800">Incoming Orders & Verification</h2>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      orderFilter === status
                        ? 'bg-amber-400 text-white shadow-2xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredOrders.map((o) => (
                <div key={o.id} className="rounded-2xl bg-white p-3.5 sm:p-4 border border-gray-100 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div>
                        <span className="font-black text-gray-800 text-xs">{o.id}</span>
                        <p className="text-[10px] text-gray-400">{o.time || o.date}</p>
                      </div>
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700">
                        {o.status}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-gray-800">{o.customer} ({o.phone})</p>
                      <p className="text-gray-500 text-[11px] flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        <span className="truncate">{o.location} ({o.type || 'Pick-Up'})</span>
                      </p>

                      <div className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-200 space-y-1 mt-1">
                        <p className="font-extrabold text-amber-900 text-[11px]">Payment: {o.paymentMethod || 'Cash'}</p>
                        {o.paymentMethod && o.paymentMethod.includes('E-Wallet') && o.eWalletRef && (
                          <p className="text-[11px] text-gray-700 font-semibold">
                            🔑 <strong>Ref No:</strong> <span className="text-amber-700">{o.eWalletRef}</span>
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-100 space-y-1 mt-2">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-gray-700 font-medium text-xs">
                            <span>{it.qty}x {it.name} {it.addons?.length > 0 ? `(+ ${it.addons.join(', ')})` : ''}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-gray-400 font-semibold">Total:</span>
                        <span className="font-black text-amber-500 text-base">₱ {o.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    {o.status === 'Pending' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleOpenCancelModal(o)} className="rounded-xl bg-red-50 text-red-500 border border-red-200 py-1.5 text-xs font-bold cursor-pointer">Decline</button>
                        <button onClick={() => handleAcceptOrder(o.id)} className="rounded-xl bg-amber-400 text-white py-1.5 text-xs font-bold cursor-pointer hover:bg-amber-500">Accept</button>
                      </div>
                    ) : o.status === 'Cancelled' ? (
                      <div className="rounded-xl bg-red-50 border border-red-200 py-2 text-center">
                        <p className="text-xs font-bold text-red-500">Order Cancelled</p>
                        {o.cancelReason && (
                          <p className="text-[10px] text-red-400 mt-0.5">Reason: {o.cancelReason}</p>
                        )}
                      </div>
                    ) : o.status === 'Completed' ? (
                      <div className="rounded-xl bg-green-50 border border-green-200 py-2 text-center space-y-1.5">
                        <p className="text-xs font-bold text-green-600">Order Completed</p>
                        <button
                          onClick={() => setViewingReceiptOrder(o)}
                          className="inline-flex items-center gap-1 rounded-lg bg-white border border-green-300 text-green-700 px-2.5 py-1 text-[10px] font-bold cursor-pointer hover:bg-green-100"
                        >
                          <FileText className="h-3 w-3" /> View Receipt
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1">
                        <button onClick={() => handleOrderStatus(o.id, 'Preparing')} className="rounded-xl bg-amber-50 text-amber-600 py-1 text-[10px] font-bold cursor-pointer">Prepare</button>
                        <button onClick={() => handleOrderStatus(o.id, 'Ready')} className="rounded-xl bg-purple-50 text-purple-600 py-1 text-[10px] font-bold cursor-pointer">Ready</button>
                        <button onClick={() => handleOrderStatus(o.id, 'Completed')} className="rounded-xl bg-green-50 text-green-600 py-1 text-[10px] font-bold cursor-pointer">Complete</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: STORE MENU & ADD-ONS */}
        {activeTab === 'menu' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-gray-800">Store Menu Flavors</h2>
                  <p className="text-xs text-gray-400">Manage items across Sakto, Sarap, and Sagad categories with automatic stock counting.</p>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-amber-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Flavor Item</span>
                </button>
              </div>

              {/* Product Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['Active', 'Trash'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setProductFilter(status)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      productFilter === status
                        ? 'bg-amber-400 text-white shadow-2xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {status === 'Trash' && <Trash className="h-3.5 w-3.5" />}
                    <span>{status}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 col-span-full">No flavor items found under {productFilter}.</p>
                ) : (
                  filteredProducts.map((item) => {
                    const stockVal = item.stock !== undefined ? item.stock : 10;
                    const inStock = item.inStock !== false && stockVal > 0;
                    const isInTrash = item.isDeleted;
                    return (
                      <div key={item.id} className={`rounded-2xl bg-white p-3 border shadow-2xs flex flex-col justify-between space-y-2 relative ${isInTrash ? 'border-red-200 bg-red-50/20' : !inStock ? 'border-red-200 bg-red-50/25' : 'border-gray-100'}`}>
                        {!isInTrash && !inStock && (
                          <span className="absolute top-2 right-2 rounded-full bg-red-500 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                            Out of Stock
                          </span>
                        )}
                        {isInTrash && (
                          <span className="absolute top-2 right-2 rounded-full bg-red-100 text-red-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                            In Trash
                          </span>
                        )}
                        <div>
                          <div className="mb-2 h-24 sm:h-28 w-full rounded-xl bg-amber-50 flex items-center justify-center text-xs font-semibold text-amber-700 text-center px-1 overflow-hidden border border-amber-100">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[11px] text-amber-600 font-bold">{item.name} Image</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                              {item.category}
                            </span>
                            <span className={`text-[10px] font-black ${stockVal === 0 ? 'text-red-500' : 'text-gray-600'}`}>
                              Stock: {stockVal}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-800 text-xs sm:text-sm mt-1 truncate">{item.name}</h3>
                          <p className="text-xs font-bold text-amber-500 mt-0.5">₱ {item.price.toFixed(2)}</p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-gray-100">
                          {isInTrash ? (
                            <button
                              onClick={() => handleRestore('product', item)}
                              className="w-full rounded-xl bg-amber-50 border border-amber-200 py-1 text-[10px] font-extrabold text-amber-700 hover:bg-amber-100 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => toggleItemStock(item.id)}
                                className={`w-full rounded-xl py-1 text-[10px] font-bold transition-all cursor-pointer ${
                                  inStock ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
                              >
                                {inStock ? 'Mark Out of Stock' : 'Set In Stock'}
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditModal(item)}
                                  className="flex-1 rounded-xl bg-gray-50 border border-gray-200 py-1 text-[10px] font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handlePromptDelete('product', item)}
                                  className="p-1 text-red-400 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <hr className="border-gray-200 my-6" />

            {/* STORE ADD-ONS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-gray-800">Store Add-ons</h2>
                  <p className="text-xs text-gray-400">Manage extra toppings, change prices, and set out of stock states.</p>
                </div>
                <button
                  onClick={handleOpenAddAddon}
                  className="rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-amber-500 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Add-on</span>
                </button>
              </div>

              {/* Addon Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['Active', 'Trash'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setAddonFilter(status)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      addonFilter === status
                        ? 'bg-amber-400 text-white shadow-2xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {status === 'Trash' && <Trash className="h-3.5 w-3.5" />}
                    <span>{status}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredAddons.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">No add-ons found under {addonFilter}.</p>
                ) : (
                  filteredAddons.map((a) => {
                    const inStock = a.inStock !== false;
                    const isInTrash = a.isDeleted;
                    return (
                      <div key={a.id} className={`rounded-2xl bg-white p-4 border shadow-2xs flex flex-col justify-between space-y-3 ${isInTrash ? 'border-red-200 bg-red-50/20' : !inStock ? 'border-red-200 bg-red-50/25' : 'border-gray-100'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-black text-gray-800">{a.name}</h4>
                            <p className="text-xs font-bold text-amber-600 mt-0.5">+₱ {a.price.toFixed(2)}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${isInTrash ? 'bg-red-100 text-red-600' : inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {isInTrash ? 'In Trash' : inStock ? 'Available' : 'Out of Stock'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          {isInTrash ? (
                            <button
                              onClick={() => handleRestore('addon', a)}
                              className="w-full rounded-xl bg-amber-50 border border-amber-200 py-1.5 text-xs font-extrabold text-amber-700 hover:bg-amber-100 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Restore Add-on</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => toggleAddonStock(a.id)}
                                className={`flex-1 rounded-xl py-1.5 text-xs font-bold cursor-pointer ${
                                  inStock ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
                              >
                                {inStock ? 'Mark Out of Stock' : 'Set In Stock'}
                              </button>
                              <button onClick={() => handleOpenEditAddon(a)} className="rounded-xl bg-gray-50 border px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer">Edit</button>
                              <button onClick={() => handlePromptDelete('addon', a)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-xl cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PROMO BANNERS */}
        {activeTab === 'banners' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-black text-gray-800">SaWrap Promo Banners</h2>
                <p className="text-xs text-gray-400">Manage pure image banners displayed at the customer app header.</p>
              </div>
              <button
                onClick={handleOpenAddBanner}
                className="rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-amber-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Banner Image</span>
              </button>
            </div>

            {/* Banner Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['Active', 'Trash'].map((status) => (
                <button
                  key={status}
                  onClick={() => setBannerFilter(status)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    bannerFilter === status
                      ? 'bg-amber-400 text-white shadow-2xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {status === 'Trash' && <Trash className="h-3.5 w-3.5" />}
                  <span>{status}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBanners.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4">No promo banners found under {bannerFilter}.</p>
              ) : (
                filteredBanners.map((b) => {
                  const isInTrash = b.isDeleted;
                  return (
                    <div key={b.id} className={`rounded-2xl p-4 border shadow-2xs space-y-3 ${isInTrash ? 'bg-red-50/20 border-red-200' : 'bg-white border-gray-100'}`}>
                      <div className="h-40 w-full rounded-xl bg-amber-400 flex items-center justify-center text-white font-black overflow-hidden shadow-inner relative">
                        {isInTrash && (
                          <span className="absolute top-2 right-2 rounded-full bg-red-100 text-red-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider z-10">
                            In Trash
                          </span>
                        )}
                        {b.image ? (
                          <img src={b.image} alt="Promo Banner" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1.5 rounded-xl">No Image Uploaded</span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-1 border-t border-gray-100">
                        {isInTrash ? (
                          <button onClick={() => handleRestore('banner', b)} className="w-full rounded-xl bg-amber-50 border border-amber-200 py-2 text-xs font-extrabold text-amber-700 hover:bg-amber-100 cursor-pointer flex items-center justify-center gap-1">
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Restore Banner</span>
                          </button>
                        ) : (
                          <>
                            <button onClick={() => handleOpenEditBanner(b)} className="flex-1 rounded-xl bg-gray-50 border py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer">Change Image</button>
                            <button onClick={() => handlePromptDelete('banner', b)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PROMOS & VOUCHERS */}
        {activeTab === 'vouchers' && (
          <div className="space-y-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-black text-gray-800">Promotions & Vouchers Management</h2>
                <p className="text-[11px] sm:text-xs text-gray-400">Add time frames, edit states, and manage deleted promos in Trash.</p>
              </div>
              <button
                onClick={handleOpenAddVoucher}
                className="rounded-full bg-amber-400 px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-amber-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Create Promotion</span>
              </button>
            </div>

            {/* Voucher Category Filter Buttons including Trash */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['All', 'Active', 'Inactive', 'Expired / Completed Promos', 'Trash'].map((status) => (
                <button
                  key={status}
                  onClick={() => setVoucherFilter(status)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    voucherFilter === status
                      ? 'bg-amber-400 text-white shadow-2xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {status === 'Trash' && <Trash className="h-3.5 w-3.5" />}
                  <span>{status}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
              {filteredVouchers.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4">No promotions found under this category.</p>
              ) : (
                filteredVouchers.map((v) => {
                  const isActive = v.status === 'Active';
                  const isExpired = v.status === 'Expired';
                  const isInTrash = v.isDeleted;
                  return (
                    <div key={v.id} className={`rounded-2xl p-4 border shadow-2xs space-y-3 flex flex-col justify-between ${isInTrash ? 'bg-red-50/30 border-red-200' : isExpired ? 'bg-gray-50 border-gray-200' : isActive ? 'bg-white border-green-200' : 'bg-white border-amber-200'}`}>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-black ${isExpired || isInTrash ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{v.code}</h4>
                          <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold ${isInTrash ? 'bg-red-100 text-red-600' : isActive ? 'bg-green-100 text-green-700' : isExpired ? 'bg-gray-200 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                            {isInTrash ? 'In Trash' : isActive ? 'Active ●' : isExpired ? 'Expired' : 'Inactive'}
                          </span>
                        </div>
                        <p className={`text-xs font-bold ${isExpired || isInTrash ? 'text-gray-400' : 'text-amber-600'}`}>₱ {v.discount.toFixed(2)} OFF</p>
                        <p className="text-[10px] text-gray-400">Min. spend: ₱ {v.minSpend}</p>
                        <p className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{isInTrash ? `Deleted: ${new Date(v.deletedAt).toLocaleDateString()}` : isExpired ? `Ended on: ${v.endDate}` : `Valid: ${v.startDate} to ${v.endDate}`}</span>
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        {isInTrash ? (
                          <button onClick={() => handleRestore('voucher', v)} className="w-full rounded-xl bg-amber-50 border border-amber-200 py-1.5 text-xs font-extrabold text-amber-700 hover:bg-amber-100 cursor-pointer flex items-center justify-center gap-1">
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Restore Promotion</span>
                          </button>
                        ) : (
                          <>
                            <button onClick={() => handleOpenEditVoucher(v)} className="flex-1 rounded-xl bg-gray-50 border py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer">
                              {isExpired ? 'Re-activate' : 'Edit Promo'}
                            </button>
                            <button onClick={() => handlePromptDelete('voucher', v)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-xl cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 5: MESSAGES */}
        {activeTab === 'chat' && (() => {
          const activeChats = chats.filter((c) => !c.isDeleted);
          const trashedChats = chats.filter((c) => c.isDeleted);
          const visibleChats = chatView === 'active' ? activeChats : trashedChats;

          return (
            <div className="space-y-3">
              {/* Active / Trash toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setChatView('active'); setSelectedChatPhone(null); }}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer transition-all ${chatView === 'active' ? 'bg-amber-400 text-white shadow-xs' : 'bg-white text-gray-500 border border-gray-200'}`}
                >
                  Active ({activeChats.length})
                </button>
                <button
                  onClick={() => { setChatView('trash'); setSelectedChatPhone(null); }}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${chatView === 'trash' ? 'bg-red-500 text-white shadow-xs' : 'bg-white text-gray-500 border border-gray-200'}`}
                >
                  <Trash2 className="h-3 w-3" /> Trash ({trashedChats.length})
                </button>
              </div>

              {visibleChats.length === 0 ? (
                <div className="w-full rounded-2xl bg-white p-12 border border-gray-100 shadow-2xs text-center space-y-3">
                  <MessageSquare className="h-7 w-7 text-amber-500 mx-auto" />
                  <h3 className="text-sm sm:text-base font-bold text-gray-800">
                    {chatView === 'active' ? 'No active customer chats' : 'Trash is empty'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {chatView === 'active' ? 'Lalabas dito ang mga conversation kapag nag-message na ang mga customer.' : 'Walang deleted na conversation.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-2xl bg-white border border-gray-100 shadow-2xs overflow-hidden h-[600px]">
                  {/* Conversation list */}
                  <div className="border-r border-gray-100 bg-gray-50/50 overflow-y-auto">
                    {[...visibleChats].sort((a, b) => {
                      const at = a.messages?.[a.messages.length - 1]?.time || '';
                      const bt = b.messages?.[b.messages.length - 1]?.time || '';
                      return bt.localeCompare(at);
                    }).map((c) => {
                      const lastMsg = c.messages?.[c.messages.length - 1];
                      const isActive = c.phone === selectedChatPhone;
                      return (
                        <div
                          key={c.phone}
                          onClick={() => chatView === 'active' ? handleOpenChat(c.phone) : setSelectedChatPhone(c.phone)}
                          className={`flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer hover:bg-white ${isActive ? 'bg-white border-l-4 border-l-amber-400' : ''}`}
                        >
                          <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-white text-xs font-bold">
                            {c.customerName?.charAt(0)?.toUpperCase() || '?'}
                            {c.unreadByStore && chatView === 'active' && (
                              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-800 truncate">{c.customerName} <span className="font-normal text-gray-400">({c.phone})</span></p>
                            <p className="text-[11px] text-gray-500 truncate">{lastMsg?.text || 'No messages yet'}</p>
                          </div>
                          {chatView === 'active' ? (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteChat(c.phone); }}
                              title="Move to Trash"
                              className="flex-shrink-0 rounded-full p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleRestoreChat(c.phone); }}
                              title="Restore"
                              className="flex-shrink-0 rounded-full p-1.5 text-gray-300 hover:text-green-600 hover:bg-green-50 cursor-pointer"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {chatView === 'trash' && trashedChats.length > 0 && (
                      <p className="text-[10px] text-gray-400 text-center px-4 py-3 leading-relaxed">
                        Items in Trash will be automatically deleted after 30 days if not restored.
                      </p>
                    )}
                  </div>

                  {/* Chat thread */}
                  <div className="md:col-span-2 flex flex-col h-full">
                    {!selectedChatPhone ? (
                      <div className="flex-1 flex items-center justify-center text-xs text-gray-400 font-semibold">
                        Pumili ng conversation sa kaliwa
                      </div>
                    ) : (() => {
                      const activeConvo = chats.find((c) => c.phone === selectedChatPhone);
                      if (!activeConvo) return null;
                      return (
                        <>
                          <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-gray-800">{activeConvo.customerName}</p>
                              <p className="text-[11px] text-gray-400">{activeConvo.phone}</p>
                            </div>
                            {chatView === 'trash' && (
                              <button
                                onClick={() => handleRestoreChat(activeConvo.phone)}
                                className="flex items-center gap-1.5 rounded-xl bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 text-xs font-bold cursor-pointer hover:bg-green-100"
                              >
                                <RotateCcw className="h-3.5 w-3.5" /> Restore
                              </button>
                            )}
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                            {activeConvo.messages.map((msg) => {
                              const isStore = msg.sender === 'store';
                              return (
                                <div key={msg.id} className={`flex ${isStore ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${isStore ? 'bg-amber-400 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                                    {msg.text}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {chatView === 'active' && (
                            <form onSubmit={handleSendChatReply} className="p-3 border-t border-gray-100 flex items-center gap-2">
                              <input
                                type="text"
                                value={chatReplyText}
                                onChange={(e) => setChatReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                className="flex-1 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-xs outline-none focus:border-amber-400"
                              />
                              <button type="submit" disabled={!chatReplyText.trim()} className="rounded-xl bg-amber-400 text-white px-4 py-2 text-xs font-bold disabled:opacity-40 cursor-pointer hover:bg-amber-500">
                                Send
                              </button>
                            </form>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 6: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="mx-auto max-w-2xl w-full rounded-3xl bg-white p-6 sm:p-8 border border-gray-100 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-800">Store Settings & Customer Visibility</h2>
                <p className="text-xs text-gray-400">Manage store branch details visible to customers.</p>
              </div>
              {!isEditingSettings && (
                <button 
                  type="button"
                  onClick={handleStartEditSettings}
                  className="rounded-xl bg-amber-400 hover:bg-amber-500 text-white px-4 py-2 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Settings</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveStoreSettings} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Branch Name</label>
                <input 
                  type="text" 
                  value={tempStoreInfo.name} 
                  disabled={!isEditingSettings}
                  onChange={(e) => setTempStoreInfo({ ...tempStoreInfo, name: e.target.value })} 
                  className={`w-full rounded-2xl px-4 py-3 text-sm font-bold border outline-none transition-all ${
                    isEditingSettings ? 'bg-gray-50 border-amber-300' : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                  }`} 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={tempStoreInfo.phone} 
                    disabled={!isEditingSettings}
                    onChange={(e) => setTempStoreInfo({ ...tempStoreInfo, phone: e.target.value })} 
                    className={`w-full rounded-2xl px-4 py-3 text-sm font-bold border outline-none transition-all ${
                      isEditingSettings ? 'bg-gray-50 border-amber-300' : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                    }`} 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Operating Hours</label>
                  <input 
                    type="text" 
                    value={tempStoreInfo.hours} 
                    disabled={!isEditingSettings}
                    onChange={(e) => setTempStoreInfo({ ...tempStoreInfo, hours: e.target.value })} 
                    className={`w-full rounded-2xl px-4 py-3 text-sm font-bold border outline-none transition-all ${
                      isEditingSettings ? 'bg-gray-50 border-amber-300' : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                    }`} 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Location / Address (Customer Side)</label>
                <input 
                  type="text" 
                  value={tempStoreInfo.address} 
                  disabled={!isEditingSettings}
                  onChange={(e) => setTempStoreInfo({ ...tempStoreInfo, address: e.target.value })} 
                  className={`w-full rounded-2xl px-4 py-3 text-sm font-bold border outline-none transition-all ${
                    isEditingSettings ? 'bg-gray-50 border-amber-300' : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                  }`} 
                  required 
                />
              </div>

              {/* ADMIN QR CODE UPLOAD */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 uppercase block">E-Wallet QR Code (Customer Checkout Visibility)</label>
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div className="h-28 w-28 rounded-xl bg-white border border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {(isEditingSettings ? tempAdminQrCode : adminQrCode) ? (
                      <img src={isEditingSettings ? tempAdminQrCode : adminQrCode} alt="Admin QR Preview" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold text-center px-1">No QR Uploaded</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className={`rounded-xl px-4 py-2 text-xs font-bold inline-block transition-all ${isEditingSettings ? 'bg-amber-400 hover:bg-amber-500 text-white cursor-pointer shadow-xs' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                        Upload QR Code Image
                        <input type="file" accept="image/*" onChange={handleAdminQrUpload} disabled={!isEditingSettings} className="hidden" />
                      </label>
                      {isEditingSettings && tempAdminQrCode && (
                        <button
                          type="button"
                          onClick={handleRemoveAdminQr}
                          className="rounded-xl bg-red-50 text-red-500 border border-red-200 px-3 py-2 text-xs font-bold cursor-pointer hover:bg-red-100"
                        >
                          Remove QR
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-tight">
                      {isEditingSettings ? 'Upload official QR code for customer E-Wallet payments. Click "Save Changes" below to apply.' : 'Click "Edit Settings" above to change or remove the QR code.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACCOUNT SECURITY - Username & Password */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 uppercase block">Account Security</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Owner Username</label>
                    <input
                      type="text"
                      value={tempAdminUsername}
                      disabled={!isEditingSettings}
                      onChange={(e) => setTempAdminUsername(e.target.value)}
                      className={`w-full mt-1 rounded-xl px-3.5 py-2.5 text-xs font-bold border outline-none transition-all ${
                        isEditingSettings ? 'bg-white border-amber-300' : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">New Password</label>
                    <div className={`mt-1 flex items-center rounded-xl px-3.5 py-2.5 border transition-all ${
                      isEditingSettings ? 'bg-white border-amber-300' : 'bg-gray-100 border-gray-200'
                    }`}>
                      <input
                        type={showTempAdminPassword ? 'text' : 'password'}
                        placeholder={isEditingSettings ? 'Leave blank to keep current' : '••••••••'}
                        value={tempAdminPassword}
                        disabled={!isEditingSettings}
                        onChange={(e) => setTempAdminPassword(e.target.value)}
                        className={`w-full bg-transparent text-xs font-bold outline-none placeholder:font-normal placeholder:text-gray-400 ${!isEditingSettings ? 'text-gray-500 cursor-not-allowed' : 'text-gray-800'}`}
                      />
                      {isEditingSettings && (
                        <button type="button" onClick={() => setShowTempAdminPassword((s) => !s)} className="text-gray-400 hover:text-gray-600 cursor-pointer ml-2">
                          {showTempAdminPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  {isEditingSettings ? 'Palitan lang ang mga field na gusto mong baguhin. Kailangan i-confirm gamit ang kasalukuyang password bago mase-save ang anumang pagbabago.' : 'Click "Edit Settings" above to change your username or password.'}
                </p>
              </div>

              {isEditingSettings && (
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={handleCancelEditSettings}
                    className="flex-1 rounded-2xl bg-gray-100 hover:bg-gray-200 py-3.5 text-sm font-bold text-gray-600 transition-all cursor-pointer"
                  >
                    Cancel / Disregard Changes
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 rounded-2xl bg-amber-400 hover:bg-amber-500 py-3.5 text-sm font-black text-white shadow-md transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
        </>
        )}

      </main>

      {/* --- MODALS --- */}

      {/* CONFIRM DELETE MODAL ("Are you sure?") */}
      {showConfirmDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-800">Are you sure?</h3>
              <p className="text-xs text-gray-500">Do you really want to delete this item? It will be moved to Trash.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => { setShowConfirmDeleteModal(false); setItemToDelete(null); }}
                className="rounded-2xl bg-gray-100 hover:bg-gray-200 py-3 text-xs font-bold text-gray-600 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDelete}
                className="rounded-2xl bg-red-500 hover:bg-red-600 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP MODAL ("Okay") */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-800">Success!</h3>
              <p className="text-xs text-gray-500">{successMessageText}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setShowSuccessModal(false)}
              className="w-full rounded-2xl bg-amber-400 hover:bg-amber-500 py-3 text-xs font-black text-white shadow-md transition-all cursor-pointer"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* PASSWORD CONFIRMATION MODAL - para sa pag-save ng Settings (kasama credentials) */}
      {showSettingsPasswordConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="text-center space-y-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500 border border-amber-100">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-gray-800">Confirm Changes</h3>
              <p className="text-[11px] text-gray-500">Ilagay ang KASALUKUYANG password para i-apply ang mga pagbabago.</p>
            </div>

            <form onSubmit={handleConfirmSettingsSave} className="space-y-3">
              <div className={`flex items-center rounded-2xl bg-gray-50 px-4 py-3 border transition-all ${settingsConfirmError ? 'border-red-400 bg-red-50/30' : 'border-gray-200 focus-within:border-amber-400'}`}>
                <Lock className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <input
                  type={showSettingsConfirmPwVisible ? 'text' : 'password'}
                  placeholder="Current password"
                  autoFocus
                  value={settingsConfirmPasswordInput}
                  onChange={(e) => { setSettingsConfirmPasswordInput(e.target.value); setSettingsConfirmError(''); }}
                  className="w-full bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400 font-medium"
                />
                <button type="button" onClick={() => setShowSettingsConfirmPwVisible((s) => !s)} className="text-gray-400 hover:text-gray-600 cursor-pointer ml-2">
                  {showSettingsConfirmPwVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {settingsConfirmError && (
                <p className="text-[11px] text-red-500 font-bold flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />{settingsConfirmError}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSettingsPasswordConfirm(false)}
                  className="flex-1 rounded-2xl bg-gray-100 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 cursor-pointer"
                >
                  Back
                </button>
                <button type="submit" className="flex-1 rounded-2xl bg-amber-400 py-2.5 text-xs font-bold text-white hover:bg-amber-500 cursor-pointer">
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTINGS FEEDBACK MODAL */}
      {settingsModalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center ${settingsModalMessage === 'saved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              {settingsModalMessage === 'saved' ? <Check className="h-6 w-6" /> : <RotateCcw className="h-6 w-6" />}
            </div>
            <h3 className="text-base font-black text-gray-800">
              {settingsModalMessage === 'saved' ? 'Settings Successfully Updated!' : 'Changes Disregarded'}
            </h3>
            <p className="text-xs text-gray-500">
              {settingsModalMessage === 'saved' 
                ? 'Store settings have been successfully updated and are now visible on the customer app.' 
                : 'No changes were saved. Details have been reverted back to original settings.'}
            </p>
            <button 
              type="button"
              onClick={() => setSettingsModalMessage(null)}
              className="w-full rounded-2xl bg-amber-400 hover:bg-amber-500 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* TOTAL ORDERS DASHBOARD MODAL */}
      {showTotalOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-800">Total Orders History</h3>
                <p className="text-xs text-gray-400 mt-0.5">Filter time frame and inspect individual customer purchases.</p>
              </div>
              <button type="button" onClick={() => { setShowTotalOrdersModal(false); setSelectedOrderDetail(null); }} className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'today', label: 'Today' },
                { id: '7days', label: 'Last 7 Days' },
                { id: '6months', label: 'Last 6 Months' },
                { id: '1year', label: 'Last 1 Year' },
                { id: 'all', label: 'All' },
              ].map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => setOrderTimeFrame(tf.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    orderTimeFrame === tf.id ? 'bg-amber-400 text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {filteredTotalOrders.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No orders found for this time period.</p>
              ) : (
                filteredTotalOrders.map((o) => (
                  <div 
                    key={o.id} 
                    onClick={() => setSelectedOrderDetail(o)}
                    className="rounded-2xl bg-gray-50/80 p-4 border border-gray-200/80 hover:border-amber-400 hover:bg-amber-50/20 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-800 text-xs">{o.id}</span>
                        <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[9px] font-bold">{o.status}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-600 mt-1">{o.customer} • <span className="text-amber-600 font-extrabold">{o.paymentMethod || 'Cash'}</span></p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-500 text-sm">₱ {o.total.toFixed(2)}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">Click to view details →</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedOrderDetail && (
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 space-y-2.5 mt-4">
                <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                  <h4 className="font-black text-xs text-amber-900 uppercase">Order Details: {selectedOrderDetail.id}</h4>
                  <button type="button" onClick={() => setSelectedOrderDetail(null)} className="text-amber-700 text-xs font-bold hover:underline cursor-pointer">Close Detail</button>
                </div>
                <div className="text-xs space-y-1.5 text-gray-700">
                  <p><strong>Customer Name:</strong> {selectedOrderDetail.customer}</p>
                  <p><strong>Phone Number:</strong> {selectedOrderDetail.phone}</p>
                  <p><strong>Delivery Location:</strong> {selectedOrderDetail.location} ({selectedOrderDetail.type})</p>
                  <p><strong>Mode of Payment:</strong> <span className="font-bold text-amber-600">{selectedOrderDetail.paymentMethod || 'Cash'}</span> {selectedOrderDetail.eWalletRef ? `(Ref: ${selectedOrderDetail.eWalletRef})` : ''}</p>
                  <div className="pt-1">
                    <strong>Items Ordered:</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      {selectedOrderDetail.items.map((it, idx) => (
                        <li key={idx}>
                          {it.qty}x {it.name} (₱{it.price || 40}.00) {it.addons?.length > 0 ? `+ Add-ons: ${it.addons.join(', ')}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="pt-2 text-sm font-black text-amber-600">Total Amount: ₱ {selectedOrderDetail.total.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GROSS SALES DASHBOARD WITH TOP 5 BEST-SELLING FLAVOR GRAPH & PROFESSIONAL PDF */}
      {showSalesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-800">Gross Sales & Top 5 Best-Selling Analytics</h3>
                <p className="text-xs text-gray-400 mt-0.5">Revenue breakdown by category and top 5 best-selling flavor graph.</p>
              </div>
              <button type="button" onClick={() => setShowSalesModal(false)} className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'today', label: 'Today' },
                    { id: '7days', label: 'Last 7 Days' },
                    { id: '6months', label: 'Last 6 Months' },
                    { id: '1year', label: 'Last 1 Year' },
                    { id: 'custom', label: 'Custom Range' },
                    { id: 'all', label: 'All' },
                  ].map((tf) => (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => setSalesTimeFrame(tf.id)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        salesTimeFrame === tf.id ? 'bg-amber-400 text-white shadow-2xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pinahabang Generate Executive PDF Report Button */}
              <button
                type="button"
                onClick={handleGeneratePDF}
                className="w-full rounded-2xl bg-green-500 text-white py-3 text-xs font-extrabold shadow-md hover:bg-green-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                <span>Generate Executive PDF Report</span>
              </button>

              {salesTimeFrame === 'custom' && (
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                  <div>
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">Start Date</label>
                    <input 
                      type="date" 
                      value={customStartDate} 
                      onChange={(e) => setCustomStartDate(e.target.value)} 
                      className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold border border-gray-200 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-gray-400 uppercase block mb-1">End Date</label>
                    <input 
                      type="date" 
                      value={customEndDate} 
                      onChange={(e) => setCustomEndDate(e.target.value)} 
                      className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold border border-gray-200 outline-none" 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-center justify-between shadow-xs">
              <div>
                <p className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">Total Gross Revenue ({salesTimeFrame.toUpperCase()})</p>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">₱ {totalSalesCalculated.toFixed(2)}</h3>
              </div>
              <div className="text-right text-xs text-amber-900 bg-amber-100 px-3 py-1.5 rounded-xl font-bold">
                <p>{filteredSalesOrders.length} transactions</p>
              </div>
            </div>

            {/* BEST-SELLING FLAVORS GRAPH & VISUAL RANKING - Scrollable, ipinapakita LAHAT ng produkto */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>Best-Selling Flavors Ranking ({salesTimeFrame.toUpperCase()})</span>
                </h4>
                <span className="text-[10px] text-gray-400 font-bold">Units Sold</span>
              </div>

              <div className="space-y-2.5 pt-1 max-h-64 overflow-y-auto pr-1">
                {sortedFlavorsRanking.map((prod, idx) => {
                  const maxSold = Math.max(...sortedFlavorsRanking.map(p => p.soldCount), 1);
                  const percentage = Math.round((prod.soldCount / maxSold) * 100);
                  return (
                    <div key={prod.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-700 flex items-center gap-1">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${idx < 5 ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-500'}`}>#{idx + 1}</span>
                          {prod.name} <span className="text-gray-400 font-normal">({prod.category})</span>
                        </span>
                        <span className="font-black text-amber-600">{prod.soldCount} units</span>
                      </div>
                      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.max(percentage, 8)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Table Breakdown */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-gray-500 uppercase tracking-wider">Earnings Breakdown by Category</h4>
              <table className="w-full border-collapse border border-gray-200 text-xs text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-bold">
                    <th className="border border-gray-200 p-2">Category</th>
                    <th className="border border-gray-200 p-2">Price Rate</th>
                    <th className="border border-gray-200 p-2">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 p-2 font-bold">Sakto</td>
                    <td className="border border-gray-200 p-2">₱30.00</td>
                    <td className="border border-gray-200 p-2 font-bold">₱ {categorySales.Sakto.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2 font-bold">Sarap</td>
                    <td className="border border-gray-200 p-2">₱40.00</td>
                    <td className="border border-gray-200 p-2 font-bold">₱ {categorySales.Sarap.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2 font-bold">Sagad</td>
                    <td className="border border-gray-200 p-2">₱50.00</td>
                    <td className="border border-gray-200 p-2 font-bold">₱ {categorySales.Sagad.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ITEM MODAL WITH STOCK QUANTITY INPUT */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-800">{editingItem ? 'Edit Flavor Item & Stock' : 'Add New Flavor & Stock'}</h3>
              <button type="button" onClick={() => setShowItemModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-3">
              <div>
                <label className="text-[10px] font-extrabold text-gray-400 uppercase px-1">Flavor Picture</label>
                <div className="mt-1 flex items-center gap-3">
                  <div className="h-20 w-20 rounded-2xl bg-amber-50 border border-amber-200 overflow-hidden flex items-center justify-center">
                    {itemImage ? <img src={itemImage} alt="Preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-amber-400" />}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="rounded-2xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 cursor-pointer text-center">
                      {itemImage ? 'Change Picture' : 'Upload Picture'}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setItemImage)} className="hidden" />
                    </label>
                    {itemImage && (
                      <button
                        type="button"
                        onClick={() => setItemImage('')}
                        className="rounded-2xl bg-red-50 text-red-500 border border-red-200 px-4 py-1.5 text-[11px] font-bold hover:bg-red-100 cursor-pointer"
                      >
                        Remove Picture
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Item Name</label>
                <input type="text" placeholder="e.g. Pistachiowrap" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full rounded-xl bg-gray-50 px-3.5 py-2.5 text-xs border font-bold mt-1" required />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                  <select value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} className="w-full rounded-xl bg-gray-50 px-3 py-2.5 text-xs border font-bold mt-1">
                    <option value="Sakto">Sakto</option>
                    <option value="Sarap">Sarap</option>
                    <option value="Sagad">Sagad</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Price (₱)</label>
                  <input type="number" placeholder="30" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} className="w-full rounded-xl bg-gray-50 px-3.5 py-2.5 text-xs border font-bold mt-1" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Stock Qty</label>
                  <input type="number" placeholder="20" value={itemStock} onChange={(e) => setItemStock(e.target.value)} className="w-full rounded-xl bg-gray-50 px-3.5 py-2.5 text-xs border font-bold mt-1" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                <textarea placeholder="Description..." value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} className="w-full rounded-xl bg-gray-50 px-3.5 py-2.5 text-xs border h-16 mt-1" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 rounded-xl bg-gray-100 py-2.5 text-xs font-bold text-gray-600 cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-amber-400 py-2.5 text-xs font-extrabold text-white shadow-md cursor-pointer">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BANNER MODAL */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-800">{editingBanner ? 'Change Banner Image' : 'Add Banner Image'}</h3>
              <button type="button" onClick={() => setShowBannerModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveBanner} className="space-y-3">
              <div>
                <label className="text-[10px] font-extrabold text-gray-400 uppercase px-1">Banner Image</label>
                <div className="mt-1 flex items-center gap-3">
                  <div className="h-24 w-36 rounded-2xl bg-amber-50 border overflow-hidden flex items-center justify-center">
                    {bannerImage ? <img src={bannerImage} alt="Banner Preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-amber-400" />}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="rounded-2xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 cursor-pointer text-center">
                      {bannerImage ? 'Change Image' : 'Upload Banner Image'}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBannerImage)} className="hidden" />
                    </label>
                    {bannerImage && (
                      <button
                        type="button"
                        onClick={() => setBannerImage('')}
                        className="rounded-2xl bg-red-50 text-red-500 border border-red-200 px-4 py-1.5 text-[11px] font-bold hover:bg-red-100 cursor-pointer"
                      >
                        Remove Picture
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowBannerModal(false)} className="flex-1 rounded-xl bg-gray-100 py-2.5 text-xs font-bold text-gray-600 cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-amber-400 py-2.5 text-xs font-extrabold text-white shadow-md cursor-pointer">Save Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADDON MODAL */}
      {showAddonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-800">{editingAddon ? 'Edit Add-on' : 'Add New Add-on'}</h3>
              <button type="button" onClick={() => setShowAddonModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveAddon} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Add-on Name</label>
                <input type="text" placeholder="e.g. Marshmallow" value={addonName} onChange={(e) => setAddonName(e.target.value)} className="w-full rounded-xl bg-gray-50 px-3.5 py-2 text-xs border font-bold mt-1" required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Price (₱)</label>
                <input type="number" placeholder="15" value={addonPrice} onChange={(e) => setAddonPrice(e.target.value)} className="w-full rounded-xl bg-gray-50 px-3.5 py-2 text-xs border font-bold mt-1" required />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddonModal(false)} className="flex-1 rounded-xl bg-gray-100 py-2 text-xs font-bold text-gray-600 cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-amber-400 py-2 text-xs font-bold text-white cursor-pointer">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFESSIONAL VOUCHER / PROMOTION CREATION & EDIT MODAL */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-sans overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Tag className="h-4 w-4" />
                </div>
                <h3 className="text-base font-black text-gray-800">{editingVoucher ? 'Edit Promotion' : 'Create New Promotion'}</h3>
              </div>
              <button type="button" onClick={() => setShowVoucherModal(false)} className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleSaveVoucher} className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Promo Code</label>
                <input type="text" placeholder="e.g. SAWRAVE10" value={vCode} onChange={(e) => setVCode(e.target.value)} className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-xs border font-extrabold uppercase outline-none focus:border-amber-400 transition-all" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Discount Amount (₱)</label>
                  <input type="number" placeholder="10" value={vDiscount} onChange={(e) => setVDiscount(e.target.value)} className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-xs border font-bold outline-none focus:border-amber-400 transition-all" required />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Min. Spend (₱)</label>
                  <input type="number" placeholder="100" value={vMinSpend} onChange={(e) => setVMinSpend(e.target.value)} className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-xs border font-bold outline-none focus:border-amber-400 transition-all" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Start Date</label>
                  <input type="date" value={vStartDate} onChange={(e) => setVStartDate(e.target.value)} className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-xs border font-bold outline-none focus:border-amber-400 transition-all" required />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">End Date</label>
                  <input type="date" value={vEndDate} onChange={(e) => setVEndDate(e.target.value)} className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-xs border font-bold outline-none focus:border-amber-400 transition-all" required />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Promo Status</label>
                <select value={vStatus} onChange={(e) => setVStatus(e.target.value)} className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-xs border font-bold outline-none focus:border-amber-400 transition-all">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired / Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowVoucherModal(false)} className="flex-1 rounded-2xl bg-gray-100 hover:bg-gray-200 py-3.5 text-xs font-bold text-gray-600 transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 rounded-2xl bg-amber-400 hover:bg-amber-500 py-3.5 text-xs font-black text-white shadow-md transition-all cursor-pointer">Save Promotion</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL ("Are you sure?") */}
      {showConfirmDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-800">Are you sure?</h3>
              <p className="text-xs text-gray-500">Do you really want to delete this item? It will be moved to Trash.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => { setShowConfirmDeleteModal(false); setItemToDelete(null); }}
                className="rounded-2xl bg-gray-100 hover:bg-gray-200 py-3 text-xs font-bold text-gray-600 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmDelete}
                className="rounded-2xl bg-red-500 hover:bg-red-600 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP MODAL ("Okay") */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <Check className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-gray-800">Success!</h3>
              <p className="text-xs text-gray-500">{successMessageText}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setShowSuccessModal(false)}
              className="w-full rounded-2xl bg-amber-400 hover:bg-amber-500 py-3 text-xs font-black text-white shadow-md transition-all cursor-pointer"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {/* CANCEL ORDER MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-800">Decline Order</h3>
              <button type="button" onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleConfirmCancelOrder} className="space-y-3">
              <select value={cancelReasonOption} onChange={(e) => setCancelReasonOption(e.target.value)} className="w-full rounded-xl bg-gray-50 px-3 py-2 text-xs border font-bold">
                <option value="Out of Stock / Ingredients Unavailable">Out of Stock / Ingredients Unavailable</option>
                <option value="Store is Closing Soon">Store is Closing Soon</option>
                <option value="Unable to Deliver to Location">Unable to Deliver to Location</option>
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCancelModal(false)} className="flex-1 rounded-xl bg-gray-100 py-2 text-xs font-bold cursor-pointer">Back</button>
                <button type="submit" className="flex-1 rounded-xl bg-red-500 text-white py-2 text-xs font-bold cursor-pointer">Confirm Decline</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER RECEIPT VIEW MODAL */}
      {viewingReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-amber-50">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-white">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-gray-800">Customer Receipt</h2>
                  <p className="text-[10px] text-gray-500">{viewingReceiptOrder.id}</p>
                </div>
              </div>
              <button onClick={() => setViewingReceiptOrder(null)} className="rounded-full bg-white p-2 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-200">
                <div className="flex items-center justify-center gap-1.5 text-amber-600 font-black text-sm">
                  <Store className="h-4 w-4" /> SaWrap
                </div>
                <p className="text-[10px] text-gray-400">{new Date(viewingReceiptOrder.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                <span className="inline-block mt-1 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider px-3 py-1">
                  {viewingReceiptOrder.status}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="font-bold text-gray-800">{viewingReceiptOrder.customer}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-bold text-gray-800">{viewingReceiptOrder.phone}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Fulfillment</span><span className="font-bold text-gray-800">{viewingReceiptOrder.type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-bold text-gray-800 text-right max-w-[60%]">{viewingReceiptOrder.location}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className="font-bold text-gray-800">{viewingReceiptOrder.paymentMethod}</span></div>
                {viewingReceiptOrder.eWalletRef && viewingReceiptOrder.eWalletRef !== 'N/A' && (
                  <div className="flex justify-between"><span className="text-gray-500">Ref No.</span><span className="font-bold text-gray-800">{viewingReceiptOrder.eWalletRef}</span></div>
                )}
              </div>
              <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
                {viewingReceiptOrder.items?.map((item, idx) => (
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
                <span className="text-lg font-black text-amber-500">₱ {viewingReceiptOrder.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}