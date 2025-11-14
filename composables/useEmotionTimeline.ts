export interface TimelineEntry {
  date: Date | string;
  emotions: string[];
  intensity: number;
  title: string;
  id: string;
}

export interface TopEmotion {
  emotion: string;
  count: number;
}

export interface EmotionTimelineData {
  timeline: TimelineEntry[];
  emotionsByDate: { [key: string]: { [emotion: string]: number } };
  intensityByDate: { [key: string]: { total: number; count: number; avg: number } };
  topEmotions: TopEmotion[];
  allEmotions: string[];
  stats: {
    totalDreams: number;
    dateRange: {
      start: Date | string | null;
      end: Date | string | null;
    };
    daysRequested: number;
  };
}

export const useEmotionTimeline = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const data = ref<EmotionTimelineData | null>(null);

  const fetchEmotionTimeline = async (days = 30) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch(
        '/api/analytics/emotion-timeline',
        {
          query: { days }
        }
      );

      if (response.success) {
        data.value = response.data;
      }

      return response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch emotion timeline';
      console.error('Error fetching emotion timeline:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    data,
    fetchEmotionTimeline
  };
};
