<script setup>
import { useMapStore } from 'src/stores/map'
import { useQuasar } from 'quasar'

const mapStore = useMapStore()
const $q = useQuasar()

const zoomIn = () => mapStore.zoomIn()
const zoomOut = () => mapStore.zoomOut()
</script>

<template>
    <q-card flat :class="$q.dark.isActive ? 'search-box-dark text-white' : 'card-bg-light text-dark'" style="border-radius: 20px; width: 44px;" class="column items-center overflow-hidden">
        <q-btn flat dense icon="add" size="13px" class="q-py-sm full-width" @click="zoomIn" />
        <q-separator :dark="$q.dark.isActive" style="width: 70%; opacity: 0.2;" />
        <q-btn flat dense icon="remove" size="13px" class="q-py-sm full-width" @click="zoomOut" />
    </q-card>
</template>
