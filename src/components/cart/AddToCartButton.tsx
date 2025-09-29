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
    // Extract responsive classes from the passed className
    const isCompact = className?.includes('h-8 text-xs') && !className?.includes('sm:h-9');
    
    return (
      <div className={`flex items-center justify-center ${isCompact ? 'gap-1' : 'gap-2'} ${className?.replace(/h-\d+|text-\w+|w-full/g, '').trim()}`}>
        <Button
          variant="secondary"
          onClick={() => handleQuantityChange(currentQuantity - 1)}
          disabled={isButtonDisabled}
          className={`p-0 ${isCompact ? 'h-8 w-8 text-xs' : 'h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm'}`}
        >
          -
        </Button>
        
        <span className={`text-center font-medium ${isCompact ? 'min-w-[2rem] text-xs px-2' : 'min-w-[2.5rem] text-xs sm:text-sm px-2 sm:px-3'}`}>
          {currentQuantity}
        </span>
        
        <Button
          variant="secondary"
          onClick={() => handleQuantityChange(currentQuantity + 1)}
          disabled={isButtonDisabled}
          className={`p-0 ${isCompact ? 'h-8 w-8 text-xs' : 'h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm'}`}
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
