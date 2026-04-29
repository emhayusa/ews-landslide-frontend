/**
 * ClimateDataService
 * Mimics Zoom.earth data fetching patterns.
 * Provides manifest (times), grid data (wind/precip), and storm tracks.
 */

import gfsManifest from '../data/mock/gfs.json'

export const ClimateDataService = {
  /**
   * Fetch available timestamps for a given parameter
   * @returns {Object} Manifest data
   */
  async getManifest() {
    // Simulated fetch
    return gfsManifest
  },

  /**
   * Generate dummy wind grid for Indonesia
   * Lat: -15 to 15, Lon: 90 to 145
   */
  async getWindGrid(timestamp, hour) {
    console.log(`[ClimateService] Fetching wind grid API for ${timestamp} +${hour}h`)
    
    // Konversi hour (misal 1.5) menjadi format nama file (1_5)
    const hourStr = hour.toString().replace('.', '_')
    
    try {
      // Menggunakan import.meta.env.BASE_URL agar fetch mematuhi konfigurasi publicPath Quasar
      const baseUrl = import.meta.env.BASE_URL || '/';
      const url = `${baseUrl}api/wind/${timestamp}_${hourStr}.json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const payload = await response.json();
      return payload;
      
    } catch (error) {
      console.error('[ClimateService] Error fetching wind grid API:', error);
      return null;
    }
  },

  /**
   * Fetch storm tracks (mimics /data/storms/?id=...)
   */
  async getStormTracks() {
    return [
      {
        id: 'vaianu-2026',
        name: 'Vaianu',
        active: true,
        track: [
          {
            date: '2026-04-10T00:00:00Z',
            coordinates: [115, -8], // Near Bali
            wind: 45,
            spline: [[110, -5], [112, -6], [115, -8]]
          },
          {
            date: '2026-04-10T06:00:00Z',
            coordinates: [118, -10],
            wind: 55,
            spline: [[115, -8], [116.5, -9], [118, -10]]
          }
        ]
      }
    ]
  }
}
