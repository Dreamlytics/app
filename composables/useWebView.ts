/**
 * Composable for WebView management in Capacitor app
 * Provides utilities for communication between native app and web content
 */

export const useWebView = () => {
  if (process.server) {
    return {
      isWebView: ref(false),
      sendMessage: () => {},
      onMessage: () => {},
      openExternal: () => {},
    };
  }

  const isWebView = ref(false);

  // Detect if running inside a WebView
  const detectWebView = () => {
    if (typeof window === 'undefined') return false;
    
    // Check for Capacitor
    if (window.location.protocol === 'capacitor:') {
      return true;
    }
    
    // Check for common WebView user agents
    const ua = navigator.userAgent.toLowerCase();
    return (
      ua.includes('wv') ||
      ua.includes('webview') ||
      (ua.includes('android') && !ua.includes('chrome')) ||
      (window as any).AndroidInterface !== undefined
    );
  };

  // Send message to parent (if in iframe)
  const sendMessage = (type: string, data: any) => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type, data, timestamp: Date.now() }, '*');
    }
  };

  // Listen for messages from parent
  const onMessage = (callback: (event: MessageEvent) => void) => {
    window.addEventListener('message', callback);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('message', callback);
    };
  };

  // Open URL in external browser (outside WebView)
  const openExternal = async (url: string) => {
    try {
      // Try to use Capacitor Browser plugin if available
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url });
    } catch (error) {
      // Fallback to window.open
      window.open(url, '_blank');
    }
  };

  // Initialize
  isWebView.value = detectWebView();

  return {
    isWebView,
    sendMessage,
    onMessage,
    openExternal,
  };
};

/**
 * Composable for handling native app features from web context
 */
export const useNativeFeatures = () => {
  if (process.server) {
    return {
      isNativeApp: ref(false),
      platform: ref('web'),
      shareContent: async () => {},
      showToast: async () => {},
    };
  }

  const { isWebView } = useWebView();
  const isNativeApp = ref(false);
  const platform = ref<'ios' | 'android' | 'web'>('web');

  // Detect platform
  const detectPlatform = () => {
    if (typeof window === 'undefined') return 'web';
    
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
      return 'ios';
    } else if (ua.includes('android')) {
      return 'android';
    }
    return 'web';
  };

  // Share content using native share
  const shareContent = async (options: { title?: string; text?: string; url?: string }) => {
    try {
      if (navigator.share) {
        await navigator.share(options);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  };

  // Show native toast notification
  const showToast = async (message: string, duration: number = 2000) => {
    try {
      const { Toast } = await import('@capacitor/toast');
      await Toast.show({
        text: message,
        duration: duration === 2000 ? 'short' : 'long',
      });
    } catch (error) {
      // Fallback to console
      console.log('Toast:', message);
    }
  };

  // Initialize
  isNativeApp.value = isWebView.value;
  platform.value = detectPlatform();

  return {
    isNativeApp,
    platform,
    shareContent,
    showToast,
  };
};
