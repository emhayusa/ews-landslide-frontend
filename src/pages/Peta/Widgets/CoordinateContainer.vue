<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useMapStore } from 'src/stores/map'
import { toLonLat } from 'ol/proj'
import { useQuasar } from 'quasar'

const mapStore = useMapStore()
const $q = useQuasar()

const lat = ref(null)
const lon = ref(null)

let pointerMoveHandler = null

function formatCoord(value) {
    return value.toFixed(6)
}

onMounted(() => {
    if (!mapStore.map) return

    pointerMoveHandler = (evt) => {
        if (!evt.coordinate) return

        const [longitude, latitude] = toLonLat(evt.coordinate)

        lat.value = latitude
        lon.value = longitude
    }

    mapStore.map.on('pointermove', pointerMoveHandler)
})

onBeforeUnmount(() => {
    if (mapStore.map && pointerMoveHandler) {
        mapStore.map.un('pointermove', pointerMoveHandler)
    }
})
</script>

<template>
    <q-card :flat="$q.dark.isActive" :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'card-bg-light text-dark'" class="absolute-bottom q-ma-md rounded-borders" style="left: 50%; transform: translateX(-50%); z-index: 10;">
        <div class="row items-center justify-evenly q-px-sm" style="height: 30px; font-size: 11px;">
            <span v-if="lat !== null" class="q-mr-md">
                Lat {{ formatCoord(Math.abs(lat)) }}° {{ lat < 0 ? 'S' : 'N' }} 
            </span>

            <span v-if="lon !== null">
                Lon {{ formatCoord(Math.abs(lon)) }}° {{ lon < 0 ? 'W' : 'E' }} 
            </span>
        </div>
    </q-card>
</template>
