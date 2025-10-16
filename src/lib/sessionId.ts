/**
 * Session ID management for guest users
 */

const SESSION_ID_KEY = 'sessionId';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create a session ID for guest users
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return generateSessionId();
  }

  try {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    
    return sessionId;
  } catch (error) {
    // Fallback if localStorage is not available
    console.warn('localStorage not available, using temporary session ID');
    return generateSessionId();
  }
}

/**
 * Get existing session ID (returns null if not found)
 */
export function getSessionId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(SESSION_ID_KEY);
  } catch (error) {
    return null;
  }
}

/**
 * Clear session ID (for logout or cart clear)
 */
export function clearSessionId(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
    console.warn('Failed to clear session ID from localStorage');
  }
}
