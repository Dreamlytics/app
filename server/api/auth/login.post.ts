import { z } from 'zod';
import { User } from '~/server/models/User';
import { generateToken } from '~/server/utils/auth';

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string()
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        message: 'Invalid input format'
      });
    }
    
    const { emailOrUsername, password } = validation.data;

    // Find user by email or username
    // Check if input is an email format
    const isEmail = emailOrUsername.includes('@');
    
    // @ts-ignore - Mongoose type inference issue
    const user = await User.findOne(
      isEmail 
        ? { email: emailOrUsername.toLowerCase() }
        : { name: emailOrUsername }
    );
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    // Set cookie
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    };
  } catch (error: any) {
    throw error;
  }
});
