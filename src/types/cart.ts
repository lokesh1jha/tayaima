export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantUnit: string;
  variantAmount: number;
  price: number;
  quantity: number;
  imageUrl?: string;
  maxStock: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  lastUpdated: number;
  syncStatus: 'idle' | 'syncing' | 'error' | 'retrying';
  syncQueue: CartSyncAction[];
  retryCount: number;
  lastSyncAttempt?: number;
}

export interface CartSyncAction {
  type: 'add' | 'remove' | 'update' | 'clear';
  timestamp: number;
  payload?: any;
}

export interface CartSyncRequest {
  items: CartItem[];
  total: number;
  itemCount: number;
  lastUpdated: number;
}

export interface CartSyncResponse {
  success: boolean;
  message?: string;
  updatedItems?: CartItem[];
}

export interface AddToCartParams {
  productId: string;
  variantId: string;
  productName: string;
  variantUnit: string;
  variantAmount: number;
  price: number;
  quantity: number;
  imageUrl?: string;
  maxStock: number;
}

export interface UpdateCartItemParams {
  itemId: string;
  quantity: number;
}
