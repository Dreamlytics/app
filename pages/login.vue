<template>
  <div class="auth-page gradient-bg">
    <div class="container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>✨ Dreamlytics</h1>
          <p>Track, analyze, and remember your dreams</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="emailOrUsername">Email or Username</label>
            <input
              id="emailOrUsername"
              v-model="emailOrUsername"
              type="text"
              placeholder="your@email.com or username"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

          <p v-if="error" class="error-message">{{ error }}</p>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <NuxtLink to="/register">Register</NuxtLink></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { login } = useAuth();
const router = useRouter();

const emailOrUsername = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await login(emailOrUsername.value, password.value);
    router.push('/');
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to login';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
}

.auth-card {
  max-width: 480px;
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: $spacing-xl;

  h1 {
    margin-bottom: $spacing-sm;
  }

  p {
    color: $text-secondary;
    font-size: 1.1rem;
  }
}

.auth-form {
  .form-group {
    margin-bottom: $spacing-lg;

    label {
      display: block;
      margin-bottom: $spacing-sm;
      font-weight: 500;
      color: $text-secondary;
    }
  }

  button {
    width: 100%;
    margin-top: $spacing-md;
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

.auth-footer {
  text-align: center;
  margin-top: $spacing-xl;
  padding-top: $spacing-xl;
  border-top: 1px solid $bg-tertiary;

  a {
    font-weight: 600;
  }
}
</style>
