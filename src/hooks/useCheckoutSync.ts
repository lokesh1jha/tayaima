import { useCallback, useRef, useEffect } from 'react';
import { useCart } from './useCart';
import { useRouter } from 'next/navigation';

/**
 * Hook for checkout-specific cart operations
 */
export const useCheckoutSync = () => {
  const { forceSync, items, total, syncStatus } = useCart();
  const router = useRouter();
  const isNavigating = useRef(false);

  const proceedToCheckout = useCallback(async () => {
    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Prevent multiple navigation calls
    if (isNavigating.current) {
      return;
    }

    isNavigating.current = true;

    try {
      // Force sync before checkout
      await forceSync();
      
      // Navigate to checkout page after successful sync
      router.push('/checkout');
    } catch (error) {
      isNavigating.current = false;
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to sync cart before checkout:', error);
      }
      throw new Error('Failed to sync cart. Please try again.');
    }
  }, [forceSync, items.length, router]);

  // Reset navigation flag when component unmounts or items change
  useEffect(() => {
    return () => {
      isNavigating.current = false;
    };
  }, [items.length]);

  const canProceedToCheckout = items.length > 0 && syncStatus !== 'syncing';

  return {
    proceedToCheckout,
    canProceedToCheckout,
    isCheckoutReady: syncStatus === 'idle' && items.length > 0,
    checkoutTotal: total,
    checkoutItems: items,
  };
};
