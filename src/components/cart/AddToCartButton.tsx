'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { AddToCartParams } from '@/types/cart';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  productId: string;
  variantId: string;
  productName: string;
  variantUnit: string;
  variantAmount: number;
  price: number;
  imageUrl?: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const AddToCartButton = ({
  productId,
  variantId,
  productName,
  variantUnit,
  variantAmount,
  price,
  imageUrl,
  className,
  disabled,
  children = 'Add to Cart',
}: AddToCartButtonProps) => {
  const { addToCart, updateCartItem, removeFromCart, getItemQuantity, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentQuantity = getItemQuantity(productId, variantId);
  const isInCart = currentQuantity > 0;

  const handleAddToCart = async () => {
    setIsAdding(true);

    try {
      const params: AddToCartParams = {
        productId,
        variantId,
        productName,
        variantUnit,
        variantAmount,
        price,
        quantity: 1,
        imageUrl,
      };

      addToCart(params);
      
      toast.success(`Added ${productName} to cart`);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to add to cart:', error);
      }
      toast.error('Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity === currentQuantity) return;
    
    if (newQuantity <= 0) {
      handleRemove();
      return;
    }

    setIsUpdating(true);

    try {
      const itemId = `${productId}-${variantId}`;
      updateCartItem({ itemId, quantity: newQuantity });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update quantity:', error);
      }
      toast.error('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);

    try {
      const itemId = `${productId}-${variantId}`;
      removeFromCart(itemId);
      toast.success(`Removed ${productName} from cart`);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to remove item:', error);
      }
      toast.error('Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  const isButtonDisabled = disabled || isAdding || isUpdating || isLoading;

  // If item is in cart, show quantity controls
  if (isInCart) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Button
          variant="secondary"
          onClick={() => handleQuantityChange(currentQuantity - 1)}
          disabled={isButtonDisabled}
          className="h-8 w-8 p-0 text-sm"
        >
          -
        </Button>
        
        <span className="min-w-[2rem] text-center text-sm font-medium px-2">
          {currentQuantity}
        </span>
        
        <Button
          variant="secondary"
          onClick={() => handleQuantityChange(currentQuantity + 1)}
          disabled={isButtonDisabled}
          className="h-8 w-8 p-0 text-sm"
        >
          +
        </Button>
      </div>
    );
  }

  // If item is not in cart, show Add button
  return (
    <Button
      onClick={handleAddToCart}
      disabled={isButtonDisabled}
      className={className}
    >
      {isAdding ? 'Adding...' : children}
    </Button>
  );
};
