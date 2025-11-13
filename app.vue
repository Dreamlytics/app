<template>
  <div id="app">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
const { initializeApp } = useCapacitor();

// Initialize Capacitor when app mounts (only on client)
onMounted(async () => {
  await initializeApp();
});
</script>
