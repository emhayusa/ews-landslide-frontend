import { defineStore } from 'pinia';
import UserService from 'src/services/UserService';
import { date } from 'quasar';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false
  }),
  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await UserService.getAll();
        this.users = (response.data || []).map(u => ({
          nama: u.full_name,
          username: u.username,
          email: u.email,
          role: u.role,
          sites: u.sites || [],
          site_ids: u.sites ? u.sites.map(s => s.id) : [],
          initials: u.full_name ? u.full_name.substring(0, 2).toUpperCase() : '??',
          avatarColor: 'blue-6',
          dibuat: u.created_at ? date.formatDate(u.created_at, 'DD MMM YYYY') : '-'
        }));
      } catch (error) {
        console.error('Store fetchUsers error:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async createUser(data) {
      await UserService.create(data);
      await this.fetchUsers();
    },
    async updateUser(username, data) {
      await UserService.update(username, data);
      await this.fetchUsers();
    },
    async deleteUser(username) {
      await UserService.delete(username);
      await this.fetchUsers();
    }
  }
});
