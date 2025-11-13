<template>
  <div class="mobile-cors-test">
    <div class="container">
      <div class="test-card">
        <h1>📱 Mobile CORS Test</h1>
        <p class="subtitle">Test API connectivity from mobile app</p>

        <!-- Platform Info -->
        <div class="info-section">
          <h2>Platform Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Platform:</span>
              <span class="value">{{ platformInfo.platform }}</span>
            </div>
            <div class="info-item">
              <span class="label">App Version:</span>
              <span class="value">{{ platformInfo.version || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">API URL:</span>
              <span class="value">{{ apiUrl }}</span>
            </div>
          </div>
        </div>

        <!-- Test Controls -->
        <div class="test-section">
          <h2>CORS Tests</h2>
          
          <div class="test-buttons">
            <button @click="testHealth" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Testing...' : 'Test Health Endpoint' }}
            </button>
            
            <button @click="testPublicApi" class="btn btn-secondary" :disabled="loading">
              Test Public API
            </button>
            
            <button @click="testAuthApi" class="btn btn-accent" :disabled="loading">
              Test Auth API
            </button>

            <button @click="clearResults" class="btn btn-secondary">
              Clear Results
            </button>
          </div>
        </div>

        <!-- Results -->
        <div v-if="results.length > 0" class="results-section">
          <h2>Test Results</h2>
          <div 
            v-for="(result, index) in results" 
            :key="index"
            class="result-item"
            :class="result.success ? 'success' : 'error'"
          >
            <div class="result-header">
              <span class="result-icon">{{ result.success ? '✅' : '❌' }}</span>
              <span class="result-title">{{ result.test }}</span>
              <span class="result-time">{{ result.timestamp }}</span>
            </div>
            <div class="result-body">
              <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="instructions">
          <h3>📋 How to Use</h3>
          <ol>
            <li>Open this page in your mobile app (Capacitor)</li>
            <li>Click the test buttons above</li>
            <li>Check if CORS is working correctly</li>
            <li>Green checkmark = Success, Red X = Failed</li>
          </ol>

          <h3>🔧 Troubleshooting</h3>
          <ul>
            <li>Make sure the dev server is running on localhost:3000</li>
            <li>Check capacitor.config.ts has correct server settings</li>
            <li>iOS: Check Info.plist allows localhost connections</li>
            <li>Android: Check AndroidManifest.xml has INTERNET permission</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getApiUrl, getPlatformInfo, checkHealth, get } = useMobileApi();

const loading = ref(false);
const results = ref<Array<{
  test: string;
  success: boolean;
  timestamp: string;
  data: any;
}>>([]);

const platformInfo = computed(() => getPlatformInfo());
const apiUrl = computed(() => getApiUrl());

const addResult = (test: string, success: boolean, data: any) => {
  results.value.unshift({
    test,
    success,
    timestamp: new Date().toLocaleTimeString(),
    data,
  });
};

const testHealth = async () => {
  loading.value = true;
  try {
    const response = await checkHealth();
    addResult('Health Check', true, response);
  } catch (error: any) {
    addResult('Health Check', false, { error: error.message });
  } finally {
    loading.value = false;
  }
};

const testPublicApi = async () => {
  loading.value = true;
  try {
    const response = await get('/public/dreams?limit=5');
    addResult('Public Dreams API', true, { 
      count: response.dreams?.length || 0,
      message: 'Successfully fetched public dreams'
    });
  } catch (error: any) {
    addResult('Public Dreams API', false, { error: error.message });
  } finally {
    loading.value = false;
  }
};

const testAuthApi = async () => {
  loading.value = true;
  try {
    const response = await get('/auth/me');
    addResult('Auth API (Me)', true, response);
  } catch (error: any) {
    addResult('Auth API (Me)', false, { 
      error: error.message,
      note: 'This is expected if not logged in'
    });
  } finally {
    loading.value = false;
  }
};

const clearResults = () => {
  results.value = [];
};

// Auto-run health check on mount
onMounted(() => {
  testHealth();
});
</script>

<style scoped lang="scss">
.mobile-cors-test {
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.test-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  color: #1a202c;

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #2d3748;
  }

  .subtitle {
    color: #718096;
    margin-bottom: 2rem;
  }

  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: #2d3748;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0.5rem;
  }

  h3 {
    font-size: 1.125rem;
    margin: 1.5rem 0 0.75rem;
    color: #2d3748;
  }
}

.info-section {
  margin-bottom: 2rem;
}

.info-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;

  .label {
    font-weight: 600;
    color: #4a5568;
  }

  .value {
    color: #667eea;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
  }
}

.test-section {
  margin-bottom: 2rem;
}

.test-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;

  .btn {
    padding: 0.875rem 1.5rem;
    font-weight: 600;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    color: white;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
      }
    }

    &.btn-secondary {
      background: #718096;
      
      &:hover:not(:disabled) {
        background: #4a5568;
      }
    }

    &.btn-accent {
      background: linear-gradient(135deg, #f093fb, #f5576c);
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(240, 147, 251, 0.3);
      }
    }
  }
}

.results-section {
  margin-bottom: 2rem;
}

.result-item {
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid;

  &.success {
    border-color: #48bb78;
    background: #f0fff4;
  }

  &.error {
    border-color: #f56565;
    background: #fff5f5;
  }
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  .result-icon {
    font-size: 1.25rem;
  }

  .result-title {
    flex: 1;
    font-weight: 600;
    color: #2d3748;
  }

  .result-time {
    font-size: 0.875rem;
    color: #718096;
    font-family: 'Courier New', monospace;
  }
}

.result-body {
  padding: 1rem;

  pre {
    margin: 0;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    color: #2d3748;
    white-space: pre-wrap;
    word-break: break-word;
    background: rgba(0, 0, 0, 0.02);
    padding: 0.75rem;
    border-radius: 0.375rem;
  }
}

.instructions {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #ebf8ff;
  border-radius: 0.5rem;
  border-left: 4px solid #4299e1;

  ol, ul {
    margin: 0.5rem 0 0 1.5rem;
    color: #2d3748;
  }

  li {
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 768px) {
  .test-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
