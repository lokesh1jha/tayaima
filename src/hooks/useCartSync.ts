import { useEffect, useRef } from 'react';
import { useCart } from './useCart';
import { useSession } from 'next-auth/react';

/**
 * Hook to handle cart sync on critical events
 */
export const useCartSync = () => {
  const { forceSync } = useCart();
  const { data: session, status } = useSession();
  const previousSession = useRef(session);

  // Force sync when user logs in or out
  useEffect(() => {
    if (status === 'loading') return;

    const wasLoggedIn = !!previousSession.current;
    const isLoggedIn = !!session;

    // Trigger sync on login/logout state change
    if (wasLoggedIn !== isLoggedIn) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state changed, forcing cart sync');
      }
      forceSync();
    }

    previousSession.current = session;
  }, [session, status]);

  // Force sync on page unload (keep this for data safety)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Note: This may not complete due to browser limitations
      // but we attempt it anyway for data safety
      forceSync();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Manual sync function for checkout
  const syncForCheckout = async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Syncing cart for checkout');
    }
    return await forceSync();
  };

  return {
    forceSync,
    syncForCheckout,
  };
};
