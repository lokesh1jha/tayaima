'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

interface CartItemQuantityProps {
  itemId: string;
  productId: string;
  variantId: string;
  currentQuantity: number;
  maxStock: number;
  productName: string;
}

export const CartItemQuantity = ({
  itemId,
  productId,
  variantId,
  currentQuantity,
  maxStock,
  productName,
}: CartItemQuantityProps) => {
  const { updateCartItem, removeFromCart, isLoading } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity === currentQuantity) return;
    
    if (newQuantity <= 0) {
      handleRemove();
      return;
    }

    if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }

    setIsUpdating(true);

    try {
      updateCartItem({ itemId, quantity: newQuantity });
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);

    try {
      removeFromCart(itemId);
      toast.success(`Removed ${productName} from cart`);
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  const canDecrease = currentQuantity > 1;
  const canIncrease = currentQuantity < maxStock;
  const isButtonDisabled = isUpdating || isLoading;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        onClick={() => handleQuantityChange(currentQuantity - 1)}
        disabled={!canDecrease || isButtonDisabled}
        className="h-8 w-8 p-0 text-sm"
      >
        -
      </Button>
      
      <span className="min-w-[2rem] text-center text-sm font-medium">
        {currentQuantity}
      </span>
      
      <Button
        variant="secondary"
        onClick={() => handleQuantityChange(currentQuantity + 1)}
        disabled={!canIncrease || isButtonDisabled}
        className="h-8 w-8 p-0 text-sm"
      >
        +
      </Button>
      
      <Button
        variant="ghost"
        onClick={handleRemove}
        disabled={isButtonDisabled}
        className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
      >
        Remove
      </Button>
    </div>
  );
};
