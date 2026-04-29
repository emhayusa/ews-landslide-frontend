<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useMapStore } from 'src/stores/map'
import { useQuasar } from 'quasar'
import { Feature } from 'ol'
import Point from 'ol/geom/Point'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import { fromLonLat } from 'ol/proj'

const mapStore = useMapStore()
const $q = useQuasar()

defineEmits(['toggle-measurement'])


// --- My Location Logic ---
const GPS_LAYER_ID = 'gps_layer'
const loading = ref(false)

const navigate = () => {
    if (!mapStore.map && !mapStore.is3D) return
    if (!('geolocation' in navigator)) {
        $q.notify({
            type: 'negative',
            message: 'Geolokasi tidak didukung oleh browser ini',
            position: 'top'
        })
        return
    }

    loading.value = true
    navigator.geolocation.getCurrentPosition(
        (position) => {
            try {
                const { latitude, longitude } = position.coords
                const coords = fromLonLat([longitude, latitude])
                
                // Handle 2D Marker
                if (mapStore.map) {
                    const map = mapStore.map
                    const point = new Feature({ geometry: new Point(coords) })
                    point.setStyle(new Style({
                        image: new Icon({
                            src: 'https://openlayers.org/en/latest/examples/data/dot.png',
                            color: '#00B4FF',
                            crossOrigin: 'anonymous',
                            scale: 1.2,
                        }),
                    }))

                    let gpsLayer = map.getLayers().getArray().find((l) => l.get('id') === GPS_LAYER_ID)
                    if (!gpsLayer) {
                        gpsLayer = new VectorLayer({ 
                            source: new VectorSource(),
                            zIndex: 9999 // Ensure it's on top
                        })
                        gpsLayer.set('id', GPS_LAYER_ID)
                        map.addLayer(gpsLayer)
                    }
                    gpsLayer.getSource().clear()
                    gpsLayer.getSource().addFeature(point)
                }

                // Sync with Global Store for 2D/3D centering
                mapStore.centerMap(longitude, latitude, 17)
                
                $q.notify({
                    type: 'positive',
                    message: 'Lokasi ditemukan',
                    position: 'top',
                    timeout: 1000
                })
            } finally {
                loading.value = false
            }
        },
        (error) => {
            loading.value = false
            let msg = 'Gagal mendapatkan lokasi'
            if (error.code === 1) msg = 'Izin lokasi ditolak'
            else if (error.code === 3) msg = 'Waktu permintaan habis'
            
            $q.notify({
                type: 'negative',
                message: msg,
                position: 'top'
            })
            console.error(error)
        },
        { enableHighAccuracy: true, timeout: 10000 }
    )
}
// --- Home Logic ---
const homeExtent = () => mapStore.homeExtent()

// --- Fullscreen Logic ---
const isFullscreen = ref(false)
const fullScreen = () => {
    const el = document.documentElement
    if (!document.fullscreenElement) {
        el.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
}
const onFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange)
})
onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange)
})
</script>

<template>
    <q-card flat :class="$q.dark.isActive ? 'search-box-dark text-white' : 'card-bg-light text-dark'" style="border-radius: 20px; width: 44px;" class="column items-center overflow-hidden">
        <q-btn flat dense icon="gps_fixed" size="13px" class="q-py-sm full-width" @click="navigate" :loading="loading" />
        <q-separator :dark="$q.dark.isActive" style="width: 70%; opacity: 0.2;" />
        <q-btn flat dense icon="home" size="13px" class="q-py-sm full-width" @click="homeExtent" />
        <q-separator v-if="!$q.screen.lt.sm" :dark="$q.dark.isActive" style="width: 70%; opacity: 0.2;" />
        <q-btn v-if="!$q.screen.lt.sm" flat dense icon="square_foot" size="13px" class="q-py-sm full-width" :class="mapStore.measureType ? 'text-blue' : ''" @click="$emit('toggle-measurement')">
            <q-tooltip>Measurement</q-tooltip>
        </q-btn>
        <q-separator v-if="!$q.screen.lt.sm" :dark="$q.dark.isActive" style="width: 70%; opacity: 0.2;" />
        <q-btn v-if="!$q.screen.lt.sm" flat dense :icon="isFullscreen ? 'close_fullscreen' : 'fullscreen'" size="13px" class="q-py-sm full-width" @click="fullScreen" />
    </q-card>
</template>
