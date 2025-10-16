import { useCallback, useEffect, useState } from 'react';
import { useCartStore } from '@/stores/useCartStore';
import { AddToCartParams, UpdateCartItemParams } from '@/types/cart';

/**
 * Main cart hook that provides all cart operations
 */
export const useCart = () => {
  const [mounted, setMounted] = useState(false);
  const store = useCartStore();

  useEffect(() => {
    setMounted(true);
    if (process.env.NODE_ENV === 'development') {
      console.log('useCart: Mounted, items:', store.items.length);
    }
  }, []);

  const addToCart = useCallback((params: AddToCartParams) => {
    store.addItem(params);
  }, [store]);

  const removeFromCart = useCallback((itemId: string) => {
    store.removeItem(itemId);
  }, [store]);

  const updateCartItem = useCallback((params: UpdateCartItemParams) => {
    store.updateItem(params);
  }, [store]);

  const clearCart = useCallback(() => {
    store.clearCart();
  }, [store]);

  const syncCart = useCallback(() => {
    store.syncCart();
  }, [store]);

  const forceSync = useCallback(async () => {
    await store.forceSync();
  }, [store]);

  // Get item quantity for a specific product variant
  const getItemQuantity = useCallback((productId: string, variantId: string) => {
    const item = store.items.find(
      item => item.productId === productId && item.variantId === variantId
    );
    return item?.quantity || 0;
  }, [store.items]);

  // Check if item is in cart
  const isInCart = useCallback((productId: string, variantId: string) => {
    return store.items.some(
      item => item.productId === productId && item.variantId === variantId
    );
  }, [store.items]);

  return {
    // State
    items: mounted ? store.items : [],
    total: mounted ? store.total : 0,
    itemCount: mounted ? store.itemCount : 0,
    syncStatus: store.syncStatus,
    isLoading: store.syncStatus === 'syncing',
    hasError: store.syncStatus === 'error',
    isRetrying: store.syncStatus === 'retrying',
    mounted,
    
    // Actions
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    syncCart,
    forceSync,
    
    // Utilities
    getItemQuantity,
    isInCart,
  };
};
