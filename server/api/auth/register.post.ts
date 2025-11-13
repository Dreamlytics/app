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

    // Check if email already exists
    // @ts-ignore - Mongoose type inference issue
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      throw createError({
        statusCode: 400,
        message: 'Email already exists'
      });
    }

    // Check if username already exists
    // @ts-ignore - Mongoose type inference issue
    const existingUsername = await User.findOne({ name });
    if (existingUsername) {
      throw createError({
        statusCode: 400,
        message: 'Username already exists'
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
