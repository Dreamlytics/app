<template>
  <ion-app>
    <ion-page>
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Dreamlytics</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="refreshWebView">
              <ion-icon :icon="refreshOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      
      <ion-content :fullscreen="true">
        <div class="webview-container">
          <!-- This iframe loads the full Nuxt app -->
          <iframe
            ref="webviewFrame"
            :src="appUrl"
            class="app-webview"
            frameborder="0"
            allow="accelerometer; camera; geolocation; microphone"
            @load="onWebViewLoad"
          ></iframe>
          
          <!-- Loading overlay -->
          <div v-if="isLoading" class="loading-overlay">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Loading Dreamlytics...</p>
          </div>
          
          <!-- Error state -->
          <div v-if="error" class="error-state">
            <ion-icon :icon="alertCircleOutline" size="large"></ion-icon>
            <h2>Connection Error</h2>
            <p>{{ error }}</p>
            <ion-button @click="retryLoad">Retry</ion-button>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </ion-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  IonApp,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
} from '@ionic/vue';
import { refreshOutline, alertCircleOutline } from 'ionicons/icons';
import '~/assets/styles/ionic.css';

const webviewFrame = ref<HTMLIFrameElement | null>(null);
const isLoading = ref(true);
const error = ref('');

// Determine the app URL based on environment
const appUrl = computed(() => {
  if (process.server) return '';
  
  // Check if we're in production (built app)
  const isProduction = window.location.protocol === 'capacitor:';
  
  if (isProduction) {
    // In production, use the root URL
    return '/';
  } else {
    // In development, use the same origin (avoid loading /app inside /app)
    return window.location.origin;
  }
});

const onWebViewLoad = () => {
  isLoading.value = false;
  error.value = '';
  
  if (process.client) {
    console.log('✅ WebView loaded successfully');
    
    // Set up message passing between iframe and parent
    setupMessagePassing();
  }
};

const setupMessagePassing = () => {
  if (!webviewFrame.value) return;
  
  // Listen for messages from the iframe
  window.addEventListener('message', (event) => {
    // Verify origin for security
    if (event.origin !== appUrl.value && !appUrl.value.startsWith(event.origin)) {
      return;
    }
    
    console.log('📨 Message from WebView:', event.data);
    
    // Handle specific message types
    if (event.data.type === 'navigation') {
      console.log('🔗 Navigation to:', event.data.url);
    }
  });
};

const refreshWebView = () => {
  if (webviewFrame.value) {
    isLoading.value = true;
    error.value = '';
    webviewFrame.value.src = webviewFrame.value.src; // Reload iframe
  }
};

const retryLoad = () => {
  isLoading.value = true;
  error.value = '';
  
  if (webviewFrame.value) {
    webviewFrame.value.src = appUrl.value;
  }
};

// Handle iframe load errors
onMounted(() => {
  if (process.client && webviewFrame.value) {
    webviewFrame.value.addEventListener('error', () => {
      isLoading.value = false;
      error.value = 'Failed to load the application. Please check your connection.';
    });
    
    // Set a timeout for loading
    setTimeout(() => {
      if (isLoading.value) {
        isLoading.value = false;
        error.value = 'Loading timeout. Please try again.';
      }
    }, 15000); // 15 second timeout
  }
});
</script>

<style scoped>
.webview-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.app-webview {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--ion-background-color, #fff);
  z-index: 1000;
}

.loading-overlay ion-spinner {
  --color: var(--ion-color-primary, #8a2be2);
  transform: scale(2);
  margin-bottom: 2rem;
}

.loading-overlay p {
  color: var(--ion-color-medium, #666);
  font-size: 1rem;
  margin-top: 1rem;
}

.error-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--ion-background-color, #fff);
  text-align: center;
  z-index: 1000;
}

.error-state ion-icon {
  color: var(--ion-color-danger, #ff4444);
  margin-bottom: 1rem;
}

.error-state h2 {
  color: var(--ion-color-dark, #000);
  margin-bottom: 0.5rem;
}

.error-state p {
  color: var(--ion-color-medium, #666);
  margin-bottom: 1.5rem;
}

ion-toolbar {
  --background: var(--ion-color-primary, #8a2be2);
  --color: white;
}
</style>
