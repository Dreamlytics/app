export interface Dream {
  id: string;
  title: string;
  content: string;
  date: Date | string;
  tags: string[];
  isPublic: boolean;
  aiAnalysis?: string;
  aiMotifs?: string[];
  aiEmotions?: string[];
  emotionalIntensity?: number;
  author?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isOwner?: boolean;
}

export interface CreateDreamData {
  title: string;
  content: string;
  date: Date | string;
  tags: string[];
  isPublic: boolean;
  aiAnalysis?: string;
  aiMotifs?: string[];
  aiEmotions?: string[];
  emotionalIntensity?: number;
}

export const useDreams = () => {
  const dreams = useState<Dream[]>('dreams', () => []);
  const loading = useState<boolean>('dreams-loading', () => false);
  const currentDream = useState<Dream | null>('current-dream', () => null);

  const fetchDreams = async (page = 1, tag?: string) => {
    loading.value = true;
    try {
      const query: any = { page };
      if (tag) query.tag = tag;
      
      const response = await $fetch<{ dreams: Dream[] }>('/api/dreams', {
        query
      });
      dreams.value = response.dreams;
    } catch (error) {
      console.error('Error fetching dreams:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchDream = async (id: string) => {
    loading.value = true;
    try {
      const response = await $fetch<{ dream: Dream }>(`/api/dreams/${id}`);
      currentDream.value = response.dream;
      return response.dream;
    } catch (error) {
      console.error('Error fetching dream:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createDream = async (data: CreateDreamData) => {
    const response = await $fetch<{ success: boolean; dream: Dream }>('/api/dreams', {
      method: 'POST',
      body: data
    });
    await fetchDreams();
    return response.dream;
  };

  const updateDream = async (id: string, data: Partial<CreateDreamData>) => {
    const response = await $fetch<{ success: boolean; dream: Dream }>(`/api/dreams/${id}`, {
      method: 'PUT',
      body: data
    });
    await fetchDreams();
    return response.dream;
  };

  const deleteDream = async (id: string) => {
    await $fetch(`/api/dreams/${id}`, { method: 'DELETE' as any });
    await fetchDreams();
  };

  return {
    dreams,
    currentDream,
    loading,
    fetchDreams,
    fetchDream,
    createDream,
    updateDream,
    deleteDream
  };
};
