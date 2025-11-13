import { z } from 'zod';
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
  let logData: any = null;
  
  try {
    // Require authentication
    const user = await requireAuth(event);
    
    const body = await readBody(event);
    
    // Validate input
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

    // Prepare the prompt for dream analysis
    const prompt = `You are a professional dream analyst. Analyze the following dream and provide insights about its possible meanings, symbolism, and psychological significance.

${dreamTitle ? `Dream Title: ${dreamTitle}\n` : ''}
Dream Content: ${dreamContent}
${tags && tags.length > 0 ? `Tags: ${tags.join(', ')}\n` : ''}

Please provide a comprehensive yet concise analysis covering:
1. Overall interpretation (2-3 paragraphs)
2. Key symbols and their meanings (3-5 symbols)
3. Possible emotional themes (2-3 themes)
4. Suggestions for reflection (2-3 suggestions)

Keep the analysis thoughtful, empathetic, and insightful. Ensure you complete all sections fully.`;

    // Call OpenRouter API with timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 second timeout
    
    let response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.openrouterApiKey}`,
          'HTTP-Referer': 'https://dreamlytics.app',
          'X-Title': 'Dreamlytics',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'nousresearch/hermes-3-llama-3.1-405b:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2500  // Increased from 1500 to prevent cutoff
        }),
        signal: controller.signal
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw createError({
          statusCode: 504,
          message: 'Request timeout. The AI service took too long to respond. Please try again.'
        });
      }
      throw createError({
        statusCode: 503,
        message: 'Failed to connect to AI service. Please try again.'
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Better error messages for common issues
      let errorMessage = 'Failed to analyze dream';
      let statusCode = response.status;
      
      if (response.status === 429) {
        errorMessage = 'Rate limit reached. Please wait a moment and try again.';
      } else if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check your OpenRouter configuration.';
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        errorMessage = 'AI service temporarily unavailable. Please try again in a few seconds.';
        statusCode = 503;
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
      
      throw createError({
        statusCode,
        message: errorMessage
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;
    const finishReason = data.choices?.[0]?.finish_reason;

    if (!analysis) {
      throw createError({
        statusCode: 500,
        message: 'No analysis generated'
      });
    }

    // Check if response was cut off due to token limit
    if (finishReason === 'length') {
      console.warn('AI response was truncated due to max_tokens limit');
      // Add a note to the analysis that it was truncated
      // User will still get the response but we log the issue
    }

    const processingTime = Date.now() - startTime;
    const usageData = {
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens
    };

    // Log AI analysis to database
    try {
      // @ts-ignore - Mongoose type inference issue
      await AILog.create({
        userId: user.userId,
        dreamId: dreamId || undefined,
        operation: isRefresh ? 'refresh' : 'analyze',
        aiModel: 'nousresearch/hermes-3-llama-3.1-405b:free',
        requestData: {
          dreamTitle,
          dreamContent,
          tags
        },
        responseData: {
          analysis
        },
        usage: usageData,
        success: true,
        processingTime
      });
    } catch (logError) {
      console.error('Failed to log AI analysis:', logError);
      // Don't fail the request if logging fails
    }

    return {
      success: true,
      analysis,
      usage: usageData
    };
  } catch (error: any) {
    // Log failed analysis attempt
    const processingTime = Date.now() - startTime;
    try {
      const user = await requireAuth(event).catch(() => null);
      if (user) {
        const body = await readBody(event).catch(() => ({}));
        // @ts-ignore - Mongoose type inference issue
        await AILog.create({
          userId: user.userId,
          dreamId: body.dreamId || undefined,
          operation: 'analyze',
          aiModel: 'nousresearch/hermes-3-llama-3.1-405b:free',
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
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    throw error;
  }
});
