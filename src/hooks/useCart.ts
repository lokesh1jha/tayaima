import { useCallback, useEffect } from 'react';
import { useCartStore } from '@/stores/useCartStore';
import { AddToCartParams, UpdateCartItemParams } from '@/types/cart';

/**
 * Main cart hook that provides all cart operations
 */
export const useCart = () => {
  const store = useCartStore();

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
    items: store.items,
    total: store.total,
    itemCount: store.itemCount,
    syncStatus: store.syncStatus,
    isLoading: store.syncStatus === 'syncing',
    hasError: store.syncStatus === 'error',
    isRetrying: store.syncStatus === 'retrying',
    
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
