import { requireAuth } from '~/server/utils/auth';
import { Dream } from '~/server/models/Dream';

/**
 * Toggle like on a dream
 * POST /api/dreams/:id/like
 */
export default defineEventHandler(async (event) => {
  try {
    // Require authentication to like
    const user = await requireAuth(event);
    const dreamId = getRouterParam(event, 'id');

    if (!dreamId) {
      throw createError({
        statusCode: 400,
        message: 'Dream ID is required'
      });
    }

    // Find the dream
    // @ts-ignore - Mongoose type inference issue
    const dream = await Dream.findById(dreamId);

    if (!dream) {
      throw createError({
        statusCode: 404,
        message: 'Dream not found'
      });
    }

    // Check if dream is public (only public dreams can be liked)
    if (!dream.isPublic) {
      throw createError({
        statusCode: 403,
        message: 'Only public dreams can be liked'
      });
    }

    const userId = user.userId;
    const userObjectId = new (Dream as any).base.Types.ObjectId(userId);

    // Check if user already liked this dream
    const hasLiked = dream.likes.some((id: any) => id.toString() === userId);

    if (hasLiked) {
      // Unlike: Remove user from likes array
      dream.likes = dream.likes.filter((id: any) => id.toString() !== userId);
      dream.likeCount = Math.max(0, dream.likeCount - 1);
    } else {
      // Like: Add user to likes array
      dream.likes.push(userObjectId);
      dream.likeCount = dream.likeCount + 1;
    }

    await dream.save();

    return {
      success: true,
      data: {
        dreamId: dream._id,
        liked: !hasLiked,
        likeCount: dream.likeCount
      }
    };
  } catch (error: any) {
    // If it's already a createError, rethrow it
    if (error.statusCode) {
      throw error;
    }

    console.error('Error toggling like:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to toggle like',
      data: { error: error.message }
    });
  }
});
