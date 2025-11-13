import { z } from 'zod';
import { OpenRouter } from '@openrouter/sdk';
import { requireAuth } from '~/server/utils/auth';
import { AILog } from '~/server/models/AILog';

const analyzeSchema = z.object({
  dreamContent: z.string().min(10),
  dreamTitle: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dreamId: z.string().optional(),
  isRefresh: z.boolean().optional()
});

export default defineEventHandler(async (event) => {
  const startTime = Date.now();

  try {
    const user = await requireAuth(event);
    const body = await readBody(event);
    const validation = analyzeSchema.safeParse(body);

    

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        message: 'Invalid input data',
        data: validation.error.errors
      });
    }

    const { dreamContent, dreamTitle, tags, dreamId, isRefresh } = validation.data;
    const config = useRuntimeConfig();

    if (!config.openrouterApiKey) {
      throw createError({
        statusCode: 500,
        message: 'OpenRouter API key not configured'
      });
    }

    const openRouter = new OpenRouter({
      apiKey: config.openrouterApiKey,
    });

    console.log(config.openrouterApiKey);

    const prompt = `You are a professional dream analyst. Analyze the following dream and provide insights about its possible meanings, symbolism, and psychological significance.

${dreamTitle ? `Dream Title: ${dreamTitle}\n` : ''}
Dream Content: ${dreamContent}
${tags?.length ? `Tags: ${tags.join(', ')}\n` : ''}

Please provide a comprehensive yet concise analysis covering:
1. Overall interpretation (2-3 paragraphs)
2. Key symbols and their meanings (3-5 symbols)
3. Possible emotional themes (2-3 themes)
4. Suggestions for reflection (2-3 suggestions)

Keep the analysis thoughtful, empathetic, and insightful. Ensure you complete all sections fully.`;

    const completion = await openRouter.chat.send({
      model: 'meta-llama/llama-3.3-8b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      stream: false
    });

    const analysis = completion.choices?.[0]?.message?.content;
    const finishReason = completion.choices?.[0]?.finishReason;

    if (!analysis) {
      throw createError({ statusCode: 500, message: 'No analysis generated' });
    }

    if (finishReason === 'length') {
      console.warn('AI response was truncated due to token limit');
    }

    const usage = completion.usage;

    try {
      const log = new AILog({
        userId: user.userId,
        dreamId: dreamId || undefined,
        operation: isRefresh ? 'refresh' : 'analyze',
  aiModel: 'meta-llama/llama-3.3-8b-instruct:free',
        requestData: { dreamTitle, dreamContent, tags },
        responseData: { analysis },
        usage,
        success: true,
        processingTime: Date.now() - startTime
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to log AI analysis:', logError);
    }

    return { success: true, analysis, usage };
  } catch (error: any) {
    const processingTime = Date.now() - startTime;

    try {
      const user = await requireAuth(event).catch(() => null);
      const body = await readBody(event).catch(() => ({}));
      if (user) {
        const log = new AILog({
          userId: user.userId,
          dreamId: body.dreamId || undefined,
          operation: 'analyze',
          aiModel: 'meta-llama/llama-3.3-8b-instruct:free',
          requestData: {
            dreamTitle: body.dreamTitle,
            dreamContent: body.dreamContent,
            tags: body.tags
          },
          responseData: {},
          success: false,
          errorMessage: error.message || 'Unknown error',
          processingTime
        });
        await log.save();
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    throw error;
  }
});
