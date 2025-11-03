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

  const extractMotifsAndEmotions = async (data: ExtractRequest): Promise<ExtractionResult | null> => {
    extracting.value = true;
    error.value = null;

    try {
      const response = await $fetch<ExtractResponse>('/api/extract', {
        method: 'POST',
        body: data
      });

      return response.data;
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to extract motifs and emotions';
      return null;
    } finally {
      extracting.value = false;
    }
  };

  return {
    extracting,
    error,
    extractMotifsAndEmotions
  };
};
