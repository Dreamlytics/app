// @ts-ignore - jsonwebtoken types compatibility
import jwt from 'jsonwebtoken';
import type { H3Event } from 'h3';
import { getCookie, createError } from 'h3';

export interface JWTPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const config = useRuntimeConfig();
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const config = useRuntimeConfig();
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const getUserFromEvent = async (event: H3Event): Promise<JWTPayload | null> => {
  const token = getCookie(event, 'auth_token');
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
};

export const requireAuth = async (event: H3Event): Promise<JWTPayload> => {
  const user = await getUserFromEvent(event);
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    });
  }

  return user;
};
