import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([2, 7]);
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

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

  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // SMART ADD TO CART (Consolidates items by Product ID and Add-ons)
  const addToCart = (product, quantityToAdd = 1, selectedAddons = []) => {
    const sortedAddons = [...selectedAddons].sort();
    const addonsTotal = sortedAddons.length * 15;
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

export const useCart = () => useContext(CartContext);