<template>
  <div class="flex column full-height" :class="$q.dark.isActive ? 'drawer-bg-dark text-white' : 'drawer-bg-light text-dark'" style="width: 100%; min-height: 100vh;">
    <!-- Header -->
    <div class="row items-center q-pa-md no-wrap" :style="$q.dark.isActive ? 'border-bottom: 1px solid rgba(255, 255, 255, 0.05);' : 'border-bottom: 1px solid #e0e0e0;'">
      <div class="row items-center col">
        <q-icon name="security" size="sm" class="q-mr-sm" :class="$q.dark.isActive ? 'text-grey-4' : 'text-blue-8'" />
        <div class="text-h6 text-weight-bold" style="font-size: 1.1rem;" :class="$q.dark.isActive ? 'text-[#eceff4]' : 'text-dark'">{{ $t('map.sidebarTitle') }}</div>
      </div>
      
      <!-- Mobile Login Button -->
      <q-btn 
        v-if="$q.screen.lt.sm" 
        outline 
        rounded 
        size="sm" 
        to="/login" 
        class="q-mr-sm q-px-sm" 
        :class="$q.dark.isActive ? 'text-white' : 'text-primary'" 
        style="border: 1px solid rgba(128,128,128,0.3); height: 32px;"
      >
        <q-icon name="login" class="q-mr-xs" size="14px" />
        <span class="text-weight-bold" style="font-size: 11px;">{{ $t('auth.login') }}</span>
      </q-btn>

      <q-btn flat round dense :icon="$q.screen.lt.sm ? 'close' : 'chevron_left'" @click="$emit('close')" />
    </div>

    <q-scroll-area class="col q-pa-md">
      <!-- Mobile Search (Inside Drawer) -->
      <div v-if="$q.screen.lt.sm" class="q-mb-md">
        <GeocodingSearchContainer />
      </div>

      <!-- Filter Card -->
      <q-card :flat="$q.dark.isActive" class="q-pa-xs q-mb-lg border-radius-lg" :class="$q.dark.isActive ? 'card-bg-dark' : 'card-bg-light'">
        <div class="row justify-between no-wrap">
          <!-- Semua -->
          <div :class="['filter-item col flex column flex-center q-pa-sm rounded-borders cursor-pointer', activeFilter === 'SEMUA' ? 'active' : '']" @click="activeFilter = 'SEMUA'">
            <q-icon name="format_list_bulleted" size="xs" class="q-mb-xs" :class="activeFilter === 'SEMUA' ? 'text-white' : ($q.dark.isActive ? 'text-grey-5' : 'text-grey-7')" />
            <div class="text-caption text-weight-bold" :class="activeFilter === 'SEMUA' ? 'text-white' : ($q.dark.isActive ? 'text-grey-5' : 'text-grey-7')" style="font-size: 10px; letter-spacing: 0.5px;">{{ $t('map.filterAll') }}</div>
          </div>
          <!-- Waspada -->
          <div :class="['filter-item col flex column flex-center q-pa-sm rounded-borders cursor-pointer', activeFilter === 'WASPADA' ? 'active' : '']" @click="activeFilter = 'WASPADA'">
            <div class="circle-indicator bg-warning q-mb-xs"></div>
            <div class="text-caption text-weight-bold" :class="activeFilter === 'WASPADA' ? 'text-white' : ($q.dark.isActive ? 'text-grey-5' : 'text-grey-7')" style="font-size: 10px; letter-spacing: 0.5px;">{{ $t('map.filterWaspada') }}</div>
          </div>
          <!-- Siaga -->
          <div :class="['filter-item col flex column flex-center q-pa-sm rounded-borders cursor-pointer', activeFilter === 'SIAGA' ? 'active' : '']" @click="activeFilter = 'SIAGA'">
            <div class="circle-indicator bg-orange q-mb-xs"></div>
            <div class="text-caption text-weight-bold" :class="activeFilter === 'SIAGA' ? 'text-white' : ($q.dark.isActive ? 'text-grey-5' : 'text-grey-7')" style="font-size: 10px; letter-spacing: 0.5px;">{{ $t('map.filterSiaga') }}</div>
          </div>
          <!-- Awas -->
          <div :class="['filter-item col flex column flex-center q-pa-sm rounded-borders cursor-pointer', activeFilter === 'AWAS' ? 'active' : '']" @click="activeFilter = 'AWAS'">
            <div class="circle-indicator text-negative bg-negative q-mb-xs"></div>
            <div class="text-caption text-weight-bold" :class="activeFilter === 'AWAS' ? 'text-white' : ($q.dark.isActive ? 'text-grey-5' : 'text-grey-7')" style="font-size: 10px; letter-spacing: 0.5px;">{{ $t('map.filterAwas') }}</div>
          </div>
        </div>
      </q-card>

      <!-- Title -->
      <div class="text-caption text-weight-bold q-mb-md" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'" style="letter-spacing: 1px;">
        {{ $t('map.activeAlerts') }} ({{ filteredAlerts.length }})
      </div>

      <!-- List Cards -->
      <div class="column q-gutter-y-md">
        <q-card 
          v-for="(alert, index) in filteredAlerts" 
          :key="index" 
          :flat="$q.dark.isActive" 
          class="alert-card cursor-pointer" 
          :class="$q.dark.isActive ? 'card-bg-dark' : 'card-bg-light'" 
          :style="`border-left: 4px solid ${alert.colorHex}`"
          @click="mapStore.openAlertDetail(alert)"
        >
          <q-card-section class="q-pa-sm">
            <!-- Header Card (Chip & Level) -->
            <div class="row items-center justify-between q-mb-sm">
              <q-chip dense outline :color="alert.color" class="text-weight-bold q-ma-none" style="border-width: 1px;" :style="$q.dark.isActive ? `background: ${alert.colorHex}26;` : `background: ${alert.colorHex}0D;`">
                <q-icon :name="alert.level === 'WASPADA' ? 'warning' : 'error_outline'" size="xs" class="q-mr-xs" /> <span style="font-size: 11px;">{{ $t('map.filter' + alert.level.charAt(0) + alert.level.slice(1).toLowerCase()) }}</span>
              </q-chip>
              <q-chip dense class="text-weight-bold text-caption q-ma-none" :class="$q.dark.isActive ? 'chip-bg-dark text-grey-4' : 'chip-bg-light text-dark'" style="font-size: 10px;">Level {{ alert.levelNum }}</q-chip>
            </div>
            
            <!-- Title -->
            <div class="text-weight-bold q-mb-xs line-height-tight" style="font-size: 13px;">{{ alert.title }}</div>
            
            <!-- Location -->
            <div class="row items-center text-caption q-mb-sm" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'" style="font-size: 11px;">
              <q-icon name="location_on" size="14px" class="q-mr-xs" /> 
              {{ alert.location }}
            </div>

            <!-- Tags -->
            <div class="row q-gutter-x-sm q-mb-sm">
              <q-chip v-for="(tag, tIdx) in alert.tags" :key="tIdx" dense :class="$q.dark.isActive ? 'chip-bg-dark' : 'chip-bg-light'" :text-color="$q.dark.isActive ? 'grey-4' : 'dark'" class="q-px-sm" style="font-size: 11px; height: 22px;">
                <q-icon :name="tag.icon" size="12px" class="q-mr-xs" /> {{ tag.label }}
              </q-chip>
            </div>

            <!-- Div & Time -->
            <q-separator :dark="$q.dark.isActive" class="q-mb-xs" :style="$q.dark.isActive ? 'background: rgba(255,255,255,0.05);' : ''" />
            
            <div class="row justify-end items-center text-caption" :class="$q.dark.isActive ? 'text-grey-6' : 'text-grey-8'" style="font-size: 10px;">
              <q-icon name="schedule" size="12px" class="q-mr-xs" /> {{ alert.time }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useMapStore } from 'src/stores/map'
import GeocodingSearchContainer from './GeocodingSearchContainer.vue'

const $q = useQuasar()
const mapStore = useMapStore()
defineEmits(['close'])

const activeFilter = ref('SEMUA')

const alertsData = ref([
  { 
    level: 'AWAS', levelNum: 1, 
    title: 'Hujan Lebat, Kilat/Petir, Angin Kencang', 
    location: 'Kp. Melayu, Jakarta Timur', 
    time: '5 Jam lalu', 
    tags: [{icon: 'cloud', label: 'Hujan Lebat'}, {icon: 'bolt', label: 'Kilat/Petir'}], 
    color: 'negative', colorHex: '#f44336' 
  },
  { 
    level: 'AWAS', levelNum: 2, 
    title: 'Hujan Sedang-Lebat, Banjir Rob', 
    location: 'Penjaringan, Jakarta Utara', 
    time: '3 Jam lalu', 
    tags: [{icon: 'cloud', label: 'Hujan Sedang-Lebat'}, {icon: 'water_drop', label: 'Banjir Rob'}], 
    color: 'negative', colorHex: '#f44336' 
  },
  { 
    level: 'WASPADA', levelNum: 3, 
    title: 'Hujan Ringan-Sedang', 
    location: 'Tebet, Jakarta Selatan', 
    time: 'Baru saja', 
    tags: [{icon: 'cloud', label: 'Hujan Ringan-Sedang'}], 
    color: 'warning', colorHex: '#f2c037' 
  }
])

const filteredAlerts = computed(() => {
  if (activeFilter.value === 'SEMUA') return alertsData.value
  return alertsData.value.filter(a => a.level === activeFilter.value)
})
</script>

<style scoped>
.drawer-bg-dark {
  background: linear-gradient(180deg, #101625 0%, #151a28 100%);
}
.card-bg-dark {
  background-color: #242938;
}
.border-radius-lg {
  border-radius: 12px;
}
.line-height-tight {
  line-height: 1.3;
}
.filter-item {
  transition: all 0.2s ease;
}
.filter-item.active {
  background-color: #2D4C63; /* slightly lighter blue accent */
}
.filter-item:hover:not(.active) {
  background-color: rgba(0, 0, 0, 0.04);
}
body.body--dark .filter-item:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.05);
}
.circle-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 4px; 
  margin-bottom: 6px;
}
.alert-card {
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}
</style>
