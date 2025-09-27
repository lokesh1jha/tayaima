import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';

interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number;
  variant: {
    id: string;
    unit: string;
    amount: number;
    price: number;
    stock: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
    };
  };
}

interface Cart {
  id: string;
  items: CartItem[];
}

/**
 * Fetch cart data using secure POST endpoint
 */
async function fetchCart(): Promise<Cart | null> {
  const sessionId = localStorage.getItem("sessionId");
  
  const response = await fetch('/api/cart/fetch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch cart: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * React Query hook for cart data
 */
export function useCartQuery() {
  const { data: auth } = useAuth();
  
  return useQuery({
    queryKey: ['cart', auth?.user?.id || 'guest'],
    queryFn: fetchCart,
    staleTime: 2 * 60 * 1000, // 2 minutes - cart changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Mutation for adding items to cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { data: auth } = useAuth();
  
  return useMutation({
    mutationFn: async (item: {
      productId: string;
      variantId: string;
      quantity: number;
    }) => {
      const sessionId = localStorage.getItem("sessionId");
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          sessionId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate cart query to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: ['cart', auth?.user?.id || 'guest']
      });
    },
  });
}

/**
 * Mutation for updating cart item quantity
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const { data: auth } = useAuth();
  
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const sessionId = localStorage.getItem("sessionId");
      
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          quantity,
          sessionId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cart');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cart', auth?.user?.id || 'guest']
      });
    },
  });
}

/**
 * Mutation for removing items from cart
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const { data: auth } = useAuth();
  
  return useMutation({
    mutationFn: async (itemId: string) => {
      const sessionId = localStorage.getItem("sessionId");
      
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          sessionId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['cart', auth?.user?.id || 'guest']
      });
    },
  });
}
