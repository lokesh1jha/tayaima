import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

/**
 * Enhanced auth hook that uses React Query for better caching
 * Wraps NextAuth's useSession with React Query benefits
 */
export function useAuth() {
  const { data: session, status } = useSession();
  
  // Use React Query to cache and manage auth state
  return useQuery({
    queryKey: ['auth', session?.user?.id],
    queryFn: () => {
      if (!session?.user) return null;
      
      return {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: (session.user as any).role || 'USER',
        },
        isAuthenticated: true,
        isAdmin: (session.user as any).role === 'ADMIN',
        isLoading: false, // When we reach here, loading is complete
      };
    },
    enabled: status !== 'loading', // Only run when session is loaded
    staleTime: 5 * 60 * 1000, // 5 minutes - auth state doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    // Return cached data immediately while revalidating
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Add loading state from the query itself
    initialData: status === 'loading' ? undefined : null,
  });
}

/**
 * Hook for checking if user is admin
 */
export function useIsAdmin() {
  const { data: auth } = useAuth();
  return auth?.isAdmin ?? false;
}

/**
 * Hook for getting current user
 */
export function useCurrentUser() {
  const { data: auth } = useAuth();
  return auth?.user ?? null;
}
