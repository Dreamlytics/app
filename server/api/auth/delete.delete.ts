import { User } from '~/server/models/User';
import { Dream } from '~/server/models/Dream';
import { requireAuth } from '~/server/utils/auth';
import { deleteCookie } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);

    const body = await readBody(event);
    const { username } = body;

    // @ts-ignore - Mongoose type inference issue
    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      });
    }

    // Verify username matches
    if (username !== dbUser.name) {
      throw createError({
        statusCode: 400,
        message: 'Username does not match'
      });
    }

    // Delete all user's dreams
    // @ts-ignore - Mongoose type inference issue
    await Dream.deleteMany({ userId: user.userId });

    // Delete user account
    // @ts-ignore - Mongoose type inference issue
    await User.findByIdAndDelete(user.userId);

    // Clear authentication cookie
    deleteCookie(event, 'auth-token');

    return {
      success: true,
      message: 'Account deleted successfully'
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to delete account'
    });
  }
});
