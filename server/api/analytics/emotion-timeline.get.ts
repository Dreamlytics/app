import { getUserFromEvent } from '~/server/utils/auth';
import { Dream } from '~/server/models/Dream';

/**
 * Get emotion timeline data
 * Returns emotions over time for visualization
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    const query = getQuery(event);
    const days = parseInt(query.days as string) || 30; // Default to last 30 days

    let filter: any = {};

    if (user) {
      // Authenticated users see their dreams + public dreams
      filter = {
        $or: [
          { userId: user.userId },
          { isPublic: true }
        ],
        aiEmotions: { $exists: true, $ne: [] },
        date: {
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      };
    } else {
      // Non-authenticated users only see public dreams
      filter = {
        isPublic: true,
        aiEmotions: { $exists: true, $ne: [] },
        date: {
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      };
    }

    // Get dreams with emotions sorted by date
    // @ts-ignore - Mongoose type inference issue
    const dreams = await Dream.find(filter)
      .sort({ date: 1 })
      .select('date aiEmotions emotionalIntensity title')
      .lean();

    // Build timeline data
    const timelineData = dreams.map((dream: any) => ({
      date: dream.date,
      emotions: dream.aiEmotions || [],
      intensity: dream.emotionalIntensity || 5,
      title: dream.title,
      id: dream._id
    }));

    // Calculate emotion frequency over time
    const emotionsByDate: { [key: string]: { [emotion: string]: number } } = {};
    const allEmotions = new Set<string>();

    dreams.forEach((dream: any) => {
      const dateKey = new Date(dream.date).toISOString().split('T')[0];
      if (!emotionsByDate[dateKey]) {
        emotionsByDate[dateKey] = {};
      }
      
      if (dream.aiEmotions && Array.isArray(dream.aiEmotions)) {
        dream.aiEmotions.forEach((emotion: string) => {
          allEmotions.add(emotion);
          emotionsByDate[dateKey][emotion] = (emotionsByDate[dateKey][emotion] || 0) + 1;
        });
      }
    });

    // Calculate average intensity per day
    const intensityByDate: { [key: string]: { total: number; count: number; avg: number } } = {};
    
    dreams.forEach((dream: any) => {
      const dateKey = new Date(dream.date).toISOString().split('T')[0];
      if (!intensityByDate[dateKey]) {
        intensityByDate[dateKey] = { total: 0, count: 0, avg: 0 };
      }
      
      intensityByDate[dateKey].total += dream.emotionalIntensity || 5;
      intensityByDate[dateKey].count += 1;
      intensityByDate[dateKey].avg = Math.round((intensityByDate[dateKey].total / intensityByDate[dateKey].count) * 10) / 10;
    });

    // Get most common emotions
    const emotionFrequency: { [emotion: string]: number } = {};
    dreams.forEach((dream: any) => {
      if (dream.aiEmotions && Array.isArray(dream.aiEmotions)) {
        dream.aiEmotions.forEach((emotion: string) => {
          emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
        });
      }
    });

    const topEmotions = Object.entries(emotionFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([emotion, count]) => ({ emotion, count }));

    return {
      success: true,
      data: {
        timeline: timelineData,
        emotionsByDate,
        intensityByDate,
        topEmotions,
        allEmotions: Array.from(allEmotions).sort(),
        stats: {
          totalDreams: dreams.length,
          dateRange: {
            start: dreams.length > 0 ? dreams[0].date : null,
            end: dreams.length > 0 ? dreams[dreams.length - 1].date : null
          },
          daysRequested: days
        }
      }
    };
  } catch (error: any) {
    console.error('Error fetching emotion timeline:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch emotion timeline data',
      data: { error: error.message }
    });
  }
});
