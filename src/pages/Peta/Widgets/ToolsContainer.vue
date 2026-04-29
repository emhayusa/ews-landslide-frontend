<template>
  <div class="tools-container shadow-10" :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'card-bg-light text-dark'">
    <!-- Header -->
    <div class="tools-header" :style="$q.dark.isActive ? 'border-bottom: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.03);' : 'border-bottom: 1px solid rgba(0, 0, 0, 0.05); background: rgba(0, 0, 0, 0.02);'">
      <h3 :class="$q.dark.isActive ? 'text-white' : 'text-grey-9'">Measurement</h3>
      <button class="close-btn" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'" @click="$emit('close')">×</button>
    </div>

    <!-- Usage Note -->
    <div class="usage-note" :class="$q.dark.isActive ? 'chip-bg-dark' : 'chip-bg-light'" :style="$q.dark.isActive ? 'border: 1px solid rgba(25, 118, 210, 0.2);' : 'border: 1px solid rgba(25, 118, 210, 0.1);'">
      <div class="note-icon">ℹ️</div>
      <div class="note-text" :class="$q.dark.isActive ? 'text-blue-2' : 'text-blue-8'">
        <strong :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Cara Penggunaan:</strong>
        <ol>
          <li>Pilih Distance atau Area</li>
          <li>Klik pada peta untuk mulai menggambar</li>
          <li>Klik lagi untuk menambah titik</li>
          <li>Double-klik untuk selesai</li>
        </ol>
      </div>
    </div>

    <!-- Measurement Tools -->
    <div class="tools-body">
      <button
        @click="activateMeasure('distance')"
        :class="{ 
          active: mapStore.measureType === 'distance',
          'chip-bg-dark text-white': $q.dark.isActive && mapStore.measureType !== 'distance',
          'chip-bg-light text-dark': !$q.dark.isActive && mapStore.measureType !== 'distance'
        }"
        class="tool-button"
      >
        <q-icon name="straighten" size="xs" class="icon" />
        <span>Distance</span>
      </button>

      <button
        @click="activateMeasure('area')"
        :class="{ 
          active: mapStore.measureType === 'area',
          'chip-bg-dark text-white': $q.dark.isActive && mapStore.measureType !== 'area',
          'chip-bg-light text-dark': !$q.dark.isActive && mapStore.measureType !== 'area'
        }"
        class="tool-button"
      >
        <q-icon name="square_foot" size="xs" class="icon" />
        <span>Area</span>
      </button>

      <div class="divider" :style="$q.dark.isActive ? 'background: rgba(255, 255, 255, 0.05);' : 'background: rgba(0, 0, 0, 0.05);'"></div>

      <button
        @click="clearMeasure"
        :disabled="mapStore.measureFeatures.length === 0"
        :class="{ 
          'bg-red-1 text-red-9': !$q.dark.isActive && mapStore.measureFeatures.length > 0,
          'bg-red-10 text-white': $q.dark.isActive && mapStore.measureFeatures.length > 0
        }"
        class="tool-button clear-button"
      >
        <q-icon name="delete_outline" size="xs" class="icon" />
        <span>Clear All</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useMapStore } from 'src/stores/map'

defineEmits(['close'])
defineProps({
  showClose: {
    type: Boolean,
    default: true,
  },
})

const $q = useQuasar()
const mapStore = useMapStore()

const activateMeasure = (type) => {
  console.log('[ToolsContainer] Activating measure:', type)
  console.log('[ToolsContainer] Current type:', mapStore.measureType)

  if (mapStore.measureType === type) {
    // If same type clicked, toggle off
    console.log('[ToolsContainer] Same type - toggling off')
    mapStore.disableMeasurement()
  } else {
    // Activate new measurement
    console.log('[ToolsContainer] Activating new measurement')
    mapStore.enableMeasurement(type)
  }
}

const clearMeasure = () => {
  console.log('[ToolsContainer] Clearing all measurements')
  // Disable active measurement first
  mapStore.disableMeasurement()
  // Then clear all measurements
  mapStore.clearMeasurements()
}
</script>

<style scoped>
.tools-container {
  position: absolute;
  top: 16px;
  right: 70px;
  width: 280px;
  z-index: 1000;
  overflow: hidden;
}

.tools-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px;
}

.tools-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(244, 67, 54, 0.2);
  color: #ff8a80;
}

.usage-note {
  border-radius: 8px;
  padding: 12px;
  margin: 12px;
  display: flex;
  gap: 10px;
  font-size: 12px;
  line-height: 1.6;
}

.note-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.note-text {
  flex: 1;
}

.note-text strong {
  display: block;
  margin-bottom: 6px;
  font-weight: 700;
}

.note-text ol {
  margin: 0;
  padding-left: 18px;
}

.note-text li {
  margin-bottom: 4px;
}

.tools-body {
  padding: 0 12px 12px 12px;
}

.tool-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  gap: 12px;
  border: 1px solid transparent;
}

.tool-button:last-child {
  margin-bottom: 0;
}

.tool-button:hover:not(:disabled) {
  opacity: 0.9;
}

.tool-button.active {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
  box-shadow: 0 0 15px rgba(25, 118, 210, 0.4);
}

.divider {
  height: 1px;
  margin: 8px 0 12px 0;
}

.tool-button.clear-button:hover:not(:disabled) {
  opacity: 0.8;
}

.tool-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .tools-container {
    right: 16px;
    width: calc(100% - 32px);
    max-width: 280px;
    bottom: 80px;
  }
}
</style>
