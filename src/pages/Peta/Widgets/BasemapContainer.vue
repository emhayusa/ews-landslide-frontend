<template>
  <q-card :flat="$q.dark.isActive" :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'card-bg-light text-dark'" class="rounded-borders q-mb-none">
      <q-expansion-item
          :dark="$q.dark.isActive"
          expand-separator
          icon="layers"
          :label="$t('map.basemap')"
          default-opened
      >
          <q-card-section class="q-pt-none">
              <q-select 
                  :dark="$q.dark.isActive" dense outlined 
                  v-model="mapStore.basemap" 
                  :options="basemaps"
                  option-value="name"
                  option-label="label"
                  emit-value
                  map-options
                  @update:model-value="handleBasemap"
                  class="q-mt-sm"
                  :class="$q.dark.isActive ? 'chip-bg-dark' : 'chip-bg-light'"
              >
                  <!-- Custom Option Display with Thumbnails -->
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-img :src="scope.opt.thumbnail" width="30px" height="30px" class="rounded-borders" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
              </q-select>
              
              <!-- Opacity Control -->
              <div class="text-caption q-mt-md q-mb-xs">Opacity</div>
              <div class="row q-gutter-x-xs justify-between">
                <q-btn v-for="o in opacities" :key="o.id" size="xs" :label="o.value + '%'"
                  :color="mapStore.opacity === o.value ? 'primary' : 'grey-5'" :flat="mapStore.opacity !== o.value"
                  @click="handleOpacity(o.value)" class="col" style="padding: 2px 4px;" />
              </div>
          </q-card-section>
      </q-expansion-item>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useMapStore } from 'src/stores/map'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

const mapStore = useMapStore()
const $q = useQuasar()
const { t } = useI18n()

const opacities = [
  { id: 1, value: 10 },
  { id: 2, value: 25 },
  { id: 3, value: 50 },
  { id: 4, value: 75 },
  { id: 5, value: 100 },
]

const basemaps = computed(() => [
  { name: 'rbi', label: t('map.basemaps.rbi'), thumbnail: 'thumbs/rbi.png' },
  { name: 'imagery', label: t('map.basemaps.imagery'), thumbnail: 'thumbs/imagery.png' },
  { name: 'osm', label: t('map.basemaps.osm'), thumbnail: 'thumbs/osm.png' },
  { name: 'gray', label: t('map.basemaps.gray'), thumbnail: 'thumbs/gray.png' },
])

function handleBasemap(item) {
  mapStore.applyBasemap(item)
}

function handleOpacity(value) {
  const layers = mapStore.map.getLayers().getArray()
  // Apply opacity to all basemap layers (not operational)
  layers.forEach((layer) => {
    const isOperational = layer.get('type') === 'supermap' || !!layer.get('id')
    if (!isOperational) {
      layer.setOpacity(value / 100)
    }
  })
  mapStore.setOpacity(value)
}
</script>

<style>
.q-img__container {
  border-radius: initial;
}
</style>
