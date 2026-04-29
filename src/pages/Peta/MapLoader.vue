<script setup>
import { useMapStore } from 'src/stores/map'

const mapStore = useMapStore()
</script>

<template>
    <transition name="fade">
        <div v-if="mapStore.isLoading" class="map-loader">
            <q-spinner color="primary" size="40px" />
            <div class="text-caption q-mt-xs">Memuat peta…</div>
        </div>
    </transition>
</template>

<style scoped>
.map-loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 200;
    background: rgba(255, 255, 255, 0.85);
    padding: 12px 16px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>