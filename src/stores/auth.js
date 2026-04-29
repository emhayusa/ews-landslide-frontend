import { defineStore } from 'pinia';
import AuthService from 'src/services/AuthService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(username, password) {
      try {
        const response = await AuthService.login(username, password);
        const { token } = response.data;
        
        this.token = token;
        localStorage.setItem('token', token);

        // Fetch user profile after login
        await this.fetchMe();
        
        return true;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },

    async fetchMe() {
      try {
        const response = await AuthService.getMe();
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
