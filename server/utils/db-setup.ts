import { User } from '~/server/models/User';

/**
 * Ensures database indexes are properly created
 * Call this on application startup or manually to fix index issues
 */
export async function ensureIndexes() {
  try {
    // Drop existing indexes to recreate them properly
    await User.collection.dropIndexes();
    
    // Create unique indexes for email and name
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ name: 1 }, { unique: true });
    
    console.log('✅ Database indexes created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
    return false;
  }
}

/**
 * Finds and reports duplicate usernames or emails
 * Use this to diagnose data integrity issues
 */
export async function findDuplicates() {
  try {
    // Find duplicate emails
    const duplicateEmails = await User.aggregate([
      {
        $group: {
          _id: { email: '$email' },
          count: { $sum: 1 },
          users: { $push: { id: '$_id', name: '$name', email: '$email' } }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    // Find duplicate usernames
    const duplicateUsernames = await User.aggregate([
      {
        $group: {
          _id: { name: '$name' },
          count: { $sum: 1 },
          users: { $push: { id: '$_id', name: '$name', email: '$email' } }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    return {
      duplicateEmails,
      duplicateUsernames,
      hasDuplicates: duplicateEmails.length > 0 || duplicateUsernames.length > 0
    };
  } catch (error) {
    console.error('❌ Error finding duplicates:', error);
    return null;
  }
}
