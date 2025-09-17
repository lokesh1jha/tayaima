import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { CartState, CartItem, AddToCartParams, UpdateCartItemParams, CartSyncAction } from '@/types/cart';
import { cartStorage } from '@/lib/cartStorage';
import { cartSyncManager } from '@/lib/cartSync';

interface CartStore extends CartState {
  // Actions
  addItem: (params: AddToCartParams) => void;
  removeItem: (itemId: string) => void;
  updateItem: (params: UpdateCartItemParams) => void;
  clearCart: () => void;
  syncCart: () => void;
  forceSync: () => Promise<void>;
  loadFromStorage: () => void;
  
  // Internal methods
  _updateTotals: () => void;
  _saveToStorage: () => void;
  _addSyncAction: (action: CartSyncAction) => void;
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  lastUpdated: Date.now(),
  syncStatus: 'idle',
  syncQueue: [],
  retryCount: 0,
};

export const useCartStore = create<CartStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    addItem: (params: AddToCartParams) => {
      const { productId, variantId, quantity } = params;
      const existingItemIndex = get().items.findIndex(
        item => item.productId === productId && item.variantId === variantId
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const existingItem = get().items[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        set(state => ({
          ...state,
          items: state.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: newQuantity }
              : item
          ),
        }));
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${productId}-${variantId}`,
          productId,
          variantId,
          productName: params.productName,
          variantUnit: params.variantUnit,
          variantAmount: params.variantAmount,
          price: params.price,
          quantity: quantity,
          imageUrl: params.imageUrl,
          maxStock: params.maxStock, // Keep for admin reference if provided
        };

        set(state => ({
          ...state,
          items: [...state.items, newItem],
        }));
      }

      get()._updateTotals();
      get()._saveToStorage();
      get()._addSyncAction({
        type: 'add',
        timestamp: Date.now(),
        payload: { productId, variantId, quantity },
      });
      get().syncCart();
    },

    removeItem: (itemId: string) => {
      set(state => ({
        ...state,
        items: state.items.filter(item => item.id !== itemId),
      }));

      get()._updateTotals();
      get()._saveToStorage();
      get()._addSyncAction({
        type: 'remove',
        timestamp: Date.now(),
        payload: { itemId },
      });
      get().syncCart();
    },

    updateItem: ({ itemId, quantity }: UpdateCartItemParams) => {
      if (quantity <= 0) {
        get().removeItem(itemId);
        return;
      }

      set(state => ({
        ...state,
        items: state.items.map(item =>
          item.id === itemId
            ? { ...item, quantity: quantity }
            : item
        ),
      }));

      get()._updateTotals();
      get()._saveToStorage();
      get()._addSyncAction({
        type: 'update',
        timestamp: Date.now(),
        payload: { itemId, quantity },
      });
      get().syncCart();
    },

    clearCart: () => {
      set({
        ...initialState,
        lastUpdated: Date.now(),
      });

      get()._saveToStorage();
      get()._addSyncAction({
        type: 'clear',
        timestamp: Date.now(),
      });
      get().syncCart();
    },

    syncCart: () => {
      cartSyncManager.scheduleSync(
        () => get(),
        (updater) => set(updater)
      );
    },

    forceSync: async () => {
      await cartSyncManager.forceSync(
        () => get(),
        (updater) => set(updater)
      );
    },

    loadFromStorage: () => {
      const storedCart = cartStorage.loadCart();
      if (storedCart) {
        set(storedCart);
        get()._updateTotals();
      }
    },

    _updateTotals: () => {
      const items = get().items;
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      set(state => ({
        ...state,
        total,
        itemCount,
        lastUpdated: Date.now(),
      }));
    },

    _saveToStorage: () => {
      cartStorage.saveCart(get());
    },

    _addSyncAction: (action: CartSyncAction) => {
      cartSyncManager.addSyncAction(action, (updater) => set(updater));
    },
  }))
);

// Load cart from storage on store creation (client-side only)
if (typeof window !== 'undefined') {
  useCartStore.getState().loadFromStorage();
}

// Subscribe to cart changes for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  useCartStore.subscribe(
    (state) => state.items,
    (items) => {
      console.log('Cart items updated:', items);
    }
  );

  useCartStore.subscribe(
    (state) => state.syncStatus,
    (syncStatus) => {
      console.log('Cart sync status:', syncStatus);
    }
  );
}
