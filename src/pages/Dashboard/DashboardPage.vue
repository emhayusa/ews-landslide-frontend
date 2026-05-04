<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- Summary Cards Row -->
    <div class="row q-col-gutter-md q-col-gutter-sm-lg q-mb-lg">
      <div v-for="card in summaryCards" :key="card.label" class="col-6 col-sm-4 col-md">
        <q-card class="summary-card no-shadow border-radius-md" :class="'card-top-' + card.color">
          <q-card-section class="q-pa-md q-pa-sm-lg row items-start">
            <div class="column">
               <q-icon :name="card.icon" size="20px" :color="card.color" class="q-mb-md" />
               <div class="text-h4 text-weight-bold text-slate-900 line-height-1">{{ card.value }}</div>
               <div class="text-caption text-weight-medium mt-sm" style="color: #64748b; font-size: 11px">{{ card.label }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="row q-col-gutter-lg">
      <!-- Left Column: Map -->
      <div class="col-12 col-md-5">
        <q-card class="panel-card no-shadow border-radius-lg overflow-hidden">
          <q-card-section class="q-pa-md flex items-center bg-white border-bottom-light">
            <q-icon name="map" size="24px" class="q-mr-sm text-green-6" />
            <div class="text-weight-bold text-slate-800 text-body1">Peta Sebaran Station</div>
            <q-space />
            <q-btn flat round dense icon="refresh" color="blue-grey-4" size="sm" @click="refreshMapData">
              <q-tooltip>Refresh Data Peta</q-tooltip>
            </q-btn>
          </q-card-section>
          
          <q-card-section class="q-pa-none relative-position map-container">
            <!-- Floating Legend -->
            <div class="legend-box shadow-2">
              <div class="text-weight-bold text-caption q-mb-sm border-bottom-light q-pb-xs">Legenda</div>
              <div v-for="l in legendItems" :key="l.label" class="flex items-center q-mb-sm no-wrap cursor-pointer hover-opacity" @click="toggleLayer(l)">
                <div class="marker-dot q-mr-sm" :class="[l.visible !== false ? 'bg-' + l.color : 'bg-grey-4']">
                   <div v-if="l.label.includes('Base')" class="text-white text-bold" style="font-size: 8px">B</div>
                </div>
                <div class="text-caption" :class="[l.visible !== false ? 'text-slate-700' : 'text-grey-4 text-strike']">{{ l.label }} ({{ l.count }})</div>
              </div>
            </div>

            <!-- Actual Map Component -->
            <div class="map-bg full-height full-width relative-position">
              <MapView />
            </div>

            <!-- Zoom Controls -->
            <div class="absolute-bottom-right q-ma-md" style="z-index: 10;">
              <div class="column no-wrap items-center bg-white shadow-sm" style="border: 1px solid #e2e8f0; border-radius: 8px; width: 40px;">
                <q-btn flat dense color="blue-grey-4" icon="add" size="14px" padding="8px" @click="mapStore.zoomIn()" />
                <div style="height: 1px; width: 24px; background: #f1f5f9;"></div>
                <q-btn flat dense color="blue-grey-4" icon="remove" size="14px" padding="8px" @click="mapStore.zoomOut()" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Column: Table -->
      <div class="col-12 col-md-7">
        <q-card class="panel-card no-shadow border-radius-lg overflow-hidden">
          <q-card-section class="q-pa-md flex justify-between items-center bg-white border-bottom-light">
            <div class="flex items-center">
              <q-icon name="sensors" size="20px" class="q-mr-sm text-slate-700" />
              <div class="text-weight-bold text-slate-900" style="font-size: 14px;">Station Overview</div>
              <q-badge v-if="streamStore.isConnected" color="green-1" text-color="green-7" label="LIVE" class="q-ml-sm text-bold" style="font-size: 9px;" />
              <q-badge v-else color="grey-2" text-color="grey-6" label="OFFLINE" class="q-ml-sm text-bold" style="font-size: 9px;" />
            </div>
            <div class="text-caption text-grey-5 uppercase text-weight-medium" style="font-size: 11px;">
               {{ stationStore.maintenanceRovers }} Warning
            </div>
          </q-card-section>
          
          <q-card-section class="q-pa-md">
            <div class="text-caption text-grey-5 q-mb-md font-weight-600 uppercase">Region Overview</div>
            
            <q-table
              flat
              :rows="rows"
              :columns="columns"
              row-key="pairing"
              hide-pagination
              class="premium-table"
              :pagination="{ rowsPerPage: 0 }"
              @row-click="onRowClick"
            >
              <template v-slot:body-cell-pairing="props">
                <q-td :props="props">
                  <div class="flex items-center no-wrap">
                    <span class="text-blue-6 text-bold text-caption uppercase">{{ props.row.base_code }}</span>
                    <q-icon name="swap_horiz" size="18px" class="q-mx-xs text-grey-4" />
                    <span class="text-purple-5 text-bold text-caption uppercase">{{ props.row.obs_code }}</span>
                  </div>
                </q-td>
              </template>
              
              <template v-slot:body-cell-deformation="props">
                <q-td :props="props">
                  <span :class="props.row.status === 'BAHAYA' ? 'text-red-6' : (props.row.status === 'NORMAL' ? 'text-green-6' : 'text-slate-700')" class="text-weight-bold" style="font-size: 11px">
                    {{ props.value }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-rain_combined="props">
                <q-td :props="props">
                  <div class="flex items-center no-wrap">
                    <span class="text-slate-700 text-weight-bold" style="font-size: 11px">{{ props.row.rain }}</span>
                    <span class="text-grey-4 q-mx-xs">/</span>
                    <span class="text-slate-500" style="font-size: 10px">{{ props.row.rain_daily }}</span>
                    <span class="text-grey-5 q-ml-xs" style="font-size: 9px">mm</span>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-power_combined="props">
                <q-td :props="props">
                  <div class="flex items-center no-wrap">
                    <q-icon name="bolt" size="12px" :color="props.row.battery < 12 ? 'red' : 'amber-8'" class="q-mr-xs" />
                    <span class="text-slate-700 text-weight-bold" style="font-size: 11px">{{ props.row.battery }}</span>
                    <span class="text-grey-4 q-mx-xs">/</span>
                    <span class="text-slate-500" style="font-size: 10px">{{ props.row.solar }}</span>
                    <span class="text-grey-5 q-ml-xs" style="font-size: 9px">V</span>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-accel="props">
                <q-td :props="props">
                  <span class="text-slate-700 text-weight-bold" style="font-size: 11px">
                    {{ props.value }}
                  </span>
                </q-td>
              </template>

              <template v-slot:body-cell-lastUpdate="props">
                <q-td :props="props">
                  <div class="flex items-center no-wrap">
                    <div v-if="props.value" class="pulse-dot q-mr-xs"></div>
                    <span class="text-slate-600 text-weight-medium" style="font-size: 11px">
                      {{ props.value || '-' }}
                    </span>
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-badge
                    :color="getStatusColor(props.value).bg"
                    :text-color="getStatusColor(props.value).text"
                    :label="props.value"
                    class="status-pill text-bold uppercase border-radius-sm"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-chart="props">
                <q-td :props="props">
                  <div class="flex items-center justify-center q-gutter-x-sm">
                    <q-btn flat round dense size="xs" icon="bar_chart" color="cyan-6" class="bg-cyan-1 q-pa-xs border-radius-sm" @click.stop="openChart(props.row)" />
                    <q-btn flat round dense size="xs" icon="system_update_alt" color="amber-7" class="bg-amber-1 q-pa-xs border-radius-sm" />
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-push="props">
                <q-td :props="props">
                  <div v-if="props.value === 'IDLE'" class="flex items-center">
                     <q-badge color="blue-1" text-color="blue-7" label="IDLE" rounded class="q-px-sm q-py-xs text-weight-bold" style="font-size: 9px;" />
                  </div>
                  <div v-else class="push-details-container">
                    <div v-for="d in props.value" :key="d.label" class="sensor-row flex items-center justify-between q-mb-xs">
                      <div class="flex items-center text-slate-500" style="font-size: 10px;">
                         <q-icon :name="d.icon" size="12px" :color="d.iconColor" class="q-mr-xs" />
                         <span>{{ d.label }}:</span>
                      </div>
                      <q-badge :style="d.status === 'TERKIRIM' ? 'background: #ccfbf1; color: #115e59;' : (d.status === 'N/A' ? 'background: #f1f5f9; color: #64748b;' : 'background: #e0f2fe; color: #0284c7;')"
                               :label="d.status" 
                               class="mini-status text-weight-bold" />
                    </div>
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <!-- Chart Dialog -->
    <ChartDialog 
      v-model="showChartDialog"
      :station-id="selectedStationForChart?.station_id"
      :station-name="selectedStationForChart?.name"
    />
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted, computed, watch, ref } from 'vue';
import MapView from '../Peta/MapView.vue';
import ChartDialog from 'src/components/ChartDialog.vue';
import { useRouter } from 'vue-router';
import { useStationStore } from "src/stores/station";
import { useMapStore } from "src/stores/map";
import { useStreamStore } from "src/stores/stream";
import { useQuasar, date } from 'quasar';

const $q = useQuasar();
const router = useRouter();
const stationStore = useStationStore();
const mapStore = useMapStore();
const streamStore = useStreamStore();

const showChartDialog = ref(false);
const selectedStationForChart = ref(null);

function openChart(row) {
  selectedStationForChart.value = row;
  showChartDialog.value = true;
}

console.log('[Dashboard] Initializing...');

async function refreshMapData() {
  try {
    await Promise.all([
      stationStore.fetchStations(),
      stationStore.fetchBaseStations()
    ]);
    if (mapStore.map) {
      mapStore.setStations(stationStore.stations, stationStore.baseStations);
    }
    $q.notify({
      message: 'Data peta berhasil diperbarui',
      color: 'positive',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    });
  } catch {
    $q.notify({
      message: 'Gagal memperbarui data peta',
      color: 'negative',
      icon: 'error',
      position: 'top'
    });
  }
}

onMounted(async () => {
  console.log('[Dashboard] Mounted, fetching stations & connecting WS...');
  await Promise.all([
    stationStore.fetchStations(),
    stationStore.fetchBaseStations()
  ]);
  streamStore.connect();
  
  console.log('[Dashboard] Data fetched:', stationStore.stations.length, 'rovers,', stationStore.baseStations.length, 'bases');
  // Ensure map is updated if already ready
  if (mapStore.map) {
    console.log('[Dashboard] Map already ready, setting stations...');
    mapStore.setStations(stationStore.stations, stationStore.baseStations);
  }
});

onUnmounted(() => {
  streamStore.disconnect();
});

// Watch for streaming data to update stations (General: Battery, Rain, etc)
watch(() => streamStore.latestData, (newData) => {
  if (newData && newData.payload && newData.payload.params) {
    const payload = newData.payload;
    const params = payload.params;
    
    const targetStation = stationStore.stations.find(s => 
      s.id === newData.id || 
      s.station_id === newData.station_id
    );

    if (targetStation) {
      // Keep existing deformation if we are getting it from the other stream, 
      // or update if this stream provides a more specific one
      if (params.deformasi !== undefined) {
        targetStation.deformation = Math.abs(params.deformasi || 0).toFixed(3);
      }
      targetStation.battery = (params.Baterai || 0).toFixed(2);
      targetStation.solar = (params.Solar || 0).toFixed(2);
      targetStation.rain = (params.curah_hujan_hourly || 0).toFixed(1);
      targetStation.rain_daily = (params.curah_hujan_daily || 0).toFixed(1);
      targetStation.lastUpdate = date.formatDate(new Date(), 'HH:mm:ss');
      
      // Update history for chart
      if (params.deformasi !== undefined) {
        stationStore.addHistory(targetStation.station_id, {
          x: new Date().getTime(),
          y: Number(Math.abs(params.deformasi).toFixed(3))
        });
      }
      
      if (mapStore.selectedStation && mapStore.selectedStation.id === targetStation.id) {
        mapStore.selectedStation = { ...targetStation };
      }
      
      // Update marker color on map
      mapStore.updateStationMarker(targetStation);
    }
  }
});

const INITIAL_DISTANCE = 17528.774;

// Watch for sensor distance data (Specifically for UNGR)
watch(() => streamStore.latestSensorData, (newData) => {
  if (newData && newData.distance) {
    const targetStation = stationStore.stations.find(s => s.station_id === 'UNGR');
    if (targetStation) {
      // Calculate deformation: Current Distance - Initial Distance (in meters)
      const diffMeters = newData.distance - INITIAL_DISTANCE;
      
      targetStation.deformation = Math.abs(diffMeters).toFixed(3);
      targetStation.lastUpdate = date.formatDate(new Date(), 'HH:mm:ss');
      
      // Update marker color on map
      mapStore.updateStationMarker(targetStation);
      
      // Update history for chart
      stationStore.addHistory('UNGR', {
        x: new Date().getTime(),
        y: Number(Math.abs(diffMeters).toFixed(3))
      });
      
      if (mapStore.selectedStation && mapStore.selectedStation.station_id === 'UNGR') {
        mapStore.selectedStation = { ...targetStation };
      }
    }
  }
});

// Watch for map readiness
watch(() => mapStore.map, (map) => {
  if (map && (stationStore.stations.length > 0 || stationStore.baseStations.length > 0)) {
    console.log('[Dashboard] Map became ready, setting stations...');
    mapStore.setStations(stationStore.stations, stationStore.baseStations);
  }
});

const summaryCards = computed(() => [
  { label: 'Base Station', value: stationStore.baseStations.length, icon: 'satellite_alt', color: 'blue-6' },
  { label: 'Rover Station', value: stationStore.stations.length, icon: 'cell_tower', color: 'purple-4' },
  { label: 'Normal / Active', value: stationStore.activeRovers, icon: 'check_circle', color: 'green-5' },
  { label: 'Danger / Bahaya', value: stationStore.maintenanceRovers, icon: 'campaign', color: 'red-5' },
  { label: 'Offline', value: stationStore.offlineRovers, icon: 'wifi_off', color: 'blue-5' }
]);

const legendItems = computed(() => [
  { label: 'Base Station', color: 'blue-6', count: stationStore.baseStations.length, type: 'BASE', visible: mapStore.baseStationLayer?.getVisible() },
  { label: 'Active', color: 'green-5', count: stationStore.activeRovers, type: 'ROVER', visible: mapStore.stationLayer?.getVisible() },
  { label: 'Danger / Bahaya', color: 'red-5', count: stationStore.maintenanceRovers, type: 'ROVER', visible: mapStore.stationLayer?.getVisible() },
  { label: 'Offline', color: 'grey-6', count: stationStore.offlineRovers, type: 'ROVER', visible: mapStore.stationLayer?.getVisible() }
]);

function toggleLayer(item) {
  if (item.type === 'BASE') {
    if (mapStore.baseStationLayer) mapStore.baseStationLayer.setVisible(!mapStore.baseStationLayer.getVisible());
  } else if (item.type === 'ROVER') {
    if (mapStore.stationLayer) mapStore.stationLayer.setVisible(!mapStore.stationLayer.getVisible());
  }
}

const columns = [
  { name: 'pairing', align: 'left', label: 'STATION / PAIRING', field: 'name' },
  { name: 'deformation', align: 'left', label: 'DEFORMATION (m)', field: 'deformation' },
  { name: 'accel', align: 'left', label: 'ACCELEROMETER (m/s²)', field: 'accel' },
  { name: 'rain_combined', align: 'left', label: 'RAIN (H / D)', field: 'rain' },
  { name: 'power_combined', align: 'left', label: 'POWER (B / S)', field: 'battery' },
  { name: 'lastUpdate', align: 'left', label: 'LAST UPDATE', field: 'lastUpdate' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'chart', align: 'center', label: 'CHART', field: 'chart' },
  { name: 'push', align: 'center', label: 'PUSH NOTIFIKASI', field: 'push' }
];

const rows = computed(() => {
  return stationStore.stations
    .map(st => ({
      ...st,
      base_code: st.base_station?.kode || 'BASE',
      obs_code: st.station_id,
      pairing: st.name,
      deformation: st.deformation || '0.000',
      accel: 'N/A',
      rain: st.rain || '0.0',
      rain_daily: st.rain_daily || '0.0',
      battery: st.battery || '0.0',
      solar: st.solar || '0.0',
      lastUpdate: st.lastUpdate || date.formatDate(st.updated_at, 'HH:mm:ss'),
      status: (Math.abs(Number(st.deformation)) >= 0.1 || st.status === 'MAINTENANCE') ? 'BAHAYA' : (st.status === 'ACTIVE' ? 'NORMAL' : 'OFFLINE'),
      push: 'IDLE'
    }));
});

const onRowClick = (evt, row) => {
  router.push(`/dashboard/station/${row.station_id}`);
};

const getStatusColor = (status) => {
  if (status === 'NORMAL') return { bg: 'green-1', text: 'green-6' };
  if (status === 'BAHAYA') return { bg: 'red-1', text: 'red-6' };
  return { bg: 'grey-3', text: 'grey-7' };
};
</script>

<style lang="scss" scoped>
.col-md-2-4 {
  width: 20%;
}

.summary-card {
  border-top-width: 4px;
  border-top-style: solid;
  background: white;
}

.card-top-blue-6 { border-top-color: #2563eb; }
.card-top-purple-4 { border-top-color: #c084fc; }
.card-top-green-5 { border-top-color: #22c55e; }
.card-top-red-5 { border-top-color: #ef4444; }
.card-top-blue-5 { border-top-color: #3b82f6; }

.map-container {
  height: 400px;
  @media (max-width: $breakpoint-xs-max) {
     height: 300px;
  }
}

.legend-box {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 10px;
  border-radius: 12px;
  z-index: 10;
  width: 150px;
  border: 1px solid #f1f5f9;
  
  @media (min-width: $breakpoint-sm-min) {
    top: 20px;
    left: 20px;
    padding: 14px;
    width: 170px;
  }
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-marker {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 11px;
  border: 2px solid white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.15);
  transform: translate(-50%, -50%);
  z-index: 5;
}

.marker-base { background: #1d4ed8; font-size: 14px; }
.marker-green { background: #16a34a; }
.marker-red { background: #ef4444; }
.marker-grey { background: #64748b; }

.status-pill {
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 10px;
}

.premium-table {
  background: transparent;
  
  :deep(th) {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 700;
    padding: 12px 8px;
    border-bottom: 2px solid #f1f5f9;
  }
  
  :deep(td) {
    font-size: 12px;
    padding: 10px 8px;
    color: #475569;
    font-weight: 500;
  }
  
  :deep(tr:hover) {
    background: #f8fafc;
    cursor: pointer;
  }
}

.mini-status {
  font-size: 9px;
  padding: 2px 6px;
  min-height: auto;
  border-radius: 4px;
}

.push-details-container {
  width: 160px;
}

.sensor-row {
  line-height: 1.2;
}

.bg-green-1 { background: #f0fdf4; }
.bg-amber-1 { background: #fffbeb; }

.letter-spacing-1 {
  letter-spacing: 0.05em;
}
.pulse-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}
</style>
