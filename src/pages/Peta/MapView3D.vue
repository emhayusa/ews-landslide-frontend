<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import Globe from 'globe.gl'
import { useMapStore } from 'src/stores/map'
import { ClimateDataService } from 'src/services/ClimateDataService'
import { useQuasar } from 'quasar'

const props = defineProps({
    hour: {
        type: Number,
        default: 0
    }
})

const mapStore = useMapStore()
const $q = useQuasar()
const globeContainer = ref(null)
let myGlobe = null
let animationFrameId = null

// --- WIND STREAMS (PATHS) STATE ---
const windPaths = ref([])
const activeWindData = ref(null)
const PATH_COUNT = 3000 // Standard for Windy-like density
const PATH_LENGTH = 3 // Number of segments per path
const PARTICLE_SPEED = 0.6

// --- WEATHER TILE MAPPING ---
// Signature BMKG patterns for different parameters
const weatherTilePatterns = {
    'angin': 'ecmwf/wind/1000/2026041012/2026041100/{z}/{x}/{-y}.png?ci=1&overlays=contourf',
    'hujan': 'ecmwf/rr/1000/2026041012/2026041100/{z}/{x}/{-y}.png?ci=1&overlays=contourf',
    'akumulasi': 'ecmwf/rain/total/2026041012/2026041100/{z}/{x}/{-y}.png?ci=1&overlays=contourf',
    'suhu': 'ecmwf/temp/2m/2026041012/2026041100/{z}/{x}/{-y}.png?ci=1&overlays=contourf',
    'kelembapan': 'ecmwf/rh/2m/2026041012/2026041100/{z}/{x}/{-y}.png?ci=1&overlays=contourf',
    'awan': 'ecmwf/tcc/tc/2026041012/2026041100/{z}/{x}/{-y}.png?ci=1&overlays=contourf'
}

// --- BASMAP MAPPING ---
const basemapUrls = {
    'imagery': (x, y, l) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${l}/${y}/${x}`,
    'osm': (x, y, l) => `https://tile.openstreetmap.org/${l}/${x}/${y}.png`,
    'gray': (x, y, l) => `https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/${l}/${y}/${x}`,
    'rbi': (x, y, l) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${l}/${y}/${x}`, 
}

const loading = ref(true)

async function loadWindData() {
    if (!mapStore.windAnimationEnabled) {
        windPaths.value = []
        if (myGlobe) myGlobe.pathsData([])
        return
    }

    try {
        const manifest = await ClimateDataService.getManifest()
        const latestTs = Object.keys(manifest['wind-speed']['10m'])[0]
        const grid = await ClimateDataService.getWindGrid(latestTs, props.hour)
        
        if (grid && grid.data) {
            const gridMap = new Map()
            grid.data.forEach(d => {
                gridMap.set(`${Math.round(d.lon)}_${Math.round(d.lat)}`, {u: d.u, v: d.v})
            })
            activeWindData.value = gridMap

            // Initialize paths if empty (Streaming style)
            if (windPaths.value.length === 0) {
                const paths = []
                for (let i = 0; i < PATH_COUNT; i++) {
                    const startLat = -15 + Math.random() * 30
                    const startLng = 90 + Math.random() * 55
                    
                    // Create segments
                    const coords = []
                    for(let j=0; j < PATH_LENGTH; j++) {
                        coords.push([startLat, startLng])
                    }

                    paths.push({
                        coords: coords,
                        age: Math.random() * 100
                    })
                }
                windPaths.value = paths
            }
        }
    } catch (err) {
        console.error('[3D Wind] Failed to load data:', err)
    }
}

function animateWind() {
    if (!myGlobe || !mapStore.windAnimationEnabled || !activeWindData.value) {
        animationFrameId = requestAnimationFrame(animateWind)
        return
    }

    const grid = activeWindData.value
    const paths = windPaths.value

    paths.forEach(p => {
        const head = p.coords[p.coords.length - 1]
        
        // Simple lookup from grid
        const lonIdx = Math.round(head[1])
        const latIdx = Math.round(head[0])
        const vector = grid.get(`${lonIdx}_${latIdx}`) || { u: 0, v: 0 }

        // Shift coordinates (move path forward)
        const nextLat = head[0] + vector.v * 0.02 * PARTICLE_SPEED
        const nextLng = head[1] + vector.u * 0.02 * PARTICLE_SPEED
        
        p.coords.shift()
        p.coords.push([nextLat, nextLng])
        p.age++

        // Reset if out of bounds or too old
        if (p.age > 80 || nextLat < -20 || nextLat > 25 || nextLng < 85 || nextLng > 155) {
            const nl = -15 + Math.random() * 30
            const ng = 90 + Math.random() * 55
            p.coords = Array(PATH_LENGTH).fill(0).map(() => [nl, ng])
            p.age = 0
        }
    })

    // Update Globe
    myGlobe.pathsData([...paths])
    animationFrameId = requestAnimationFrame(animateWind)
}

onMounted(async () => {
    if (!globeContainer.value) return

    myGlobe = Globe()(globeContainer.value)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .atmosphereColor('#3a228a')
        .atmosphereAltitude(0.15)
        .showGraticules(true)
        // Path settings
        .pathPoints('coords')
        .pathPointLat(d => d[0])
        .pathPointLng(d => d[1])
        .pathColor(() => $q.dark.isActive ? 'rgba(255, 255, 255, 0.6)' : 'rgba(25, 118, 210, 0.6)')
        .pathStroke(0.6)
        .pathDashLength(1)
        .pathDashGap(0)
        .pathTransitionDuration(0)
        .width(globeContainer.value.offsetWidth)
        .height(globeContainer.value.offsetHeight)
        .onZoom(() => {
            const pov = myGlobe.pointOfView()
            if (mapStore.is3D) {
                mapStore.globeAltitude = pov.altitude
            }
        })

    updateBasemap(mapStore.basemap);

    myGlobe.pointOfView({ lat: -2.5, lng: 118, altitude: 5 }, 0);
    setTimeout(() => {
        myGlobe.pointOfView({ lat: -2.5, lng: 118, altitude: 2 }, 3000);
        setTimeout(() => {
            loading.value = false
        }, 500);
    }, 500);

    const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (myGlobe) myGlobe.width(width).height(height);
        }
    });
    resizeObserver.observe(globeContainer.value);
    
    await loadWindData()
    animateWind()

    onUnmounted(() => {
        resizeObserver.disconnect()
        if (animationFrameId) cancelAnimationFrame(animationFrameId)
    });
});

function updateBasemap(name) {
    if (!myGlobe) return;
    
    // logic: If a weather parameter is active, use its tile layer as the globe engine
    // but try to layer it? globe.gl natively can't easily layer.
    // Compromise: If weatherType is active, show the weather tiles.
    const weatherType = mapStore.weatherType
    if (weatherType && weatherTilePatterns[weatherType]) {
        const url = `https://signature.bmkg.go.id/api21/mpl_req/${weatherTilePatterns[weatherType]}`
        myGlobe.globeTileEngineUrl((x, y, z) => {
            // BMKG usually uses {-y} but globe.gl standard engine might need adjustment
            // for simplicity we use the base pattern
            return url.replace('{z}', z).replace('{x}', x).replace('{-y}', Math.pow(2, z) - 1 - y)
        })
        myGlobe.globeImageUrl(null)
    } else {
        const urlProvider = basemapUrls[name]
        if (urlProvider) {
            myGlobe.globeTileEngineUrl(urlProvider)
            myGlobe.globeImageUrl(null)
        } else {
            myGlobe.globeTileEngineUrl(null)
            myGlobe.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        }
    }
}

// Watchers
watch(() => mapStore.basemap, (newBasemap) => {
    updateBasemap(newBasemap);
});

watch(() => mapStore.weatherType, () => {
    updateBasemap(mapStore.basemap);
});

watch(() => props.hour, () => {
    loadWindData();
    updateBasemap(mapStore.basemap); // Refresh tiles for timestamp sync
});

watch(() => mapStore.windAnimationEnabled, (enabled) => {
    if (enabled) {
        loadWindData();
    } else {
        if (myGlobe) myGlobe.pathsData([]);
        windPaths.value = [];
    }
});

// --- ZOOM SYNC ---
watch(() => mapStore.globeAltitude, (newAlt) => {
    if (!myGlobe) return
    const currentPov = myGlobe.pointOfView()
    // Only update if difference is significant to avoid infinite loops from onZoom
    if (Math.abs(currentPov.altitude - newAlt) > 0.01) {
        myGlobe.pointOfView({ altitude: newAlt }, 400)
    }
})

watch(() => mapStore.userLocation, (loc) => {
    if (loc && myGlobe) {
        myGlobe.pointOfView({ lat: loc.lat, lng: loc.lon, altitude: mapStore.globeAltitude }, 2000);
    }
});

</script>

<template>
    <div ref="globeContainer" class="globe-container">
        <q-inner-loading :showing="loading" transition-show="fade" transition-hide="fade" class="bg-dark">
            <q-spinner-gears size="100px" color="primary" />
            <div class="text-primary q-mt-md" style="font-weight: 500; letter-spacing: 2px;">MEMUAT 3D GLOBE...</div>
        </q-inner-loading>
    </div>
</template>

<style scoped>
.globe-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: radial-gradient(circle at center, #0a0a1a 0%, #000000 100%);
}
</style>
