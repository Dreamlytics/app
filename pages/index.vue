<template>
  <div class="home-page gradient-bg">
    <nav class="navbar">
      <div class="container">
        <div class="nav-content">
          <NuxtLink to="/" class="logo">
            <h3>✨ Dreamlytics</h3>
          </NuxtLink>

          <!-- Hamburger Menu Button -->
          <button class="hamburger" @click="toggleMenu" :class="{ active: isMenuOpen }" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div class="nav-actions" :class="{ 'mobile-open': isMenuOpen }">
            <template v-if="isAuthenticated">
              <NuxtLink to="/app" class="btn btn-accent" @click="closeMenu">
                📱 WebView
              </NuxtLink>
              <NuxtLink to="/mobile-test" class="btn btn-accent" @click="closeMenu">
                🧪 Test
              </NuxtLink>
              <NuxtLink to="/public/feed" class="btn btn-secondary" @click="closeMenu">
                🌐 Feed
              </NuxtLink>
              <NuxtLink to="/analytics/motifs" class="btn btn-secondary" @click="closeMenu">
                🎭 Motifs
              </NuxtLink>
              <NuxtLink to="/analytics/emotions" class="btn btn-secondary" @click="closeMenu">
                💭 Emotions
              </NuxtLink>
              <NuxtLink to="/analytics/frequency" class="btn btn-secondary" @click="closeMenu">
                📊 Frequency
              </NuxtLink>
              <NuxtLink to="/extract" class="btn btn-secondary" @click="closeMenu">
                🎭 Extract
              </NuxtLink>
              <NuxtLink to="/analyze" class="btn btn-accent" @click="closeMenu">
                🔮 Analyze
              </NuxtLink>
              <NuxtLink to="/dreams/new" class="btn btn-primary" @click="closeMenu">
                ➕ New
              </NuxtLink>
              <button @click="handleLogout" class="btn btn-secondary">
                Logout
              </button>
            </template>
            <template v-else>
              <NuxtLink to="/app" class="btn btn-accent" @click="closeMenu">
                📱 WebView
              </NuxtLink>
              <NuxtLink to="/mobile-test" class="btn btn-accent" @click="closeMenu">
                🧪 Test
              </NuxtLink>
              <NuxtLink to="/public/feed" class="btn btn-secondary" @click="closeMenu">
                🌐 Feed
              </NuxtLink>
              <NuxtLink to="/analytics/motifs" class="btn btn-secondary" @click="closeMenu">
                🎭 Motifs
              </NuxtLink>
              <NuxtLink to="/analytics/emotions" class="btn btn-secondary" @click="closeMenu">
                💭 Emotions
              </NuxtLink>
              <NuxtLink to="/analytics/frequency" class="btn btn-secondary" @click="closeMenu">
                📊 Frequency
              </NuxtLink>
              <NuxtLink to="/login" class="btn btn-secondary" @click="closeMenu">
                Login
              </NuxtLink>
              <NuxtLink to="/register" class="btn btn-primary" @click="closeMenu">
                Register
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <div class="container">
      <div class="hero">
        <h1>Your Dream Journey</h1>
        <p>Track, analyze, and explore your dreams</p>
      </div>

      <div class="dreams-section">
        <div class="section-header">
          <h2>Recent Dreams</h2>
          <div class="filters">
            <div class="filter-controls">
              <div class="filter-type-selector">
                <button 
                  @click="filterType = 'tag'" 
                  :class="['filter-type-btn', { active: filterType === 'tag' }]"
                >
                  🏷️ Tags
                </button>
                <button 
                  @click="filterType = 'motif'" 
                  :class="['filter-type-btn', { active: filterType === 'motif' }]"
                >
                  🎭 Motifs
                </button>
                <button 
                  @click="filterType = 'emotion'" 
                  :class="['filter-type-btn', { active: filterType === 'emotion' }]"
                >
                  💭 Emotions
                </button>
              </div>
              <div class="filter-input-wrapper">
                <input
                  v-model="searchQuery"
                  type="text"
                  :placeholder="`Search by ${filterType}...`"
                  @input="handleFilter"
                  class="filter-input"
                />
                <button 
                  v-if="searchQuery" 
                  @click="clearFilter" 
                  class="clear-filter-btn"
                  title="Clear filter"
                >
                  ✕
                </button>
              </div>
            </div>
            <span v-if="searchQuery" class="filter-active-badge">
              Searching {{ filterType }}: <strong>{{ searchQuery }}</strong>
              <span class="fuzzy-hint">(fuzzy match)</span>
            </span>
          </div>
        </div>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading dreams...</p>
        </div>

        <div v-else-if="dreams.length === 0" class="empty-state">
          <div class="empty-icon">🌙</div>
          <h3>No dreams yet</h3>
          <p>Start recording your dreams to see them here</p>
          <NuxtLink v-if="isAuthenticated" to="/dreams/new" class="btn btn-primary">
            Record your first dream
          </NuxtLink>
        </div>

        <div v-else class="dreams-grid">
          <div
            v-for="dream in dreams"
            :key="dream.id"
            class="dream-card card"
          >
            <div class="dream-header">
              <h3>{{ dream.title }}</h3>
              <span class="dream-visibility">
                {{ dream.isPublic ? '🌍' : '🔒' }}
              </span>
            </div>

            <div class="dream-meta">
              <span class="dream-date">
                📅 {{ formatDate(dream.date) }}
              </span>
              <span class="dream-author">
                👤 {{ dream.author }}
              </span>
            </div>

            <p class="dream-content">
              {{ truncate(dream.content, 150) }}
            </p>

            <div v-if="dream.aiAnalysis" class="ai-interpretation">
              <div class="ai-header">
                <span class="ai-badge">🤖 AI Insight</span>
              </div>
              <div class="ai-text" v-html="formatAIAnalysis(dream.aiAnalysis, 200)"></div>
            </div>

            <div v-if="dream.aiMotifs && dream.aiMotifs.length > 0" class="ai-motifs">
              <span class="motif-label">Motifs:</span>
              <span
                v-for="motif in dream.aiMotifs.slice(0, 5)"
                :key="motif"
                class="ai-tag"
              >
                {{ motif }}
              </span>
            </div>

            <div v-if="dream.aiEmotions && dream.aiEmotions.length > 0" class="ai-emotions">
              <span class="emotion-label">Emotions:</span>
              <span
                v-for="emotion in dream.aiEmotions"
                :key="emotion"
                class="emotion-tag"
              >
                {{ emotion }}
              </span>
            </div>

            <div class="dream-tags">
              <span
                v-for="tag in dream.tags"
                :key="tag"
                class="tag"
              >
                #{{ tag }}
              </span>
            </div>

            <div class="dream-actions">
              <NuxtLink :to="`/dreams/${dream.id}`" class="btn btn-secondary">
                View
              </NuxtLink>
              <!-- Show analyze button for all users -->
              <template v-if="isAuthenticated">
                <button 
                  @click="handleAnalyzeDream(dream)" 
                  class="btn btn-accent" 
                  :disabled="analyzingDreamId === dream.id"
                  v-if="!dream.aiAnalysis"
                >
                  {{ analyzingDreamId === dream.id ? '⏳ Analyzing...' : '🔮 Analyze' }}
                </button>
                <button 
                  @click="handleRefreshInterpretation(dream)" 
                  class="btn btn-accent"
                  :disabled="analyzingDreamId === dream.id"
                  v-else
                  title="Refresh AI interpretation"
                >
                  {{ analyzingDreamId === dream.id ? '⏳ Refreshing...' : '🔄 Refresh' }}
                </button>
              </template>
              <template v-else>
                <!-- Show disabled analyze button with tooltip for non-authenticated users -->
                <div class="tooltip-wrapper">
                  <button 
                    class="btn btn-accent btn-disabled" 
                    disabled
                    v-if="!dream.aiAnalysis"
                  >
                    🔮 Analyze
                  </button>
                  <button 
                    class="btn btn-accent btn-disabled"
                    disabled
                    v-else
                  >
                    🔄 Refresh
                  </button>
                  <span class="tooltip">Login to analyze dreams</span>
                </div>
              </template>
              <!-- Edit and Delete only for owner -->
              <template v-if="dream.isOwner">
                <NuxtLink :to="`/dreams/${dream.id}/edit`" class="btn btn-secondary">
                  Edit
                </NuxtLink>
                <button @click="handleDelete(dream.id)" class="btn btn-danger">
                  Delete
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth();
const { dreams, loading, fetchDreams, deleteDream } = useDreams();
const router = useRouter();

// Mobile menu state
const isMenuOpen = ref(false);

const searchQuery = ref('');
const filterType = ref<'tag' | 'motif' | 'emotion'>('tag');
let filterTimeout: NodeJS.Timeout | null = null;

// Toggle mobile menu
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Close mobile menu
const closeMenu = () => {
  isMenuOpen.value = false;
};

onMounted(async () => {
  await fetchDreams();
});

const handleFilter = () => {
  // Debounce the filter to avoid too many requests
  if (filterTimeout) {
    clearTimeout(filterTimeout);
  }
  
  filterTimeout = setTimeout(() => {
    const trimmedQuery = searchQuery.value.trim();
    if (trimmedQuery) {
      fetchDreams(1, undefined, filterType.value, trimmedQuery);
    } else {
      fetchDreams(1, undefined);
    }
  }, 300); // Wait 300ms after user stops typing
};

const clearFilter = () => {
  searchQuery.value = '';
  fetchDreams(1, undefined);
};

const handleLogout = async () => {
  closeMenu();
  await logout();
};

const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this dream?')) {
    try {
      await deleteDream(id);
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

const truncate = (text: string, length: number) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

const formatAIAnalysis = (text: string, maxLength: number) => {
  const truncated = truncate(text, maxLength);
  // Format numbered lists and paragraphs
  return truncated
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/(\d+\.\s)/g, '<br><strong>$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

const { analyzeDream } = useAnalyze();
const { extractMotifsAndEmotions } = useExtract();
const { updateDream } = useDreams();

const analyzingDreamId = ref<string | null>(null);

const handleAnalyzeDream = async (dream: any) => {
  if (analyzingDreamId.value) return; // Prevent multiple simultaneous analyses
  
  analyzingDreamId.value = dream.id;
  
  try {
    // Get AI analysis
    const analysis = await analyzeDream({
      dreamContent: dream.content,
      dreamTitle: dream.title,
      tags: dream.tags,
      dreamId: dream.id
    });

    // Wait 2 seconds before making the second API call to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get motifs and emotions
    const extraction = await extractMotifsAndEmotions({
      dreamContent: dream.content,
      dreamTitle: dream.title,
      existingTags: dream.tags,
      dreamId: dream.id
    });

    // Update the dream with AI data
    if (analysis || extraction) {
      await updateDream(dream.id, {
        aiAnalysis: analysis || undefined,
        aiMotifs: extraction?.motifs,
        aiEmotions: extraction?.emotions,
        emotionalIntensity: extraction?.emotionalIntensity
      });
      
      // Refresh the dreams list
      await fetchDreams();
    }
  } catch (e: any) {
    const errorMessage = typeof e === 'string' ? e : (e.message || 'Unknown error');
    alert('Failed to analyze dream: ' + errorMessage + '\n\nTip: If you see a rate limit error, please wait 60 seconds before trying again.');
  } finally {
    analyzingDreamId.value = null;
  }
};

const handleRefreshInterpretation = async (dream: any) => {
  if (analyzingDreamId.value) return;
  
  if (!confirm('This will generate a new AI interpretation. Continue?')) {
    return;
  }
  
  analyzingDreamId.value = dream.id;
  
  try {
    // Get fresh AI analysis
    const analysis = await analyzeDream({
      dreamContent: dream.content,
      dreamTitle: dream.title,
      tags: dream.tags,
      dreamId: dream.id,
      isRefresh: true
    });

    // Wait 2 seconds before making the second API call to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get fresh motifs and emotions
    const extraction = await extractMotifsAndEmotions({
      dreamContent: dream.content,
      dreamTitle: dream.title,
      existingTags: dream.tags,
      dreamId: dream.id
    });

    // Update the dream with fresh AI data
    if (analysis || extraction) {
      await updateDream(dream.id, {
        aiAnalysis: analysis || undefined,
        aiMotifs: extraction?.motifs,
        aiEmotions: extraction?.emotions,
        emotionalIntensity: extraction?.emotionalIntensity
      });
      
      // Refresh the dreams list
      await fetchDreams();
    }
  } catch (e: any) {
    const errorMessage = typeof e === 'string' ? e : (e.message || 'Unknown error');
    alert('Failed to refresh interpretation: ' + errorMessage + '\n\nTip: If you see a rate limit error, please wait 60 seconds before trying again.');
  } finally {
    analyzingDreamId.value = null;
  }
};
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  padding-bottom: $spacing-2xl;
}

.navbar {
  background: rgba($bg-secondary, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0.75rem 0;
  position: sticky;
  top: 0;
  z-index: 100;

  .nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .logo h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .nav-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
    
    .btn {
      padding: 0.5rem 0.875rem;
      font-size: 0.8125rem;
      font-weight: 500;
      
      // Smaller emoji/icon size
      &::before {
        font-size: 0.9em;
      }
    }
  }
}

.hero {
  text-align: center;
  padding: 3rem 0;

  h1 {
    font-size: 2.75rem;
    margin-bottom: $spacing-md;
    line-height: 1.2;
  }

  p {
    font-size: 1.125rem;
    color: $text-secondary;
  }
}

.dreams-section {
  margin-top: $spacing-2xl;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xl;

  h2 {
    margin: 0;
    font-size: 2rem;
  }

  .filters {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    align-items: flex-end;
  }

  .filter-controls {
    display: flex;
    gap: $spacing-md;
    align-items: center;
  }

  .filter-type-selector {
    display: flex;
    gap: 4px;
    background: rgba($bg-tertiary, 0.5);
    padding: 4px;
    border-radius: $radius-lg;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .filter-type-btn {
    padding: 6px 12px;
    background: transparent;
    border: none;
    color: $text-muted;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: $radius-md;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      background: rgba($primary, 0.1);
      color: $text-secondary;
    }

    &.active {
      background: linear-gradient(135deg, $primary, $primary-light);
      color: white;
      box-shadow: 0 2px 8px rgba($primary, 0.3);
    }
  }

  .filter-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .filter-input {
    max-width: 300px;
    padding-right: 35px; // Make room for clear button
  }

  .clear-filter-btn {
    position: absolute;
    right: 8px;
    background: transparent;
    border: none;
    color: $text-muted;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 4px 8px;
    line-height: 1;
    transition: color 0.2s ease;

    &:hover {
      color: $text-primary;
    }
  }

  .filter-active-badge {
    font-size: 0.875rem;
    color: $text-secondary;
    background: rgba($primary, 0.15);
    padding: 6px 14px;
    border-radius: $radius-lg;
    border: 1px solid rgba($primary, 0.3);
    display: flex;
    align-items: center;
    gap: 6px;

    strong {
      color: $primary-light;
      font-weight: 600;
    }

    .fuzzy-hint {
      font-size: 0.75rem;
      color: $text-muted;
      font-style: italic;
      margin-left: 4px;
    }
  }
}

.loading {
  text-align: center;
  padding: $spacing-2xl;

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

.empty-state {
  text-align: center;
  padding: $spacing-2xl;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: $spacing-lg;
  }

  h3 {
    color: $text-secondary;
    margin-bottom: $spacing-sm;
  }

  p {
    color: $text-muted;
    margin-bottom: $spacing-xl;
  }
}

.dreams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: $spacing-xl;
}

.dream-card {
  display: flex;
  flex-direction: column;
  transition: transform $transition-base, box-shadow $transition-base;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-xl;
  }

  .dream-header {
    display: flex;
    align-items: start;
    justify-content: space-between;
    margin-bottom: $spacing-md;

    h3 {
      margin: 0;
      font-size: 1.5rem;
      flex: 1;
    }

    .dream-visibility {
      font-size: 1.2rem;
    }
  }

  .dream-meta {
    display: flex;
    gap: $spacing-lg;
    margin-bottom: $spacing-md;
    font-size: 0.875rem;
    color: $text-muted;
  }

  .dream-content {
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: $spacing-lg;
    flex: 1;
  }

  .ai-interpretation {
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.05), rgba(72, 209, 204, 0.05));
    border-left: 3px solid $primary;
    padding: $spacing-md;
    margin-bottom: $spacing-md;
    border-radius: $radius-md;

    .ai-header {
      margin-bottom: $spacing-xs;
    }

    .ai-badge {
      display: inline-block;
      background: linear-gradient(135deg, $primary, $secondary);
      color: white;
      padding: 2px $spacing-sm;
      border-radius: $radius-sm;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ai-text {
      color: $text-primary;
      font-size: 0.9rem;
      line-height: 1.6;
      margin: 0;
      font-style: italic;
    }
  }

  .ai-motifs,
  .ai-emotions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: $spacing-sm;

    .motif-label,
    .emotion-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: $text-muted;
      margin-right: $spacing-xs;
    }
  }

  .ai-tag {
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(138, 43, 226, 0.25));
    border: 1px solid rgba(138, 43, 226, 0.3);
    color: $primary-light;
    padding: 2px $spacing-sm;
    border-radius: $radius-sm;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .emotion-tag {
    background: linear-gradient(135deg, rgba(255, 105, 180, 0.15), rgba(255, 105, 180, 0.25));
    border: 1px solid rgba(255, 105, 180, 0.3);
    color: $accent;
    padding: 2px $spacing-sm;
    border-radius: $radius-sm;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .dream-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: $spacing-lg;

    .tag {
      background: rgba($primary, 0.2);
      color: $primary-light;
      padding: $spacing-xs $spacing-sm;
      border-radius: $radius-md;
      font-size: 0.875rem;
      font-weight: 500;
    }
  }

  .dream-actions {
    display: flex;
    gap: 8px;
    padding-top: $spacing-md;
    border-top: 1px solid $bg-tertiary;

    .btn {
      flex: 1;
      text-align: center;
      padding: $spacing-sm;
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
        font-size: 0.75rem;
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
          border: 4px solid transparent;
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

/* Hamburger Menu */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 101;

  span {
    width: 25px;
    height: 3px;
    background: $text-primary;
    border-radius: 3px;
    transition: all 0.3s ease;
  }

  &.active {
    span:nth-child(1) {
      transform: rotate(45deg) translate(4px, 5px);
    }

    span:nth-child(2) {
      opacity: 0;
    }

    span:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -7px);
    }
  }
}

/* Responsive Styles */
@media (max-width: $breakpoint-md) {
  .hamburger {
    display: flex;
  }

  .nav-actions {
    position: fixed;
    top: 0;
    right: -100%;
    height: 100vh;
    width: 280px;
    background: rgba($bg-secondary, 0.98);
    backdrop-filter: blur(20px);
    flex-direction: column;
    padding: 80px 20px 20px;
    gap: 0.75rem;
    transition: right 0.3s ease;
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 100;
    overflow-y: auto;

    &.mobile-open {
      right: 0;
    }

    .btn {
      width: 100%;
      justify-content: center;
      padding: 0.75rem 1.25rem;
      font-size: 0.9375rem;
    }
  }

  .hero h1 {
    font-size: 2.5rem;
  }

  .hero p {
    font-size: 1.1rem;
  }

  .dreams-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: $spacing-md;
    align-items: stretch;

    h2 {
      font-size: 1.75rem;
    }

    .filter-input {
      max-width: 100%;
    }

    .filter-controls {
      flex-direction: column;
      width: 100%;
    }

    .filter-type-selector {
      width: 100%;
      justify-content: space-between;
    }

    .filter-input-wrapper {
      width: 100%;
    }
  }

  .navbar {
    .logo h3 {
      font-size: 1.25rem;
    }
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 2rem;
  }

  .filter-type-btn {
    padding: 8px 10px;
    font-size: 0.8rem;
  }

  .dream-card {
    padding: $spacing-md;
  }

  .btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}
</style>
