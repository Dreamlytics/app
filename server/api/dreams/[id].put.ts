import { z } from 'zod';
import { requireAuth } from '~/server/utils/auth';
import { Dream } from '~/server/models/Dream';

const updateDreamSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  date: z.string().or(z.date()).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional()
});

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Dream ID is required'
      });
    }

    const updateData = updateDreamSchema.parse(body);

    // Find the dream
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

    // Update dream
    if (updateData.title) dream.title = updateData.title;
    if (updateData.content) dream.content = updateData.content;
    if (updateData.date) dream.date = new Date(updateData.date);
    if (updateData.tags) dream.tags = updateData.tags.map(tag => tag.toLowerCase().trim());
    if (updateData.isPublic !== undefined) dream.isPublic = updateData.isPublic;

    await dream.save();

    return {
      success: true,
      dream: {
        id: dream._id,
        title: dream.title,
        content: dream.content,
        date: dream.date,
        tags: dream.tags,
        isPublic: dream.isPublic,
        createdAt: dream.createdAt,
        updatedAt: dream.updatedAt
      }
    };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid input data'
      });
    }
    throw error;
  }
});
