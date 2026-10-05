import { useState, useEffect } from 'react';
import { Search, Bell, ShoppingCart } from 'lucide-react';
import sawrapLogo from '../assets/sawrap-logo.png';
import FallingBananas from './FallingBananas';
import { listMyNotifications } from '../lib/api';

export default function Header({ onOpenCart, onOpenNotification, onOpenAdminAuth, cartCount = 0, searchQuery = '', setSearchQuery }) {
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showBananaRain, setShowBananaRain] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    const loadUnread = async () => {
      try {
        const rows = await listMyNotifications();
        if (active) setUnreadCount(rows.filter((item) => !item.read).length);
      } catch { if (active) setUnreadCount(0); }
    };
    loadUnread();
    const interval = setInterval(loadUnread, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Secret 3-tap gesture on SaWrap Logo to trigger Admin Lock (+ fun banana rain!)
  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    if (newCount >= 3) {
      setLogoClickCount(0);
      setShowBananaRain(true);
      if (onOpenAdminAuth) onOpenAdminAuth();
    } else {
      setLogoClickCount(newCount);
      setTimeout(() => setLogoClickCount(0), 1500); // Reset tap counter after 1.5s
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        
        {/* Brand Logo with Discrete Multi-tap Gesture */}
        <div
          onClick={handleLogoClick}
          className="cursor-pointer select-none active:scale-95 transition-transform"
          title="SaWrap Store"
        >
          <img src={sawrapLogo} alt="SaWrap" className="h-7 md:h-8 w-auto object-contain" />
        </div>

        {/* Search Bar - Konektado na sa searchQuery at setSearchQuery */}
        <div className="flex flex-1 items-center rounded-full bg-gray-100 px-4 py-2 md:max-w-md">
          <Search className="mr-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search flavor or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-700 outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNotification}
            className="relative rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </button>

          <button 
            onClick={onOpenCart}
            className="relative rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors cursor-pointer"
            title="Cart"
          >
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {showBananaRain && <FallingBananas onDone={() => setShowBananaRain(false)} />}
    </header>
  );
}
