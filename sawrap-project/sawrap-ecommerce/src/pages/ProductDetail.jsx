import { useState } from 'react';
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/cart';
import CartModal from '../components/CartModal';
import NotificationModal from '../components/BackendNotificationModal';

export default function ProductDetail({ product, onBack, onGoToCheckout }) {
  const { addToCart, favorites, toggleFavorite, totalItemCount } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  
  // States para sa modal sa loob ng ProductDetail
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  if (!product) return null;

  const isFavorite = favorites?.includes(product.id);

  const addonsList = product.addons || [];

  const toggleAddon = (addonName) => {
    if (selectedAddons.includes(addonName)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== addonName));
    } else {
      setSelectedAddons([...selectedAddons, addonName]);
    }
  };

  const addonsTotal = selectedAddons.reduce((sum, name) => {
    const addon = addonsList.find((a) => a.name === name);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const unitPrice = product.price + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedAddons);
    // Ang Toast (hindi na native browser alert) ang nagpapakita ng "Added to Cart!" - awtomatiko na itong
    // trinigger sa loob ng addToCart() mismo (CartContext.jsx), kaya walang dagdag na notification dito.
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedAddons);
    onGoToCheckout();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 md:pb-12 pt-4 px-4 md:px-8 font-sans">
      <div className="mx-auto max-w-5xl">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-2xs hover:bg-amber-50 hover:border-amber-400 hover:text-amber-500 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {product.category || 'SaWrap Special'}
          </span>

          {/* Cart Icon sa Header na direktang magbubukas ng Cart Modal */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all shadow-2xs cursor-pointer"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Main Content Card (2-Column Grid on Desktop) */}
        <div className="rounded-3xl bg-white p-5 md:p-8 shadow-xs border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* LEFT COLUMN: Product Image */}
          <div className="flex flex-col gap-4">
            <div className="relative h-64 md:h-96 w-full rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/50 flex items-center justify-center border border-amber-100 shadow-inner overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <span className="text-4xl md:text-6xl mb-2 block">🍌</span>
                  <h3 className="text-amber-800 font-black text-xl md:text-2xl">{product.name}</h3>
                  <p className="text-xs text-amber-600/80 mt-1">Freshly fried crispy banana wrap</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Details & Options */}
          <div className="flex flex-col justify-between h-full space-y-6">
            
            {/* Title & Price Header */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">{product.name}</h1>
                  <p className="text-2xl font-extrabold text-amber-500 mt-1">₱ {product.price.toFixed(2)}</p>
                </div>

                {/* Favorite Heart Button */}
                <button
                  onClick={() => toggleFavorite && toggleFavorite(product.id)}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all cursor-pointer ${
                    isFavorite
                      ? 'border-amber-400 bg-amber-50 text-amber-500 shadow-2xs'
                      : 'border-gray-200 bg-white text-gray-400 hover:text-amber-500 hover:border-amber-300'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
              </div>

              {/* Quantity Selector - Naka-center ang alignment */}
              <div className="mt-4 flex items-center justify-between bg-gray-50/80 p-3 rounded-2xl border border-gray-100 w-full max-w-xs">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</span>
                <div className="flex items-center gap-4 bg-white px-4 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-500 hover:text-amber-500 transition-colors cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-black text-gray-800 w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-gray-500 hover:text-amber-500 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* About Flavor */}
            <div className="space-y-1.5 border-t border-gray-100 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">About the flavor</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                {product.description || "Indulge in the ultimate Filipino classic from SaWrap! Sweet, ripe saba bananas wrapped in a crispy spring roll wrapper, deep-fried to golden perfection and finished with a rich caramelized glaze."}
              </p>
            </div>

            {/* Add-ons List */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Add-ons</h3>
              <div className="grid grid-cols-1 gap-2">
                {addonsList.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.name);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.name)}
                      className={`flex items-center justify-between rounded-xl p-3 border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/60 shadow-2xs'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xs font-bold text-gray-700">
                        {addon.name} <span className="text-amber-600 font-semibold">(+₱{addon.price.toFixed(2)})</span>
                      </span>
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-md font-bold text-xs transition-all ${
                          isSelected ? 'bg-amber-500 text-white' : 'border border-gray-300 bg-gray-50 text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center gap-3 border-t border-gray-100 pt-6 mt-4">
              <button
                onClick={handleAddToCart}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-amber-400 text-amber-500 hover:bg-amber-50 transition-all cursor-pointer"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 rounded-2xl bg-amber-400 py-3 text-center font-bold text-white shadow-md hover:bg-amber-500 active:scale-[0.98] transition-all flex items-center justify-between px-6 h-12 cursor-pointer"
              >
                <span>Checkout Now</span>
                <span className="text-base font-extrabold">₱ {totalPrice.toFixed(2)}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Bottom Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 z-40">
        <div className="mx-auto max-w-md flex items-center gap-3">
          <button
            onClick={handleAddToCart}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-amber-400 text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 rounded-2xl bg-amber-400 py-3.5 text-center font-bold text-white shadow-md hover:bg-amber-500 active:scale-[0.98] transition-all flex items-center justify-between px-5 cursor-pointer"
          >
            <span>Checkout</span>
            <span className="text-sm font-extrabold">₱ {totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>

      {/* Cart Modal para magbukas kapag pinindot ang cart icon sa header */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          onGoToCheckout();
        }}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onGoToProfile={() => {}}
      />
    </div>
  );
}
