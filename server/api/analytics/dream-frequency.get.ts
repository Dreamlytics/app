import { getUserFromEvent } from '~/server/utils/auth';
import { Dream } from '~/server/models/Dream';

/**
 * Get dream frequency data (dreams per week)
 * Returns weekly dream counts for visualization
 */
export default defineEventHandler(async (event) => {
  try {
    const user = await getUserFromEvent(event);
    const query = getQuery(event);
    const weeks = parseInt(query.weeks as string) || 12; // Default to last 12 weeks

    let filter: any = {};

    if (user) {
      // Authenticated users see their dreams + public dreams
      filter = {
        $or: [
          { userId: user.userId },
          { isPublic: true }
        ],
        date: {
          $gte: new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000)
        }
      };
    } else {
      // Non-authenticated users only see public dreams
      filter = {
        isPublic: true,
        date: {
          $gte: new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000)
        }
      };
    }

    // Get all dreams within the time range
    // @ts-ignore - Mongoose type inference issue
    const dreams = await Dream.find(filter)
      .sort({ date: 1 })
      .select('date title isPublic userId')
      .lean();

    // Calculate week boundaries
    const now = new Date();
    const weekData: {
      weekStart: Date;
      weekEnd: Date;
      weekLabel: string;
      count: number;
      myDreams: number;
      publicDreams: number;
    }[] = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      weekData.push({
        weekStart,
        weekEnd,
        weekLabel,
        count: 0,
        myDreams: 0,
        publicDreams: 0
      });
    }

    // Count dreams per week
    dreams.forEach((dream: any) => {
      const dreamDate = new Date(dream.date);
      
      for (const week of weekData) {
        if (dreamDate >= week.weekStart && dreamDate < week.weekEnd) {
          week.count++;
          
          if (user && dream.userId?.toString() === user.userId) {
            week.myDreams++;
          } else {
            week.publicDreams++;
          }
          break;
        }
      }
    });

    // Calculate statistics
    const totalDreams = dreams.length;
    const weeksWithDreams = weekData.filter(w => w.count > 0).length;
    const averagePerWeek = totalDreams / weeks;
    const maxWeek = weekData.reduce((max, week) => 
      week.count > max.count ? week : max, weekData[0]);
    const minWeek = weekData.reduce((min, week) => 
      week.count < min.count ? week : min, weekData[0]);

    // Calculate trend (simple linear regression slope)
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    const n = weekData.length;

    weekData.forEach((week, index) => {
      sumX += index;
      sumY += week.count;
      sumXY += index * week.count;
      sumX2 += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const trend = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';

    // Get recent dreams for highlights
    const recentDreams = dreams.slice(-5).reverse().map((dream: any) => ({
      id: dream._id,
      title: dream.title,
      date: dream.date,
      isPublic: dream.isPublic
    }));

    return {
      success: true,
      data: {
        weekly: weekData,
        stats: {
          totalDreams,
          weeksWithDreams,
          averagePerWeek: Math.round(averagePerWeek * 10) / 10,
          maxWeek: {
            count: maxWeek.count,
            label: maxWeek.weekLabel
          },
          minWeek: {
            count: minWeek.count,
            label: minWeek.weekLabel
          },
          trend,
          trendValue: Math.round(slope * 100) / 100
        },
        recentDreams,
        metadata: {
          weeksAnalyzed: weeks,
          startDate: weekData[0]?.weekStart || null,
          endDate: weekData[weekData.length - 1]?.weekEnd || null
        }
      }
    };
  } catch (error: any) {
    console.error('Error fetching dream frequency:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch dream frequency data',
      data: { error: error.message }
    });
  }
});
