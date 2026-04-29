<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useMapStore } from 'src/stores/map'
import { getPointResolution } from 'ol/proj'
import { useQuasar } from 'quasar'

const mapStore = useMapStore()
const $q = useQuasar()
const scale = ref(null)

let listenerKey = null

function updateScale() {
    if (!mapStore.map) return

    const view = mapStore.map.getView()
    const resolution = view.getResolution()
    const center = view.getCenter()

    if (!resolution || !center) return

    // meters per pixel at current latitude
    const metersPerPixel = getPointResolution(
        view.getProjection(),
        resolution,
        center
    )

    // 96 DPI is standard for web maps
    const dpi = 96
    const inchesPerMeter = 39.37

    scale.value = metersPerPixel * dpi * inchesPerMeter
}

onMounted(() => {
    if (!mapStore.map) return

    updateScale()

    listenerKey = mapStore.map.getView().on('change:resolution', updateScale)
})

onBeforeUnmount(() => {
    if (listenerKey) {
        mapStore.map.getView().un(listenerKey.type, updateScale)
    }
})
</script>

<template>
    <q-card :flat="$q.dark.isActive" :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'card-bg-light text-dark'" class="absolute-bottom-left q-ma-md rounded-borders" style="z-index: 10;">
        <div class="row items-center justify-evenly q-px-sm" style="width: 200px; height: 30px; font-size: 11px;">
            <span v-if="scale">
                1 : {{ scale >= 1000 ? (scale / 1000).toFixed(0) + ' K' : scale.toFixed(0) }}
            </span>
            <img src="scale_bar.png" alt="Scale bar" height="10" />
        </div>
    </q-card>
</template>
