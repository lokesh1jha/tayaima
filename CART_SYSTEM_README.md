# Shopping Cart System

A comprehensive, production-ready shopping cart system built with Next.js, React, Zustand, and TypeScript. Features debounced server synchronization, offline support, retry mechanisms, and seamless user experience.

## 🚀 Features

### Core Functionality
- ✅ **Zustand State Management** - Fast, lightweight state management
- ✅ **Persistent Storage** - Cart survives page reloads using localStorage
- ✅ **Debounced Sync** - 3-5 second delay before server sync to reduce API calls
- ✅ **Force Sync** - Immediate sync on critical events (checkout, auth changes, page unload)
- ✅ **Retry Mechanism** - Exponential backoff retry with queue management
- ✅ **Offline Support** - Changes queued when offline, synced when back online
- ✅ **TypeScript** - Fully typed for better developer experience
- ✅ **Error Handling** - Comprehensive error handling and user feedback

### User Experience
- ✅ **Real-time Updates** - Instant UI updates with background sync
- ✅ **Loading States** - Visual feedback during sync operations
- ✅ **Stock Validation** - Prevents adding more items than available
- ✅ **Toast Notifications** - User feedback for all cart operations
- ✅ **Responsive Design** - Works on all device sizes

## 📁 File Structure

```
src/
├── types/cart.ts                          # TypeScript type definitions
├── stores/useCartStore.ts                 # Zustand store with persistence
├── lib/
│   ├── cartStorage.ts                     # localStorage management
│   └── cartSync.ts                        # Sync manager with retry logic
├── hooks/
│   ├── useCart.ts                         # Main cart hook
│   ├── useCartSync.ts                     # Auto-sync hook
│   └── useCheckoutSync.ts                 # Checkout-specific operations
├── components/cart/
│   ├── CartProvider.tsx                   # Cart context provider
│   ├── CartDrawerProvider.tsx             # Drawer state management
│   ├── CartDrawerWrapper.tsx              # Drawer wrapper component
│   ├── AddToCartButton.tsx                # Add to cart button
│   ├── CartItemQuantity.tsx               # Quantity controls
│   ├── CartSyncIndicator.tsx              # Sync status indicator
│   └── CheckoutButton.tsx                 # Checkout button with force sync
└── app/api/cart/sync/route.ts             # API endpoint for cart sync
```

## 🛠️ Setup and Installation

### 1. Install Dependencies

The cart system uses the following packages (already in your project):

```json
{
  "zustand": "^4.x.x",
  "next-auth": "^4.x.x",
  "sonner": "^2.x.x",
  "zod": "^3.x.x"
}
```

### 2. Database Schema

Ensure your Prisma schema includes cart tables:

```prisma
model Cart {
  id        String     @id @default(cuid())
  userId    String     @unique
  total     Int        @default(0)
  itemCount Int        @default(0)
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model CartItem {
  id        String         @id @default(cuid())
  cartId    String
  productId String
  variantId String
  quantity  Int
  price     Int
  cart      Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product        @relation(fields: [productId], references: [id])
  variant   ProductVariant @relation(fields: [variantId], references: [id])
  @@unique([cartId, productId, variantId])
}
```

### 3. Update Your Layout

Add the cart providers to your root layout:

```tsx
// app/layout.tsx
import { CartDrawerWrapper } from "@/components/cart/CartDrawerWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers> {/* This now includes CartProvider and CartDrawerProvider */}
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <CartDrawerWrapper />
          <Toast />
        </Providers>
      </body>
    </html>
  );
}
```

## 📚 Usage Examples

### Basic Cart Operations

```tsx
import { useCart } from '@/hooks/useCart';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

function ProductPage() {
  const { items, total, itemCount, clearCart } = useCart();

  return (
    <div>
      <AddToCartButton
        productId="prod-123"
        variantId="var-456"
        productName="Fresh Tomatoes"
        variantUnit="KG"
        variantAmount={1}
        price={8000} // Price in paise (₹80.00)
        maxStock={50}
        imageUrl="/tomatoes.jpg"
      />
      
      <div>Cart Total: ₹{(total / 100).toFixed(2)}</div>
      <div>Items: {itemCount}</div>
    </div>
  );
}
```

### Cart Item Management

```tsx
import { CartItemQuantity } from '@/components/cart/CartItemQuantity';

function CartItem({ item }) {
  return (
    <div className="cart-item">
      <h3>{item.productName}</h3>
      <CartItemQuantity
        itemId={item.id}
        productId={item.productId}
        variantId={item.variantId}
        currentQuantity={item.quantity}
        maxStock={item.maxStock}
        productName={item.productName}
      />
    </div>
  );
}
```

### Checkout Flow

```tsx
import { CheckoutButton } from '@/components/cart/CheckoutButton';
import { CartSyncIndicator } from '@/components/cart/CartSyncIndicator';

function CheckoutPage() {
  return (
    <div>
      <CartSyncIndicator />
      <CheckoutButton>
        Complete Purchase
      </CheckoutButton>
    </div>
  );
}
```

### Manual Cart Operations

```tsx
import { useCart } from '@/hooks/useCart';

function ManualCartControls() {
  const { addToCart, updateCartItem, removeFromCart, forceSync } = useCart();

  const handleAddItem = () => {
    addToCart({
      productId: 'prod-123',
      variantId: 'var-456',
      productName: 'Fresh Tomatoes',
      variantUnit: 'KG',
      variantAmount: 1,
      price: 8000,
      quantity: 1,
      maxStock: 50,
      imageUrl: '/tomatoes.jpg'
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateCartItem({ itemId, quantity: newQuantity });
  };

  const handleForceSync = async () => {
    await forceSync();
  };

  return (
    <div>
      <button onClick={handleAddItem}>Add Item</button>
      <button onClick={() => handleUpdateQuantity('item-1', 3)}>Update Quantity</button>
      <button onClick={handleForceSync}>Force Sync</button>
    </div>
  );
}
```

## ⚙️ Configuration

### Sync Settings

Modify sync behavior in `src/lib/cartSync.ts`:

```typescript
// Debounce delay (milliseconds)
private readonly SYNC_DELAY = 3000; // 3 seconds

// Retry configuration
private readonly RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  baseDelay: 1000,      // 1 second base delay
  maxDelay: 30000,      // 30 seconds max delay
};
```

### Storage Settings

Modify storage behavior in `src/lib/cartStorage.ts`:

```typescript
// Cart data expiration (7 days)
const maxAge = 7 * 24 * 60 * 60 * 1000;

// Storage version for compatibility
const CART_VERSION = '1.0';
```

## 🔄 Sync Behavior

### Automatic Sync Triggers
1. **Debounced Sync**: After 3 seconds of inactivity following cart changes
2. **Network Recovery**: When device comes back online
3. **Retry Logic**: Failed syncs are retried with exponential backoff

### Force Sync Triggers
1. **User Authentication**: Login/logout state changes
2. **Checkout Process**: Before proceeding to checkout
3. **Page Unload**: Before user leaves the page
4. **Manual Trigger**: Via `forceSync()` method

### Sync States
- `idle`: No sync in progress
- `syncing`: Currently syncing to server
- `retrying`: Retrying failed sync
- `error`: Sync failed after max retries

## 🛡️ Error Handling

### Client-Side Errors
- Network failures are queued and retried
- Invalid data is validated before sync
- User feedback via toast notifications
- Graceful degradation when offline

### Server-Side Validation
- Stock availability checking
- Product/variant existence validation
- User authentication verification
- Data consistency checks

## 🔍 Debugging

### Development Mode
The cart system includes debug logging in development:

```typescript
// Console logs for cart changes
console.log('Cart items updated:', items);
console.log('Cart sync status:', syncStatus);
```

### Monitoring Sync Status

```tsx
import { useCart } from '@/hooks/useCart';

function DebugPanel() {
  const { syncStatus, items } = useCart();
  
  return (
    <div className="debug-panel">
      <div>Sync Status: {syncStatus}</div>
      <div>Items Count: {items.length}</div>
      <div>Last Updated: {new Date().toLocaleString()}</div>
    </div>
  );
}
```

## 🚀 Production Considerations

### Performance
- Debounced API calls reduce server load
- Optimistic UI updates for instant feedback
- Efficient re-renders with Zustand subscriptions
- Persistent storage prevents data loss

### Scalability
- Modular architecture for easy extension
- TypeScript ensures type safety at scale
- Separation of concerns between components
- Configurable retry and timeout settings

### Security
- Server-side validation of all cart operations
- User authentication required for sync
- Data sanitization and validation
- CSRF protection via Next.js

### Monitoring
- Failed sync attempts are logged
- Retry counts and patterns tracked
- User feedback for all error states
- Network status monitoring

## 📖 API Reference

### Cart Store Methods
- `addItem(params: AddToCartParams)` - Add item to cart
- `removeItem(itemId: string)` - Remove item from cart
- `updateItem(params: UpdateCartItemParams)` - Update item quantity
- `clearCart()` - Clear all items
- `syncCart()` - Trigger debounced sync
- `forceSync()` - Trigger immediate sync

### Hook Returns
- `items: CartItem[]` - Array of cart items
- `total: number` - Total price in paise
- `itemCount: number` - Total number of items
- `syncStatus: SyncStatus` - Current sync state
- `isLoading: boolean` - Is sync in progress
- `hasError: boolean` - Has sync error
- `isRetrying: boolean` - Is retrying sync

## 🤝 Contributing

When extending the cart system:

1. **Types First**: Add TypeScript types for new features
2. **Test Thoroughly**: Test offline scenarios and edge cases
3. **Error Handling**: Include proper error handling and user feedback
4. **Documentation**: Update this README with new features
5. **Performance**: Consider impact on sync frequency and payload size

## 📝 License

This cart system is part of the TaYaima e-commerce platform and follows the same license terms.
