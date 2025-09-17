'use client';

import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { CartItemQuantity } from '@/components/cart/CartItemQuantity';
import { CartSyncIndicator } from '@/components/cart/CartSyncIndicator';
import { CheckoutButton } from '@/components/cart/CheckoutButton';
import { useCart } from '@/hooks/useCart';
import { useCartDrawer } from '@/components/cart/CartDrawerProvider';
import Button from '@/components/ui/Button';

/**
 * Example component demonstrating how to use the new cart system
 * This shows all the main cart functionality in one place
 */
export const CartSystemExample = () => {
  const { items, total, itemCount, clearCart, syncStatus } = useCart();
  const { openCart, toggleCart } = useCartDrawer();

  // Example product data
  const exampleProduct = {
    productId: 'prod-123',
    variantId: 'var-456',
    productName: 'Fresh Tomatoes',
    variantUnit: 'KG',
    variantAmount: 1,
    price: 8000, // 80.00 INR in paise
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&h=500&fit=crop'
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Cart System Demo</h1>
      
      {/* Cart Status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Cart Status</h2>
        <div className="space-y-2 text-sm">
          <div>Items: {itemCount}</div>
          <div>Total: ₹{(total / 100).toFixed(2)}</div>
          <div>Sync Status: {syncStatus}</div>
        </div>
        <CartSyncIndicator />
      </div>

      {/* Add to Cart Example */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Add Product to Cart</h2>
        <div className="flex items-center gap-4">
          <div>
            <div className="font-medium">{exampleProduct.productName}</div>
            <div className="text-sm text-gray-600">
              {exampleProduct.variantAmount} {exampleProduct.variantUnit} - ₹{(exampleProduct.price / 100).toFixed(2)}
            </div>
          </div>
          <AddToCartButton
            productId={exampleProduct.productId}
            variantId={exampleProduct.variantId}
            productName={exampleProduct.productName}
            variantUnit={exampleProduct.variantUnit}
            variantAmount={exampleProduct.variantAmount}
            price={exampleProduct.price}
            imageUrl={exampleProduct.imageUrl}
          />
        </div>
      </div>

      {/* Cart Items */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Cart Items</h2>
        {items.length === 0 ? (
          <div className="text-gray-500">No items in cart</div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded">
                <div>
                  <div className="font-medium">{item.productName}</div>
                  <div className="text-sm text-gray-600">
                    {item.variantAmount} {item.variantUnit} × {item.quantity}
                  </div>
                </div>
                <CartItemQuantity
                  itemId={item.id}
                  productId={item.productId}
                  variantId={item.variantId}
                  currentQuantity={item.quantity}
                  productName={item.productName}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Actions */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h2 className="text-lg font-semibold">Cart Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openCart} variant="secondary">
            Open Cart Drawer
          </Button>
          <Button onClick={toggleCart} variant="secondary">
            Toggle Cart Drawer
          </Button>
          <Button 
            onClick={clearCart} 
            variant="ghost"
            disabled={items.length === 0}
            className="text-red-600 hover:text-red-700"
          >
            Clear Cart
          </Button>
        </div>
        <CheckoutButton />
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">How to Use</h2>
        <div className="text-sm space-y-2">
          <p><strong>Add to Cart:</strong> Click "Add to Cart" to add items</p>
          <p><strong>Quantity Controls:</strong> Use +/- buttons or Remove button in cart items</p>
          <p><strong>Cart Drawer:</strong> Click cart icon in navbar or "Open Cart Drawer" button</p>
          <p><strong>Checkout:</strong> Click "Proceed to Checkout" (forces sync before navigation)</p>
          <p><strong>Auto Sync:</strong> Cart syncs automatically after 3 seconds of inactivity</p>
          <p><strong>Force Sync:</strong> Happens on login/logout, checkout, and page close</p>
        </div>
      </div>
    </div>
  );
};
