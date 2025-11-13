<template>
  <div class="admin-page">
    <div class="container">
      <h1>🔧 Database Cleanup & Fix</h1>
      
      <div class="section">
        <h2>Step 1: Clean Up Duplicates</h2>
        <p>This will remove duplicate usernames and emails, keeping the oldest account for each.</p>
        <button 
          @click="cleanupDuplicates" 
          :disabled="loading"
          class="btn btn-primary"
        >
          {{ loading ? 'Cleaning...' : 'Clean Up Duplicates' }}
        </button>
        
        <div v-if="cleanupResult" class="result">
          <h3>Cleanup Results:</h3>
          <pre>{{ JSON.stringify(cleanupResult, null, 2) }}</pre>
        </div>
      </div>

      <div class="section">
        <h2>Step 2: Fix Database Indexes</h2>
        <p>This will recreate unique indexes to prevent future duplicates.</p>
        <button 
          @click="fixIndexes" 
          :disabled="loading"
          class="btn btn-secondary"
        >
          {{ loading ? 'Fixing...' : 'Fix Indexes' }}
        </button>
        
        <div v-if="indexResult" class="result">
          <h3>Index Fix Results:</h3>
          <pre>{{ JSON.stringify(indexResult, null, 2) }}</pre>
        </div>
      </div>

      <div class="section">
        <h2>Step 3: Restart Server</h2>
        <p>After cleanup, restart your development server in the terminal:</p>
        <code class="code-block">
          pkill -9 node<br>
          npm run dev
        </code>
      </div>

      <div v-if="error" class="error">
        <strong>Error:</strong> {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false);
const error = ref('');
const cleanupResult = ref(null);
const indexResult = ref(null);

const cleanupDuplicates = async () => {
  loading.value = true;
  error.value = '';
  cleanupResult.value = null;
  
  try {
    const response = await $fetch('/api/admin/cleanup-duplicates', {
      method: 'POST'
    });
    cleanupResult.value = response;
  } catch (err: any) {
    error.value = err.message || 'Failed to cleanup duplicates';
  } finally {
    loading.value = false;
  }
};

const fixIndexes = async () => {
  loading.value = true;
  error.value = '';
  indexResult.value = null;
  
  try {
    const response = await $fetch('/api/admin/fix-indexes');
    indexResult.value = response;
  } catch (err: any) {
    error.value = err.message || 'Failed to fix indexes';
  } finally {
    loading.value = false;
  }
};

useHead({
  title: 'Admin - Database Cleanup'
});
</script>

<style scoped lang="scss">
.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

h1 {
  color: #667eea;
  margin-bottom: 2rem;
  text-align: center;
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

h2 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

p {
  color: #666;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
  }
  
  &.btn-secondary {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);
    }
  }
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  
  h3 {
    color: #667eea;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  pre {
    margin: 0;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.875rem;
    color: #333;
  }
}

.error {
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: #c33;
  margin-top: 1rem;
}

.code-block {
  display: block;
  padding: 1rem;
  background: #2d2d2d;
  color: #f8f8f2;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  margin-top: 0.5rem;
}
</style>
