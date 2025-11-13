/**
 * Composable for making API requests from mobile app
 * Handles CORS, authentication, and mobile-specific headers
 */

export const useMobileApi = () => {
  const config = useRuntimeConfig();

  // Determine the API base URL
  const getApiUrl = () => {
    if (process.server) {
      return config.public.apiBase;
    }

    // Check if running in Capacitor
    const isCapacitor = 
      window.location.protocol === 'capacitor:' ||
      window.location.protocol === 'ionic:';

    if (isCapacitor) {
      // In production Capacitor app, use the production API URL
      // For development, use localhost
      if (process.env.NODE_ENV === 'production') {
        return 'https://your-api-domain.com/api'; // TODO: Replace with your production API
      } else {
        // Development: use localhost
        return 'http://localhost:3000/api';
      }
    }

    // Regular web app
    return config.public.apiBase;
  };

  // Get platform information
  const getPlatformInfo = () => {
    if (process.server) return { platform: 'server', version: null };

    const ua = navigator.userAgent;
    let platform: 'ios' | 'android' | 'web' = 'web';

    if (/iPad|iPhone|iPod/.test(ua)) {
      platform = 'ios';
    } else if (/Android/.test(ua)) {
      platform = 'android';
    }

    // Try to get app version from Capacitor
    let version: string | null = null;
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      version = (window as any).Capacitor.appVersion || null;
    }

    return { platform, version };
  };

  // Make API request with mobile-specific headers
  const fetchApi = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const apiUrl = getApiUrl();
    const { platform, version } = getPlatformInfo();

    // Build headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add mobile-specific headers
    if (platform !== 'web') {
      headers['X-Platform'] = platform;
      if (version) {
        headers['X-App-Version'] = version;
      }
    }

    // Make the request
    const url = endpoint.startsWith('http') ? endpoint : `${apiUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Important for cookies/auth
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  };

  // Convenience methods
  const get = <T = any>(endpoint: string, options: RequestInit = {}) =>
    fetchApi<T>(endpoint, { ...options, method: 'GET' });

  const post = <T = any>(endpoint: string, data?: any, options: RequestInit = {}) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });

  const put = <T = any>(endpoint: string, data?: any, options: RequestInit = {}) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });

  const del = <T = any>(endpoint: string, options: RequestInit = {}) =>
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' });

  // Health check
  const checkHealth = () => get('/mobile/health');

  return {
    fetchApi,
    get,
    post,
    put,
    delete: del,
    checkHealth,
    getApiUrl,
    getPlatformInfo,
  };
};
