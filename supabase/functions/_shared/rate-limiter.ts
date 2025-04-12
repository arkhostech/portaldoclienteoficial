
// Simple rate limiting implementation using in-memory cache
// Note: This provides basic protection but will reset on function restart

// Configure rate limits
const MAX_REQUESTS_PER_MINUTE = 10;
const requestCache = new Map<string, { count: number, timestamp: number }>();

export function checkRateLimit(userId: string): { allowed: boolean, message?: string } {
  const now = Date.now();
  const minute = 60 * 1000; // milliseconds in a minute
  
  // Get current request data for this user
  const userData = requestCache.get(userId);
  
  if (!userData) {
    // First request from this user
    requestCache.set(userId, { count: 1, timestamp: now });
    return { allowed: true };
  }
  
  // If timestamp is older than a minute, reset the counter
  if (now - userData.timestamp > minute) {
    requestCache.set(userId, { count: 1, timestamp: now });
    return { allowed: true };
  }
  
  // If under the limit, increment the counter
  if (userData.count < MAX_REQUESTS_PER_MINUTE) {
    requestCache.set(userId, { 
      count: userData.count + 1, 
      timestamp: userData.timestamp 
    });
    return { allowed: true };
  }
  
  // Rate limit exceeded
  return { 
    allowed: false, 
    message: `Rate limit exceeded. Try again later.` 
  };
}
