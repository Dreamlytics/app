import { ensureIndexes, findDuplicates } from '~/server/utils/db-setup';

/**
 * Admin endpoint to fix database index issues
 * GET /api/admin/fix-indexes
 */
export default defineEventHandler(async (event) => {
  try {
    // Find existing duplicates
    const duplicates = await findDuplicates();
    
    if (duplicates?.hasDuplicates) {
      return {
        success: false,
        message: 'Found duplicate data. Please clean up manually before recreating indexes.',
        duplicateEmails: duplicates.duplicateEmails,
        duplicateUsernames: duplicates.duplicateUsernames
      };
    }

    // Recreate indexes
    const indexesCreated = await ensureIndexes();

    return {
      success: indexesCreated,
      message: indexesCreated 
        ? 'Database indexes created successfully. Registration should now properly prevent duplicates.'
        : 'Failed to create indexes. Check server logs for details.',
      duplicates
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fix database indexes',
      data: { error: error.message }
    });
  }
});
