export interface CachedSummary {
  summary: string;
  insights: string;
  timestamp: number;
  documentUrl: string;
}

const CACHE_PREFIX = 'ai_summary_';
const CACHE_EXPIRY_DAYS = 30; // Cache for 30 days

export const summaryCache = {
  // Generate cache key from document URL
  getKey: (documentUrl: string): string => {
    return CACHE_PREFIX + btoa(documentUrl).replace(/[^a-zA-Z0-9]/g, '');
  },

  // Get cached summary
  get: (documentUrl: string): CachedSummary | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const key = summaryCache.getKey(documentUrl);
      const cached = localStorage.getItem(key);
      
      if (!cached) return null;
      
      const data: CachedSummary = JSON.parse(cached);
      const now = Date.now();
      const expiryTime = data.timestamp + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      
      // Check if cache has expired
      if (now > expiryTime) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  },

  // Set cached summary
  set: (documentUrl: string, summary: string, insights: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const key = summaryCache.getKey(documentUrl);
      const data: CachedSummary = {
        summary,
        insights,
        timestamp: Date.now(),
        documentUrl
      };
      
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  },

  // Check if summary is cached
  has: (documentUrl: string): boolean => {
    return summaryCache.get(documentUrl) !== null;
  },

  // Clear all cached summaries
  clear: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  // Get cache statistics
  getStats: (): { total: number; size: number } => {
    if (typeof window === 'undefined') return { total: 0, size: 0 };
    
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      const total = cacheKeys.length;
      const size = cacheKeys.reduce((acc, key) => {
        const item = localStorage.getItem(key);
        return acc + (item ? item.length : 0);
      }, 0);
      
      return { total, size };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { total: 0, size: 0 };
    }
  }
}; 