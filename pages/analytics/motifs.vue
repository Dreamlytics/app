<template>
  <div class="analytics-page gradient-bg">
    <nav class="navbar">
      <div class="container">
        <div class="nav-content">
          <NuxtLink to="/" class="logo">
            <h3>✨ Dreamlytics</h3>
          </NuxtLink>
          <div class="nav-actions">
            <NuxtLink to="/analytics/emotions" class="btn btn-secondary">
              😎 Emotions
            </NuxtLink>
            <NuxtLink to="/analytics/frequency" class="btn btn-secondary">
              📊 Frequency
            </NuxtLink>
            <NuxtLink to="/" class="btn btn-secondary">
              ← Back to Dreams
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="container">
      <div class="page-header">
        <h1>🎭 Motif Analytics</h1>
        <p>Discover the most common themes and symbols in your dreams</p>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Analyzing dream motifs...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h2>Failed to Load Analytics</h2>
        <p>{{ error }}</p>
        <button @click="loadData" class="btn btn-primary">Try Again</button>
      </div>

      <div v-else-if="data" class="analytics-content">
        <!-- Stats Overview -->
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <h3>{{ data.stats.totalDreamsWithMotifs }}</h3>
              <p>Dreams Analyzed</p>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">🎭</div>
            <div class="stat-info">
              <h3>{{ data.stats.totalUniqueMotifs }}</h3>
              <p>Unique Motifs</p>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <h3>{{ data.stats.topMotifsCount }}</h3>
              <p>Top Motifs Shown</p>
            </div>
          </div>
        </div>

        <!-- Motif Frequency Chart -->
        <div class="motif-chart-section card">
          <div class="section-header">
            <h2>Most Common Motifs</h2>
            <div class="view-controls">
              <button 
                @click="viewMode = 'chart'" 
                :class="['view-btn', { active: viewMode === 'chart' }]"
              >
                📊 Chart
              </button>
              <button 
                @click="viewMode = 'list'" 
                :class="['view-btn', { active: viewMode === 'list' }]"
              >
                📋 List
              </button>
            </div>
          </div>

          <!-- Chart View -->
          <div v-if="viewMode === 'chart'" class="motif-bars">
            <div 
              v-for="(item, index) in data.motifs" 
              :key="item.motif"
              class="motif-bar-item"
            >
              <div class="motif-rank">{{ index + 1 }}</div>
              <div class="motif-info">
                <div class="motif-label">
                  <span class="motif-name">{{ item.motif }}</span>
                  <span class="motif-stats">
                    <strong>{{ item.frequency }}</strong> dreams
                    <span class="percentage">({{ item.percentage }}%)</span>
                  </span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${item.percentage}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="motif-list">
            <div 
              v-for="(item, index) in data.motifs" 
              :key="item.motif"
              class="motif-list-item"
            >
              <div class="motif-rank-badge">{{ index + 1 }}</div>
              <div class="motif-details">
                <h3>{{ item.motif }}</h3>
                <div class="motif-meta">
                  <span class="frequency-badge">
                    {{ item.frequency }} occurrences
                  </span>
                  <span class="percentage-badge">
                    {{ item.percentage }}% of dreams
                  </span>
                </div>
              </div>
              <div class="motif-action">
                <NuxtLink 
                  :to="`/?filterType=motif&query=${item.motif}`" 
                  class="btn btn-sm"
                  title="View dreams with this motif"
                >
                  View Dreams →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="data.motifs.length === 0" class="empty-analytics">
          <div class="empty-icon">🎭</div>
          <h3>No Motif Data Available</h3>
          <p>Analyze some dreams to see motif patterns!</p>
          <NuxtLink to="/" class="btn btn-primary">Go to Dreams</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { loading, error, data, fetchMotifFrequency } = useMotifAnalytics();
const viewMode = ref<'chart' | 'list'>('chart');

const loadData = async () => {
  try {
    await fetchMotifFrequency(20);
  } catch (e) {
    console.error('Failed to load motif analytics:', e);
  }
};

onMounted(() => {
  loadData();
});

useHead({
  title: 'Motif Analytics'
});
</script>

<style scoped lang="scss">
.analytics-page {
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

  .nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo h3 {
    margin: 0;
    font-size: 1.5rem;
  }
}

.page-header {
  text-align: center;
  padding: $spacing-2xl 0;
  margin-top: 40px;

  h1 {
    font-size: 3rem;
    margin-bottom: $spacing-md;
    background: linear-gradient(135deg, $primary, $accent);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 1.25rem;
    color: $text-secondary;
  }
}

.loading {
  text-align: center;
  padding: $spacing-2xl;
  margin-top: $spacing-2xl;

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid $bg-tertiary;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto $spacing-lg;
  }

  p {
    color: $text-secondary;
    font-size: 1.1rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  text-align: center;
  padding: $spacing-2xl;
  margin-top: $spacing-2xl;

  .error-icon {
    font-size: 4rem;
    margin-bottom: $spacing-lg;
  }

  h2 {
    color: $error;
    margin-bottom: $spacing-sm;
  }

  p {
    color: $text-muted;
    margin-bottom: $spacing-xl;
  }
}

.analytics-content {
  margin-top: $spacing-2xl;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-xl;
  margin-bottom: $spacing-2xl;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-xl;
  transition: transform $transition-base, box-shadow $transition-base;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-xl;
  }

  .stat-icon {
    font-size: 3rem;
    filter: drop-shadow(0 0 10px rgba($primary, 0.3));
  }

  .stat-info {
    h3 {
      font-size: 2.5rem;
      margin: 0 0 $spacing-xs 0;
      background: linear-gradient(135deg, $primary, $primary-light);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    p {
      margin: 0;
      color: $text-secondary;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

.motif-chart-section {
  padding: $spacing-xl;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;
    padding-bottom: $spacing-md;
    border-bottom: 2px solid $bg-tertiary;

    h2 {
      margin: 0;
      font-size: 1.75rem;
    }

    .view-controls {
      display: flex;
      gap: $spacing-xs;
      background: rgba($bg-tertiary, 0.5);
      padding: 4px;
      border-radius: $radius-lg;
    }

    .view-btn {
      padding: 8px 16px;
      background: transparent;
      border: none;
      color: $text-muted;
      font-size: 0.9rem;
      border-radius: $radius-md;
      cursor: pointer;
      transition: all 0.2s ease;

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
  }
}

.motif-bars {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.motif-bar-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;

  .motif-rank {
    font-size: 1.5rem;
    font-weight: 700;
    color: $text-muted;
    min-width: 40px;
    text-align: center;
  }

  .motif-info {
    flex: 1;
  }

  .motif-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xs;

    .motif-name {
      font-weight: 600;
      font-size: 1.05rem;
      color: $text-primary;
    }

    .motif-stats {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      font-size: 0.9rem;
      color: $text-secondary;

      strong {
        color: $primary-light;
      }

      .percentage {
        color: $text-muted;
      }
    }
  }

  .progress-bar {
    height: 12px;
    background: rgba($bg-tertiary, 0.5);
    border-radius: $radius-lg;
    overflow: hidden;
    position: relative;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, $primary, $primary-light);
      border-radius: $radius-lg;
      transition: width 0.6s ease;
      box-shadow: 0 0 10px rgba($primary, 0.4);
    }
  }
}

.motif-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.motif-list-item {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-lg;
  background: rgba($bg-tertiary, 0.3);
  border-radius: $radius-lg;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($bg-tertiary, 0.5);
    transform: translateX(4px);
  }

  .motif-rank-badge {
    font-size: 1.5rem;
    font-weight: 700;
    color: $primary-light;
    background: rgba($primary, 0.2);
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 2px solid rgba($primary, 0.3);
  }

  .motif-details {
    flex: 1;

    h3 {
      margin: 0 0 $spacing-xs 0;
      font-size: 1.2rem;
      color: $text-primary;
    }

    .motif-meta {
      display: flex;
      gap: $spacing-md;

      .frequency-badge,
      .percentage-badge {
        padding: 4px 12px;
        border-radius: $radius-md;
        font-size: 0.85rem;
        font-weight: 500;
      }

      .frequency-badge {
        background: rgba($primary, 0.15);
        color: $primary-light;
        border: 1px solid rgba($primary, 0.3);
      }

      .percentage-badge {
        background: rgba($accent, 0.15);
        color: $accent;
        border: 1px solid rgba($accent, 0.3);
      }
    }
  }

  .btn-sm {
    padding: $spacing-xs $spacing-md;
    font-size: 0.9rem;
  }
}

.empty-analytics {
  text-align: center;
  padding: $spacing-2xl;
  margin-top: $spacing-2xl;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: $spacing-lg;
    filter: grayscale(0.5);
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

@media (max-width: $breakpoint-md) {
  .page-header h1 {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .motif-chart-section .section-header {
    flex-direction: column;
    gap: $spacing-md;
    align-items: flex-start;
  }

  .motif-list-item {
    flex-direction: column;
    text-align: center;

    .motif-action {
      width: 100%;

      .btn {
        width: 100%;
      }
    }
  }
}
</style>
