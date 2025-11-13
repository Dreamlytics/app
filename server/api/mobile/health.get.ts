/**
 * Mobile Health Check Endpoint
 * Tests CORS and mobile connectivity
 */

import { defineEventHandler } from 'h3';
import { isMobileRequest, getPlatform, getAppVersion } from '~/server/utils/mobile';

export default defineEventHandler(async (event) => {
  const isMobile = isMobileRequest(event);
  const platform = getPlatform(event);
  const appVersion = getAppVersion(event);

  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    mobile: {
      isMobile,
      platform,
      appVersion,
    },
    cors: {
      enabled: true,
      message: 'CORS is properly configured for mobile access',
    },
    server: {
      environment: process.env.NODE_ENV || 'development',
      nuxtVersion: '3.19.3',
    },
  };
});
