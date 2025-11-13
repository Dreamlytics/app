<template>
  <ion-app>
    <ion-page>
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Mobile Test</ion-title>
          <ion-buttons slot="start">
            <ion-button @click="navigateBack">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content :scrollY="true" :fullscreen="true" class="ion-padding">
        <div class="test-container">
          <h1>🎉 Ionic + Capacitor Setup Complete!</h1>
          
          <ion-card>
            <ion-card-header>
              <ion-card-title>Platform Information</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-list>
                <ion-item>
                  <ion-label>
                    <h3>Platform</h3>
                    <p>{{ platform }}</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-label>
                    <h3>Is Native App</h3>
                    <p>{{ isNative ? 'Yes' : 'No' }}</p>
                  </ion-label>
                </ion-item>
                <ion-item>
                  <ion-label>
                    <h3>Is Mobile</h3>
                    <p>{{ isMobile ? 'Yes' : 'No' }}</p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </ion-card-content>
          </ion-card>

          <ion-card>
            <ion-card-header>
              <ion-card-title>Test Capacitor Features</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-button expand="block" @click="testHaptic" class="ion-margin-bottom">
                <ion-icon slot="start" :icon="pulseOutline"></ion-icon>
                Test Haptic Feedback
              </ion-button>

              <ion-button expand="block" @click="testVibrate" color="secondary" class="ion-margin-bottom">
                <ion-icon slot="start" :icon="phonePortraitOutline"></ion-icon>
                Test Vibration
              </ion-button>

              <ion-button expand="block" @click="hideKeyboard" color="tertiary">
                <ion-icon slot="start" :icon="keypadOutline"></ion-icon>
                Hide Keyboard
              </ion-button>
            </ion-card-content>
          </ion-card>

          <ion-card>
            <ion-card-header>
              <ion-card-title>Ionic Components Demo</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-item>
                <ion-label>Toggle Example</ion-label>
                <ion-toggle v-model="toggleValue" @ionChange="handleToggle"></ion-toggle>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Input Example</ion-label>
                <ion-input v-model="inputValue" placeholder="Type something..."></ion-input>
              </ion-item>

              <ion-item>
                <ion-label>Range: {{ rangeValue }}</ion-label>
                <ion-range v-model="rangeValue" :min="0" :max="100" :pin="true" color="primary"></ion-range>
              </ion-item>
            </ion-card-content>
          </ion-card>

          <ion-button expand="block" color="success" @click="showToast">
            <ion-icon slot="start" :icon="checkmarkCircleOutline"></ion-icon>
            Show Success Toast
          </ion-button>
        </div>
      </ion-content>
    </ion-page>
  </ion-app>
</template>

<script setup lang="ts">
// Import Ionic CSS only for this page
import '~/assets/styles/ionic.css';

import {
  IonApp,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonInput,
  IonRange,
  toastController,
} from '@ionic/vue';
import {
  arrowBackOutline,
  pulseOutline,
  phonePortraitOutline,
  keypadOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

const router = useRouter();
const { 
  isNative, 
  platform, 
  isMobile, 
  hapticImpact, 
  hapticVibrate,
  hideKeyboard: hideKeyboardFn 
} = useCapacitor();

// Reactive state
const toggleValue = ref(false);
const inputValue = ref('');
const rangeValue = ref(50);

// Navigation
const navigateBack = () => {
  router.back();
};

// Haptic tests
const testHaptic = async () => {
  await hapticImpact();
  await showToast('Haptic feedback triggered!', 'success');
};

const testVibrate = async () => {
  await hapticVibrate();
  await showToast('Vibration triggered!', 'success');
};

const hideKeyboard = async () => {
  await hideKeyboardFn();
  await showToast('Keyboard hidden (native only)', 'primary');
};

// Toggle handler
const handleToggle = async () => {
  await hapticImpact();
};

// Toast helper
const showToast = async (message: string, color: string = 'success') => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'bottom',
  });
  await toast.present();
};
</script>

<style scoped lang="scss">
.test-container {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 2rem;
  min-height: 100%;

  h1 {
    text-align: center;
    margin: 2rem 0;
    background: linear-gradient(135deg, #8a2be2, #9d4edd, #c77dff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 2rem;
  }
}

ion-card {
  margin-bottom: 1rem;
}

ion-item {
  --padding-start: 0;
}
</style>
