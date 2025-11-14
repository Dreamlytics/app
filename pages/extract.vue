<template>
  <div class="extract-page gradient-bg">
    <div class="container">
      <button @click="goBack" class="back-button" title="Return to home page">
        ← Back to Home
      </button>
      
      <div class="card">
        <h1>🎭 Motif & Emotion Extraction</h1>
        <p class="subtitle">AI-powered analysis of dream patterns, symbols, and feelings</p>

        <form @submit.prevent="handleExtract" class="extract-form">
          <div class="form-group">
            <label for="title">Dream Title (Optional)</label>
            <input
              id="title"
              v-model="title"
              type="text"
              placeholder="e.g., The Endless Ocean"
            />
          </div>

          <div class="form-group">
            <label for="content">Dream Content</label>
            <textarea
              id="content"
              v-model="content"
              rows="10"
              placeholder="Describe your dream in detail..."
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="tags">Existing Tags (Optional)</label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              placeholder="e.g., ocean, storm, journey (comma-separated)"
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="extracting || !content">
            {{ extracting ? 'Extracting...' : 'Extract Patterns' }}
          </button>

          <p v-if="error" class="error-message">{{ error }}</p>
        </form>

        <div v-if="result" class="results">
          <!-- Motifs -->
          <div class="result-section">
            <h2>🌟 Motifs & Symbols</h2>
            <div class="tags-container">
              <span v-for="motif in result.motifs" :key="motif" class="tag tag-motif">
                {{ motif }}
              </span>
            </div>
          </div>

          <!-- Emotions -->
          <div class="result-section">
            <h2>💫 Emotions</h2>
            <div class="tags-container">
              <span v-for="emotion in result.emotions" :key="emotion" class="tag tag-emotion">
                {{ emotion }}
              </span>
            </div>
            <div class="intensity-bar">
              <label>Emotional Intensity: {{ result.emotionalIntensity }}/10</label>
              <div class="bar">
                <div class="fill" :style="{ width: `${result.emotionalIntensity * 10}%` }"></div>
              </div>
            </div>
          </div>

          <!-- Primary Theme -->
          <div class="result-section">
            <h2>🎯 Primary Theme</h2>
            <p class="theme-text">{{ result.primaryTheme }}</p>
          </div>

          <!-- Symbolism -->
          <div v-if="result.symbolism.length > 0" class="result-section">
            <h2>🔮 Symbolic Meanings</h2>
            <div class="symbolism-list">
              <div v-for="(item, index) in result.symbolism" :key="index" class="symbolism-item">
                <strong>{{ item.symbol }}:</strong>
                <span>{{ item.meaning }}</span>
              </div>
            </div>
          </div>

          <!-- Archetypes -->
          <div v-if="result.archetypes.length > 0" class="result-section">
            <h2>🏛️ Jungian Archetypes</h2>
            <div class="tags-container">
              <span v-for="archetype in result.archetypes" :key="archetype" class="tag tag-archetype">
                {{ archetype }}
              </span>
            </div>
          </div>

          <!-- Lucidity Level -->
          <div class="result-section">
            <h2>✨ Lucidity Level</h2>
            <div class="intensity-bar">
              <label>{{ result.lucidityLevel }}/10 - {{ getLucidityLabel(result.lucidityLevel) }}</label>
              <div class="bar lucidity">
                <div class="fill" :style="{ width: `${result.lucidityLevel * 10}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExtract } from '~/composables/useExtract';
import type { ExtractionResult } from '~/composables/useExtract';

const { extracting, error, extractMotifsAndEmotions } = useExtract();

const title = ref('');
const content = ref('');
const tagsInput = ref('');
const result = ref<ExtractionResult | null>(null);

const handleExtract = async () => {
  const tags = tagsInput.value
    ? tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
    : [];

  const extracted = await extractMotifsAndEmotions({
    dreamContent: content.value,
    dreamTitle: title.value || undefined,
    existingTags: tags.length > 0 ? tags : undefined
  });

  if (extracted) {
    result.value = extracted;
  }
};

const getLucidityLabel = (level: number): string => {
  if (level === 0) return 'Non-lucid';
  if (level <= 3) return 'Low awareness';
  if (level <= 6) return 'Moderate awareness';
  if (level <= 9) return 'High awareness';
  return 'Fully lucid';
};

const router = useRouter();
const goBack = () => {
  // Navigate directly to home page
  router.push('/');
};
</script>

<style scoped lang="scss">
.extract-page {
  min-height: 100vh;
  padding: $spacing-xl;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.card {
  h1 {
    margin-bottom: $spacing-xs;
  }

  .subtitle {
    color: $text-secondary;
    margin-bottom: $spacing-xl;
  }
}

.extract-form {
  margin-bottom: $spacing-xl;

  .form-group {
    margin-bottom: $spacing-lg;

    label {
      display: block;
      margin-bottom: $spacing-xs;
      font-weight: 500;
      color: $text-primary;
    }

    input,
    textarea {
      width: 100%;
      padding: $spacing-sm;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: $text-primary;
      font-family: inherit;
      font-size: 1rem;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: $primary;
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.1);
      }

      &::placeholder {
        color: $text-secondary;
      }
    }

    textarea {
      resize: vertical;
      min-height: 150px;
    }
  }

  .btn {
    width: 100%;
  }
}

.results {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.result-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: $spacing-lg;

  h2 {
    font-size: 1.5rem;
    margin-bottom: $spacing-md;
    color: $primary-light;
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.tag {
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-lg;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all $transition-fast;

  &.tag-motif {
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(138, 43, 226, 0.3));
    border: 1px solid rgba(138, 43, 226, 0.4);
    color: $primary-light;
  }

  &.tag-emotion {
    background: linear-gradient(135deg, rgba(255, 105, 180, 0.2), rgba(255, 105, 180, 0.3));
    border: 1px solid rgba(255, 105, 180, 0.4);
    color: $accent;
  }

  &.tag-archetype {
    background: linear-gradient(135deg, rgba(72, 209, 204, 0.2), rgba(72, 209, 204, 0.3));
    border: 1px solid rgba(72, 209, 204, 0.4);
    color: $secondary;
  }
}

.theme-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: $text-primary;
  font-style: italic;
}

.symbolism-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.symbolism-item {
  padding: $spacing-sm;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border-left: 3px solid $primary;

  strong {
    color: $primary-light;
    margin-right: $spacing-xs;
  }

  span {
    color: $text-secondary;
  }
}

.intensity-bar {
  margin-top: $spacing-md;

  label {
    display: block;
    margin-bottom: $spacing-xs;
    font-size: 0.9rem;
    color: $text-secondary;
  }

  .bar {
    width: 100%;
    height: 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: $radius-lg;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);

    .fill {
      height: 100%;
      background: linear-gradient(90deg, $primary, $accent);
      transition: width 0.5s ease;
      border-radius: $radius-lg;
    }

    &.lucidity .fill {
      background: linear-gradient(90deg, $secondary, $primary-light);
    }
  }
}

.error-message {
  margin-top: $spacing-md;
  padding: $spacing-sm;
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 8px;
  color: #ff4444;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: $text-primary;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: $primary;
    color: $primary-light;
    box-shadow: 0 4px 8px rgba(138, 43, 226, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.3);
  }
}
</style>
