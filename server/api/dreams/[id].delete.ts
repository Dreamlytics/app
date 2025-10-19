import { requireAuth } from '~/server/utils/auth';
import { Dream } from '~/server/models/Dream';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Dream ID is required'
    });
  }

  // @ts-ignore - Mongoose type inference issue
  const dream = await Dream.findById(id);

  if (!dream) {
    throw createError({
      statusCode: 404,
      message: 'Dream not found'
    });
  }

  // Check if user owns this dream
  if (dream.userId.toString() !== user.userId) {
    throw createError({
      statusCode: 403,
      message: 'Access denied'
    });
  }

  await dream.deleteOne();

  return {
    success: true,
    message: 'Dream deleted successfully'
  };
});
