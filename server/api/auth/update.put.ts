import { User } from '~/server/models/User';
import { requireAuth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);

    const body = await readBody(event);
    const { name, email, currentPassword, newPassword } = body;

    // @ts-ignore - Mongoose type inference issue
    const dbUser = await User.findById(user.userId);
    if (!dbUser) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      });
    }

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        throw createError({
          statusCode: 400,
          message: 'Current password is required to change password'
        });
      }

      const isValidPassword = await dbUser.comparePassword(currentPassword);
      if (!isValidPassword) {
        throw createError({
          statusCode: 400,
          message: 'Current password is incorrect'
        });
      }

      dbUser.password = newPassword;
    }

    // Update name if provided
    if (name && name !== dbUser.name) {
      // Check if name is already taken
      // @ts-ignore - Mongoose type inference issue
      const existingUser = await User.findOne({ name, _id: { $ne: user.userId } });
      if (existingUser) {
        throw createError({
          statusCode: 400,
          message: 'Username is already taken'
        });
      }
      dbUser.name = name;
    }

    // Update email if provided
    if (email && email !== dbUser.email) {
      // Check if email is already taken
      // @ts-ignore - Mongoose type inference issue
      const existingUser = await User.findOne({ email, _id: { $ne: user.userId } });
      if (existingUser) {
        throw createError({
          statusCode: 400,
          message: 'Email is already taken'
        });
      }
      dbUser.email = email;
    }

    await dbUser.save();

    return {
      success: true,
      user: {
        id: dbUser._id.toString(),
        email: dbUser.email,
        name: dbUser.name
      }
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update user'
    });
  }
});
