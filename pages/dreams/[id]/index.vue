<template>
  <div class="dream-view-page gradient-bg">
    <nav class="navbar">
      <div class="container">
        <div class="nav-content">
          <NuxtLink to="/" class="btn btn-secondary">
            ← Back
          </NuxtLink>
        </div>
      </div>
    </nav>

    <div class="container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading dream...</p>
      </div>

      <div v-else-if="currentDream" class="dream-detail card">
        <div class="dream-header">
          <h1>{{ currentDream.title }}</h1>
          <span class="dream-visibility">
            {{ currentDream.isPublic ? '🌍 Public' : '🔒 Private' }}
          </span>
        </div>

        <div class="dream-meta">
          <span class="dream-date">
            📅 {{ formatDate(currentDream.date) }}
          </span>
          <span class="dream-author">
            👤 {{ currentDream.author }}
          </span>
        </div>

        <div class="dream-content">
          {{ currentDream.content }}
        </div>

        <div v-if="currentDream.tags.length > 0" class="dream-tags">
          <h3>Tags</h3>
          <div class="tags-list">
            <span
              v-for="tag in currentDream.tags"
              :key="tag"
              class="tag"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <div v-if="currentDream.aiAnalysis" class="ai-section">
          <h3>🤖 AI Analysis</h3>
          <div class="ai-content" v-html="formatAIAnalysis(currentDream.aiAnalysis)"></div>
        </div>

        <div v-if="currentDream.aiMotifs && currentDream.aiMotifs.length > 0" class="motifs-section">
          <h3>✨ Motifs</h3>
          <div class="motifs-list">
            <span v-for="motif in currentDream.aiMotifs" :key="motif" class="motif-tag">
              {{ motif }}
            </span>
          </div>
        </div>

        <div v-if="currentDream.aiEmotions && currentDream.aiEmotions.length > 0" class="emotions-section">
          <h3>💭 Emotions</h3>
          <div class="emotions-list">
            <span v-for="emotion in currentDream.aiEmotions" :key="emotion" class="emotion-tag">
              {{ emotion }}
            </span>
          </div>
        </div>

        <!-- Analyze buttons -->
        <div class="dream-actions">
          <template v-if="isAuthenticated">
            <button 
              v-if="!currentDream.aiAnalysis"
              @click="handleAnalyzeDream" 
              class="btn btn-accent"
              :disabled="analyzing"
            >
              {{ analyzing ? '⏳ Analyzing...' : '🔮 Analyze Dream' }}
            </button>
            <button 
              v-else
              @click="handleRefreshAnalysis" 
              class="btn btn-accent"
              :disabled="analyzing"
              title="Generate fresh AI interpretation"
            >
              {{ analyzing ? '⏳ Refreshing...' : '🔄 Refresh Analysis' }}
            </button>
          </template>
          <template v-else>
            <!-- Show disabled analyze button with tooltip for non-authenticated users -->
            <div class="tooltip-wrapper">
              <button 
                class="btn btn-accent btn-disabled" 
                disabled
                v-if="!currentDream.aiAnalysis"
              >
                🔮 Analyze Dream
              </button>
              <button 
                class="btn btn-accent btn-disabled"
                disabled
                v-else
              >
                🔄 Refresh Analysis
              </button>
              <span class="tooltip">Login to analyze dreams</span>
            </div>
          </template>
          <!-- Edit and Delete only for owner -->
          <template v-if="currentDream.isOwner">
            <NuxtLink :to="`/dreams/${currentDream.id}/edit`" class="btn btn-primary">
              ✏️ Edit
            </NuxtLink>
            <button @click="handleDelete" class="btn btn-danger">
              🗑️ Delete
            </button>
          </template>
        </div>
      </div>

      <div v-else class="error-state">
        <h2>Dream not found</h2>
        <NuxtLink to="/" class="btn btn-primary">
          Go Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { isAuthenticated } = useAuth();
const { currentDream, loading, fetchDream, deleteDream, updateDream } = useDreams();
const { analyzeDream } = useAnalyze();
const { extractMotifsAndEmotions } = useExtract();

const analyzing = ref(false);

onMounted(async () => {
  try {
    await fetchDream(route.params.id as string);
  } catch (e) {
    console.error('Failed to load dream');
  }
});

const handleAnalyzeDream = async () => {
  if (!currentDream.value || analyzing.value) return;
  
  analyzing.value = true;
  
  try {
    // Get AI analysis
    const analysis = await analyzeDream({
      dreamContent: currentDream.value.content,
      dreamTitle: currentDream.value.title,
      tags: currentDream.value.tags,
      dreamId: currentDream.value.id
    });

    // Wait 2 seconds before making the second API call to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get motifs and emotions
    const extraction = await extractMotifsAndEmotions({
      dreamContent: currentDream.value.content,
      dreamTitle: currentDream.value.title,
      existingTags: currentDream.value.tags,
      dreamId: currentDream.value.id
    });

    // Update the dream with AI data
    if (analysis || extraction) {
      await updateDream(currentDream.value.id, {
        aiAnalysis: analysis || undefined,
        aiMotifs: extraction?.motifs,
        aiEmotions: extraction?.emotions,
        emotionalIntensity: extraction?.emotionalIntensity
      });
      
      // Refresh the current dream
      await fetchDream(route.params.id as string);
    }
  } catch (e: any) {
    const errorMessage = typeof e === 'string' ? e : (e.message || 'Unknown error');
    alert('Failed to analyze dream: ' + errorMessage + '\n\nTip: If you see a rate limit error, please wait 60 seconds before trying again.');
  } finally {
    analyzing.value = false;
  }
};

const handleRefreshAnalysis = async () => {
  if (!currentDream.value || analyzing.value) return;
  
  if (!confirm('This will generate a new AI interpretation. Continue?')) {
    return;
  }
  
  analyzing.value = true;
  
  try {
    // Get fresh AI analysis
    const analysis = await analyzeDream({
      dreamContent: currentDream.value.content,
      dreamTitle: currentDream.value.title,
      tags: currentDream.value.tags,
      dreamId: currentDream.value.id,
      isRefresh: true
    });

    // Wait 2 seconds before making the second API call to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get fresh motifs and emotions
    const extraction = await extractMotifsAndEmotions({
      dreamContent: currentDream.value.content,
      dreamTitle: currentDream.value.title,
      existingTags: currentDream.value.tags,
      dreamId: currentDream.value.id
    });

    // Update the dream with fresh AI data
    if (analysis || extraction) {
      await updateDream(currentDream.value.id, {
        aiAnalysis: analysis || undefined,
        aiMotifs: extraction?.motifs,
        aiEmotions: extraction?.emotions,
        emotionalIntensity: extraction?.emotionalIntensity
      });
      
      // Refresh the current dream
      await fetchDream(route.params.id as string);
    }
  } catch (e: any) {
    const errorMessage = typeof e === 'string' ? e : (e.message || 'Unknown error');
    alert('Failed to refresh analysis: ' + errorMessage + '\n\nTip: If you see a rate limit error, please wait 60 seconds before trying again.');
  } finally {
    analyzing.value = false;
  }
};

const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this dream?')) {
    try {
      await deleteDream(route.params.id as string);
      router.push('/');
    } catch (e) {
      alert('Failed to delete dream');
    }
  }
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatAIAnalysis = (text: string) => {
  // Format AI analysis with proper HTML formatting
  return text
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/(\d+\.\s)/g, '<br><strong>$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};
</script>

<style scoped lang="scss">
.dream-view-page {
  min-height: 100vh;
  padding-bottom: $spacing-2xl;
}

.navbar {
  background: rgba($bg-secondary, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: $spacing-lg 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.loading {
  text-align: center;
  padding: $spacing-2xl;
  margin-top: 100px;

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid $bg-tertiary;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto $spacing-lg;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dream-detail {
  max-width: 900px;
  margin: $spacing-2xl auto;

  .dream-header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $bg-tertiary;

    h1 {
      margin: 0;
      flex: 1;
    }

    .dream-visibility {
      font-size: 1rem;
      color: $text-muted;
      padding: $spacing-xs $spacing-md;
      background: rgba($primary, 0.1);
      border-radius: $radius-lg;
    }
  }

  .dream-meta {
    display: flex;
    gap: $spacing-xl;
    margin-bottom: $spacing-xl;
    padding-bottom: $spacing-lg;
    border-bottom: 1px solid $bg-tertiary;
    color: $text-muted;
    font-size: 0.95rem;
  }

  .dream-content {
    color: $text-secondary;
    line-height: 1.8;
    font-size: 1.1rem;
    margin-bottom: $spacing-xl;
    white-space: pre-wrap;
  }

  .dream-tags {
    margin-bottom: $spacing-xl;

    h3 {
      font-size: 1.2rem;
      margin-bottom: $spacing-md;
    }

    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-sm;

      .tag {
        background: linear-gradient(135deg, $primary, $secondary);
        color: white;
        padding: $spacing-sm $spacing-lg;
        border-radius: $radius-lg;
        font-size: 0.95rem;
        font-weight: 500;
      }
    }
  }

  .ai-section,
  .motifs-section,
  .emotions-section {
    margin-top: $spacing-xl;
    padding-top: $spacing-xl;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    h3 {
      font-size: 1.2rem;
      margin-bottom: $spacing-md;
      color: $primary-light;
    }

    .ai-content {
      color: $text-secondary;
      line-height: 1.8;
      font-size: 1.05rem;
    }
  }

  .motifs-list,
  .emotions-list {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .motif-tag {
    padding: $spacing-xs $spacing-md;
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(138, 43, 226, 0.3));
    border: 1px solid rgba(138, 43, 226, 0.4);
    color: $primary-light;
    border-radius: $radius-lg;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .emotion-tag {
    padding: $spacing-xs $spacing-md;
    background: linear-gradient(135deg, rgba(255, 105, 180, 0.2), rgba(255, 105, 180, 0.3));
    border: 1px solid rgba(255, 105, 180, 0.4);
    color: $accent;
    border-radius: $radius-lg;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .dream-actions {
    display: flex;
    gap: $spacing-md;
    padding-top: $spacing-xl;
    border-top: 1px solid $bg-tertiary;

    .btn {
      flex: 1;
      text-align: center;
    }

    .btn-danger {
      background: rgba($error, 0.1);
      color: $error;
      border: 1px solid $error;

      &:hover {
        background: rgba($error, 0.2);
      }
    }

    .btn-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tooltip-wrapper {
      position: relative;
      flex: 1;

      .tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: $spacing-xs $spacing-sm;
        border-radius: $radius-sm;
        font-size: 0.875rem;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
        margin-bottom: 8px;

        &::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.9);
        }
      }

      &:hover .tooltip {
        opacity: 1;
      }

      .btn {
        width: 100%;
      }
    }
  }
}

.error-state {
  text-align: center;
  padding: $spacing-2xl;
  margin-top: 100px;

  h2 {
    color: $text-muted;
    margin-bottom: $spacing-xl;
  }
}

@media (max-width: $breakpoint-md) {
  .dream-detail {
    .dream-header {
      flex-direction: column;
      gap: $spacing-md;

      .dream-visibility {
        align-self: flex-start;
      }
    }

    .dream-meta {
      flex-direction: column;
      gap: $spacing-sm;
    }
  }
}
</style>
