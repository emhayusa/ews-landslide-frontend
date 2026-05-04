import { defineStore } from 'pinia';
import SiteService from 'src/services/SiteService';

export const useSiteStore = defineStore('site', {
  state: () => ({
    sites: [],
    loading: false
  }),
  actions: {
    async fetchSites() {
      this.loading = true;
      try {
        const response = await SiteService.getAll();
        this.sites = response.data || [];
      } catch (error) {
        console.error('Store fetchSites error:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
