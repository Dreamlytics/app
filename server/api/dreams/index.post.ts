import { z } from 'zod';
import { requireAuth } from '~/server/utils/auth';
import { Dream } from '~/server/models/Dream';

const createDreamSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  date: z.string().or(z.date()),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false)
});

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const { title, content, date, tags, isPublic } = createDreamSchema.parse(body);

    // @ts-ignore - Mongoose type inference issue
    const dream = await Dream.create({
      userId: user.userId,
      title,
      content,
      date: new Date(date),
      tags: tags.map(tag => tag.toLowerCase().trim()),
      isPublic
    });

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
