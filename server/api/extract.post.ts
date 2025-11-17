import { z } from 'zod';
import { OpenRouter } from '@openrouter/sdk';
import { requireAuth } from '~/server/utils/auth';
import { AILog } from '~/server/models/AILog';

const extractSchema = z.object({
  dreamContent: z.string().min(10),
  dreamTitle: z.string().optional(),
  existingTags: z.array(z.string()).optional(),
  dreamId: z.string().optional()
});

export default defineEventHandler(async (event) => {
  const startTime = Date.now();
  
  try {
    const user = await requireAuth(event);
    
    const body = await readBody(event);
    
    const validation = extractSchema.safeParse(body);
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        message: 'Invalid input data',
        data: validation.error.errors
      });
    }
    
    const { dreamContent, dreamTitle, existingTags, dreamId } = validation.data;
    const config = useRuntimeConfig();
    
    if (!config.openrouterApiKey) {
      throw createError({
        statusCode: 500,
        message: 'OpenRouter API key not configured'
      });
    }

    const openRouter = new OpenRouter({
      apiKey: config.openrouterApiKey
    });

    const prompt = `You are an expert dream analyst specializing in identifying recurring motifs, symbols, and emotional patterns in dreams. Analyze the following dream and extract key information.

${dreamTitle ? `Dream Title: ${dreamTitle}\n` : ''}
Dream Content: ${dreamContent}
${existingTags && existingTags.length > 0 ? `User's Tags: ${existingTags.join(', ')}\n` : ''}

Please analyze this dream and provide a structured JSON response with the following:

1. **motifs**: Array of recurring symbols, objects, or themes (e.g., "water", "flying", "chase", "falling", "house", "animal")
2. **emotions**: Array of primary emotions experienced (e.g., "fear", "joy", "anxiety", "excitement", "sadness", "confusion", "peace")
3. **emotionalIntensity**: Overall emotional intensity from 1-10
4. **primaryTheme**: The main theme or narrative of the dream (one sentence)
5. **symbolism**: Key symbolic elements and their potential meanings (array of {symbol, meaning})
6. **archetypes**: Any Jungian archetypes present (e.g., "shadow", "anima", "hero", "trickster")
7. **lucidityLevel**: Estimated level of lucidity (0-10, where 0 is non-lucid and 10 is fully lucid)

Guidelines:
- Extract 3-8 motifs (most prominent and meaningful)
- Identify 2-5 core emotions
- Be specific but concise
- Focus on universal symbols and patterns
- Consider cultural and psychological symbolism

Respond ONLY with valid JSON in this exact format:
{
  "motifs": ["motif1", "motif2"],
  "emotions": ["emotion1", "emotion2"],
  "emotionalIntensity": 7,
  "primaryTheme": "A brief description of the dream's main theme",
  "symbolism": [
    {"symbol": "water", "meaning": "emotional depth and unconscious feelings"},
    {"symbol": "flight", "meaning": "desire for freedom or escape"}
  ],
  "archetypes": ["shadow", "hero"],
  "lucidityLevel": 3
}`;

    const completion = await openRouter.chat.send({
      model: 'openai/gpt-oss-20b:free',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      maxTokens: 1500,
      stream: false
    });

    const content = completion.choices?.[0]?.message?.content;
    const finishReason = completion.choices?.[0]?.finishReason;
    const usage = completion.usage;

    if (!content) {
      throw createError({
        statusCode: 500,
        message: 'No extraction result generated'
      });
    }

    if (finishReason === 'length') {
      console.warn('AI response was truncated due to token limit');
    }

    let extracted;
    try {
      let cleanContent = '';
      if (typeof content === 'string') {
        cleanContent = content.trim();
      } else if (Array.isArray(content)) {
        cleanContent = content
          .filter(item => typeof item === 'string')
          .join(' ')
          .trim();
      }
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      extracted = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Failed to parse JSON response:', content, e);
      throw createError({
        statusCode: 500,
        message: 'Failed to parse extraction result'
      });
    }

    const extractionData = {
      motifs: extracted.motifs || [],
      emotions: extracted.emotions || [],
      emotionalIntensity: extracted.emotionalIntensity || 5,
      primaryTheme: extracted.primaryTheme || '',
      symbolism: extracted.symbolism || [],
      archetypes: extracted.archetypes || [],
      lucidityLevel: extracted.lucidityLevel || 0
    };

    try {
      const log = new AILog({
        userId: user.userId,
        dreamId: dreamId || undefined,
        operation: 'extract',
        aiModel: 'openai/gpt-oss-20b:free',
        requestData: {
          dreamTitle,
          dreamContent,
          tags: existingTags
        },
        responseData: extractionData,
        usage: usage,
        success: true,
        processingTime: Date.now() - startTime
      });
      await log.save();
    } catch (logError) {
      console.error('Failed to log extraction:', logError);
    }

    return {
      success: true,
      data: extractionData,
      usage: usage
    };

  } catch (error: any) {
    const processingTime = Date.now() - startTime;

    try {
      const user = await requireAuth(event).catch(() => null);
      const body = await readBody(event).catch(() => ({}));
      if (user) {
        const log = new AILog({
          userId: user.userId,
          dreamId: body.dreamId || undefined,
          operation: 'extract',
          aiModel: 'openai/gpt-oss-20b:free',
          requestData: {
            dreamTitle: body.dreamTitle,
            dreamContent: body.dreamContent,
            tags: body.existingTags
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