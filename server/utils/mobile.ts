/**
 * Mobile-specific utilities for handling Capacitor requests
 */

import type { H3Event } from 'h3';
import { getRequestHeaders } from 'h3';

/**
 * Check if the request is coming from a Capacitor mobile app
 */
export const isMobileRequest = (event: H3Event): boolean => {
  const headers = getRequestHeaders(event);
  const origin = headers.origin || '';
  const userAgent = headers['user-agent'] || '';

  // Check for Capacitor-specific origins
  if (
    origin.startsWith('capacitor://') ||
    origin.startsWith('ionic://') ||
    origin === 'http://localhost' ||
    origin === 'https://localhost'
  ) {
    return true;
  }

  // Check for Capacitor user agent
  if (userAgent.includes('Capacitor')) {
    return true;
  }

  // Check for mobile user agents
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return mobilePatterns.some((pattern) => pattern.test(userAgent));
};

/**
 * Get the platform from the request
 */
export const getPlatform = (event: H3Event): 'ios' | 'android' | 'web' => {
  const headers = getRequestHeaders(event);
  const userAgent = headers['user-agent'] || '';
  const origin = headers.origin || '';

  // Check origin for Capacitor iOS
  if (origin.startsWith('capacitor://') || origin.startsWith('ionic://')) {
    return 'ios';
  }

  // Check user agent
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'ios';
  }

  if (/Android/.test(userAgent)) {
    return 'android';
  }

  return 'web';
};

/**
 * Get mobile app version from headers
 */
export const getAppVersion = (event: H3Event): string | null => {
  const headers = getRequestHeaders(event);
  return headers['x-app-version'] || null;
};

/**
 * Check if request requires mobile-optimized response
 */
export const requiresMobileOptimization = (event: H3Event): boolean => {
  return isMobileRequest(event);
};

/**
 * Log mobile request for debugging
 */
export const logMobileRequest = (event: H3Event) => {
  if (!isMobileRequest(event)) return;

  const platform = getPlatform(event);
  const version = getAppVersion(event);
  const path = event.node.req.url;

  console.log(`📱 Mobile Request: ${platform} ${version || 'unknown'} → ${path}`);
};
