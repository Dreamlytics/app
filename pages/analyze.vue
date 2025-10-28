<template>
  <div class="analyze-page gradient-bg">
    <div class="container">
      <div class="card">
        <h1>🔮 Dream Analysis</h1>
        <p class="subtitle">Get AI-powered insights into your dreams</p>

        <form @submit.prevent="handleAnalyze" class="analyze-form">
          <div class="form-group">
            <label for="title">Dream Title (Optional)</label>
            <input
              id="title"
              v-model="title"
              type="text"
              placeholder="e.g., Flying over the ocean"
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
            <label for="tags">Tags (Optional)</label>
            <input
              id="tags"
              v-model="tagsInput"
              type="text"
              placeholder="e.g., flying, water, anxiety (comma-separated)"
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="analyzing || !content">
            {{ analyzing ? 'Analyzing...' : 'Analyze Dream' }}
          </button>

          <p v-if="error" class="error-message">{{ error }}</p>
        </form>

        <div v-if="analysis" class="analysis-result">
          <h2>✨ Analysis</h2>
          <div class="analysis-content" v-html="formatAnalysis(analysis)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAnalyze } from '~/composables/useAnalyze';

const { analyzing, error, analyzeDream } = useAnalyze();

const title = ref('');
const content = ref('');
const tagsInput = ref('');
const analysis = ref<string | null>(null);

const handleAnalyze = async () => {
  const tags = tagsInput.value
    ? tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
    : [];

  const result = await analyzeDream({
    dreamContent: content.value,
    dreamTitle: title.value || undefined,
    tags: tags.length > 0 ? tags : undefined
  });

  if (result) {
    analysis.value = result;
  }
};

const formatAnalysis = (text: string) => {
  // Simple markdown-like formatting
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
};
</script>

<style scoped lang="scss">
.analyze-page {
  min-height: 100vh;
  padding: $spacing-xl;
}

.container {
  max-width: 900px;
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

.analyze-form {
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

.analysis-result {
  background: rgba(138, 43, 226, 0.1);
  border: 1px solid rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  padding: $spacing-lg;

  h2 {
    margin-bottom: $spacing-md;
    color: $primary;
  }

  .analysis-content {
    line-height: 1.8;
    color: $text-primary;

    :deep(strong) {
      color: $primary;
      font-weight: 600;
    }

    :deep(em) {
      color: $accent;
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
</style>
