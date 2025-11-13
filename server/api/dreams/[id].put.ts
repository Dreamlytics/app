import { z } from 'zod';
import { requireAuth } from '~/server/utils/auth';
import { Dream } from '~/server/models/Dream';

const updateDreamSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  date: z.string().or(z.date()).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  aiAnalysis: z.string().optional(),
  aiMotifs: z.array(z.string()).optional(),
  aiEmotions: z.array(z.string()).optional(),
  emotionalIntensity: z.number().min(1).max(10).optional()
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

    const isOwner = dream.userId.toString() === user.userId;
    
    // Determine if this is an AI-only update (anyone can add AI analysis)
    const isAIOnlyUpdate = 
      updateData.aiAnalysis !== undefined ||
      updateData.aiMotifs !== undefined ||
      updateData.aiEmotions !== undefined ||
      updateData.emotionalIntensity !== undefined;
    
    const isCoreUpdate = 
      updateData.title !== undefined ||
      updateData.content !== undefined ||
      updateData.date !== undefined ||
      updateData.tags !== undefined ||
      updateData.isPublic !== undefined;

    // Only owner can update core fields
    if (isCoreUpdate && !isOwner) {
      throw createError({
        statusCode: 403,
        message: 'Only the dream owner can edit core dream fields'
      });
    }

    // Anyone can add AI analysis (but only to public dreams or their own dreams)
    if (isAIOnlyUpdate && !isOwner && !dream.isPublic) {
      throw createError({
        statusCode: 403,
        message: 'Cannot add AI analysis to private dreams you don\'t own'
      });
    }

    // Update dream (only owner can update core fields)
    if (isOwner) {
      if (updateData.title !== undefined) dream.title = updateData.title;
      if (updateData.content !== undefined) dream.content = updateData.content;
      if (updateData.date !== undefined) dream.date = new Date(updateData.date);
      if (updateData.tags !== undefined) dream.tags = updateData.tags.map(tag => tag.toLowerCase().trim());
      if (updateData.isPublic !== undefined) dream.isPublic = updateData.isPublic;
    }
    
    // Anyone can update AI fields (for public dreams or owned dreams)
    if (updateData.aiAnalysis !== undefined) dream.aiAnalysis = updateData.aiAnalysis;
    if (updateData.aiMotifs !== undefined) dream.aiMotifs = updateData.aiMotifs;
    if (updateData.aiEmotions !== undefined) dream.aiEmotions = updateData.aiEmotions;
    if (updateData.emotionalIntensity !== undefined) dream.emotionalIntensity = updateData.emotionalIntensity;

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
        aiAnalysis: dream.aiAnalysis,
        aiMotifs: dream.aiMotifs,
        aiEmotions: dream.aiEmotions,
        emotionalIntensity: dream.emotionalIntensity,
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
