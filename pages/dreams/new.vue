<template>
  <div class="dream-form-page gradient-bg">
    <div class="container">
      <div class="dream-form-card card">
        <h2>{{ isEditing ? '✏️ Edit Dream' : '✨ Record a Dream' }}</h2>

        <form @submit.prevent="handleSubmit" class="dream-form">
          <div class="form-group">
            <label for="title">Title</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="A mysterious journey..."
              required
              maxlength="200"
            />
          </div>

          <div class="form-group">
            <label for="date">Date</label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              required
            />
          </div>

          <div class="form-group">
            <label for="content">Dream Content</label>
            <textarea
              id="content"
              v-model="form.content"
              placeholder="Describe your dream in detail..."
              required
              rows="10"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="tags">Tags</label>
            <div class="tags-input">
              <div class="tags-list">
                <span
                  v-for="(tag, index) in form.tags"
                  :key="index"
                  class="tag"
                >
                  {{ tag }}
                  <button
                    type="button"
                    @click="removeTag(index)"
                    class="tag-remove"
                  >×</button>
                </span>
              </div>
              <input
                v-model="tagInput"
                type="text"
                placeholder="Add tags (e.g., water, flight, lucid)"
                @keydown.enter.prevent="addTag"
                @keydown.comma.prevent="addTag"
              />
            </div>
            <small>Press Enter or comma to add a tag</small>
          </div>

          <div class="form-group">
            <label class="toggle-label">
              <input
                v-model="form.isPublic"
                type="checkbox"
              />
              <span class="toggle-text">
                <span class="icon">{{ form.isPublic ? '🌍' : '🔒' }}</span>
                {{ form.isPublic ? 'Public' : 'Private' }}
              </span>
            </label>
          </div>

          <div class="form-actions">
            <button type="button" @click="goBack" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Saving...' : (isEditing ? 'Update' : 'Save Dream') }}
            </button>
          </div>

          <p v-if="error" class="error-message">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { createDream, updateDream, fetchDream, currentDream } = useDreams();
const { isAuthenticated } = useAuth();

const isEditing = computed(() => !!route.params.id);
const loading = ref(false);
const error = ref('');
const tagInput = ref('');

const form = reactive({
  title: '',
  date: new Date().toISOString().split('T')[0],
  content: '',
  tags: [] as string[],
  isPublic: false
});

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/login');
    return;
  }

  if (isEditing.value) {
    try {
      const dream = await fetchDream(route.params.id as string);
      form.title = dream.title;
      form.date = new Date(dream.date).toISOString().split('T')[0];
      form.content = dream.content;
      form.tags = [...dream.tags];
      form.isPublic = dream.isPublic;
    } catch (e) {
      error.value = 'Failed to load dream';
    }
  }
});

const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase();
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag);
    tagInput.value = '';
  }
};

const removeTag = (index: number) => {
  form.tags.splice(index, 1);
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    if (isEditing.value) {
      await updateDream(route.params.id as string, form);
    } else {
      await createDream(form);
    }
    router.push('/');
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to save dream';
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.dream-form-page {
  min-height: 100vh;
  padding: $spacing-xl;
  padding-top: 100px;
}

.dream-form-card {
  max-width: 800px;
  margin: 0 auto;

  h2 {
    margin-bottom: $spacing-xl;
    text-align: center;
  }
}

.dream-form {
  .form-group {
    margin-bottom: $spacing-lg;

    label {
      display: block;
      margin-bottom: $spacing-sm;
      font-weight: 500;
      color: $text-secondary;
    }

    small {
      display: block;
      margin-top: $spacing-xs;
      color: $text-muted;
      font-size: 0.875rem;
    }
  }
}

.tags-input {
  background: $bg-secondary;
  border: 1px solid $bg-tertiary;
  border-radius: $radius-md;
  padding: $spacing-sm;
  transition: all $transition-base;

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  input {
    border: none;
    background: transparent;
    padding: $spacing-xs 0;

    &:focus {
      box-shadow: none;
    }
  }
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  margin-bottom: $spacing-xs;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  background: linear-gradient(135deg, $primary, $secondary);
  color: white;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-md;
  font-size: 0.875rem;
  font-weight: 500;

  .tag-remove {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    line-height: 1;
    padding: 0;
    transition: background $transition-fast;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    width: 48px;
    height: 24px;
    position: relative;
    appearance: none;
    background: $bg-tertiary;
    border-radius: 12px;
    cursor: pointer;
    transition: background $transition-base;

    &::before {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      top: 3px;
      left: 3px;
      background: white;
      transition: transform $transition-base;
    }

    &:checked {
      background: linear-gradient(135deg, $primary, $secondary);

      &::before {
        transform: translateX(24px);
      }
    }
  }

  .toggle-text {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-weight: 500;

    .icon {
      font-size: 1.2rem;
    }
  }
}

.form-actions {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-xl;

  button {
    flex: 1;
  }
}

.error-message {
  color: $error;
  text-align: center;
  margin-top: $spacing-md;
  padding: $spacing-sm;
  background: rgba($error, 0.1);
  border-radius: $radius-md;
}
</style>
