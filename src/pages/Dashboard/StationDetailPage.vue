<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- Header Page -->
    <div class="q-mb-lg">
      <div class="text-h4 text-weight-bold text-slate-900 line-height-1">{{ currentStation.name || 'Station Detail' }}</div>
      <div class="text-caption text-grey-6 text-weight-medium mt-sm">ID: {{ currentStation.station_id || stationId }} • Atur kanal pengiriman peringatan dini dan ambang batas sensor.</div>
    </div>

    <!-- Communication Kanal Cards -->
    <div class="row q-col-gutter-md q-col-gutter-sm-lg q-mb-lg">
      <!-- Sirene Lapangan -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="panel-card no-shadow border-radius-lg overflow-hidden border-left-red full-height">
          <q-card-section class="q-pa-md">
            <div class="flex justify-between items-start q-mb-sm">
              <div class="icon-box bg-red-1 text-red-5 q-pa-sm border-radius-md flex items-center justify-center">
                <q-icon name="campaign" size="24px" />
              </div>
              <q-badge color="green-1" text-color="green-6" label="• ACTIVE" class="text-bold border-radius-sm status-badge" />
            </div>
            <div class="text-weight-bold text-slate-900 text-body1 q-mt-md">Sirene Lapangan</div>
            <div class="text-caption text-grey-6 q-mb-lg" style="min-height: 40px">Koneksi langsung ke hardware siren di lokasi rawan.</div>
            
            <q-separator />
            
            <div class="flex justify-between items-center q-mt-sm">
              <div class="text-caption text-grey-5">Latency: 24ms</div>
              <q-btn flat no-caps color="blue-6" label="Uji Koneksi" class="text-bold text-caption q-pa-none" size="sm" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- WhatsApp Gateway -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="panel-card no-shadow border-radius-lg overflow-hidden border-left-green full-height">
          <q-card-section class="q-pa-md">
            <div class="flex justify-between items-start q-mb-sm">
              <div class="icon-box bg-green-1 text-green-6 q-pa-sm border-radius-md flex items-center justify-center">
                <q-icon name="fa-brands fa-whatsapp" size="24px" />
              </div>
              <q-badge color="green-1" text-color="green-6" label="• ACTIVE" class="text-bold border-radius-sm status-badge" />
            </div>
            <div class="text-weight-bold text-slate-900 text-body1 q-mt-md">WhatsApp Gateway</div>
            <div class="text-caption text-grey-6 q-mb-lg" style="min-height: 40px">Pesan broadcast otomatis ke grup koordinasi warga.</div>
            
            <q-separator />
            
            <div class="flex justify-between items-center q-mt-sm">
              <div class="text-caption text-grey-5">Messages: 1,240 Today</div>
              <q-btn flat no-caps color="blue-6" label="Log Pengiriman" class="text-bold text-caption q-pa-none" size="sm" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Telegram Bot -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="panel-card no-shadow border-radius-lg overflow-hidden border-left-blue full-height">
          <q-card-section class="q-pa-md">
            <div class="flex justify-between items-start q-mb-sm">
              <div class="icon-box bg-blue-1 text-blue-5 q-pa-sm border-radius-md flex items-center justify-center">
                <q-icon name="send" size="24px" />
              </div>
              <q-badge color="green-1" text-color="green-6" label="• ACTIVE" class="text-bold border-radius-sm status-badge" />
            </div>
            <div class="text-weight-bold text-slate-900 text-body1 q-mt-md">Telegram Bot</div>
            <div class="text-caption text-grey-6 q-mb-lg" style="min-height: 40px">Notifikasi teknis dan log sensor untuk tim monitoring.</div>
            
            <q-separator />
            
            <div class="flex justify-between items-center q-mt-sm">
              <div class="text-caption text-grey-5">Subs: 12 User</div>
              <div class="text-caption text-transparent">Log</div> <!-- placeholder for spacing -->
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Live Monitoring Cards -->
    <div class="row q-col-gutter-md q-col-gutter-sm-lg q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="panel-card no-shadow border-radius-lg bg-indigo-5 text-white">
          <q-card-section class="q-pa-md">
            <div class="flex items-center q-mb-sm">
              <q-icon name="cloud" size="20px" class="q-mr-sm" />
              <div class="text-caption text-weight-medium uppercase opacity-80" style="letter-spacing: 0.5px">Rainfall (Live)</div>
            </div>
            <div class="flex items-end q-gutter-x-xs">
              <div class="text-h4 text-weight-bold">{{ currentStation.rain || '0.0' }}</div>
              <div class="text-caption q-pb-xs opacity-80">mm/h</div>
            </div>
            <div class="text-caption q-mt-md opacity-70">
              Update Terakhir: {{ currentStation.lastUpdate || '-' }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="panel-card no-shadow border-radius-lg bg-orange-7 text-white">
          <q-card-section class="q-pa-md">
            <div class="flex items-center q-mb-sm">
              <q-icon name="trending_up" size="20px" class="q-mr-sm" />
              <div class="text-caption text-weight-medium uppercase opacity-80" style="letter-spacing: 0.5px">Deformasi</div>
            </div>
            <div class="flex items-end q-gutter-x-xs">
              <div class="text-h4 text-weight-bold">{{ currentStation.deformation || '0.0000' }}</div>
              <div class="text-caption q-pb-xs opacity-80">cm</div>
            </div>
            <div class="text-caption q-mt-md opacity-70">
              Sensor GNSS Active
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="panel-card no-shadow border-radius-lg bg-green-7 text-white">
          <q-card-section class="q-pa-md">
            <div class="flex items-center q-mb-sm">
              <q-icon name="battery_charging_full" size="20px" class="q-mr-sm" />
              <div class="text-caption text-weight-medium uppercase opacity-80" style="letter-spacing: 0.5px">Battery</div>
            </div>
            <div class="flex items-end q-gutter-x-xs">
              <div class="text-h4 text-weight-bold">{{ currentStation.battery || '0.0' }}</div>
              <div class="text-caption q-pb-xs opacity-80">Volt</div>
            </div>
            <div class="text-caption q-mt-md opacity-70">
              Solar Panel: {{ currentStation.solar || '0.0' }} V
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="panel-card no-shadow border-radius-lg bg-blue-grey-8 text-white">
          <q-card-section class="q-pa-md">
            <div class="flex items-center q-mb-sm">
              <q-icon name="sensors" size="20px" class="q-mr-sm" />
              <div class="text-caption text-weight-medium uppercase opacity-80" style="letter-spacing: 0.5px">Status</div>
            </div>
            <div class="flex items-center q-gutter-x-sm">
              <div class="text-h5 text-weight-bold">{{ currentStation.status === 'ACTIVE' ? 'NORMAL' : 'OFFLINE' }}</div>
              <q-badge rounded color="green" />
            </div>
            <div class="text-caption q-mt-md opacity-70">
              Signal: -75dBm (Strong)
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Threshold Setting Panel -->
    <q-card class="panel-card no-shadow border-radius-lg overflow-hidden">
      <!-- Title box -->
      <div class="q-pa-md flex items-center">
        <div class="icon-box bg-indigo-1 text-indigo-5 q-pa-sm border-radius-md flex items-center justify-center q-mr-md" style="width: 40px; height: 40px">
          <q-icon name="format_line_spacing" size="20px" class="rotate-90"/>
        </div>
        <div>
          <div class="text-weight-bold text-slate-900 text-body1">Threshold Bahaya</div>
          <div class="text-caption text-grey-6">Konfigurasi parameter pemicu peringatan dini sistem.</div>
        </div>
      </div>
      
      <q-separator />

      <q-card-section class="q-pa-md q-pa-sm-lg">
        <div class="row q-col-gutter-md q-col-gutter-sm-lg">
          <!-- Left Col: Threshold values -->
          <div class="col-12 col-md-7 column q-gutter-y-lg">
            <!-- Deformasi -->
            <div>
              <div class="flex items-center q-mb-sm" style="color: #d97706">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="q-mr-xs"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-4 4"/></svg>
                <span class="text-weight-bold text-caption">Deformasi (cm)</span>
              </div>
              <q-input v-model="form.deformasi" outlined dense class="bg-grey-2 border-radius-sm threshold-input" />
              <div class="text-grey-5 q-mt-xs q-italic" style="font-size: 11px">Memicu notifikasi jika pergerakan tanah melebihi nilai ini (GNSS precision tracking).</div>
            </div>
            
            <!-- Curah Hujan -->
            <div>
              <div class="flex items-center q-mb-sm text-blue-grey-6 text-weight-bold text-caption">
                <q-icon name="cloud" size="18px" class="q-mr-xs"/>
                Curah Hujan (mm)
              </div>
              <q-input v-model="form.curah_hujan" outlined dense class="bg-grey-2 border-radius-sm threshold-input" />
              <div class="text-grey-5 q-mt-xs q-italic" style="font-size: 11px">Memicu notifikasi jika curah hujan melebihi nilai ini.</div>
            </div>
          </div>

          <!-- Right Col: Kanal Pemicu -->
          <div class="col-12 col-md-5">
            <div class="text-caption text-grey-6 text-weight-bold q-mb-md uppercase" style="letter-spacing: 0.5px">Kanal Pemicu Aktif</div>
            
            <div class="q-gutter-y-sm">
              <div class="trigger-row bg-grey-1 flex justify-between items-center q-pa-sm border-radius-sm">
                <div class="flex items-center">
                  <q-icon name="campaign" size="18px" class="text-red-5 q-mr-sm" />
                  <span class="text-slate-800 text-weight-medium" style="font-size: 13px">Sirene Lokal</span>
                </div>
                <q-checkbox v-model="form.trigger_sirene" size="sm" class="custom-checkbox" />
              </div>
              
              <div class="trigger-row bg-grey-1 flex justify-between items-center q-pa-sm border-radius-sm">
                <div class="flex items-center">
                  <q-icon name="fa-brands fa-whatsapp" size="18px" class="text-green-6 q-mr-sm" />
                  <span class="text-slate-800 text-weight-medium" style="font-size: 13px">WhatsApp Blast</span>
                </div>
                <q-checkbox v-model="form.trigger_wa" size="sm" class="custom-checkbox" />
              </div>
              
              <div class="trigger-row bg-grey-1 flex justify-between items-center q-pa-sm border-radius-sm">
                <div class="flex items-center">
                  <q-icon name="send" size="18px" class="text-blue-5 q-mr-sm" />
                  <span class="text-slate-800 text-weight-medium" style="font-size: 13px">Telegram Alert</span>
                </div>
                <q-checkbox v-model="form.trigger_telegram" size="sm" class="custom-checkbox" />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
      
      <!-- Footer Action -->
      <q-separator />
      <q-card-actions align="right" class="q-pa-md bg-white">
        <q-btn unelevated color="blue-5" icon="save" label="Simpan Konfigurasi" class="border-radius-sm text-weight-medium q-px-md" no-caps @click="save" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar, date } from 'quasar';
import { useStreamStore } from 'src/stores/stream';
import { useStationStore } from 'src/stores/station';

const route = useRoute();
const $q = useQuasar();
const streamStore = useStreamStore();
const stationStore = useStationStore();

const stationId = computed(() => {
  return route.params.id;
});

const currentStation = computed(() => {
  return stationStore.stations.find(s => s.station_id === stationId.value) || {};
});

const form = ref({
  deformasi: '10.0',
  curah_hujan: '15.0',
  trigger_sirene: true,
  trigger_wa: true,
  trigger_telegram: false
});

onMounted(() => {
  streamStore.connect();
});

onUnmounted(() => {
  // We might not want to disconnect if other pages still need it, 
  // but usually Dashboard manages it. 
  // For now, let's just keep it simple.
});

// Watch for streaming data (Weather/MQTT)
watch(() => streamStore.latestData, (newData) => {
  if (newData && (newData.station_id === stationId.value || newData.id === currentStation.value.id)) {
    const params = newData.payload.params;
    const targetStation = stationStore.stations.find(s => s.station_id === newData.station_id || s.id === newData.id);
    
    if (targetStation) {
      targetStation.battery = (params.Baterai || 0).toFixed(2);
      targetStation.solar = (params.Solar || 0).toFixed(2);
      targetStation.rain = (params.bucket || 0).toFixed(1);
      targetStation.lastUpdate = date.formatDate(new Date(), 'HH:mm:ss');
    }
  }
});

// Watch for streaming data (Deformation/GNSS)
watch(() => streamStore.latestSensorData, (newData) => {
  if (newData) {
    // Check if message is for this station
    const targetStation = stationStore.stations.find(s => s.station_id === stationId.value);
    if (targetStation) {
      targetStation.deformation = (newData.offset || 0).toFixed(4);
      targetStation.lastUpdate = date.formatDate(new Date(), 'HH:mm:ss');
      console.log('[Detail] Updated live deformation for station:', stationId.value);
    }
  }
});

const save = () => {
  $q.notify({
    color: 'positive',
    position: 'top',
    message: 'Konfigurasi berhasil disimpan',
  });
}
</script>

<style lang="scss" scoped>
.panel-card {
  border: 1px solid #e2e8f0;
}

.border-radius-lg { border-radius: 12px; }
.border-radius-md { border-radius: 8px; }
.border-radius-sm { border-radius: 6px; }

.border-left-red { border-left: 4px solid #ef4444; }
.border-left-green { border-left: 4px solid #22c55e; }
.border-left-blue { border-left: 4px solid #3b82f6; }

.icon-box {
  width: 48px;
  height: 48px;
}

.status-badge {
  padding: 4px 8px;
  letter-spacing: 0.5px;
}

.threshold-input {
  :deep(.q-field__control) {
    border-radius: 6px;
  }
}

.trigger-row {
  border: 1px solid #e2e8f0;
}

.custom-checkbox {
  :deep(.q-checkbox__inner) {
    color: #3b82f6;
  }
}
</style>
