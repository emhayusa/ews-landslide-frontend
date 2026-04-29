<template>
  <q-card
    flat
    bordered
    class="absolute-bottom-right q-ma-md bg-darker-slate"
    style="margin-right: 70px; cursor: pointer"
  >
    <q-img
      :src="thumbnailSrc"
      :alt="mapStore.basemap"
      style="width: 100px; height: 100px; border-radius: 5px; border: 3px #272C39 solid"
    >
      <div class="absolute-bottom text-subtitle2 text-white text-center">Peta Dasar</div>
    </q-img>
  </q-card>
</template>

<script setup>
import { useMapStore } from 'src/stores/map'
import { computed } from 'vue'

const mapStore = useMapStore()

const thumbnailSrc = computed(() => {
  if (mapStore.basemap === 'cleanmap') {
    return 'thumbs/cleanmap.png'
  }
  return `thumbs/${mapStore.basemap}.png`
})
</script>

<style>
.q-img__content > div {
  padding: 8px;
}
</style>
