import { CartState, CartSyncRequest, CartSyncResponse, CartSyncAction } from '@/types/cart';
import { getSession } from 'next-auth/react';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

class CartSyncManager {
  private syncTimeoutId: NodeJS.Timeout | null = null;
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncInProgress = false;
  private readonly SYNC_DELAY = 3000; // 3 seconds debounce
  private readonly RETRY_CONFIG: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
  };

  constructor() {
    this.setupOnlineListener();
  }

  private setupOnlineListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      if (process.env.NODE_ENV === 'development') {
        console.log('Network back online, attempting to sync cart');
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      if (process.env.NODE_ENV === 'development') {
        console.log('Network offline, cart sync will be queued');
      }
    });
  }

  /**
   * Schedule a debounced sync (disabled - only using force sync now)
   */
  scheduleSync(
    getCartState: () => CartState,
    updateCartState: (updater: (state: CartState) => CartState) => void,
    force = false
  ): void {
    // Disabled automatic debounced sync - only sync at checkout and login
    if (process.env.NODE_ENV === 'development') {
      console.log('Debounced sync disabled - only using force sync');
    }
  }

  /**
   * Cancel pending sync
   */
  cancelSync(): void {
    if (this.syncTimeoutId) {
      clearTimeout(this.syncTimeoutId);
      this.syncTimeoutId = null;
    }
  }

  /**
   * Perform the actual sync operation
   */
  private async performSync(
    getCartState: () => CartState,
    updateCartState: (updater: (state: CartState) => CartState) => void
  ): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return;
    }

    const cartState = getCartState();

    // Skip sync if no items or no changes in queue
    if (cartState.items.length === 0 && cartState.syncQueue.length === 0) {
      return;
    }

    if (!this.isOnline) {
      console.log('Device offline, queuing sync for later');
      return;
    }

    // Skip sync if user is not authenticated
    try {
      const session = await getSession();
      if (!session?.user?.id) {
        // Not logged in; do not sync cart to server
        return;
      }
    } catch (e) {
      // If session check fails for any reason, do not attempt sync
      return;
    }

    this.syncInProgress = true;

    // Update sync status
    updateCartState((state) => ({
      ...state,
      syncStatus: 'syncing',
      lastSyncAttempt: Date.now(),
    }));

    try {
      const success = await this.syncToServer(cartState, updateCartState);

      if (success) {
        // Clear sync queue on successful sync
        updateCartState((state) => ({
          ...state,
          syncStatus: 'idle',
          syncQueue: [],
          retryCount: 0,
        }));
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Cart synced successfully');
        }
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Cart sync failed:', error);
      }
      await this.handleSyncFailure(getCartState, updateCartState);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Handle sync failure with retry logic
   */
  private async handleSyncFailure(
    getCartState: () => CartState,
    updateCartState: (updater: (state: CartState) => CartState) => void
  ): Promise<void> {
    const cartState = getCartState();
    const newRetryCount = cartState.retryCount + 1;

    if (newRetryCount >= this.RETRY_CONFIG.maxRetries) {
      updateCartState((state) => ({
        ...state,
        syncStatus: 'error',
        retryCount: newRetryCount,
      }));
      console.error('Max retry attempts reached, sync failed permanently');
      return;
    }

    // Calculate exponential backoff delay
    const delay = Math.min(
      this.RETRY_CONFIG.baseDelay * Math.pow(2, newRetryCount - 1),
      this.RETRY_CONFIG.maxDelay
    );

    updateCartState((state) => ({
      ...state,
      syncStatus: 'retrying',
      retryCount: newRetryCount,
    }));

    if (process.env.NODE_ENV === 'development') {
      console.log(`Retrying cart sync in ${delay}ms (attempt ${newRetryCount})`);
    }

    setTimeout(() => {
      this.performSync(getCartState, updateCartState);
    }, delay);
  }

  /**
   * Sync cart data to server
   */
  private async syncToServer(
    cartState: CartState,
    updateCartState?: (updater: (state: CartState) => CartState) => void
  ): Promise<boolean> {
    try {
      const syncData: CartSyncRequest = {
        items: cartState.items,
        total: cartState.total,
        itemCount: cartState.itemCount,
        lastUpdated: cartState.lastUpdated,
      };

      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(syncData),
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        // Handle 401 errors gracefully - user session expired
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}));
          
          // If it's a stale session, trigger logout
          if (errorData.error === 'STALE_SESSION') {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Stale session detected, triggering logout');
            }
            
            // Use utility function to handle session expiry
            const { handleSessionExpiry } = await import('@/lib/sessionUtils');
            await handleSessionExpiry();
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Cart sync failed: User session expired');
            }
          }
          return false; // Don't throw error for auth issues
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CartSyncResponse = await response.json();
      
      // If we have an update function and server returned updated items, apply them
      if (updateCartState && result.updatedItems) {
        this.applyServerUpdates(result.updatedItems, updateCartState);
      }
      
      return result.success;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Server sync failed:', error);
      }
      return false;
    }
  }

  /**
   * Apply server updates to the cart state
   */
  private applyServerUpdates(
    serverItems: any[],
    updateCartState: (updater: (state: CartState) => CartState) => void
  ): void {
    updateCartState((state) => {
      const updatedItems = [...state.items];
      let hasChanges = false;

      // Check each server item against local items
      serverItems.forEach((serverItem) => {
        const localIndex = updatedItems.findIndex(
          (item) => item.id === serverItem.id
        );

        if (localIndex >= 0) {
          const localItem = updatedItems[localIndex];
          
          // Check for differences and update
          if (
            localItem.quantity !== serverItem.quantity ||
            localItem.price !== serverItem.price ||
            localItem.maxStock !== serverItem.maxStock
          ) {
            updatedItems[localIndex] = {
              ...localItem,
              quantity: serverItem.quantity,
              price: serverItem.price,
              maxStock: serverItem.maxStock,
            };
            hasChanges = true;

            // Show toast notification for changes
            if (typeof window !== 'undefined') {
              this.notifyItemUpdated(localItem, serverItem);
            }
          }
        }
      });

      // Remove items that no longer exist on server
      const serverItemIds = new Set(serverItems.map(item => item.id));
      const filteredItems = updatedItems.filter(item => {
        const exists = serverItemIds.has(item.id);
        if (!exists && typeof window !== 'undefined') {
          this.notifyItemRemoved(item);
          hasChanges = true;
        }
        return exists;
      });

      if (hasChanges) {
        // Recalculate totals
        const newTotal = filteredItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const newItemCount = filteredItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        return {
          ...state,
          items: filteredItems,
          total: newTotal,
          itemCount: newItemCount,
          lastUpdated: Date.now(),
        };
      }

      return state;
    });
  }

  /**
   * Notify user about item updates
   */
  private notifyItemUpdated(localItem: any, serverItem: any): void {
    if (localItem.quantity !== serverItem.quantity) {
      // Dynamic import to avoid SSR issues
      import('sonner').then(({ toast }) => {
        toast.info(
          `${localItem.productName} quantity updated to ${serverItem.quantity}`,
          { duration: 3000 }
        );
      });
    }
    
    if (localItem.price !== serverItem.price) {
      import('sonner').then(({ toast }) => {
        toast.info(
          `${localItem.productName} price updated`,
          { duration: 3000 }
        );
      });
    }
  }

  /**
   * Notify user about removed items
   */
  private notifyItemRemoved(item: any): void {
    import('sonner').then(({ toast }) => {
      toast.warning(
        `${item.productName} is no longer available and was removed from your cart`,
        { duration: 4000 }
      );
    });
  }

  /**
   * Add sync action to queue
   */
  addSyncAction(
    action: CartSyncAction,
    updateCartState: (updater: (state: CartState) => CartState) => void
  ): void {
    updateCartState((state) => ({
      ...state,
      syncQueue: [...state.syncQueue, action],
      lastUpdated: Date.now(),
    }));
  }

  /**
   * Force immediate sync (for critical events)
   */
  async forceSync(
    getCartState: () => CartState,
    updateCartState: (updater: (state: CartState) => CartState) => void
  ): Promise<void> {
    if (this.syncInProgress) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Force sync called but sync already in progress, skipping');
      }
      return;
    }
    
    this.cancelSync();
    await this.performSync(getCartState, updateCartState);
  }
}

export const cartSyncManager = new CartSyncManager();
