<template>
    <q-page class="q-pa-none overflow-hidden relative-position map-page">
        <!-- 1. Layer Background (Map) -->
        <MapView v-if="!mapStore.is3D && !mapStore.is3DSuperMap" />
        <MapView3D v-if="mapStore.is3D" :hour="forecastOptions[forecastSlider]" />
        <MapView3DSuperMap v-if="mapStore.is3DSuperMap" />

        <!-- 2. Overlay UI Layer -->
        <div class="absolute-full pointer-events-none ui-layer">
            
            <!-- KIRI ATAS: Search, Peta Dasar, Layer, Legenda -->
            <div class="absolute-top-left q-pa-md pointer-events-none column q-gutter-y-sm items-stretch" style="min-width: 280px; width: fit-content; max-width: 350px; z-index: 500;" v-if="!$q.screen.lt.sm || mapStore.searchVisible">
                <GeocodingSearchContainer class="pointer-events-all" />
                
                <div v-if="!$q.screen.lt.sm" class="column q-gutter-y-sm">
                    <BasemapContainer class="pointer-events-all" />
                    <LayerList class="pointer-events-all" />
                    <LegendaContainer class="pointer-events-all" />
                </div>
            </div>

            <!-- TENGAH ATAS: Parameter Cuaca -->
            <div class="absolute-top bg-transparent pointer-events-none row justify-center q-pt-md" style="z-index: 500;">
                <!-- Desktop: Original Icon Style -->
                <q-card v-if="!$q.screen.lt.sm" :flat="$q.dark.isActive" :class="$q.dark.isActive ? 'card-bg-dark text-grey-5' : 'bg-white shadow-5 text-grey-7'" class="rounded-borders pointer-events-all row items-center q-px-sm" style="height: 48px; border-radius: 24px;">
                    <q-btn flat round dense icon="air" :class="{ 'bg-blue text-white shadow-2': mapStore.weatherType === 'angin' }" class="q-mx-xs" @click="mapStore.weatherType = mapStore.weatherType === 'angin' ? '' : 'angin'">
                        <q-tooltip>Angin</q-tooltip>
                    </q-btn>

                    <q-btn flat round dense icon="shower" :class="{ 'bg-blue text-white shadow-2': mapStore.weatherType === 'hujan' }" class="q-mx-xs" @click="mapStore.weatherType = mapStore.weatherType === 'hujan' ? '' : 'hujan'">
                        <q-tooltip>Hujan</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="opacity" :class="{ 'bg-blue text-white shadow-2': mapStore.weatherType === 'akumulasi' }" class="q-mx-xs" @click="mapStore.weatherType = mapStore.weatherType === 'akumulasi' ? '' : 'akumulasi'">
                        <q-tooltip>Akumulasi 24J</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="thermostat" :class="{ 'bg-blue text-white shadow-2': mapStore.weatherType === 'suhu' }" class="q-mx-xs" @click="mapStore.weatherType = mapStore.weatherType === 'suhu' ? '' : 'suhu'">
                        <q-tooltip>Suhu</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="water_drop" :class="{ 'bg-blue text-white shadow-2': mapStore.weatherType === 'kelembapan' }" class="q-mx-xs" @click="mapStore.weatherType = mapStore.weatherType === 'kelembapan' ? '' : 'kelembapan'">
                        <q-tooltip>Kelembapan</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="cloud" :class="{ 'bg-blue text-white shadow-2': mapStore.weatherType === 'awan' }" class="q-mx-xs" @click="mapStore.weatherType = mapStore.weatherType === 'awan' ? '' : 'awan'">
                        <q-tooltip>Awan</q-tooltip>
                    </q-btn>
                </q-card>

                <!-- Mobile: Icon + Label Style -->
                <q-card 
                    v-else
                    :flat="$q.dark.isActive" 
                    :class="$q.dark.isActive ? 'card-bg-dark text-grey-5' : 'bg-white text-grey-8 shadow-5 text-dark'" 
                    class="pointer-events-all row items-center no-wrap overflow-auto hide-scrollbar" 
                    style="border-radius: 12px; max-width: 95vw;"
                >
                    <div 
                        v-for="param in [
                            { id: 'angin', icon: 'air', label: 'Angin' },
                            { id: 'hujan', icon: 'shower', label: 'Hujan' },
                            { id: 'akumulasi', icon: 'opacity', label: '24j Akumulasi' },
                            { id: 'suhu', icon: 'thermostat', label: 'Suhu' },
                            { id: 'kelembapan', icon: 'water_drop', label: 'Kelembapan' },
                            { id: 'awan', icon: 'cloud', label: 'Awan' }
                        ]" 
                        :key="param.id"
                        class="column items-center q-px-sm q-py-xs cursor-pointer parameter-item"
                        :class="[
                            mapStore.weatherType === param.id ? 'active-param' : '',
                            $q.screen.lt.sm ? 'q-mx-xs' : 'q-mx-sm'
                        ]"
                        style="min-width: 60px;"
                        @click="mapStore.weatherType = mapStore.weatherType === param.id ? '' : param.id"
                    >
                        <div class="icon-box flex flex-center" :class="{ 'active-box': mapStore.weatherType === param.id }">
                            <q-icon :name="param.icon" size="20px" :color="mapStore.weatherType === param.id ? 'primary' : ''" />
                        </div>
                        <div class="text-caption text-center q-mt-xs" style="font-size: 8px; font-weight: 500; line-height: 1;">
                            {{ param.label }}
                        </div>
                    </div>
                </q-card>
            </div>

            <!-- KANAN ATAS: Kontrol Visual & Label -->
            <div 
                class="absolute-top-right q-pa-md pointer-events-none justify-end items-end"
                :class="$q.screen.lt.sm ? 'column q-gutter-y-sm' : 'row q-gutter-x-sm'"
                :style="$q.screen.lt.sm ? 'z-index: 500; margin-top: 80px; margin-right: 0px;' : 'z-index: 500; margin-top: 10px; margin-right: 55px;'"
            >
                <q-card :flat="$q.dark.isActive" :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'bg-white shadow-5 text-dark'" class="rounded-borders pointer-events-all q-px-md q-py-sm row items-center no-wrap" style="border-radius: 20px;">
                  <div class="text-caption text-weight-bold q-mr-md" style="font-size: 11px;">{{ $t('map.visualizeWind') }}</div>
                    <q-toggle v-model="mapStore.windAnimationEnabled" dense color="green" />
                </q-card>

                <q-card :flat="$q.dark.isActive" :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'bg-white shadow-5 text-dark'" class="rounded-borders pointer-events-all q-px-md q-py-sm row items-center no-wrap" style="border-radius: 20px;">
                  <div class="text-caption text-weight-bold q-mr-md" style="font-size: 11px;">{{ $t('map.showLabels') }}</div>
                    <q-toggle v-model="mapStore.mapLabelsEnabled" dense color="green" />
                </q-card>
            </div>

            <div 
                :class="$q.screen.lt.sm ? 'absolute-bottom-right q-pb-xl' : 'absolute-right'" 
                class="q-pa-md pointer-events-none column q-gutter-y-sm items-center" 
                style="z-index: 500; padding-bottom: 120px;"
            >
                <div class="pointer-events-all column q-gutter-y-sm items-center">
                    <ZoomButton />
                    <MapNavigationGroup @toggle-measurement="showMeasurementTools = !showMeasurementTools" />
                    <q-card flat :class="$q.dark.isActive ? 'search-box-dark text-white' : 'bg-white shadow-3 text-dark'" style="border-radius: 12px; width: 44px; height: 44px;" class="flex flex-center overflow-hidden">
                        <q-btn flat dense class="full-width full-height text-weight-bolder"  :label="mapStore.is3D ? '2D' : '3D'" size="13px" @click="mapStore.toggle3D()">
                            <q-tooltip>{{ mapStore.is3D ? 'Tampilan 2D' : 'Tampilan 3D' }}</q-tooltip>
                        </q-btn>
                    </q-card>
                </div>
            </div>

            <!-- Measurement Tools -->
            <ToolsContainer v-if="showMeasurementTools" @close="showMeasurementTools = false" class="pointer-events-all" />

            <!-- Climate Layers -->
            <WindLayer :visible="mapStore.windAnimationEnabled" :hour="forecastOptions[forecastSlider]" />
            <WindTileLayer :visible="mapStore.weatherType === 'angin'" :hour="forecastOptions[forecastSlider]" />
            <RainLayer :visible="mapStore.weatherType === 'hujan'" :hour="forecastOptions[forecastSlider]" />
            <AccumulationLayer :visible="mapStore.weatherType === 'akumulasi'" :hour="forecastOptions[forecastSlider]" />
            <TemperatureLayer :visible="mapStore.weatherType === 'suhu'" :hour="forecastOptions[forecastSlider]" />
            <HumidityLayer :visible="mapStore.weatherType === 'kelembapan'" :hour="forecastOptions[forecastSlider]" />
            <CloudLayer :visible="mapStore.weatherType === 'awan'" :hour="forecastOptions[forecastSlider]" />
            <LabelLayer :visible="mapStore.mapLabelsEnabled" />

            <!-- TENGAH BAWAH: Forecast Control (Slider) -->
            <div class="absolute-bottom bg-transparent pointer-events-none row justify-center q-pb-md" style="z-index: 500;">
                <q-card 
                    :flat="$q.dark.isActive" 
                    :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'bg-white shadow-10 text-dark'" 
                    class="rounded-borders pointer-events-all row items-center q-px-md" 
                    style="height: 60px; border-radius: 30px; width: 500px; max-width: 95vw;"
                >
                    <q-btn flat round dense icon="chevron_left" @click="forecastSlider > 0 ? forecastSlider-- : null" />
                    
                    <div class="col column items-center justify-center q-px-sm">
                        <div :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'" style="font-size: 9px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">{{ $t('map.forecast') }}</div>
                        <div class="text-weight-bold" style="font-size: 14px; margin-top: -2px;">{{ forecastText }}</div>
                        
                        <q-slider
                            v-model="forecastSlider"
                            :min="0"
                            :max="forecastOptions.length - 1"
                            :step="1"
                            :dark="$q.dark.isActive"
                            color="blue-5"
                            dense
                            class="q-mt-xs"
                            style="width: 100%;"
                        />
                    </div>

                    <q-btn flat round dense icon="chevron_right" class="q-mr-xs" @click="forecastSlider < forecastOptions.length - 1 ? forecastSlider++ : null" />
                    <q-btn round dense :icon="isPlaying ? 'pause' : 'play_arrow'" color="primary" size="lg" class="play-btn" @click="togglePlay" />
                </q-card>
            </div>
            
            <!-- KANAN BAWAH: Info UPT & Parameter Value (Desktop Only) -->
            <div v-if="!$q.screen.lt.sm" class="absolute-bottom-right q-pa-md pointer-events-none column q-gutter-y-sm" style="width: 320px; z-index: 500;">
                
                <!-- Info Grid Card -->
                <q-card :flat="$q.dark.isActive" :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'card-bg-light text-dark'" class="rounded-borders q-pa-sm pointer-events-all">
                    <div class="row justify-between items-center q-pb-sm">
                        <span class="text-caption text-weight-bold text-grey-5">{{ $t('map.uptRegion') }}</span>
                        <q-select :dark="$q.dark.isActive" dense options-dense borderless v-model="filterUPT" :options="['DKI JAKARTA']" style="min-width: 120px;" class="text-caption rounded-borders q-px-sm" :class="$q.dark.isActive ? 'chip-bg-dark' : 'chip-bg-light'" />
                    </div>
                    
                    <div class="row q-gutter-x-sm">
                        <div class="col rounded-borders q-pa-sm column flex-center" :class="$q.dark.isActive ? 'chip-bg-dark' : 'chip-bg-light'">
                            <q-icon name="cloudy_snowing" color="light-blue" size="sm" />
                            <div class="text-weight-bold q-mt-xs">0.2mm</div>
                            <div :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-8'" style="font-size: 8px;">Curah Hujan Max</div>
                        </div>
                        <div class="col rounded-borders q-pa-sm column flex-center" :class="$q.dark.isActive ? 'chip-bg-dark' : 'chip-bg-light'">
                            <q-icon name="waves" color="light-blue" size="sm" />
                            <div class="text-weight-bold q-mt-xs">200cm</div>
                            <div :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-8'" style="font-size: 8px;">TMA Max</div>
                        </div>
                        <div class="col rounded-borders q-pa-sm column flex-center" :class="$q.dark.isActive ? 'chip-bg-dark' : 'chip-bg-light'">
                            <q-icon name="air" color="light-blue" size="sm" />
                            <div class="text-weight-bold q-mt-xs">4.66m/s</div>
                            <div :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-8'" style="font-size: 8px;">{{ $t('map.windSpeed') }}</div>
                        </div>
                    </div>
                </q-card>

                <!-- Forecast Model Select -->
                <q-card :flat="$q.dark.isActive" :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'card-bg-light text-dark'" class="rounded-borders q-pa-sm row justify-between items-center pointer-events-all">
                    <span class="text-caption text-weight-bold text-grey-5">{{ $t('map.forecastModel') }}</span>
                    <q-select :dark="$q.dark.isActive" dense options-dense borderless v-model="filterModel" :options="['ECMWF']" style="min-width: 100px;" class="text-caption rounded-borders q-px-sm" :class="$q.dark.isActive ? 'chip-bg-dark' : 'chip-bg-light'" />
                </q-card>

                <!-- Scala Parameter -->
                <q-card :flat="$q.dark.isActive" :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'card-bg-light text-dark'" class="rounded-borders q-pa-sm column pointer-events-all">
                    <span class="text-caption text-weight-bold text-grey-5 q-mb-sm">{{ $t('map.windSpeed').toUpperCase() }}</span>
                    <!-- Scale Gradient bar -->
                    <div class="full-width rounded-borders" style="height: 10px; background: linear-gradient(90deg, #112A46, #1A465B, #1B5D4E, #3D753D, #7E8626, #A8862F, #B15E28, #9B3931);"></div>
                    <div class="row justify-between text-grey-6 q-mt-xs" style="font-size: 9px;">
                        <span>km/j</span>
                        <span>0</span>
                        <span>10</span>
                        <span>20</span>
                        <span>30</span>
                        <span>40</span>
                        <span>50</span>
                        <span>100</span>
                    </div>
                </q-card>

            </div>

            <!-- Peta Overlays Lainya (Scale, Coordinate, etc) -->
            <!-- <ScaleContainer /> -->
            <!-- <CoordinateContainer /> -->

        </div>
    </q-page>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import MapView from './MapView.vue';
import MapView3D from './MapView3D.vue';
import MapView3DSuperMap from './MapView3DSuperMap.vue';

// Widgets
import GeocodingSearchContainer from './Widgets/GeocodingSearchContainer.vue';
import BasemapContainer from './Widgets/BasemapContainer.vue';
import LegendaContainer from './Widgets/LegendaContainer.vue';
import ToolsContainer from './Widgets/ToolsContainer.vue';

// Components
import LayerList from './Components/LayerList.vue';
import ZoomButton from './Components/ZoomButton.vue';
import MapNavigationGroup from './Components/MapNavigationGroup.vue';

// Layers
import WindLayer from './Layers/WindLayer.vue';
import WindTileLayer from './Layers/WindTileLayer.vue';
import RainLayer from './Layers/RainLayer.vue';
import AccumulationLayer from './Layers/AccumulationLayer.vue';
import TemperatureLayer from './Layers/TemperatureLayer.vue';
import HumidityLayer from './Layers/HumidityLayer.vue';
import CloudLayer from './Layers/CloudLayer.vue';
import LabelLayer from './Layers/LabelLayer.vue';
// import MyLocationButton from './Components/MyLocationButton.vue';
// import HomeButton from './Components/HomeButton.vue';
// import FullscreenButton from './Components/FullscreenButton.vue';
// import ScaleContainer from './Widgets/ScaleContainer.vue';
// import CoordinateContainer from './Widgets/CoordinateContainer.vue';

import { useMapStore } from 'src/stores/map'

const $q = useQuasar()
const mapStore = useMapStore()
const filterUPT = ref('DKI JAKARTA')
const filterModel = ref('ECMWF')
const showMeasurementTools = ref(false)

// Forecast Slider Logic - 24 hours format
// Create options from 0 to 24 with 0.5 hour step
const forecastOptions = Array.from({ length: 49 }, (_, i) => i * 0.5)

// Initialize slider position based on current time
// If it's 12:45, index will be 12 * 2 + 1 = 25 (which maps to 12.5 in forecastOptions)
const initialTimeIndex = new Date().getHours() * 2 + (new Date().getMinutes() >= 30 ? 1 : 0)
const forecastSlider = ref(initialTimeIndex)

const forecastText = computed(() => {
    const val = forecastOptions[forecastSlider.value]
    const hours = Math.floor(val)
    const minutes = (val % 1) !== 0 ? 30 : 0
    
    const d = new Date()
    d.setHours(hours, minutes, 0, 0)
    
    const options = { day: 'numeric', month: 'short', year: 'numeric' }
    const dateStr = d.toLocaleDateString('id-ID', options)
    
    const hh = hours.toString().padStart(2, '0')
    const mm = minutes.toString().padStart(2, '0')
    
    return `${dateStr} - ${hh}:${mm} WIB`
})

const isPlaying = ref(false)
let playInterval = null

function togglePlay() {
    isPlaying.value = !isPlaying.value
    if (isPlaying.value) {
        // Use window.setInterval to ensure global scope execution
        playInterval = window.setInterval(() => {
            if (forecastSlider.value >= forecastOptions.length - 1) {
                forecastSlider.value = 0 // loop back to start
            } else {
                forecastSlider.value++
            }
        }, 2000) // 2 seconds per frame
    } else {
        if (playInterval) {
            window.clearInterval(playInterval)
            playInterval = null
        }
    }
}

onUnmounted(() => {
    if (playInterval) window.clearInterval(playInterval)
})

</script>

<style>
.map-page {
    /* Ensures nothing overflows */
    width: 100%;
}
.ui-layer {
    /* Overlay on top of the MapView */
    z-index: 10;
}
.ol-popup {
    z-index: 2000;
}
.circle-legend {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}
.box-legend {
    width: 14px;
    height: 10px;
    border-radius: 2px;
}
.parameter-item {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}
.icon-box {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid transparent;
    transition: all 0.3s;
}
.active-box {
    border: 2px solid #1976D2;
    background: rgba(25, 118, 210, 0.08);
}
.active-param .text-caption {
    color: #1976D2;
    font-weight: 800 !important;
}
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}
.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.play-btn {
    box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
}
</style>
