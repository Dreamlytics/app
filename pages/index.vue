<template>
  <div class="home-page gradient-bg">
    <nav class="navbar">
      <div class="container">
        <div class="nav-content">
          <NuxtLink to="/" class="logo">
            <h3>✨ Dreamlytics</h3>
          </NuxtLink>

          <div class="nav-actions">
            <template v-if="isAuthenticated">
              <NuxtLink to="/dreams/new" class="btn btn-primary">
                ➕ New Dream
              </NuxtLink>
              <button @click="handleLogout" class="btn btn-secondary">
                Logout
              </button>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="btn btn-secondary">
                Login
              </NuxtLink>
              <NuxtLink to="/register" class="btn btn-primary">
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
            <input
              v-model="searchTag"
              type="text"
              placeholder="Filter by tag..."
              @input="handleFilter"
              class="filter-input"
            />
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

const searchTag = ref('');

onMounted(async () => {
  await fetchDreams();
});

const handleFilter = () => {
  fetchDreams(1, searchTag.value || undefined);
};

const handleLogout = async () => {
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

  .nav-actions {
    display: flex;
    gap: $spacing-md;
  }
}

.hero {
  text-align: center;
  padding: $spacing-2xl 0;

  h1 {
    font-size: 3.5rem;
    margin-bottom: $spacing-md;
  }

  p {
    font-size: 1.25rem;
    color: $text-secondary;
  }
}

.dreams-section {
  margin-top: $spacing-2xl;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-xl;

  h2 {
    margin: 0;
  }

  .filter-input {
    max-width: 300px;
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

  .dream-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
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
    gap: $spacing-sm;
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
  }
}

@media (max-width: $breakpoint-md) {
  .hero h1 {
    font-size: 2.5rem;
  }

  .dreams-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: $spacing-md;
    align-items: stretch;

    .filter-input {
      max-width: 100%;
    }
  }

  .nav-actions {
    flex-direction: column;
  }
}
</style>
