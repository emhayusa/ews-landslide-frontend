<template>
  <div class="full-screen-container">
    <div id="cesiumContainer" ref="cesiumContainer" class="full-height"></div>
    
    <!-- Professional Loading Overlay -->
    <q-inner-loading :showing="loading" dark>
      <q-spinner-gears size="50px" color="blue" />
      <div class="text-subtitle2 q-mt-md">Inisialisasi SuperMap iClient3D...</div>
    </q-inner-loading>

    <!-- SuperMap Layer Control (Mini) -->
    <div class="absolute-bottom-left q-pa-md pointer-events-none" style="z-index: 100;">
        <q-chip dense icon="3d_rotation" color="blue" text-color="white" class="pointer-events-all">
            SuperMap iClient3D (Evaluation Mode)
        </q-chip>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useMapStore } from 'src/stores/map';

const mapStore = useMapStore();
const cesiumContainer = ref(null);
const loading = ref(true);
let viewer = null;

// CDN Paths for SuperMap iClient3D
const CESIUM_CDN = 'https://www.supermapol.com/earth/Build/Cesium';
const CESIUM_JS = `${CESIUM_CDN}/Cesium.js`;
const CESIUM_CSS = `${CESIUM_CDN}/Widgets/widgets.css`;

/**
 * Load script dynamically
 */
const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    if (window.Cesium) return resolve();
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

/**
 * Load CSS dynamically
 */
const loadCSS = (url) => {
  if (document.querySelector(`link[href="${url}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
};

onMounted(async () => {
  try {
    loading.value = true;
    
    // 1. Prepare Environment
    loadCSS(CESIUM_CSS);
    await loadScript(CESIUM_JS);
    
    if (!window.Cesium) throw new Error('Cesium not loaded');
    
    // 2. Initialize Viewer
    // Note: window.Cesium contains SuperMap extensions
    const Cesium = window.Cesium;
    
    viewer = new Cesium.Viewer(cesiumContainer.value, {
      selectionIndicator: false,
      infoBox: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      baseLayerPicker: false,
      timeline: false,
      animation: false,
      fullscreenButton: false,
      imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
      })
    });

    // 3. Set Initial View (Indonesia)
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(118.0, -2.5, 5000000.0),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
        roll: 0.0
      }
    });

    // 4. Add iServer REST Layer (Example: Batas Kecamatan / Operational 0)
    // We attempt to add the first operational layer if it's a SuperMap layer
    const layerUrl = 'https://egov.big.go.id/iserver/services/peta/rest/maps/BatasKecamatan_CleanMap';
    
    try {
        const imageryLayer = viewer.imageryLayers.addImageryProvider(new Cesium.SuperMapImageryProvider({
            url: layerUrl
        }));
        imageryLayer.alpha = 0.8;
    } catch (e) {
        console.warn('Could not add SuperMap layer:', e);
    }

    // 5. Watch for Location Changes
    watch(() => mapStore.userLocation, (newLoc) => {
        if (newLoc && window.Cesium && viewer) {
            viewer.camera.flyTo({
                destination: window.Cesium.Cartesian3.fromDegrees(newLoc.lon, newLoc.lat, 15000.0),
                duration: 2
            });
        }
    });

    // 6. Done
    loading.value = false;
    
  } catch (err) {
    console.error('Failed to initialize SuperMap 3D:', err);
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
});
</script>

<style scoped>
.full-screen-container {
  position: absolute;
  inset: 0;
  background: #000;
  overflow: hidden;
}
.full-height {
  height: 100%;
}
:deep(.cesium-viewer-bottom) {
    display: none; /* Hide credits for cleaner dashboard */
}
</style>
