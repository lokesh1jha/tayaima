/**
 * Utility functions for handling session expiry
 */

/**
 * Marks session as expired and triggers logout
 * This function handles the complete flow of session expiry
 */
export async function handleSessionExpiry(): Promise<void> {
  // Store session expiry flag in sessionStorage
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('sessionExpired', 'true');
  }
  
  // Import signOut dynamically to avoid circular dependencies
  const { signOut } = await import('next-auth/react');
  await signOut({ redirect: false });
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Checks if session expired flag is set and clears it
 * Returns true if session was expired
 */
export function checkAndClearSessionExpiry(): boolean {
  if (typeof window === 'undefined') return false;
  
  const sessionExpired = sessionStorage.getItem('sessionExpired');
  if (sessionExpired === 'true') {
    sessionStorage.removeItem('sessionExpired');
    return true;
  }
  return false;
}

/**
 * Checks if an API response indicates a stale session
 */
export function isStaleSessionError(response: Response, errorData?: any): boolean {
  return response.status === 401 && errorData?.code === 'STALE_SESSION';
}
