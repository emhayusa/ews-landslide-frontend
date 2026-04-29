<script setup>
import { useMapStore } from 'src/stores/map'
const mapStore = useMapStore()
</script>

<template>
    <q-card flat class="absolute-bottom-right q-ma-md" style="margin-bottom: 310px;">
        <div class="flex flex-center bg-darker-slate text-white" style="width: 40px; height: 40px; border-radius: 8px;">
            <q-btn round flat icon="explore" :color="mapStore.rotationEnabled ? 'primary' : 'grey-7'"
                @click="mapStore.toggleRotation" />
        </div>
    </q-card>
</template>
