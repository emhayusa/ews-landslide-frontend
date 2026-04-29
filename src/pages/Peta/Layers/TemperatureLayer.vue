<script setup>
import { watch, onMounted, onUnmounted, shallowRef } from 'vue'
import { useMapStore } from 'src/stores/map'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'

const props = defineProps({
  visible: Boolean,
  hour: Number
})

const mapStore = useMapStore()
const layerRef = shallowRef(null)

function initLayer() {
  if (!mapStore.map) return

  layerRef.value = new TileLayer({
    source: new XYZ({
      url: "https://signature.bmkg.go.id/api21/mpl_req/ecmwf/temp/1000/2026041012/2026041100/{z}/{x}/{-y}.png?ci=1&overlays=contourf",
      attributions: 'BMKG ECMWF Temperature © BMKG',
      crossOrigin: "Anonymous"
    }),
    visible: props.visible,
    opacity: 0.5,
    zIndex: 13
  })
  layerRef.value.set('weatherLayer', true)

  mapStore.map.addLayer(layerRef.value)
}

watch(() => props.visible, (newVal) => {
  if (layerRef.value) {
    layerRef.value.setVisible(newVal)
  }
})

onMounted(() => {
  if (mapStore.map) {
    initLayer()
  } else {
    watch(() => mapStore.map, (newMap) => {
      if (newMap && !layerRef.value) initLayer()
    })
  }
})

onUnmounted(() => {
  if (mapStore.map && layerRef.value) {
    mapStore.map.removeLayer(layerRef.value)
  }
})
</script>

<template>
  <div class="temperature-layer-container" style="display: none;"></div>
</template>
