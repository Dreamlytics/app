<template>
  <div class="settings-page gradient-bg">
    <nav class="navbar">
      <div class="container">
        <div class="nav-content">
          <NuxtLink to="/" class="logo">
            <h3>✨ Dreamlytics</h3>
          </NuxtLink>
          <div class="nav-actions">
            <NuxtLink to="/" class="btn btn-secondary">
              ← Back
            </NuxtLink>
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>

    <div class="container">
      <div class="settings-container">
        <h1>⚙️ Account Settings</h1>

        <!-- Update Profile Section -->
        <div class="settings-section card">
          <h2>Profile Information</h2>
          <form @submit.prevent="handleUpdateProfile" class="settings-form">
            <div class="form-group">
              <label for="name">Username</label>
              <input
                id="name"
                v-model="profileForm.name"
                type="text"
                placeholder="Enter username"
                :disabled="updating"
              />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="profileForm.email"
                type="email"
                placeholder="Enter email"
                :disabled="updating"
              />
            </div>

            <div v-if="profileMessage" :class="['message', profileMessageType]">
              {{ profileMessage }}
            </div>

            <button type="submit" class="btn btn-primary" :disabled="updating">
              {{ updating ? 'Updating...' : 'Update Profile' }}
            </button>
          </form>
        </div>

        <!-- Change Password Section -->
        <div class="settings-section card">
          <h2>Change Password</h2>
          <form @submit.prevent="handleChangePassword" class="settings-form">
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="Enter current password"
                :disabled="updatingPassword"
              />
            </div>

            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                :disabled="updatingPassword"
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="Confirm new password"
                :disabled="updatingPassword"
              />
            </div>

            <div v-if="passwordMessage" :class="['message', passwordMessageType]">
              {{ passwordMessage }}
            </div>

            <button type="submit" class="btn btn-primary" :disabled="updatingPassword">
              {{ updatingPassword ? 'Changing...' : 'Change Password' }}
            </button>
          </form>
        </div>

        <!-- Delete Account Section -->
        <div class="settings-section card danger-zone">
          <h2>⚠️ Danger Zone</h2>
          <p class="danger-warning">
            Once you delete your account, there is no going back. This will permanently delete your account and all your dreams.
          </p>

          <button @click="showDeleteModal = true" class="btn btn-danger">
            Delete Account
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>⚠️ Delete Account</h3>
            <button @click="closeDeleteModal" class="close-btn">✕</button>
          </div>

          <div class="modal-body">
            <p class="danger-text">
              This action <strong>cannot be undone</strong>. This will permanently delete your account and all associated data.
            </p>

            <p class="confirmation-text">
              Please type <strong>{{ user?.name }}</strong> to confirm:
            </p>

            <div class="form-group">
              <input
                v-model="deleteConfirmation"
                type="text"
                :placeholder="`Type ${user?.name} to confirm`"
                class="confirmation-input"
                :disabled="deleting"
              />
            </div>

            <div v-if="deleteMessage" :class="['message', deleteMessageType]">
              {{ deleteMessage }}
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeDeleteModal" class="btn btn-secondary" :disabled="deleting">
              Cancel
            </button>
            <button
              @click="handleDeleteAccount"
              class="btn btn-danger"
              :disabled="!isDeleteConfirmed || deleting"
            >
              {{ deleting ? 'Deleting...' : 'Delete Account' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
const { user, updateUser, deleteAccount, isAuthenticated } = useAuth();

// Redirect to login if not authenticated
onMounted(() => {
  if (!isAuthenticated.value) {
    navigateTo('/login');
  }
});

// Profile form
const profileForm = ref({
  name: user.value?.name || '',
  email: user.value?.email || ''
});

const updating = ref(false);
const profileMessage = ref('');
const profileMessageType = ref<'success' | 'error'>('success');

// Password form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const updatingPassword = ref(false);
const passwordMessage = ref('');
const passwordMessageType = ref<'success' | 'error'>('success');

// Delete account
const showDeleteModal = ref(false);
const deleteConfirmation = ref('');
const deleting = ref(false);
const deleteMessage = ref('');
const deleteMessageType = ref<'success' | 'error'>('success');

const isDeleteConfirmed = computed(() => {
  return deleteConfirmation.value === user.value?.name;
});

// Sync form with user data
watch(user, (newUser) => {
  if (newUser) {
    profileForm.value.name = newUser.name;
    profileForm.value.email = newUser.email;
  }
}, { immediate: true });

const handleUpdateProfile = async () => {
  updating.value = true;
  profileMessage.value = '';

  try {
    await updateUser({
      name: profileForm.value.name,
      email: profileForm.value.email
    });

    profileMessage.value = 'Profile updated successfully!';
    profileMessageType.value = 'success';
  } catch (error: any) {
    profileMessage.value = error.data?.message || 'Failed to update profile';
    profileMessageType.value = 'error';
  } finally {
    updating.value = false;
  }
};

const handleChangePassword = async () => {
  updatingPassword.value = true;
  passwordMessage.value = '';

  // Validate passwords
  if (passwordForm.value.newPassword.length < 6) {
    passwordMessage.value = 'New password must be at least 6 characters';
    passwordMessageType.value = 'error';
    updatingPassword.value = false;
    return;
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = 'Passwords do not match';
    passwordMessageType.value = 'error';
    updatingPassword.value = false;
    return;
  }

  try {
    await updateUser({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    });

    passwordMessage.value = 'Password changed successfully!';
    passwordMessageType.value = 'success';

    // Clear form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (error: any) {
    passwordMessage.value = error.data?.message || 'Failed to change password';
    passwordMessageType.value = 'error';
  } finally {
    updatingPassword.value = false;
  }
};

const handleDeleteAccount = async () => {
  if (!isDeleteConfirmed.value) return;

  deleting.value = true;
  deleteMessage.value = '';

  try {
    await deleteAccount(user.value!.name);
    // User will be redirected to login by the deleteAccount function
  } catch (error: any) {
    deleteMessage.value = error.data?.message || 'Failed to delete account';
    deleteMessageType.value = 'error';
    deleting.value = false;
  }
};

const closeDeleteModal = () => {
  if (!deleting.value) {
    showDeleteModal.value = false;
    deleteConfirmation.value = '';
    deleteMessage.value = '';
  }
};
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding-bottom: 4rem;
}

.navbar {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
  color: white;
}

.logo h3 {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.settings-container {
  max-width: 800px;
  margin: 2rem auto;
}

.settings-container > h1 {
  color: white;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-section h2 {
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group input {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.08);
}

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.message.success {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.message.error {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.danger-zone {
  border: 2px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.danger-warning {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.4);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  color: white;
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

.danger-text {
  color: #fca5a5;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.confirmation-text {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.confirmation-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.confirmation-input:focus {
  outline: none;
  border-color: #ef4444;
  background: rgba(255, 255, 255, 0.08);
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-footer .btn {
  flex: 1;
}

/* Modal animation */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .settings-container > h1 {
    font-size: 1.5rem;
  }

  .settings-section h2 {
    font-size: 1.1rem;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
