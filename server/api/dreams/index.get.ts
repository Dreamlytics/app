import { getUserFromEvent } from '~/server/utils/auth';
import { Dream } from '~/server/models/Dream';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  const query = getQuery(event);
  
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 20;
  const tag = query.tag as string | undefined; // Legacy support
  const filterType = query.filterType as 'tag' | 'motif' | 'emotion' | undefined;
  const searchQuery = query.query as string | undefined;
  const skip = (page - 1) * limit;

  let filter: any = {};

  if (user) {
    // If user is authenticated, show their dreams (both public and private) and public dreams from others
    filter = {
      $or: [
        { userId: user.userId },
        { isPublic: true }
      ]
    };
  } else {
    // If not authenticated, only show public dreams
    filter = { isPublic: true };
  }

  // Legacy tag filter support (exact match)
  if (tag && tag.trim()) {
    const tagFilter = { tags: tag.toLowerCase().trim() };
    
    if (filter.$or) {
      filter = {
        $and: [
          { $or: filter.$or },
          tagFilter
        ]
      };
    } else {
      filter.tags = tag.toLowerCase().trim();
    }
  }

  // New fuzzy filter system
  if (filterType && searchQuery && searchQuery.trim()) {
    const trimmedQuery = searchQuery.trim();
    let fuzzyFilter: any;

    if (filterType === 'tag') {
      // Fuzzy search in tags array using regex
      fuzzyFilter = {
        tags: { $regex: trimmedQuery, $options: 'i' }
      };
    } else if (filterType === 'motif') {
      // Fuzzy search in aiMotifs array
      fuzzyFilter = {
        aiMotifs: { $regex: trimmedQuery, $options: 'i' }
      };
    } else if (filterType === 'emotion') {
      // Fuzzy search in aiEmotions array
      fuzzyFilter = {
        aiEmotions: { $regex: trimmedQuery, $options: 'i' }
      };
    }

    if (fuzzyFilter) {
      if (filter.$or) {
        // Combine fuzzy filter with existing $or filter
        filter = {
          $and: [
            { $or: filter.$or },
            fuzzyFilter
          ]
        };
      } else {
        // Just add fuzzy filter to existing filter
        Object.assign(filter, fuzzyFilter);
      }
    }
  }

  // @ts-ignore - Mongoose type inference issue
  const dreams: any[] = await Dream.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name')
    .lean();
  
  // @ts-ignore - Mongoose type inference issue
  const total = await Dream.countDocuments(filter);

  return {
    dreams: dreams.map((dream: any) => ({
      id: dream._id,
      title: dream.title,
      content: dream.content,
      date: dream.date,
      tags: dream.tags,
      isPublic: dream.isPublic,
      aiAnalysis: dream.aiAnalysis,
      aiMotifs: dream.aiMotifs,
      aiEmotions: dream.aiEmotions,
      emotionalIntensity: dream.emotionalIntensity,
      author: dream.userId ? (dream.userId as any).name : 'Unknown',
      createdAt: dream.createdAt,
      updatedAt: dream.updatedAt,
      isOwner: user ? dream.userId.toString() === user.userId : false
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
});
