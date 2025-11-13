import { getUserFromEvent } from '~/server/utils/auth';
import { Dream } from '~/server/models/Dream';

/**
 * Get motif frequency aggregation
 * Returns the most common motifs across all dreams
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    const query = getQuery(event);
    const limit = parseInt(query.limit as string) || 20;

    let filter: any = {};

    if (user) {
      // Authenticated users see motifs from their dreams + public dreams
      filter = {
        $or: [
          { userId: user.userId },
          { isPublic: true }
        ],
        aiMotifs: { $exists: true, $ne: [] }
      };
    } else {
      // Non-authenticated users only see motifs from public dreams
      filter = {
        isPublic: true,
        aiMotifs: { $exists: true, $ne: [] }
      };
    }

    // Aggregate motif frequencies using MongoDB aggregation pipeline
    // @ts-ignore - Mongoose type inference issue
    const motifAggregation = await Dream.aggregate([
      // Stage 1: Match filter criteria
      { $match: filter },
      
      // Stage 2: Unwind the aiMotifs array to create a document for each motif
      { $unwind: '$aiMotifs' },
      
      // Stage 3: Group by motif and count occurrences
      {
        $group: {
          _id: '$aiMotifs',
          count: { $sum: 1 },
          // Collect sample dream IDs for reference
          dreamIds: { $push: '$_id' }
        }
      },
      
      // Stage 4: Sort by frequency (most common first)
      { $sort: { count: -1 } },
      
      // Stage 5: Limit results
      { $limit: limit },
      
      // Stage 6: Project to clean format
      {
        $project: {
          _id: 0,
          motif: '$_id',
          frequency: '$count',
          sampleDreamIds: { $slice: ['$dreamIds', 3] } // Include up to 3 sample dream IDs
        }
      }
    ]);

    // Get total number of dreams with motifs for percentage calculation
    // @ts-ignore - Mongoose type inference issue
    const totalDreamsWithMotifs = await Dream.countDocuments(filter);

    // Calculate percentages and enhance data
    const motifsWithStats = motifAggregation.map((item: any) => ({
      motif: item.motif,
      frequency: item.frequency,
      percentage: totalDreamsWithMotifs > 0 
        ? Math.round((item.frequency / totalDreamsWithMotifs) * 100 * 10) / 10 
        : 0,
      sampleDreamIds: item.sampleDreamIds
    }));

    // Get total unique motifs count
    // @ts-ignore - Mongoose type inference issue
    const totalUniqueMotifs = await Dream.aggregate([
      { $match: filter },
      { $unwind: '$aiMotifs' },
      { $group: { _id: '$aiMotifs' } },
      { $count: 'total' }
    ]);

    return {
      success: true,
      data: {
        motifs: motifsWithStats,
        stats: {
          totalDreamsWithMotifs,
          totalUniqueMotifs: totalUniqueMotifs[0]?.total || 0,
          topMotifsCount: motifsWithStats.length
        }
      }
    };
  } catch (error: any) {
    console.error('Error fetching motif frequency:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch motif frequency data',
      data: { error: error.message }
    });
  }
});
