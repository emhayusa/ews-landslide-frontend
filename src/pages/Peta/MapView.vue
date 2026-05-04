<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useMapStore } from "src/stores/map";
import ChartDialog from "src/components/ChartDialog.vue";

const mapStore = useMapStore();
const popupRef = ref(null)
const showChartDialog = ref(false)

function openChart() {
    showChartDialog.value = true
}

onMounted(async () => {
    await mapStore.initMap('map');
    mapStore.enableIdentify(popupRef.value)

    // Re-render stations if data is already available
    const stationStore = (await import('src/stores/station')).useStationStore()
    if (stationStore.stations.length > 0 || stationStore.baseStations.length > 0) {
        console.log('[MapView] Data available, rendering stations...');
        mapStore.setStations(stationStore.stations, stationStore.baseStations);
    }
    
    // Use ResizeObserver for more reliable size updates
    const mapEl = document.getElementById('map')
    if (mapEl) {
        const ro = new ResizeObserver(() => {
            if (mapStore.map) {
                mapStore.map.updateSize()
            }
        })
        ro.observe(mapEl)
    }
});

watch(() => mapStore.leftDrawerOpen, () => {
    mapStore.updateMapSize()
})

const hasResults = computed(() => mapStore.identifyResults.length > 0)


const imageDialog = ref(false)
const activeImage = ref("")

function showImage(objectId) {
    activeImage.value = `https://egov.big.go.id/ecov/foto/IMG_0${objectId}.jpg`
    imageDialog.value = true
}

function filterAttributes(attributes, excludedKeys = []) {
    if (!attributes) return []

    console.log(attributes)

    return Object.entries(attributes)
        .filter(([key, value]) =>
            !excludedKeys.includes(key) &&
            !key.toLowerCase().includes('video') && // Hide video link from table
            !key.toLowerCase().includes('stream') &&
            value !== null &&
            value !== undefined &&
            value !== ''
        )
        .map(([key, value]) => ({ key, value }))
}

function getVideoUrl(attributes) {
    if (!attributes) return null
    
    // 1. Try to find by typical keywords first
    const preferredKey = Object.keys(attributes).find(key => 
        key.toLowerCase().includes('video') || 
        key.toLowerCase().includes('stream')
    )
    if (preferredKey && attributes[preferredKey]) return attributes[preferredKey]

    // 2. Fallback: Search for ANY value that starts with http or rtsp and isn't an image
    for (const [, value] of Object.entries(attributes)) {
        if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('rtsp'))) {
            const lowerValue = value.toLowerCase()
            // Skip common image extensions to avoid collision with foto attributes
            if (!lowerValue.endsWith('.jpg') && !lowerValue.endsWith('.jpeg') && !lowerValue.endsWith('.png')) {
                return value
            }
        }
    }
    return null
}

</script>

<template>
    <div id="map" style="position: absolute; inset: 0; outline: none;"></div>
    <q-dialog v-model="imageDialog" :maximized=true>
        <q-card style="width: 80vw; ">
            <q-bar>
                <q-space />
                <q-btn dense flat icon="close" v-close-popup>
                    <q-tooltip class="bg-white text-primary">Tutup</q-tooltip>
                </q-btn>
            </q-bar>
            <q-img :src="activeImage" fit="fill" />
        </q-card>
    </q-dialog>
    <div ref="popupRef" class="ol-popup" v-show="hasResults">
        <!-- Close Button -->
        <button class="popup-close-top" @click="mapStore.closePopup()">×</button>

        <!-- Custom Station Popup -->
        <div v-if="mapStore.selectedStation" class="station-popup-content q-pa-md">
            <!-- Header: Name -->
            <div class="row items-center justify-between q-mb-sm no-wrap q-pr-lg">
                <div class="text-subtitle1 text-weight-bolder text-slate-900 ellipsis" style="max-width: 180px;">
                    {{ mapStore.selectedStation.name }}
                </div>
            </div>

            <!-- Conditional Content Based on Type -->
            <template v-if="mapStore.selectedStation._type === 'BASE'">
                <!-- BASE Layout -->
                <div class="column q-gutter-y-xs q-mb-xs">
                    <div class="row justify-between text-caption items-center" style="font-size: 11px;">
                        <span class="text-blue-3">Kode Station:</span>
                        <span class="text-weight-bold text-slate-800">{{ mapStore.selectedStation.station_id }}</span>
                    </div>
                </div>
            </template>

            <template v-else>
                <!-- ROVER Layout -->
                <div class="column q-gutter-y-xs q-mb-sm">
                    <div class="row justify-between text-caption" style="font-size: 11px;">
                        <span class="text-grey-5">Pairing:</span>
                        <div class="flex items-center no-wrap">
                          <span class="text-blue-6 text-bold uppercase">{{ mapStore.selectedStation.base_station?.kode || 'BASE' }}</span>
                          <q-icon name="swap_horiz" size="14px" class="q-mx-xs text-grey-4" />
                          <span class="text-purple-5 text-bold uppercase">{{ mapStore.selectedStation.station_id }}</span>
                        </div>
                    </div>
                    <div class="row justify-between text-caption" style="font-size: 11px;">
                        <span class="text-grey-5">Update:</span>
                        <span class="text-blue-3">{{ mapStore.selectedStation.lastUpdate || 'Tadi baru saja' }}</span>
                    </div>
                </div>

                <q-separator class="q-mb-sm" color="grey-2" />

                <!-- Sensor Data -->
                <div class="column q-gutter-y-xs q-mb-md">
                    <div class="row items-center justify-between">
                        <div class="flex items-center text-blue-3 text-weight-medium text-caption">
                            <q-icon name="change_history" size="14px" class="q-mr-sm" />
                            Deformasi:
                        </div>
                        <div 
                          class="text-body2 text-weight-bolder" 
                          :class="(Math.abs(Number(mapStore.selectedStation.deformation)) >= 0.1 || mapStore.selectedStation.status === 'MAINTENANCE') ? 'text-red-6' : (mapStore.selectedStation.status === 'ACTIVE' ? 'text-green-6' : 'text-slate-900')"
                        >
                          {{ mapStore.selectedStation.deformation || '0.000' }} m
                        </div>
                    </div>
                    <div class="row items-center justify-between">
                        <div class="flex items-center text-blue-3 text-weight-medium text-caption">
                            <q-icon name="vibration" size="14px" class="q-mr-sm" />
                            Accelerometer:
                        </div>
                        <div class="text-body2 text-weight-bolder text-slate-900">N/A</div>
                    </div>
                    <div class="row items-center justify-between">
                        <div class="flex items-center text-blue-3 text-weight-medium text-caption">
                            <q-icon name="cloud" size="14px" class="q-mr-sm" />
                            Rain (H / D):
                        </div>
                        <div class="text-body2 text-weight-bolder text-slate-900">{{ mapStore.selectedStation.rain || '0.0' }} / {{ mapStore.selectedStation.rain_daily || '0.0' }} <span class="text-caption text-grey-6 text-weight-medium">mm</span></div>
                    </div>
                    <div class="row items-center justify-between">
                        <div class="flex items-center text-blue-3 text-weight-medium text-caption">
                            <q-icon name="bolt" size="14px" class="q-mr-sm" />
                            Power (B / S):
                        </div>
                        <div class="text-body2 text-weight-bolder text-slate-900">{{ mapStore.selectedStation.battery || '0.0' }} / {{ mapStore.selectedStation.solar || '0.0' }} <span class="text-caption text-grey-6 text-weight-medium">V</span></div>
                    </div>
                </div>
            </template>

            <!-- Action Button -->
            <q-btn
                v-if="mapStore.selectedStation._type !== 'BASE'"
                unelevated
                no-caps
                size="sm"
                label="Lihat Chart"
                class="full-width btn-gradient text-white text-weight-bold border-radius-md"
                @click="openChart()"
            />
        </div>

        <!-- Normal Identify Results -->
        <template v-else>
            <div class="popup-header">
                <span class="popup-title">Informasi Fitur</span>
                <button class="popup-close" @click="mapStore.closePopup()">×</button>
            </div>

            <div class="popup-body">
                <details v-for="(result, index) in mapStore.identifyResults" :key="index" :open="index === 0"
                    class="result-section">
                    <summary class="result-header">{{ result.layerName }}</summary>
                    <div class="result-content">
                        <div v-for="(value, key) in filterAttributes(result.attributes, [
                            'FID',
                            'OBJECTID',
                            'Shape',
                            'Shape_Area',
                            'Shape_Length'
                        ])" :key="key" class="attr-row">
                            <span class="attr-key">{{ value.key }}</span>
                            <span class="attr-value">{{ value.value }}</span>
                        </div>

                        <!-- Video Stream Player (for CCTV) -->
                        <div v-if="getVideoUrl(result.attributes)" class="video-container q-mt-sm">
                            <video 
                                v-if="getVideoUrl(result.attributes).endsWith('.mp4') || getVideoUrl(result.attributes).endsWith('.m3u8')"
                                controls 
                                autoplay 
                                muted
                                width="100%"
                                class="rounded-borders"
                            >
                                <source :src="getVideoUrl(result.attributes)" />
                                Browser Anda tidak mendukung video player.
                            </video>
                            <iframe 
                                v-else
                                :src="getVideoUrl(result.attributes)"
                                width="100%"
                                height="200"
                                frameborder="0"
                                allowfullscreen
                                class="rounded-borders"
                            ></iframe>
                            <div class="text-caption text-center q-mt-xs">Live Stream CCTV</div>
                        </div>

                        <!-- Foto Display -->
                        <img v-if="result.attributes?.OBJECTID"
                            :src="`https://egov.big.go.id/ecov/foto/IMG_0${result.attributes.OBJECTID}.jpg`" width="240"
                            class="clickable-img q-ma-sm block" @click="showImage(result.attributes.OBJECTID)" />
                    </div>
                </details>
            </div>
        </template>

        <!-- Loading State -->
        <div v-if="mapStore.identifyLoading" class="popup-loading">
            Memuat...
        </div>
    </div>

    <ChartDialog 
        v-model="showChartDialog" 
        :stationId="mapStore.selectedStation?.station_id"
        :stationName="mapStore.selectedStation?.name || ''" 
    />
</template>

<style scoped>
.full-width {
    width: 100%;
}

.full-height {
    height: 100vh;
}
.ol-popup {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    min-width: 240px;
    max-width: 280px;
    display: flex;
    flex-direction: column;
    border: none;
}

/* Arrow Tip */
.ol-popup::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 10px 10px 0;
    border-style: solid;
    border-color: white transparent transparent;
    filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
}

/* Hide default OpenLayers controls */
:deep(.ol-control) {
    display: none !important;
}

.station-popup-content {
    position: relative;
}

.popup-close-top {
    position: absolute;
    top: 6px;
    right: 8px;
    background: transparent;
    border: none;
    font-size: 20px;
    color: #94a3b8;
    cursor: pointer;
    z-index: 10;
    line-height: 1;
    transition: color 0.2s;
}
.popup-close-top:hover {
    color: #475569;
}

.text-slate-900 { color: #0f172a; }
.text-slate-800 { color: #1e293b; }
.text-blue-3 { color: #94a3b8; } 

.btn-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
}

.border-radius-md {
    border-radius: 8px;
}

/* Identification Styles */
.popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: linear-gradient(135deg, #1976d2, #2196f3);
    color: white;
    border-radius: 10px 10px 0 0;
}

.popup-title {
    font-size: 14px;
    font-weight: 600;
}

.popup-body {
    padding: 8px;
    overflow-y: auto;
    flex: 1;
    border-radius: 0 0 10px 10px;
}

.result-section {
    margin-bottom: 6px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
}

.result-header {
    background: #f8fafc;
    padding: 8px 12px;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    color: #334155;
}

.attr-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 12px;
    font-size: 11px;
}

.attr-key {
    color: #64748b;
    font-weight: 600;
}

.attr-value {
    color: #1e293b;
    font-weight: 500;
    text-align: right;
}

.attr-row:nth-child(odd) {
    background: #f8fafc;
}

.clickable-img {
    cursor: pointer;
    border-radius: 8px;
    transition: opacity 0.2s;
}

.video-container {
    width: 100%;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    line-height: 0;
}

.rounded-borders {
    border-radius: 8px;
}

.block {
    display: block;
}
</style>