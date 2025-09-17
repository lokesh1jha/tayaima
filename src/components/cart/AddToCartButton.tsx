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
  const { addToCart, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);

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
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const isButtonDisabled = disabled || isAdding || isLoading;

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
