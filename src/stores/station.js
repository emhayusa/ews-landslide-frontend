import { defineStore } from 'pinia';
import StationService from 'src/services/StationService';
import BaseStationService from 'src/services/BaseStationService';

export const useStationStore = defineStore('station', {
  state: () => ({
    stations: [], // Rover Stations
    baseStations: [], // Base Stations
    loading: false
  }),
  getters: {
    totalStations: (state) => state.stations.length,
    activeRovers: (state) => state.stations.filter(r => 
      r.status === 'ACTIVE' && 
      (Math.abs(Number(r.deformation)) || 0) < 0.1
    ).length,
    maintenanceRovers: (state) => state.stations.filter(r => 
      (r.status === 'MAINTENANCE' || (Math.abs(Number(r.deformation)) || 0) >= 0.1)
    ).length,
    offlineRovers: (state) => state.stations.filter(r => r.status === 'INACTIVE').length
  },
  actions: {
    async fetchStations() {
      this.loading = true;
      try {
        const response = await StationService.getAll();
        this.stations = (response.data || []).map(st => ({
          ...st,
          coordinates: `${st.latitude}, ${st.longitude}`,
          lastActivity: 'Mengecek...',
          history: [] // Untuk menampung data streaming untuk chart
        }));
      } catch (error) {
        console.error('Store fetchStations error:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    addHistory(stationId, point) {
      const station = this.stations.find(s => s.station_id === stationId);
      if (station) {
        if (!station.history) station.history = [];
        station.history.push(point);
        // Batasi histori agar tidak membebani memori (misal: 100 data point terakhir)
        if (station.history.length > 100) {
          station.history.shift();
        }
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
    },
    async fetchBaseStations() {
      this.loading = true;
      try {
        const response = await BaseStationService.getAll();
        this.baseStations = response.data || [];
      } catch (error) {
        console.error('Store fetchBaseStations error:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async createBaseStation(data) {
      await BaseStationService.create(data);
      await this.fetchBaseStations();
    },
    async updateBaseStation(id, data) {
      await BaseStationService.update(id, data);
      await this.fetchBaseStations();
    },
    async deleteBaseStation(id) {
      await BaseStationService.delete(id);
      await this.fetchBaseStations();
    }
  }
});
