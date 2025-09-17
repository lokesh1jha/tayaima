import { useCallback } from 'react';
import { useCart } from './useCart';
import { useRouter } from 'next/navigation';

/**
 * Hook for checkout-specific cart operations
 */
export const useCheckoutSync = () => {
  const { forceSync, items, total, syncStatus } = useCart();
  const router = useRouter();

  const proceedToCheckout = useCallback(async () => {
    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Force sync before checkout
    try {
      await forceSync();
      
      // Navigate to checkout page after successful sync
      router.push('/checkout');
    } catch (error) {
      console.error('Failed to sync cart before checkout:', error);
      throw new Error('Failed to sync cart. Please try again.');
    }
  }, [forceSync, items.length, router]);

  const canProceedToCheckout = items.length > 0 && syncStatus !== 'syncing';

  return {
    proceedToCheckout,
    canProceedToCheckout,
    isCheckoutReady: syncStatus === 'idle' && items.length > 0,
    checkoutTotal: total,
    checkoutItems: items,
  };
};
