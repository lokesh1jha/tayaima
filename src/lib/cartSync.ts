import { CartState, CartSyncRequest, CartSyncResponse, CartSyncAction } from '@/types/cart';

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
      console.log('Network back online, attempting to sync cart');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network offline, cart sync will be queued');
    });
  }

  /**
   * Schedule a debounced sync
   */
  scheduleSync(
    getCartState: () => CartState,
    updateCartState: (updater: (state: CartState) => CartState) => void,
    force = false
  ): void {
    if (!force && this.syncTimeoutId) {
      clearTimeout(this.syncTimeoutId);
    }

    const delay = force ? 0 : this.SYNC_DELAY;

    this.syncTimeoutId = setTimeout(async () => {
      await this.performSync(getCartState, updateCartState);
    }, delay);
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

    this.syncInProgress = true;

    // Update sync status
    updateCartState((state) => ({
      ...state,
      syncStatus: 'syncing',
      lastSyncAttempt: Date.now(),
    }));

    try {
      const success = await this.syncToServer(cartState);

      if (success) {
        // Clear sync queue on successful sync
        updateCartState((state) => ({
          ...state,
          syncStatus: 'idle',
          syncQueue: [],
          retryCount: 0,
        }));
        console.log('Cart synced successfully');
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      console.error('Cart sync failed:', error);
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

    console.log(`Retrying cart sync in ${delay}ms (attempt ${newRetryCount})`);

    setTimeout(() => {
      this.performSync(getCartState, updateCartState);
    }, delay);
  }

  /**
   * Sync cart data to server
   */
  private async syncToServer(cartState: CartState): Promise<boolean> {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CartSyncResponse = await response.json();
      return result.success;
    } catch (error) {
      console.error('Server sync failed:', error);
      return false;
    }
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
    this.cancelSync();
    await this.performSync(getCartState, updateCartState);
  }
}

export const cartSyncManager = new CartSyncManager();
