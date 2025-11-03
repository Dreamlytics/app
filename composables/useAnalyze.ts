export interface AnalyzeRequest {
  dreamContent: string;
  dreamTitle?: string;
  tags?: string[];
  dreamId?: string;
  isRefresh?: boolean;
}

export interface AnalyzeResponse {
  success: boolean;
  analysis: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export const useAnalyze = () => {
  const analyzing = ref(false);
  const error = ref<string | null>(null);

  const analyzeDream = async (data: AnalyzeRequest): Promise<string | null> => {
    analyzing.value = true;
    error.value = null;

    try {
      const response = await $fetch<AnalyzeResponse>('/api/analyze', {
        method: 'POST',
        body: data
      });

      return response.analysis;
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to analyze dream';
      return null;
    } finally {
      analyzing.value = false;
    }
  };

  return {
    analyzing,
    error,
    analyzeDream
  };
};
