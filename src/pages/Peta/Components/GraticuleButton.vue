<script setup>
import { useMapStore } from 'src/stores/map'

const mapStore = useMapStore()

const toggle = () => {
    mapStore.toggleGraticule()
}
</script>
<template>
    <q-card flat class="absolute-bottom-right q-ma-md" style="margin-bottom: 260px; z-index: 10;">
        <div class="flex flex-center bg-darker-slate text-white" style="width: 40px; height: 40px; border-radius: 8px;">
            <q-btn round flat :color="mapStore.graticuleVisible ? 'primary' : 'grey-7'" icon="apps"
                aria-label="Toggle Graticule" @click="toggle" />
        </div>
    </q-card>
</template>
