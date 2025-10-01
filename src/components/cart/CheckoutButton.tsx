'use client';

import { useState } from 'react';
import { useCheckoutSync } from '@/hooks/useCheckoutSync';
import { useCartDrawer } from './CartDrawerProvider';
import Button from '@/components/ui/Button';
import { CartSyncIndicator } from './CartSyncIndicator';
import { toast } from 'sonner';

interface CheckoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const CheckoutButton = ({
  className,
  children = 'Proceed to Checkout',
}: CheckoutButtonProps) => {
  const {
    proceedToCheckout,
    canProceedToCheckout,
    isCheckoutReady,
    checkoutTotal,
    checkoutItems,
  } = useCheckoutSync();
  
  const { closeCart } = useCartDrawer();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!canProceedToCheckout || isProcessing) {
      if (!canProceedToCheckout) {
        toast.error('Cannot proceed to checkout at this time');
      }
      return;
    }

    setIsProcessing(true);

    try {
      await proceedToCheckout();
      // Close cart drawer after successful checkout navigation
      closeCart();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to proceed to checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <Button disabled className={className}>
        Cart is Empty
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleCheckout}
        disabled={!canProceedToCheckout || isProcessing}
        className={className}
      >
        {isProcessing ? 'Processing...' : children}
      </Button>
      
      {!isCheckoutReady && <CartSyncIndicator />}
      
      {checkoutTotal > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Total: ₹{(checkoutTotal / 100).toFixed(2)}
        </div>
      )}
    </div>
  );
};
