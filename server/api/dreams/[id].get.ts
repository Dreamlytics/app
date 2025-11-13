import { getUserFromEvent } from '~/server/utils/auth';
import { Dream } from '~/server/models/Dream';

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Dream ID is required'
    });
  }

  // @ts-ignore - Mongoose type inference issue
  const dream: any = await Dream.findById(id).populate('userId', 'name').lean().exec();

  if (!dream) {
    throw createError({
      statusCode: 404,
      message: 'Dream not found'
    });
  }

  // Check if user has permission to view this dream
  const isOwner = user && (dream.userId as any)._id.toString() === user.userId;
  if (!dream.isPublic && !isOwner) {
    throw createError({
      statusCode: 403,
      message: 'Access denied'
    });
  }

  return {
    dream: {
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
      author: (dream.userId as any).name,
      createdAt: dream.createdAt,
      updatedAt: dream.updatedAt,
      isOwner
    }
  };
});
