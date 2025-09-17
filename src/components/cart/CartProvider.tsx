'use client';

import { useEffect } from 'react';
import { useCartSync } from '@/hooks/useCartSync';

interface CartProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that sets up cart sync functionality
 * Should be placed high in the component tree, ideally in the root layout
 */
export const CartProvider = ({ children }: CartProviderProps) => {
  // Initialize cart sync hooks
  useCartSync();

  return <>{children}</>;
};
