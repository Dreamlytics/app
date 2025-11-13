export interface MotifFrequency {
  motif: string;
  frequency: number;
  percentage: number;
  sampleDreamIds: string[];
}

export interface MotifFrequencyStats {
  totalDreamsWithMotifs: number;
  totalUniqueMotifs: number;
  topMotifsCount: number;
}

export interface MotifFrequencyData {
  motifs: MotifFrequency[];
  stats: MotifFrequencyStats;
}

export const useMotifAnalytics = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const data = ref<MotifFrequencyData | null>(null);

  const fetchMotifFrequency = async (limit = 20) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{ success: boolean; data: MotifFrequencyData }>(
        '/api/analytics/motif-frequency',
        {
          query: { limit }
        }
      );

      if (response.success) {
        data.value = response.data;
      }

      return response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch motif frequency';
      console.error('Error fetching motif frequency:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    data,
    fetchMotifFrequency
  };
};
