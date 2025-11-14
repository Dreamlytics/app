<template>
  <div class="public-feed-page">
    <nav class="navbar">
      <div class="container">
        <div class="nav-content">
          <NuxtLink to="/" class="logo">
            <h3>✨ Dreamlytics</h3>
          </NuxtLink>
          <div class="nav-actions">
            <NuxtLink to="/" class="btn btn-secondary">
              ← Back to Home
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="container">
      <div class="header">
        <h1>🌐 Public Dream Feed</h1>
        <p class="subtitle">Explore dreams shared by the community</p>
      </div>

      <!-- Stats Bar -->
      <div v-if="pagination" class="stats-bar">
        <div class="stat-item">
          <span class="stat-icon">📚</span>
          <span class="stat-text">{{ pagination.total }} public dreams</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">📄</span>
          <span class="stat-text">Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-controls">
          <div class="filter-type-selector">
            <label for="filterType">Filter by:</label>
            <select 
              id="filterType" 
              v-model="selectedFilterType" 
              @change="handleFilterChange"
              class="filter-select"
            >
              <option value="all">All Dreams</option>
              <option value="motifs">Motifs</option>
              <option value="emotions">Emotions</option>
            </select>
          </div>
          
          <div v-if="selectedFilterType !== 'all'" class="filter-search">
            <input
              v-model="searchQuery"
              @input="handleFilterChange"
              type="text"
              :placeholder="`Search ${selectedFilterType}...`"
              class="search-input"
            />
            <button 
              v-if="searchQuery" 
              @click="handleClearFilter"
              class="clear-filter-btn"
              title="Clear filter"
            >
              ✕
            </button>
          </div>

          <div v-if="currentFilterQuery" class="active-filter-badge">
            <span class="badge-icon">🔍</span>
            <span class="badge-text">{{ currentFilterType }}: "{{ currentFilterQuery }}"</span>
            <button @click="handleClearFilter" class="badge-close">✕</button>
          </div>
        </div>
      </div>

      <!-- Loading State (Initial) -->
      <div v-if="loading && dreams.length === 0" class="loading-state">
        <div class="spinner"></div>
        <p>Loading public dreams...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error && dreams.length === 0" class="error-state">
        <p>❌ {{ error }}</p>
        <button @click="refresh">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="dreams.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">🌙</div>
        <h3>No Public Dreams Yet</h3>
        <p>Be the first to share your dreams with the community!</p>
        <NuxtLink to="/dreams/new" class="btn btn-primary">
          Share Your Dream
        </NuxtLink>
      </div>

      <!-- Dreams Feed -->
      <div v-else class="feed-content">
        <div class="dreams-grid">
          <div
            v-for="dream in dreams"
            :key="dream.id"
            class="dream-card"
            @click="navigateToDream(dream.id)"
          >
            <div class="dream-date">
              <span class="date-icon">📅</span>
              <span class="date-text">{{ formatDate(dream.date) }}</span>
            </div>
            <h3 class="dream-title">{{ dream.title }}</h3>
            
            <!-- Motifs and Emotions Tags -->
            <div v-if="dream.motifs.length > 0 || dream.emotions.length > 0" class="dream-tags">
              <div v-if="dream.motifs.length > 0" class="tag-group">
                <span 
                  v-for="motif in dream.motifs.slice(0, 3)" 
                  :key="motif"
                  class="tag tag-motif"
                >
                  {{ motif }}
                </span>
                <span v-if="dream.motifs.length > 3" class="tag-more">
                  +{{ dream.motifs.length - 3 }}
                </span>
              </div>
              <div v-if="dream.emotions.length > 0" class="tag-group">
                <span 
                  v-for="emotion in dream.emotions.slice(0, 3)" 
                  :key="emotion"
                  class="tag tag-emotion"
                >
                  {{ emotion }}
                </span>
                <span v-if="dream.emotions.length > 3" class="tag-more">
                  +{{ dream.emotions.length - 3 }}
                </span>
              </div>
            </div>

            <div class="dream-footer">
              <div class="footer-left">
                <span class="public-badge">🌐 Public</span>
                <button 
                  @click="handleLike($event, dream.id)"
                  :class="['like-button', { liked: dream.isLikedByMe }]"
                  :title="isAuthenticated ? (dream.isLikedByMe ? 'Unlike' : 'Like') : 'Login to like'"
                >
                  <span class="like-icon">{{ dream.isLikedByMe ? '❤️' : '🤍' }}</span>
                  <span class="like-count">{{ dream.likeCount }}</span>
                </button>
              </div>
              <span class="view-link">View →</span>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="pagination && pagination.hasMore" class="load-more-section">
          <button 
            @click="loadMore" 
            :disabled="loading"
            class="btn-load-more"
          >
            <span v-if="loading">
              <div class="mini-spinner"></div>
              Loading...
            </span>
            <span v-else>
              Load More Dreams
            </span>
          </button>
        </div>

        <!-- End of Feed -->
        <div v-else-if="dreams.length > 0" class="end-of-feed">
          <div class="divider"></div>
          <span class="end-text">✨ You've reached the end ✨</span>
          <div class="divider"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePublicFeed } from '~/composables/usePublicFeed';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';

const { 
  loading, 
  error, 
  dreams, 
  pagination, 
  filterType: currentFilterType,
  filterQuery: currentFilterQuery,
  fetchPublicDreams, 
  loadMore, 
  refresh, 
  toggleLike,
  applyFilter,
  clearFilter
} = usePublicFeed();

const { isAuthenticated } = useAuth();
const router = useRouter();

const selectedFilterType = ref('all');
const searchQuery = ref('');
const searchTimeout = ref<NodeJS.Timeout | null>(null);

onMounted(() => {
  fetchPublicDreams(1, 20);
});

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  }
};

const navigateToDream = (dreamId: string) => {
  router.push(`/dreams/${dreamId}`);
};

const handleLike = async (event: Event, dreamId: string) => {
  event.stopPropagation(); // Prevent card click navigation
  
  if (!isAuthenticated.value) {
    // Redirect to login if not authenticated
    router.push('/login');
    return;
  }

  try {
    await toggleLike(dreamId);
  } catch (err: any) {
    console.error('Failed to toggle like:', err);
    // You could show a toast notification here
  }
};

const handleFilterChange = () => {
  // Clear existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  // Debounce search
  searchTimeout.value = setTimeout(() => {
    if (selectedFilterType.value === 'all' || !searchQuery.value.trim()) {
      clearFilter();
    } else {
      applyFilter(selectedFilterType.value, searchQuery.value.trim());
    }
  }, 300);
};

const handleClearFilter = () => {
  selectedFilterType.value = 'all';
  searchQuery.value = '';
  clearFilter();
};
</script>

<style scoped lang="scss">
.public-feed-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.navbar {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
  }

  .logo {
    text-decoration: none;
    
    h3 {
      margin: 0;
      font-size: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .nav-actions {
    display: flex;
    gap: 1rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;

    &.btn-secondary {
      background: #f0f0f0;
      color: #333;

      &:hover {
        background: #e0e0e0;
        transform: translateY(-2px);
      }
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    background: linear-gradient(359deg, #ffff 0%, #ffff 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #fff;
    font-size: 1.1rem;
  }
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .stat-icon {
      font-size: 1.2rem;
    }

    .stat-text {
      font-weight: 500;
      color: #333;
    }
  }
}

.filter-section {
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .filter-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;

    .filter-type-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      label {
        font-weight: 500;
        color: #333;
      }

      .filter-select {
        padding: 0.5rem 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        background: white;
        color: #333;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: #667eea;
        }

        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
      }
    }

    .filter-search {
      flex: 1;
      min-width: 250px;
      max-width: 400px;
      position: relative;

      .search-input {
        width: 100%;
        padding: 0.5rem 2.5rem 0.5rem 1rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        &::placeholder {
          color: #999;
        }
      }

      .clear-filter-btn {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        background: #f0f0f0;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #666;
        font-size: 0.9rem;
        transition: all 0.3s ease;

        &:hover {
          background: #e0e0e0;
          color: #333;
        }
      }
    }

    .active-filter-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;

      .badge-icon {
        font-size: 1rem;
      }

      .badge-text {
        text-transform: capitalize;
      }

      .badge-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        font-size: 0.8rem;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  p {
    color: #666;
    margin-bottom: 1rem;
  }

  button, .btn {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    display: inline-block;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  }
}

.feed-content {
  .dreams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;

    .dream-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 4px solid transparent;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
        border-left-color: #667eea;

        .view-link {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .dream-date {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        color: #666;
        font-size: 0.9rem;

        .date-icon {
          font-size: 1rem;
        }

        .date-text {
          font-weight: 500;
        }
      }

      .dream-title {
        font-size: 1.25rem;
        color: #333;
        margin-bottom: 1rem;
        line-height: 1.4;
        min-height: 3rem;
        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .dream-tags {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;

        .tag-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tag {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          text-transform: capitalize;

          &.tag-motif {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
            color: #667eea;
            border: 1px solid rgba(102, 126, 234, 0.3);
          }

          &.tag-emotion {
            background: linear-gradient(135deg, rgba(255, 107, 157, 0.15), rgba(255, 68, 127, 0.15));
            color: #ff6b9d;
            border: 1px solid rgba(255, 107, 157, 0.3);
          }
        }

        .tag-more {
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          color: #999;
          font-weight: 500;
        }
      }

      .dream-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 1rem;
        border-top: 1px solid #f0f0f0;

        .footer-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .public-badge {
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          font-size: 0.8rem;
          color: #667eea;
          font-weight: 500;
        }

        .like-button {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;

          &:hover {
            border-color: #ff6b9d;
            transform: scale(1.05);
          }

          &.liked {
            border-color: #ff6b9d;
            background: linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(255, 68, 127, 0.1));

            .like-icon {
              animation: heartBeat 0.5s ease;
            }
          }

          .like-icon {
            font-size: 1.1rem;
            line-height: 1;
          }

          .like-count {
            font-weight: 600;
            color: #333;
            font-size: 0.85rem;
          }
        }

        .view-link {
          color: #667eea;
          font-weight: 600;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }
      }

      @keyframes heartBeat {
        0%, 100% {
          transform: scale(1);
        }
        25% {
          transform: scale(1.3);
        }
        50% {
          transform: scale(1.1);
        }
        75% {
          transform: scale(1.2);
        }
      }
    }
  }

  .load-more-section {
    text-align: center;
    margin: 2rem 0;

    .btn-load-more {
      padding: 0.75rem 2rem;
      background: rgba(255, 255, 255, 0.95);
      color: #333;
      border: 2px solid rgba(102, 126, 234, 0.3);
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 auto;

      &:not(:disabled):hover {
        background: white;
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .mini-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }
  }

  .end-of-feed {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 2rem 0;
    padding: 1rem 0;

    .divider {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    }

    .end-text {
      color: white;
      font-weight: 500;
      font-size: 0.9rem;
      white-space: nowrap;
    }
  }
}

@media (max-width: 768px) {
  .public-feed-page {
    .container {
      padding: 1rem;
    }

    .header h1 {
      font-size: 2rem;
    }

    .stats-bar {
      flex-direction: column;
      gap: 0.5rem;
      align-items: center;
    }

    .filter-section {
      .filter-controls {
        flex-direction: column;
        align-items: stretch;

        .filter-type-selector {
          width: 100%;
          justify-content: space-between;

          .filter-select {
            flex: 1;
          }
        }

        .filter-search {
          max-width: 100%;
        }

        .active-filter-badge {
          width: 100%;
          justify-content: space-between;
        }
      }
    }

    .dreams-grid {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;

      .dream-card {
        .dream-title {
          font-size: 1.1rem;
          min-height: auto;
        }
      }
    }
  }
}
</style>
