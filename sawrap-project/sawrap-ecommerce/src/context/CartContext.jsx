import { useEffect, useState } from 'react';
import Toast from '../components/Toast';
import { supabase } from '../lib/supabase';
import { CartContext } from './cart';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (active) setFavorites([]); return; }
      const { data, error } = await supabase.from('favorites').select('product_id');
      if (!error && active) setFavorites(data.map((row) => row.product_id));
    };
    load();
    const { data } = supabase?.auth.onAuthStateChange(() => setTimeout(load, 0)) || {};
    return () => { active = false; data?.subscription.unsubscribe(); };
  }, []);

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 2500);
  };

  const toggleFavorite = async (productId) => {
    const removing = favorites.includes(productId);
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const result = removing
      ? await supabase.from('favorites').delete().eq('customer_id', session.user.id).eq('product_id', productId)
      : await supabase.from('favorites').insert({ customer_id: session.user.id, product_id: productId });
    if (result.error) {
      setFavorites((prev) => removing ? [...prev, productId] : prev.filter((id) => id !== productId));
      showToast('Could not save favorite. Please try again.');
    }
  };

  // SMART ADD TO CART (Consolidates items by Product ID and Add-ons)
  const addToCart = (product, quantityToAdd = 1, selectedAddons = []) => {
    const sortedAddons = [...selectedAddons].sort();
    const addonRows = sortedAddons.map((name) => product.addons?.find((addon) => addon.name === name));
    if (addonRows.some((addon) => !addon)) {
      showToast('An add-on is unavailable. Please refresh the menu.');
      return;
    }
    const addonsTotal = addonRows.reduce((sum, addon) => sum + addon.price, 0);
    const addonIds = addonRows.map((addon) => addon.id);
    const unitPrice = product.price + addonsTotal;

    setCartItems((prevItems) => {
      // Check if item with same Product ID & same Add-ons already exists
      const existingIndex = prevItems.findIndex((item) => {
        const itemAddons = [...(item.selectedAddons || [])].sort();
        return (
          item.productId === product.id &&
          JSON.stringify(itemAddons) === JSON.stringify(sortedAddons)
        );
      });

      if (existingIndex > -1) {
        // Item exists -> Increase quantity only
        const updated = [...prevItems];
        const existingItem = updated[existingIndex];
        const newQty = existingItem.quantity + quantityToAdd;

        updated[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          itemTotal: unitPrice * newQty,
        };
        return updated;
      } else {
        // New item entry
        const newItem = {
          cartId: `cart-${Date.now()}-${Math.random()}`,
          productId: product.id,
          name: product.name,
          category: product.category || '',
          price: product.price,
          quantity: quantityToAdd,
          selectedAddons: sortedAddons,
          addonIds,
          image: product.image,
          itemTotal: unitPrice * quantityToAdd,
        };
        return [...prevItems, newItem];
      }
    });

    showToast(`${product.name} added to cart`);
  };

  const updateQuantity = (cartId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const unitPrice = item.itemTotal / item.quantity;
            return {
              ...item,
              quantity: newQty,
              itemTotal: unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  // Clear / Remove All Items
  const clearCart = () => {
    setCartItems([]);
  };

  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        favorites,
        toggleFavorite,
        voucherCode,
        setVoucherCode,
        discountAmount,
        setDiscountAmount,
        totalItemCount,
        subtotal,
        grandTotal,
      }}
    >
      {children}
      <Toast message={toastMessage} isVisible={isToastVisible} />
    </CartContext.Provider>
  );
}
