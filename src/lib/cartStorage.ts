import { CartState, CartItem } from '@/types/cart';

const CART_STORAGE_KEY = 'tayaima_cart';
const CART_VERSION = '1.0';

interface StoredCartData {
  version: string;
  data: CartState;
  timestamp: number;
}

class CartStorage {
  private isClient = typeof window !== 'undefined';

  /**
   * Save cart state to localStorage
   */
  saveCart(cartState: CartState): void {
    if (!this.isClient) return;

    try {
      const storageData: StoredCartData = {
        version: CART_VERSION,
        data: cartState,
        timestamp: Date.now(),
      };

      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  /**
   * Load cart state from localStorage
   */
  loadCart(): CartState | null {
    if (!this.isClient) return null;

    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return null;

      const storageData: StoredCartData = JSON.parse(stored);

      // Check version compatibility
      if (storageData.version !== CART_VERSION) {
        console.warn('Cart storage version mismatch, clearing cart');
        this.clearCart();
        return null;
      }

      // Check if cart is not too old (7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
      if (Date.now() - storageData.timestamp > maxAge) {
        console.warn('Cart data is too old, clearing cart');
        this.clearCart();
        return null;
      }

      return storageData.data;
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      this.clearCart();
      return null;
    }
  }

  /**
   * Clear cart from localStorage
   */
  clearCart(): void {
    if (!this.isClient) return;

    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear cart from localStorage:', error);
    }
  }

  /**
   * Check if storage is available
   */
  isStorageAvailable(): boolean {
    if (!this.isClient) return false;

    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

export const cartStorage = new CartStorage();
