import { getUserFromEvent } from '~/server/utils/auth';
import { Dream } from '~/server/models/Dream';

/**
 * Get public dreams feed (title + date only)
 * No authentication required - public endpoint
 */
export default defineEventHandler(async (event) => {
  try {
    // Get user if authenticated (to check if they liked the dream)
    const user = await getUserFromEvent(event);
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const filterType = query.filterType as string || '';
    const filterQuery = query.filterQuery as string || '';

    // Build filter - only fetch public dreams
    const filter: any = { isPublic: true };

    // Add motif/emotion filter if provided
    if (filterType && filterQuery) {
      const searchRegex = { $regex: filterQuery, $options: 'i' };
      
      if (filterType === 'motifs') {
        filter.aiMotifs = searchRegex;
      } else if (filterType === 'emotions') {
        filter.aiEmotions = searchRegex;
      }
    }

    // Get total count for pagination
    // @ts-ignore - Mongoose type inference issue
    const total = await Dream.countDocuments(filter);

    // Get public dreams with fields including motifs/emotions for filtering
    // @ts-ignore - Mongoose type inference issue
    const dreams = await Dream.find(filter)
      .select('title date userId likes likeCount aiMotifs aiEmotions')
      .sort({ date: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .lean();

    // Format the response
    const formattedDreams = dreams.map((dream: any) => ({
      id: dream._id.toString(),
      title: dream.title,
      date: dream.date,
      likeCount: dream.likeCount || 0,
      isLikedByMe: user && Array.isArray(dream.likes)
        ? dream.likes.some((id: any) => id.toString() === user.userId)
        : false,
      motifs: dream.aiMotifs || [],
      emotions: dream.aiEmotions || [],
      // Don't expose userId directly, just indicate if it's available
      hasUser: !!dream.userId
    }));

    return {
      success: true,
      data: {
        dreams: formattedDreams,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit)
        },
        filter: {
          type: filterType || null,
          query: filterQuery || null
        }
      }
    };
  } catch (error: any) {
    console.error('Error fetching public dreams:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch public dreams',
      data: { error: error.message }
    });
  }
});
