import { useCallback, useRef, useEffect } from 'react';
import { useCart } from './useCart';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

/**
 * Hook for checkout-specific cart operations
 */
export const useCheckoutSync = () => {
  const { forceSync, items, total, syncStatus } = useCart();
  const router = useRouter();
  const { data: session } = useSession();
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
      // Only sync if user is authenticated
      if (session?.user?.id) {
        // Force sync before checkout for authenticated users
        await forceSync();
      }
      
      // Navigate to checkout page (sync is optional for guests)
      router.push('/checkout');
    } catch (error) {
      isNavigating.current = false;
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to sync cart before checkout:', error);
      }
      // Don't throw error for sync failures - still allow checkout
      console.warn('Cart sync failed, proceeding to checkout anyway');
      router.push('/checkout');
    }
  }, [forceSync, items.length, router, session?.user?.id]);

  // Reset navigation flag when component unmounts or items change
  useEffect(() => {
    return () => {
      isNavigating.current = false;
    };
  }, [items.length]);

  const canProceedToCheckout = items.length > 0;

  return {
    proceedToCheckout,
    canProceedToCheckout,
    isCheckoutReady: syncStatus === 'idle' && items.length > 0,
    checkoutTotal: total,
    checkoutItems: items,
  };
};
