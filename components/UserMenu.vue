<template>
  <div class="user-menu" v-if="isAuthenticated">
    <button @click="toggleMenu" class="user-button" :class="[{ active: isOpen }, props.variant]">
      <span class="user-icon">👤</span>
      <span class="user-name">{{ user?.name }}</span>
      <span class="dropdown-arrow">▼</span>
    </button>
    
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <NuxtLink to="/settings" class="dropdown-item" @click="closeMenu">
          <span class="item-icon">⚙️</span>
          <span>Settings</span>
        </NuxtLink>
        <button @click="handleLogout" class="dropdown-item">
          <span class="item-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </transition>
    
    <!-- Backdrop to close menu when clicking outside -->
    <div v-if="isOpen" class="menu-backdrop" @click="closeMenu"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'grey';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
});

const { user, logout, isAuthenticated } = useAuth();
const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const handleLogout = async () => {
  closeMenu();
  await logout();
};

// Close menu when clicking outside
onMounted(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      closeMenu();
    }
  };
  
  document.addEventListener('click', handleClickOutside);
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
});
</script>

<style scoped>
.user-menu {
  position: relative;
  z-index: 1000;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.user-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.user-button.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.user-button.grey {
  background: rgba(107, 114, 128, 0.3);
  border-color: rgba(107, 114, 128, 0.4);
}

.user-button.grey:hover {
  background: rgba(107, 114, 128, 0.4);
  border-color: rgba(107, 114, 128, 0.5);
}

.user-button.grey.active {
  background: rgba(107, 114, 128, 0.5);
  border-color: rgba(107, 114, 128, 0.6);
}

.user-icon {
  font-size: 1.2rem;
}

.user-name {
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 0.6rem;
  transition: transform 0.3s ease;
}

.user-button.active .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: white;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.item-icon {
  font-size: 1.1rem;
}

.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .user-name {
    display: none;
  }
  
  .user-button {
    padding: 0.5rem 0.75rem;
  }
  
  .dropdown-menu {
    right: -10px;
  }
}
</style>
