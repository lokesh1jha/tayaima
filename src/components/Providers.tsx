"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawerProvider } from "@/components/cart/CartDrawerProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <CartProvider>
          <CartDrawerProvider>
            {children}
          </CartDrawerProvider>
        </CartProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}