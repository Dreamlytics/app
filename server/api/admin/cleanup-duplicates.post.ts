import { User } from '~/server/models/User';

/**
 * Admin endpoint to clean up duplicate users
 * POST /api/admin/cleanup-duplicates
 * 
 * This will keep the oldest account for each duplicate username/email
 * and remove the newer duplicates
 */
export default defineEventHandler(async (event) => {
  try {
    const results = {
      duplicateEmailsRemoved: 0,
      duplicateUsernamesRemoved: 0,
      errors: [] as string[]
    };

    // Find duplicate usernames
    const duplicateUsernames = await User.aggregate([
      {
        $group: {
          _id: '$name',
          count: { $sum: 1 },
          users: { $push: { id: '$_id', createdAt: '$createdAt', email: '$email' } }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    // Remove duplicate usernames (keep the oldest)
    for (const duplicate of duplicateUsernames) {
      const users = duplicate.users.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      // Keep the first (oldest), remove the rest
      for (let i = 1; i < users.length; i++) {
        try {
          // @ts-ignore - Mongoose type inference issue
          await User.findByIdAndDelete(users[i].id);
          results.duplicateUsernamesRemoved++;
          console.log(`Removed duplicate username "${duplicate._id}" - ${users[i].email}`);
        } catch (error: any) {
          results.errors.push(`Failed to remove user ${users[i].id}: ${error.message}`);
        }
      }
    }

    // Find duplicate emails
    const duplicateEmails = await User.aggregate([
      {
        $group: {
          _id: '$email',
          count: { $sum: 1 },
          users: { $push: { id: '$_id', createdAt: '$createdAt', name: '$name' } }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    // Remove duplicate emails (keep the oldest)
    for (const duplicate of duplicateEmails) {
      const users = duplicate.users.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      // Keep the first (oldest), remove the rest
      for (let i = 1; i < users.length; i++) {
        try {
          // @ts-ignore - Mongoose type inference issue
          await User.findByIdAndDelete(users[i].id);
          results.duplicateEmailsRemoved++;
          console.log(`Removed duplicate email "${duplicate._id}" - ${users[i].name}`);
        } catch (error: any) {
          results.errors.push(`Failed to remove user ${users[i].id}: ${error.message}`);
        }
      }
    }

    return {
      success: true,
      message: 'Duplicate cleanup completed',
      ...results
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Failed to cleanup duplicates',
      data: { error: error.message }
    });
  }
});
