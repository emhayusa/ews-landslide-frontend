<script setup>
import { watch, onMounted, onUnmounted, shallowRef } from 'vue'
import { useMapStore } from 'src/stores/map'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'

const props = defineProps({
  visible: Boolean
})

const mapStore = useMapStore()
const layerRef = shallowRef(null)

function initLayer() {
  if (!mapStore.map) return

  layerRef.value = new TileLayer({
    source: new XYZ({
      url: "https://cartodb-basemaps-c.global.ssl.fastly.net/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
      attributions: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
      crossOrigin: "Anonymous"
    }),
    visible: props.visible,
    zIndex: 100 // Ensure labels are above everything else
  })

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
  <div class="label-layer-container" style="display: none;"></div>
</template>
