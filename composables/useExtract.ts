export interface ExtractRequest {
  dreamContent: string;
  dreamTitle?: string;
  existingTags?: string[];
  dreamId?: string;
}

export interface Symbolism {
  symbol: string;
  meaning: string;
}

export interface ExtractionResult {
  motifs: string[];
  emotions: string[];
  emotionalIntensity: number;
  primaryTheme: string;
  symbolism: Symbolism[];
  archetypes: string[];
  lucidityLevel: number;
}

export interface ExtractResponse {
  success: boolean;
  data: ExtractionResult;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export const useExtract = () => {
  const extracting = ref(false);
  const error = ref<string | null>(null);
  let abortController: AbortController | null = null;

  const extractMotifsAndEmotions = async (data: ExtractRequest): Promise<ExtractionResult | null> => {
    // Abort any previous request
    if (abortController) {
      abortController.abort();
    }
    
    // Create new abort controller for this request
    abortController = new AbortController();
    
    extracting.value = true;
    error.value = null;

    try {
      const response = await $fetch('/api/extract', {
        method: 'POST',
        body: data,
        signal: abortController.signal,
        timeout: 60000 // 60 seconds
      });

      return response.data;
    } catch (e: any) {
      // Don't show error if request was aborted
      if (e.name === 'AbortError') {
        return null;
      }
      
      // Better error messages for rate limits
      if (e.statusCode === 429 || e.status === 429) {
        error.value = 'Rate limit reached. Please wait 60 seconds and try again.';
      } else {
        error.value = e.data?.message || e.message || 'Failed to extract motifs and emotions';
      }
      
      console.error('Extraction error:', e);
      throw error.value; // Throw to propagate to calling function
    } finally {
      extracting.value = false;
      abortController = null;
    }
  };

  return {
    extracting,
    error,
    extractMotifsAndEmotions
  };
};
