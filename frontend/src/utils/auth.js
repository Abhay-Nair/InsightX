/**
 * Secure authentication utilities for InsightX
 * Implements secure token storage and management
 */

// Secure token storage using sessionStorage (more secure than localStorage)
// In production, consider using httpOnly cookies for maximum security
const TOKEN_KEY = 'insightx_access_token';
const REFRESH_TOKEN_KEY = 'insightx_refresh_token';
const USER_KEY = 'insightx_user';

export const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error accessing token storage:', error);
    return null;
  }
};

export const getRefreshToken = () => {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error accessing refresh token storage:', error);
    return null;
  }
};

export const saveTokens = (accessToken, refreshToken, user) => {
  try {
    if (accessToken) {
      sessionStorage.setItem(TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (user) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw new Error('Failed to save authentication data');
  }
};

export const getUser = () => {
  try {
    const userStr = sessionStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const clearAuth = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
};

export const logout = async () => {
  try {
    // Call logout API to revoke tokens server-side
    const token = getToken();
    const refreshToken = getRefreshToken();
    
    if (token) {
      try {
        // Import api here to avoid circular dependency
        const { default: api } = await import('../api/api.js');
        await api.post('/auth/logout', {
          refresh_token: refreshToken
        });
      } catch (error) {
        console.warn('Server logout failed:', error);
        // Continue with client-side logout even if server call fails
      }
    }
    
    // Clear client-side storage
    clearAuth();
    
    // Redirect to login
    window.location.href = "/login";
  } catch (error) {
    console.error('Logout error:', error);
    // Ensure cleanup even if there's an error
    clearAuth();
    window.location.href = "/login";
  }
};

// Token expiration check
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode JWT payload (without verification - just for expiration check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Auto-logout on token expiration
export const checkTokenExpiration = () => {
  const token = getToken();
  
  if (token && isTokenExpired(token)) {
    console.warn('Token expired, logging out...');
    logout();
    return false;
  }
  
  return true;
};

// Set up automatic token expiration checking
let tokenCheckInterval;

export const startTokenExpirationCheck = () => {
  // Check every 5 minutes
  tokenCheckInterval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
};

export const stopTokenExpirationCheck = () => {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
    tokenCheckInterval = null;
  }
};

// Initialize token checking when module loads
if (typeof window !== 'undefined') {
  startTokenExpirationCheck();
  
  // Check on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkTokenExpiration();
    }
  });
}
