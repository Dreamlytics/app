import { z } from 'zod';
import { requireAuth } from '~/server/utils/auth';

const analyzeSchema = z.object({
  dreamContent: z.string().min(10),
  dreamTitle: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export default defineEventHandler(async (event) => {
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
    
    const { dreamContent, dreamTitle, tags } = validation.data;
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

Please provide:
1. Overall interpretation
2. Key symbols and their meanings
3. Possible emotional themes
4. Suggestions for reflection

Keep the analysis thoughtful, empathetic, and insightful.`;

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Better error messages for common issues
      let errorMessage = 'Failed to analyze dream';
      if (response.status === 429) {
        errorMessage = 'Rate limit reached. Please wait a moment and try again.';
      } else if (response.status === 401) {
        errorMessage = 'Invalid API key. Please check your OpenRouter configuration.';
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
      
      throw createError({
        statusCode: response.status,
        message: errorMessage
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw createError({
        statusCode: 500,
        message: 'No analysis generated'
      });
    }

    return {
      success: true,
      analysis,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens
      }
    };
  } catch (error: any) {
    throw error;
  }
});
