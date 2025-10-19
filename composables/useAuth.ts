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
      const response = await $fetch<{ user: User | null }>('/api/auth/me');
      user.value = response.user;
    } catch (error) {
      user.value = null;
    } finally {
      loading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    const response = await $fetch<{ success: boolean; user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    user.value = response.user;
    return response;
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await $fetch<{ success: boolean; user: User }>('/api/auth/register', {
      method: 'POST',
      body: { email, password, name }
    });
    user.value = response.user;
    return response;
  };

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' });
    user.value = null;
    navigateTo('/login');
  };

  return {
    user,
    loading,
    fetchUser,
    login,
    register,
    logout,
    isAuthenticated: computed(() => !!user.value)
  };
};
