import React from 'react';
import { Home, Mail, ShoppingBag, Heart, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'messages', icon: Mail, label: 'Messages' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur-md px-6 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between md:justify-center md:gap-12">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-amber-400 text-white shadow-xs'
                  : 'text-gray-400 hover:text-amber-500'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden md:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}