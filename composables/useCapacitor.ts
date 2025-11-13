import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useCapacitor = () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform(); // 'ios', 'android', or 'web'

  // Check if running on mobile (SSR-safe)
  const isMobile = computed(() => {
    if (process.server) return false;
    if (typeof navigator === 'undefined') return false;
    return isNative || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  });

  // Initialize app plugins
  const initializeApp = async () => {
    if (process.server) return; // Don't run on server
    if (!isNative) return;

    try {
      // Hide splash screen
      await SplashScreen.hide();

      // Set status bar style
      if (platform === 'ios' || platform === 'android') {
        await StatusBar.setStyle({ style: Style.Dark });
        if (platform === 'android') {
          await StatusBar.setBackgroundColor({ color: '#8a2be2' });
        }
      }

      // Handle back button on Android
      if (platform === 'android') {
        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });
      }

      // Handle app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active:', isActive);
      });

    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  // Haptic feedback
  const hapticImpact = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (process.server) return; // Don't run on server
    if (!isNative) return;
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  };

  const hapticVibrate = async () => {
    if (process.server) return; // Don't run on server
    if (!isNative) return;
    try {
      await Haptics.vibrate();
    } catch (error) {
      console.error('Haptic vibration error:', error);
    }
  };

  // Keyboard helpers
  const hideKeyboard = async () => {
    if (process.server) return; // Don't run on server
    if (!isNative) return;
    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Hide keyboard error:', error);
    }
  };

  const showKeyboard = async () => {
    if (process.server) return; // Don't run on server
    if (!isNative) return;
    try {
      await Keyboard.show();
    } catch (error) {
      console.error('Show keyboard error:', error);
    }
  };

  // Status bar helpers
  const setStatusBarStyle = async (style: Style) => {
    if (process.server) return; // Don't run on server
    if (!isNative) return;
    try {
      await StatusBar.setStyle({ style });
    } catch (error) {
      console.error('Set status bar style error:', error);
    }
  };

  const hideStatusBar = async () => {
    if (process.server) return; // Don't run on server
    if (!isNative) return;
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Hide status bar error:', error);
    }
  };

  const showStatusBar = async () => {
    if (process.server) return; // Don't run on server
    if (!isNative) return;
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Show status bar error:', error);
    }
  };

  return {
    isNative,
    platform,
    isMobile,
    initializeApp,
    hapticImpact,
    hapticVibrate,
    hideKeyboard,
    showKeyboard,
    setStatusBarStyle,
    hideStatusBar,
    showStatusBar,
  };
};
