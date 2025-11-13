/**
 * CORS Middleware for Mobile API Access
 * Handles Cross-Origin Resource Sharing for Capacitor mobile apps
 */

import { defineEventHandler, getRequestHeaders, setResponseHeaders, send } from 'h3';

export default defineEventHandler((event) => {
  // Get request origin
  const origin = getRequestHeaders(event).origin || '';
  const requestMethod = event.node.req.method;

  // Allowed origins for CORS
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080', // Common dev server port
    'http://localhost:8100', // Ionic dev server
    'capacitor://localhost', // iOS Capacitor
    'http://localhost', // Android Capacitor
    'https://localhost', // HTTPS variants
    'ionic://localhost', // Ionic schemes
    'http://10.0.2.2:3000', // Android emulator localhost
    'http://192.168.1.*', // Local network (wildcarded)
  ];

  // Check if origin is allowed
  const isAllowedOrigin = allowedOrigins.some((allowed) => {
    if (allowed.includes('*')) {
      // Handle wildcard patterns
      const pattern = allowed.replace(/\*/g, '.*');
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return allowed === origin;
  });

  // Special handling for Capacitor apps
  const isCapacitor = 
    origin.startsWith('capacitor://') || 
    origin.startsWith('ionic://') ||
    origin === 'http://localhost' ||
    origin === 'https://localhost';

  // Set CORS headers
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 
      'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, Set-Cookie',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  // Set appropriate Access-Control-Allow-Origin
  if (isCapacitor) {
    // For Capacitor apps, allow the origin
    corsHeaders['Access-Control-Allow-Origin'] = origin || '*';
  } else if (isAllowedOrigin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
  } else if (!origin || origin === 'null') {
    // Same-origin requests or file:// protocol
    corsHeaders['Access-Control-Allow-Origin'] = '*';
  } else if (process.env.NODE_ENV === 'development') {
    // In development, be more permissive
    corsHeaders['Access-Control-Allow-Origin'] = origin || '*';
  }

  // Add Vary header to indicate response varies based on Origin
  corsHeaders['Vary'] = 'Origin';

  // Set the headers
  setResponseHeaders(event, corsHeaders);

  // Handle preflight OPTIONS requests
  if (requestMethod === 'OPTIONS') {
    // Return 204 No Content for preflight
    event.node.res.statusCode = 204;
    event.node.res.end();
    return;
  }

  // Continue to the next handler
});
