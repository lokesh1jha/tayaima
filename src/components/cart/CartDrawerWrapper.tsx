'use client';

import CartDrawer from "@/components/CartDrawer";
import { useCartDrawer } from "./CartDrawerProvider";

export const CartDrawerWrapper = () => {
  const { isOpen, closeCart } = useCartDrawer();

  return <CartDrawer isOpen={isOpen} closeCart={closeCart} />;
};
