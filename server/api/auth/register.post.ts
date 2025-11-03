import { z } from 'zod';
import { User } from '~/server/models/User';
import { generateToken } from '~/server/utils/auth';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      throw createError({
        statusCode: 400,
        message: errors[0]?.message || 'Invalid input data',
        data: { errors }
      });
    }
    
    const { email, password, name } = validation.data;

    // Check if user already exists (email or name)
    // @ts-ignore - Mongoose type inference issue
    const existingUser = await User.findOne({ 
      $or: [{ email }, { name }]
    });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      throw createError({
        statusCode: 400,
        message: `${field} already exists`
      });
    }

    // Create new user
    // @ts-ignore - Mongoose type inference issue
    const user = await User.create({
      email,
      password,
      name
    });

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
