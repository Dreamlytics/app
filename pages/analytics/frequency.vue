<template>
  <div class="frequency-page">
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
            <NuxtLink to="/analytics/emotions" class="btn btn-secondary">
              📈 Emotions
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
        <h1>📊 Dream Frequency</h1>
        <p class="subtitle">Track your dream recording patterns over time</p>
      </div>

      <!-- Time Range Selector -->
      <div class="controls">
        <div class="time-selector">
          <button
            v-for="option in timeOptions"
            :key="option.value"
            @click="selectedWeeks = option.value"
            :class="{ active: selectedWeeks === option.value }"
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
        <p>Loading dream frequency data...</p>
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
            <div class="stat-icon">📚</div>
            <div class="stat-content">
              <div class="stat-value">{{ data.stats.totalDreams }}</div>
              <div class="stat-label">Total Dreams</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <div class="stat-value">{{ data.stats.averagePerWeek }}</div>
              <div class="stat-label">Avg per Week</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-value">{{ data.stats.maxWeek.count }}</div>
              <div class="stat-label">Best Week</div>
              <div class="stat-sublabel">{{ data.stats.maxWeek.label }}</div>
            </div>
          </div>
          <div class="stat-card" :class="`trend-${data.stats.trend}`">
            <div class="stat-icon">{{ getTrendIcon(data.stats.trend) }}</div>
            <div class="stat-content">
              <div class="stat-value">{{ data.stats.trend }}</div>
              <div class="stat-label">Trend</div>
              <div class="stat-sublabel">{{ data.stats.trendValue > 0 ? '+' : '' }}{{ data.stats.trendValue }}/week</div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="data.stats.totalDreams === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>No Dreams Recorded</h3>
          <p>No dreams found in the selected time range.</p>
          <p>Start recording your dreams to see frequency patterns!</p>
        </div>

        <template v-else>
          <!-- Bar Chart -->
          <div class="chart-section">
            <h2>Weekly Dream Count</h2>
            <div class="bar-chart">
              <div class="chart-container">
                <div class="y-axis">
                  <span v-for="i in yAxisMax + 1" :key="i" class="y-label">{{ yAxisMax - i + 1 }}</span>
                </div>
                <div class="chart-area">
                  <div class="grid-lines">
                    <div v-for="i in yAxisMax + 1" :key="i" class="grid-line"></div>
                  </div>
                  <div class="bars">
                    <div
                      v-for="(week, index) in data.weekly"
                      :key="index"
                      class="bar-wrapper"
                      @click="showWeekDetails(week)"
                    >
                      <div class="bar-container">
                        <div
                          class="bar-fill"
                          :style="{
                            height: `${(week.count / yAxisMax) * 100}%`,
                            background: getBarGradient(week.count, data.stats.maxWeek.count)
                          }"
                        >
                          <span v-if="week.count > 0" class="bar-label">{{ week.count }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="x-axis">
                <span
                  v-for="(week, index) in data.weekly"
                  :key="index"
                  class="x-label"
                  :class="{ highlight: week.count === data.stats.maxWeek.count }"
                >
                  {{ week.weekLabel }}
                </span>
              </div>
            </div>
          </div>

          <!-- Breakdown Section -->
          <div class="breakdown-section">
            <h2>Weekly Breakdown</h2>
            <div class="breakdown-grid">
              <div
                v-for="(week, index) in data.weekly"
                :key="index"
                class="breakdown-card"
                :class="{ 'has-dreams': week.count > 0 }"
              >
                <div class="breakdown-header">
                  <span class="week-label">{{ week.weekLabel }}</span>
                  <span class="week-count" :style="{ color: getCountColor(week.count, data.stats.maxWeek.count) }">
                    {{ week.count }}
                  </span>
                </div>
                <div v-if="week.count > 0" class="breakdown-details">
                  <div class="detail-row">
                    <span class="detail-label">Your Dreams:</span>
                    <span class="detail-value">{{ week.myDreams }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Public:</span>
                    <span class="detail-value">{{ week.publicDreams }}</span>
                  </div>
                </div>
                <div v-else class="no-dreams">
                  No dreams
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Dreams -->
          <div v-if="data.recentDreams.length > 0" class="recent-section">
            <h2>Recent Dreams</h2>
            <div class="recent-list">
              <div
                v-for="dream in data.recentDreams"
                :key="dream.id"
                class="recent-item"
                @click="navigateToDream(dream.id)"
              >
                <div class="recent-date">
                  {{ formatDate(dream.date) }}
                </div>
                <div class="recent-title">
                  {{ dream.title }}
                </div>
                <div class="recent-badge" v-if="dream.isPublic">
                  🌐 Public
                </div>
                <div class="recent-arrow">→</div>
              </div>
            </div>
          </div>

          <!-- Insights -->
          <div class="insights-section">
            <h2>💡 Insights</h2>
            <div class="insight-cards">
              <div class="insight-card">
                <div class="insight-icon">🔥</div>
                <div class="insight-content">
                  <h3>Consistency</h3>
                  <p>You recorded dreams in {{ data.stats.weeksWithDreams }} out of {{ data.metadata.weeksAnalyzed }} weeks ({{ Math.round((data.stats.weeksWithDreams / data.metadata.weeksAnalyzed) * 100) }}%)</p>
                </div>
              </div>
              <div class="insight-card">
                <div class="insight-icon">{{ getTrendIcon(data.stats.trend) }}</div>
                <div class="insight-content">
                  <h3>Trend Analysis</h3>
                  <p v-if="data.stats.trend === 'increasing'">
                    Your dream recording is increasing! Keep up the momentum.
                  </p>
                  <p v-else-if="data.stats.trend === 'decreasing'">
                    Your dream recording has decreased recently. Try setting a daily reminder.
                  </p>
                  <p v-else>
                    Your dream recording is stable. Great consistency!
                  </p>
                </div>
              </div>
              <div class="insight-card">
                <div class="insight-icon">🎯</div>
                <div class="insight-content">
                  <h3>Goal Setting</h3>
                  <p v-if="data.stats.averagePerWeek < 1">
                    Try to record at least 1 dream per week to build a consistent habit.
                  </p>
                  <p v-else-if="data.stats.averagePerWeek < 3">
                    You're doing well! Challenge yourself to record 3+ dreams per week.
                  </p>
                  <p v-else>
                    Excellent! You're averaging {{ data.stats.averagePerWeek }} dreams per week.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Initial Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>Ready to Analyze</h3>
        <p>Click the button above to load your dream frequency data.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDreamFrequency } from '~/composables/useDreamFrequency';
import { useRouter } from 'vue-router';

const { loading, error, data, fetchDreamFrequency } = useDreamFrequency();
const router = useRouter();

const selectedWeeks = ref(12);

const timeOptions = [
  { label: '4 Weeks', value: 4 },
  { label: '12 Weeks', value: 12 },
  { label: '26 Weeks', value: 26 },
  { label: '52 Weeks', value: 52 }
];

const fetchData = async () => {
  await fetchDreamFrequency(selectedWeeks.value);
};

onMounted(() => {
  fetchData();
});

// Watch for time range changes
watch(selectedWeeks, () => {
  fetchData();
});

// Calculate Y-axis maximum
const yAxisMax = computed(() => {
  if (!data.value || data.value.weekly.length === 0) return 10;
  const max = Math.max(...data.value.weekly.map(w => w.count));
  return Math.max(5, Math.ceil(max * 1.2)); // Add 20% padding
});

// Helper functions
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'increasing': return '📈';
    case 'decreasing': return '📉';
    default: return '➡️';
  }
};

const getBarGradient = (count: number, max: number) => {
  const intensity = count / max;
  const hue = 260 - (intensity * 60); // Purple to blue
  return `linear-gradient(180deg, hsl(${hue}, 70%, 60%), hsl(${hue}, 70%, 50%))`;
};

const getCountColor = (count: number, max: number) => {
  const intensity = count / max;
  const hue = 260 - (intensity * 60);
  return `hsl(${hue}, 70%, 50%)`;
};

const showWeekDetails = (week: any) => {
  console.log('Week details:', week);
};

const navigateToDream = (dreamId: string) => {
  router.push(`/dreams/${dreamId}`);
};
</script>

<style scoped lang="scss">
.frequency-page {
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
    flex-wrap: wrap;
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      border: 2px solid rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;

      &:hover {
        border-color: #fff;
        background: #fff;
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
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      background: #fff;
      transform: translateY(-2px);
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
    color: #666;
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
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-5px);
    }

    &.trend-increasing {
      border-left: 4px solid #4caf50;
    }

    &.trend-decreasing {
      border-left: 4px solid #f44336;
    }

    &.trend-stable {
      border-left: 4px solid #2196f3;
    }

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
        text-transform: capitalize;
      }

      .stat-label {
        color: #666;
        font-size: 0.9rem;
      }

      .stat-sublabel {
        color: #999;
        font-size: 0.8rem;
        margin-top: 0.25rem;
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

  .bar-chart {
    .chart-container {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;

      .y-axis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-right: 0.5rem;
        min-width: 30px;

        .y-label {
          font-size: 0.8rem;
          color: #666;
          text-align: right;
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
          pointer-events: none;

          .grid-line {
            height: 1px;
            background: #e0e0e0;
          }
        }

        .bars {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          gap: 0.5rem;
          align-items: flex-end;

          .bar-wrapper {
            flex: 1;
            height: 100%;
            display: flex;
            align-items: flex-end;
            cursor: pointer;

            .bar-container {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: flex-end;

              .bar-fill {
                width: 100%;
                border-radius: 6px 6px 0 0;
                transition: all 0.3s ease;
                position: relative;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: 0.5rem;

                .bar-label {
                  color: white;
                  font-weight: bold;
                  font-size: 0.85rem;
                  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                }

                &:hover {
                  opacity: 0.8;
                  transform: scaleY(1.05);
                }
              }
            }
          }
        }
      }
    }

    .x-axis {
      display: flex;
      gap: 0.5rem;
      padding-left: 3.5rem;

      .x-label {
        flex: 1;
        font-size: 0.7rem;
        color: #666;
        text-align: center;

        &.highlight {
          color: #667eea;
          font-weight: bold;
        }
      }
    }
  }
}

.breakdown-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  h2 {
    margin-bottom: 1.5rem;
    color: #333;
  }

  .breakdown-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;

    .breakdown-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.3s ease;

      &.has-dreams {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
        border: 2px solid rgba(102, 126, 234, 0.3);

        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
      }

      .breakdown-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        .week-label {
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }

        .week-count {
          font-size: 1.5rem;
          font-weight: bold;
        }
      }

      .breakdown-details {
        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 0.25rem;

          .detail-value {
            font-weight: 600;
            color: #333;
          }
        }
      }

      .no-dreams {
        font-size: 0.8rem;
        color: #999;
        text-align: center;
        padding: 0.5rem 0;
      }
    }
  }
}

.recent-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  h2 {
    margin-bottom: 1.5rem;
    color: #333;
  }

  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    .recent-item {
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

      .recent-date {
        font-size: 0.85rem;
        color: #666;
        min-width: 100px;
      }

      .recent-title {
        flex: 1;
        font-weight: 500;
        color: #333;
      }

      .recent-badge {
        padding: 0.25rem 0.75rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        font-size: 0.75rem;
      }

      .recent-arrow {
        font-size: 1.2rem;
        color: #667eea;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover .recent-arrow {
        opacity: 1;
      }
    }
  }
}

.insights-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h2 {
    margin-bottom: 1.5rem;
    color: #333;
  }

  .insight-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;

    .insight-card {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
      border-radius: 8px;
      border-left: 4px solid #667eea;

      .insight-icon {
        font-size: 2rem;
      }

      .insight-content {
        flex: 1;

        h3 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        p {
          font-size: 0.9rem;
          color: #666;
          line-height: 1.5;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .frequency-page {
    .container {
      padding: 1rem;
    }

    .header h1 {
      font-size: 2rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .nav-actions {
      gap: 0.5rem;

      .btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.85rem;
      }
    }

    .breakdown-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
  }
}
</style>
