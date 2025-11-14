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
  let abortController: AbortController | null = null;

  const analyzeDream = async (data: AnalyzeRequest): Promise<string | null> => {
    // Abort any previous request
    if (abortController) {
      abortController.abort();
    }
    
    // Create new abort controller for this request
    abortController = new AbortController();
    
    analyzing.value = true;
    error.value = null;

    try {
      const response = await $fetch('/api/analyze', {
        method: 'POST',
        body: data,
        signal: abortController.signal,
        // Increase timeout to prevent gateway errors
        timeout: 60000 // 60 seconds
      });

      return response.analysis;
    } catch (e: any) {
      // Don't show error if request was aborted (user started new analysis)
      if (e.name === 'AbortError') {
        return null;
      }
      
      // Better error messages for rate limits
      if (e.statusCode === 429 || e.status === 429) {
        error.value = 'Rate limit reached. Please wait 60 seconds and try again.';
      } else {
        error.value = e.data?.message || e.message || 'Failed to analyze dream';
      }
      
      console.error('Analysis error:', e);
      throw error.value; // Throw to propagate to calling function
    } finally {
      analyzing.value = false;
      abortController = null;
    }
  };

  return {
    analyzing,
    error,
    analyzeDream
  };
};
