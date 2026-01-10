export interface User {
  id: string;
  email: string;
  name: string;
}

export const useAuth = () => {
  const user = useState<User | null>('user', () => null);
  const loading = useState<boolean>('auth-loading', () => false);

  const fetchUser = async () => {
    loading.value = true;
    try {
      const response = await $fetch('/api/auth/me');
      user.value = response.user as any;
    } catch (error) {
      user.value = null;
    } finally {
      loading.value = false;
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { emailOrUsername, password }
    });
    user.value = response.user as any;
    return response;
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { email, password, name }
    });
    user.value = response.user as any;
    return response;
  };

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' });
    user.value = null;
    navigateTo('/login');
  };

  const updateUser = async (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => {
    const response = await $fetch('/api/auth/update', {
      method: 'PUT',
      body: data
    });
    user.value = response.user as any;
    return response;
  };

  const deleteAccount = async (username: string) => {
    const response = await $fetch('/api/auth/delete', {
      method: 'DELETE',
      body: { username }
    });
    user.value = null;
    navigateTo('/login');
    return response;
  };

  return {
    user,
    loading,
    fetchUser,
    login,
    register,
    logout,
    updateUser,
    deleteAccount,
    isAuthenticated: computed(() => !!user.value)
  };
};
