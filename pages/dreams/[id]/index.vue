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

        <div v-if="currentDream.isOwner" class="dream-actions">
          <NuxtLink :to="`/dreams/${currentDream.id}/edit`" class="btn btn-primary">
            ✏️ Edit
          </NuxtLink>
          <button @click="handleDelete" class="btn btn-danger">
            🗑️ Delete
          </button>
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
const { currentDream, loading, fetchDream, deleteDream } = useDreams();

onMounted(async () => {
  try {
    await fetchDream(route.params.id as string);
  } catch (e) {
    console.error('Failed to load dream');
  }
});

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
