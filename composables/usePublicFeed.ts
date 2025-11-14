export interface PublicDream {
  id: string;
  title: string;
  date: Date | string;
  hasUser: boolean;
  likeCount: number;
  isLikedByMe: boolean;
  motifs: string[];
  emotions: string[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PublicFeedData {
  dreams: PublicDream[];
  pagination: PaginationInfo;
  filter: {
    type: string | null;
    query: string | null;
  };
}

export const usePublicFeed = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const dreams = ref<PublicDream[]>([]);
  const pagination = ref<PaginationInfo | null>(null);
  const currentPage = ref(1);
  const filterType = ref<string>('');
  const filterQuery = ref<string>('');

  const fetchPublicDreams = async (page = 1, limit = 20, type = '', query = '') => {
    loading.value = true;
    error.value = null;

    try {
      const queryParams: any = { page, limit };
      
      if (type && query) {
        queryParams.filterType = type;
        queryParams.filterQuery = query;
      }

      const response = await $fetch(
        '/api/public/dreams',
        {
          query: queryParams
        }
      );

      if (response.success) {
        dreams.value = response.data.dreams;
        pagination.value = response.data.pagination;
        currentPage.value = page;
        filterType.value = type;
        filterQuery.value = query;
      }

      return response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch public dreams';
      console.error('Error fetching public dreams:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadMore = async () => {
    if (!pagination.value || !pagination.value.hasMore) return;
    
    const nextPage = currentPage.value + 1;
    loading.value = true;

    try {
      const queryParams: any = { 
        page: nextPage, 
        limit: pagination.value.limit 
      };
      
      if (filterType.value && filterQuery.value) {
        queryParams.filterType = filterType.value;
        queryParams.filterQuery = filterQuery.value;
      }

      const response = await $fetch(
        '/api/public/dreams',
        {
          query: queryParams
        }
      );

      if (response.success) {
        dreams.value = [...dreams.value, ...response.data.dreams];
        pagination.value = response.data.pagination;
        currentPage.value = nextPage;
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load more dreams';
      console.error('Error loading more dreams:', err);
    } finally {
      loading.value = false;
    }
  };

  const refresh = async () => {
    await fetchPublicDreams(1, pagination.value?.limit || 20, filterType.value, filterQuery.value);
  };

  const applyFilter = async (type: string, query: string) => {
    await fetchPublicDreams(1, pagination.value?.limit || 20, type, query);
  };

  const clearFilter = async () => {
    filterType.value = '';
    filterQuery.value = '';
    await fetchPublicDreams(1, pagination.value?.limit || 20, '', '');
  };

  const toggleLike = async (dreamId: string) => {
    try {
      const response = await $fetch(
        `/api/dreams/${dreamId}/like`,
        {
          method: 'POST'
        }
      );

      if (response.success) {
        // Update the dream in the local state
        const dream = dreams.value.find(d => d.id === dreamId);
        if (dream) {
          dream.isLikedByMe = response.data.liked;
          dream.likeCount = response.data.likeCount;
        }
      }

      return response.data;
    } catch (err: any) {
      console.error('Error toggling like:', err);
      throw err;
    }
  };

  return {
    loading,
    error,
    dreams,
    pagination,
    currentPage,
    filterType,
    filterQuery,
    fetchPublicDreams,
    loadMore,
    refresh,
    toggleLike,
    applyFilter,
    clearFilter
  };
};
