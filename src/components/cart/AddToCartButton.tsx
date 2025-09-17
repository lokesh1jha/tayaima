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
  maxStock: number;
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
  maxStock,
  imageUrl,
  className,
  disabled,
  children = 'Add to Cart',
}: AddToCartButtonProps) => {
  const { addToCart, getItemQuantity, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const currentQuantity = getItemQuantity(productId, variantId);
  const canAddMore = currentQuantity < maxStock;

  const handleAddToCart = async () => {
    if (!canAddMore) {
      toast.error('Maximum stock reached for this item');
      return;
    }

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
        maxStock,
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

  const isButtonDisabled = disabled || isAdding || isLoading || !canAddMore;

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
