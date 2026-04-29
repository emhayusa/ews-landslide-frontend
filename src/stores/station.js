import { defineStore } from 'pinia';
import StationService from 'src/services/StationService';

export const useStationStore = defineStore('station', {
  state: () => ({
    stations: [],
    loading: false
  }),
  getters: {
    totalStations: (state) => state.stations.length,
    baseStations: (state) => state.stations.filter(r => r.hardware_type === 'BASE').length,
    activeRovers: (state) => state.stations.filter(r => r.hardware_type === 'ROVER' && r.status === 'ACTIVE').length,
    maintenanceStations: (state) => state.stations.filter(r => r.status === 'MAINTENANCE').length
  },
  actions: {
    async fetchStations() {
      this.loading = true;
      try {
        const response = await StationService.getAll();
        this.stations = (response.data || []).map(st => ({
          ...st,
          coordinates: `${st.latitude}, ${st.longitude}`,
          lastActivity: 'Mengecek...'
        }));
      } catch (error) {
        console.error('Store fetchStations error:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async createStation(data) {
      await StationService.create(data);
      await this.fetchStations();
    },
    async updateStation(id, data) {
      await StationService.update(id, data);
      await this.fetchStations();
    },
    async deleteStation(id) {
      await StationService.delete(id);
      await this.fetchStations();
    }
  }
});
