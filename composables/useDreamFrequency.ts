export interface WeekData {
  weekStart: Date | string;
  weekEnd: Date | string;
  weekLabel: string;
  count: number;
  myDreams: number;
  publicDreams: number;
}

export interface RecentDream {
  id: string;
  title: string;
  date: Date | string;
  isPublic: boolean;
}

export interface DreamFrequencyStats {
  totalDreams: number;
  weeksWithDreams: number;
  averagePerWeek: number;
  maxWeek: {
    count: number;
    label: string;
  };
  minWeek: {
    count: number;
    label: string;
  };
  trend: 'increasing' | 'decreasing' | 'stable';
  trendValue: number;
}

export interface DreamFrequencyMetadata {
  weeksAnalyzed: number;
  startDate: Date | string | null;
  endDate: Date | string | null;
}

export interface DreamFrequencyData {
  weekly: WeekData[];
  stats: DreamFrequencyStats;
  recentDreams: RecentDream[];
  metadata: DreamFrequencyMetadata;
}

export const useDreamFrequency = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const data = ref<DreamFrequencyData | null>(null);

  const fetchDreamFrequency = async (weeks = 12) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(
        '/api/analytics/dream-frequency',
        {
          query: { weeks }
        }
      );

      if (response.success) {
        data.value = response.data;
      }

      return response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dream frequency';
      console.error('Error fetching dream frequency:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    data,
    fetchDreamFrequency
  };
};
