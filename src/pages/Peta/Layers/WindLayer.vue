<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useMapStore } from 'src/stores/map'
import { ClimateDataService } from 'src/services/ClimateDataService'
import { fromLonLat } from 'ol/proj'
import { useQuasar } from 'quasar'

const props = defineProps({
  visible: Boolean,
  hour: {
    type: Number,
    default: 0
  }
})

const mapStore = useMapStore()
const $q = useQuasar()
const canvasRef = ref(null)
const particles = ref([])
const windGridAccessor = ref(null)
const animationId = ref(null)
const isMapMoving = ref(false)

// Particle settings
const PARTICLE_COUNT = 5000
const MAX_AGE = 120 // Increased so slow particles can draw longer trails
const PARTICLE_SPEED = 0.1 // Lower number = slower, more natural animation speed
const TRAIL_ALPHA = 0.8 // Higher = longer trails

class Particle {
  constructor() {
    this.reset()
  }

  reset() {
    this.lon = 90 + Math.random() * 55 // Indonesia bounds approx
    this.lat = -15 + Math.random() * 30
    this.age = Math.floor(Math.random() * MAX_AGE)
    this.px = null
    this.py = null
    this.oldPx = null
    this.oldPy = null
    this.isReset = true
  }

  update(gridAccessor, map) {
    if (!gridAccessor) return

    // Bilinear Interpolation for smooth motion
    const spacing = 2
    const minLon = 90
    const minLat = -15
    
    // Find index in grid
    const fx = (this.lon - minLon) / spacing
    const fy = (this.lat - minLat) / spacing
    const ix = Math.floor(fx)
    const iy = Math.floor(fy)
    
    // Weightings
    const tx = fx - ix
    const ty = fy - iy
    
    const v00 = gridAccessor(ix, iy)
    const v10 = gridAccessor(ix + 1, iy)
    const v01 = gridAccessor(ix, iy + 1)
    const v11 = gridAccessor(ix + 1, iy + 1)

    // Interpolate U and V
    const u = (1 - tx) * (1 - ty) * v00.u + tx * (1 - ty) * v10.u + (1 - tx) * ty * v01.u + tx * ty * v11.u
    const v = (1 - tx) * (1 - ty) * v00.v + tx * (1 - ty) * v10.v + (1 - tx) * ty * v01.v + tx * ty * v11.v

    this.lon += u * 0.01 * PARTICLE_SPEED
    this.lat += v * 0.01 * PARTICLE_SPEED

    this.age++
    if (this.age > MAX_AGE || this.lon < 90 || this.lon > 145 || this.lat < -15 || this.lat > 15) {
      this.reset()
      return
    }

    // Convert to pixel coordinates
    const coords = fromLonLat([this.lon, this.lat])
    const pixel = map.getPixelFromCoordinate(coords)
    if (pixel) {
      if (this.isReset) {
        this.px = pixel[0]
        this.py = pixel[1]
        this.isReset = false
      } else {
        this.oldPx = this.px
        this.oldPy = this.py
        this.px = pixel[0]
        this.py = pixel[1]
      }
    } else {
      this.oldPx = null
      this.oldPy = null
    }
  }
}

async function initData() {
  try {
    const manifest = await ClimateDataService.getManifest()
    const latestTs = Object.keys(manifest['wind-speed']['10m'])[0]
    const grid = await ClimateDataService.getWindGrid(latestTs, props.hour)
    
    if (!grid || !grid.data) {
      console.warn("Failed to load wind grid from backend.")
      return
    }
    
    // Transform grid data into an O(1) lookup function using Map
    const gridMap = new Map()
    grid.data.forEach(d => {
       gridMap.set(`${Math.round(d.lon)}_${Math.round(d.lat)}`, {u: d.u, v: d.v})
    })
    
    windGridAccessor.value = (ix, iy) => {
      const lon = 90 + ix * 2;
      const lat = -15 + iy * 2;
      return gridMap.get(`${lon}_${lat}`) || { u: 0, v: 0 }
    }
  } catch (err) {
    console.error("InitData failed:", err)
  }
}

function animate() {
  if (!props.visible || !mapStore.map || !canvasRef.value || mapStore.is3D) {
    if (mapStore.is3D && canvasRef.value) {
       const ctx = canvasRef.value.getContext('2d')
       ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
    return
  }

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const map = mapStore.map
  const view = map.getView()
  
  // Deteksi animasi rotasi, geser pan, atau zoom yang berlangsung secara terus menerus 
  const isInteracting = view.getAnimating() || view.getInteracting()
  
  // Jika resolusi berubah (zoom), kita harus mereset memori partikel secara menyeluruh
  // agar tidak ada tarikan garis paksa ke piksel lama (starburst artifact)
  if (window._lastMapResolution && window._lastMapResolution !== view.getResolution()) {
       particles.value.forEach(p => p.reset())
  }
  window._lastMapResolution = view.getResolution()
  
  if (isMapMoving.value || isInteracting) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    animationId.value = requestAnimationFrame(animate)
    return
  }
  
  // Clear with trail effect
  ctx.globalCompositeOperation = 'destination-in'
  ctx.fillStyle = `rgba(0, 0, 0, ${TRAIL_ALPHA})`
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'source-over'

  // Update and Draw particles
  ctx.strokeStyle = $q.dark.isActive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(25, 118, 210, 0.8)'
  ctx.lineWidth = 1
  ctx.beginPath()

  particles.value.forEach(p => {
    p.update(windGridAccessor.value, map)
    
    // Draw line from old to new, but only if it didn't just reset
    if (p.oldPx !== null && p.oldPy !== null && p.px !== null && p.py !== null && !p.isReset) {
      const dx = p.px - p.oldPx;
      const dy = p.py - p.oldPy;
      
      // Distance clipping: prevent drawing lines across the screen when teleporting > 50px
      if (dx * dx + dy * dy < 2500) {
        ctx.moveTo(p.oldPx, p.oldPy)
        ctx.lineTo(p.px, p.py)
      }
    }
  })
  
  ctx.stroke()
  animationId.value = requestAnimationFrame(animate)
}

function resizeCanvas() {
  if (!canvasRef.value || !mapStore.map) return
  const size = mapStore.map.getSize()
  canvasRef.value.width = size[0]
  canvasRef.value.height = size[1]
}

function handleMoveStart() {
  isMapMoving.value = true
}

function handleMoveEnd() {
  resizeCanvas()
  isMapMoving.value = false
  // Reset all particles completely to clear their old screen constraints and memory
  particles.value.forEach(p => p.reset())
}

onMounted(async () => {
  await initData()
  
  // Initialize particles
  const pArray = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pArray.push(new Particle())
  }
  particles.value = pArray

  if (mapStore.map) {
    resizeCanvas()
    mapStore.map.on('change:size', resizeCanvas)
    mapStore.map.on('movestart', handleMoveStart)
    mapStore.map.on('moveend', handleMoveEnd)
  }

  if (props.visible) animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId.value)
  if (mapStore.map) {
    mapStore.map.un('change:size', resizeCanvas)
    mapStore.map.un('movestart', handleMoveStart)
    mapStore.map.un('moveend', handleMoveEnd)
  }
})

watch(() => props.visible, async (newVal) => {
  if (newVal) {
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
    await initData()
    animate()
  } else {
    cancelAnimationFrame(animationId.value)
  }
})

watch(() => props.hour, async (newHour) => {
  if (!props.visible) return
  
  // Fetch new grid when hour changes
  const manifest = await ClimateDataService.getManifest()
  const latestTs = Object.keys(manifest['wind-speed']['10m'])[0]
  const grid = await ClimateDataService.getWindGrid(latestTs, newHour)
  
  if (!grid || !grid.data) {
      console.warn("Wind grid empty or fetch failed for hour", newHour)
      return
  }
  
  const gridMap = new Map()
  grid.data.forEach(d => {
     gridMap.set(`${Math.round(d.lon)}_${Math.round(d.lat)}`, {u: d.u, v: d.v})
  })
  
  windGridAccessor.value = (ix, iy) => {
    const lon = 90 + ix * 2;
    const lat = -15 + iy * 2;
    return gridMap.get(`${lon}_${lat}`) || { u: 0, v: 0 }
  }
})
</script>

<template>
  <canvas 
    v-show="visible"
    ref="canvasRef" 
    class="absolute-full no-pointer-events z-index-wind"
    style="pointer-events: none; z-index: 95;"
  />
</template>

<style scoped>
.z-index-wind {
  z-index: 95;
}
</style>
