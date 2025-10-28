import { z } from 'zod';
import { requireAuth } from '~/server/utils/auth';

const extractSchema = z.object({
  dreamContent: z.string().min(10),
  dreamTitle: z.string().optional(),
  existingTags: z.array(z.string()).optional()
});

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuth(event);
    
    const body = await readBody(event);
    
    // Validate input
    const validation = extractSchema.safeParse(body);
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        message: 'Invalid input data',
        data: validation.error.errors
      });
    }
    
    const { dreamContent, dreamTitle, existingTags } = validation.data;
    const config = useRuntimeConfig();
    
    if (!config.openrouterApiKey) {
      throw createError({
        statusCode: 500,
        message: 'OpenRouter API key not configured'
      });
    }

    // Sophisticated prompt for motif and emotion extraction
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
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent extraction
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw createError({
        statusCode: response.status,
        message: errorData.error?.message || 'Failed to extract motifs and emotions'
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw createError({
        statusCode: 500,
        message: 'No extraction result generated'
      });
    }

    // Parse the JSON response
    let extracted;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      
      extracted = JSON.parse(cleanContent);
    } catch (e) {
      throw createError({
        statusCode: 500,
        message: 'Failed to parse extraction result'
      });
    }

    return {
      success: true,
      data: {
        motifs: extracted.motifs || [],
        emotions: extracted.emotions || [],
        emotionalIntensity: extracted.emotionalIntensity || 5,
        primaryTheme: extracted.primaryTheme || '',
        symbolism: extracted.symbolism || [],
        archetypes: extracted.archetypes || [],
        lucidityLevel: extracted.lucidityLevel || 0
      },
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
