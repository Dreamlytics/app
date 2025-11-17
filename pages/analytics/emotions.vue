<template>
  <div class="emotion-timeline-page">
    <nav class="navbar">
      <div class="container">
        <div class="nav-content">
          <NuxtLink to="/" class="logo">
            <h3>✨ Dreamlytics</h3>
          </NuxtLink>
          <div class="nav-actions">
            <NuxtLink to="/analytics/motifs" class="btn btn-secondary">
              🎭 Motifs
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
      <div class="header">
        <h1>📈 Emotion Timeline</h1>
        <p class="subtitle">Visualize emotional patterns across your dreams over time</p>
      </div>

      <!-- Time Range Selector -->
      <div class="controls">
        <div class="time-selector">
          <button
            v-for="option in timeOptions"
            :key="option.value"
            @click="selectedDays = option.value"
            :class="{ active: selectedDays === option.value }"
          >
            {{ option.label }}
          </button>
        </div>
        <button v-if="data" @click="fetchData" class="refresh-btn">
          🔄 Refresh
        </button>
      </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading emotion timeline...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>❌ {{ error }}</p>
      <button @click="fetchData">Try Again</button>
    </div>

    <!-- Content -->
    <div v-else-if="data" class="content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ data.stats.totalDreams }}</div>
            <div class="stat-label">Dreams Analyzed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">😊</div>
          <div class="stat-content">
            <div class="stat-value">{{ data.allEmotions.length }}</div>
            <div class="stat-label">Unique Emotions</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-value">{{ data.stats.daysRequested }}</div>
            <div class="stat-label">Days Range</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-value">{{ averageIntensity }}</div>
            <div class="stat-label">Avg Intensity</div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="data.stats.totalDreams === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No Dreams Found</h3>
        <p>No dreams with AI-analyzed emotions in the selected time range.</p>
        <p>Try selecting a longer time period or analyze more dreams.</p>
      </div>

      <template v-else>
        <!-- Timeline Chart -->
        <div class="chart-section">
          <h2>Emotion Intensity Over Time</h2>
          <div class="intensity-chart">
            <div class="chart-container">
              <div class="y-axis">
                <span v-for="i in 11" :key="i" class="y-label">{{ 11 - i }}</span>
              </div>
              <div class="chart-area">
                <div class="grid-lines">
                  <div v-for="i in 11" :key="i" class="grid-line"></div>
                </div>
                <svg class="line-chart" :viewBox="`0 0 ${chartWidth} ${chartHeight}`">
                  <!-- Intensity line -->
                  <polyline
                    :points="intensityLinePoints"
                    fill="none"
                    stroke="url(#gradient1)"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <!-- Data points -->
                  <circle
                    v-for="(point, index) in intensityPoints"
                    :key="index"
                    :cx="point.x"
                    :cy="point.y"
                    r="5"
                    :fill="getIntensityColor(point.intensity)"
                    class="data-point"
                    @click="selectDream(point.dreamId)"
                  >
                    <title>{{ point.date }}: Intensity {{ point.intensity }}</title>
                  </circle>
                  <!-- Gradient definition -->
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                      <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#f093fb;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div class="x-axis">
              <span v-for="label in xAxisLabels" :key="label" class="x-label">{{ label }}</span>
            </div>
          </div>
        </div>

        <!-- Emotion Frequency Chart -->
        <div class="chart-section">
          <h2>Most Common Emotions</h2>
          <div class="emotion-bars">
            <div
              v-for="emotion in data.topEmotions"
              :key="emotion.emotion"
              class="emotion-bar-item"
            >
              <div class="emotion-label">
                <span class="emotion-name">{{ emotion.emotion }}</span>
                <span class="emotion-count">{{ emotion.count }}</span>
              </div>
              <div class="bar-container">
                <div
                  class="bar-fill"
                  :style="{
                    width: `${(emotion.count / data.topEmotions[0].count) * 100}%`
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dreams Timeline List -->
        <div class="timeline-section">
          <h2>Dreams Timeline</h2>
          <div class="timeline-list">
            <div
              v-for="(entry, index) in data.timeline"
              :key="index"
              class="timeline-entry"
              @click="navigateToDream(entry.id)"
            >
              <div class="timeline-date">
                <div class="date-badge">{{ formatDate(entry.date) }}</div>
                <div class="intensity-badge" :style="{ background: getIntensityGradient(entry.intensity) }">
                  {{ entry.intensity }}/10
                </div>
              </div>
              <div class="timeline-content">
                <h3 class="dream-title">{{ entry.title }}</h3>
                <div class="emotion-tags">
                  <span
                    v-for="emotion in entry.emotions"
                    :key="emotion"
                    class="emotion-tag"
                  >
                    {{ emotion }}
                  </span>
                </div>
              </div>
              <div class="timeline-arrow">→</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Initial Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📊</div>
      <h3>Ready to Analyze</h3>
      <p>Click the button above to load your emotion timeline.</p>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useEmotionTimeline } from '~/composables/useEmotionTimeline';
import { useRouter } from 'vue-router';

const { loading, error, data, fetchEmotionTimeline } = useEmotionTimeline();
const router = useRouter();

const selectedDays = ref(30);

const timeOptions = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 }
];

const fetchData = async () => {
  await fetchEmotionTimeline(selectedDays.value);
};

onMounted(() => {
  fetchData();
});

// Watch for time range changes
watch(selectedDays, () => {
  fetchData();
});

// Chart dimensions
const chartWidth = 800;
const chartHeight = 300;

// Calculate average intensity
const averageIntensity = computed(() => {
  if (!data.value || data.value.stats.totalDreams === 0) return 0;
  
  const allIntensities = Object.values(data.value.intensityByDate);
  const total = allIntensities.reduce((sum, day) => sum + day.avg, 0);
  return (total / allIntensities.length).toFixed(1);
});

// Calculate intensity line points
const intensityPoints = computed(() => {
  if (!data.value || data.value.timeline.length === 0) return [];
  
  return data.value.timeline.map((entry, index) => {
    const x = (index / (data.value!.timeline.length - 1)) * chartWidth;
    const y = chartHeight - ((entry.intensity / 10) * chartHeight);
    
    return {
      x,
      y,
      intensity: entry.intensity,
      date: formatDate(entry.date),
      dreamId: entry.id
    };
  });
});

const intensityLinePoints = computed(() => {
  return intensityPoints.value.map(p => `${p.x},${p.y}`).join(' ');
});

// X-axis labels
const xAxisLabels = computed(() => {
  if (!data.value || data.value.timeline.length === 0) return [];
  
  const labels = [];
  const step = Math.max(1, Math.floor(data.value.timeline.length / 6));
  
  for (let i = 0; i < data.value.timeline.length; i += step) {
    labels.push(formatDateShort(data.value.timeline[i].date));
  }
  
  return labels;
});

// Helper functions
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateShort = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getIntensityColor = (intensity: number) => {
  const hue = (intensity / 10) * 120; // 0 (red) to 120 (green)
  return `hsl(${240 - hue}, 70%, 60%)`;
};

const getIntensityGradient = (intensity: number) => {
  const hue = (intensity / 10) * 120;
  return `linear-gradient(135deg, hsl(${240 - hue}, 70%, 60%), hsl(${240 - hue}, 70%, 70%))`;
};

const selectDream = (dreamId: string) => {
  navigateToDream(dreamId);
};

const navigateToDream = (dreamId: string) => {
  router.push(`/dreams/${dreamId}`);
};
</script>

<style scoped lang="scss">
.emotion-timeline-page {
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
    background: white;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: white;
    font-size: 1.1rem;
  }
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;

  .time-selector {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;

    button {
      padding: 0.5rem 1rem;
      border: 2px solid #e0e0e0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;

      &:hover {
        border-color: #667eea;
      }

      &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: transparent;
      }
    }
  }

  .refresh-btn {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;

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
  }

  p {
    color: white;
    margin-bottom: 0.5rem;
  }

  button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-content {
      flex: 1;

      .stat-value {
        font-size: 2rem;
        font-weight: bold;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .stat-label {
        color: #666;
        font-size: 0.9rem;
      }
    }
  }
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  h2 {
    margin-bottom: 1.5rem;
    color: #333;
  }

  .intensity-chart {
    .chart-container {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;

      .y-axis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-right: 0.5rem;

        .y-label {
          font-size: 0.8rem;
          color: #666;
        }
      }

      .chart-area {
        flex: 1;
        position: relative;
        height: 300px;

        .grid-lines {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .grid-line {
            height: 1px;
            background: #e0e0e0;
          }
        }

        .line-chart {
          position: relative;
          width: 100%;
          height: 100%;

          .data-point {
            cursor: pointer;
            transition: r 0.2s ease;

            &:hover {
              r: 8;
            }
          }
        }
      }
    }

    .x-axis {
      display: flex;
      justify-content: space-between;
      padding-left: 3rem;
      margin-top: 0.5rem;

      .x-label {
        font-size: 0.8rem;
        color: #666;
      }
    }
  }

  .emotion-bars {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: goldenrod;

    .emotion-bar-item {
      .emotion-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;

        .emotion-name {
          font-weight: 500;
          text-transform: capitalize;
        }

        .emotion-count {
          color: #667eea;
          font-weight: bold;
        }
      }

      .bar-container {
        height: 30px;
        background: #f0f0f0;
        border-radius: 8px;
        overflow: hidden;

        .bar-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: width 0.5s ease;
          border-radius: 8px;
        }
      }
    }
  }
}

.timeline-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h2 {
    margin-bottom: 1.5rem;
    color: #333;
  }

  .timeline-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .timeline-entry {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: #e9ecef;
        transform: translateX(5px);
      }

      .timeline-date {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 120px;

        .date-badge {
          font-size: 0.85rem;
          font-weight: 500;
          color: #666;
        }

        .intensity-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: bold;
          color: white;
          text-align: center;
        }
      }

      .timeline-content {
        flex: 1;

        .dream-title {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .emotion-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;

          .emotion-tag {
            padding: 0.25rem 0.75rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            font-size: 0.8rem;
            text-transform: capitalize;
          }
        }
      }

      .timeline-arrow {
        font-size: 1.5rem;
        color: #667eea;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover .timeline-arrow {
        opacity: 1;
      }
    }
  }
}

@media (max-width: 768px) {
  .emotion-timeline-page {
    padding: 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .timeline-entry {
    flex-direction: column;
    align-items: flex-start !important;

    .timeline-date {
      flex-direction: row !important;
      width: 100%;
    }
  }
}
</style>
