<template>
  <q-dialog v-model="visible" transition-show="scale" transition-hide="scale">
    <q-card style="width: 800px; max-width: 95vw; border-radius: 16px;" class="column no-wrap overflow-hidden">
      <!-- Fixed Header -->
      <q-card-section class="row items-center q-px-lg q-py-md shrink bg-white border-bottom-light">
        <div class="flex items-center">
          <q-select
            v-model="timeRange"
            :options="['1h', '3h', '6h', '12h', '24h']"
            dense
            outlined
            options-dense
            style="width: 80px;"
            class="q-mr-md"
          />
        </div>
        <q-space />
        <q-btn icon="close" flat round size="md" color="grey-7" @click="visible = false" />
      </q-card-section>

      <q-card-section class="q-px-lg q-py-lg">
        <div class="chart-container shadow-sm">
          <apexchart
            type="scatter"
            height="350"
            :options="options"
            :series="series"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStationStore } from 'src/stores/station'

const props = defineProps({
  modelValue: Boolean,
  stationId: String,
  stationName: String,
  chartType: {
    type: String,
    default: 'deformation' // 'deformation' or 'rainfall'
  }
})

const emit = defineEmits(['update:modelValue'])
const stationStore = useStationStore()
const timeRange = ref('1h')
const rainfallHistory = ref([])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const station = computed(() => 
  stationStore.stations.find(s => s.station_id === props.stationId)
)

watch(visible, async (val) => {
  if (val && props.chartType === 'rainfall') {
    rainfallHistory.value = await stationStore.fetchRainfallHistory(props.stationId)
  }
})

const series = computed(() => {
  if (props.chartType === 'rainfall') {
    return [{
      name: 'Curah Hujan (Hourly)',
      data: rainfallHistory.value.map(item => ({
        x: new Date(item.timestamp).getTime(),
        y: item.hourly
      }))
    }]
  }
  return [{
    name: 'Deformation',
    data: station.value?.history || []
  }]
})

const options = computed(() => {
  const isRain = props.chartType === 'rainfall'
  
  return {
    chart: {
      id: isRain ? 'rainfall-chart' : 'deformation-chart',
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: { speed: 1000 }
      },
      zoom: { enabled: false },
      sparkline: { enabled: false },
      padding: { left: 30, right: 30 }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'HH:mm:ss',
        datetimeUTC: false,
        style: { colors: '#94a3b8', fontSize: '10px' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: {
        text: 'Time',
        style: { color: '#64748b', fontSize: '11px', fontWeight: 600 }
      }
    },
    yaxis: {
      labels: {
        formatter: (val) => isRain ? val.toFixed(1) + 'mm' : val.toFixed(4) + 'm',
        style: { colors: '#94a3b8', fontSize: '10px' },
        minWidth: 70,
        offsetX: -5
      },
      title: {
        text: isRain ? 'Rainfall (mm)' : 'Offset (m)',
        rotate: -90,
        offsetX: -10,
        style: { color: '#64748b', fontSize: '11px', fontWeight: 600 }
      }
    },
    stroke: {
      show: !isRain,
      width: isRain ? 2 : 0,
      curve: 'smooth'
    },
    fill: {
      type: isRain ? 'gradient' : 'solid',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    colors: [isRain ? '#3b82f6' : '#818cf8'],
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
    },
    markers: {
      size: isRain ? 0 : 5,
      colors: [isRain ? '#3b82f6' : '#818cf8'],
      strokeWidth: 0,
      hover: { size: 7 }
    },
    tooltip: {
      x: { format: 'dd MMM HH:mm' }
    }
  }
})
</script>

<style scoped>
.chart-container {
  background: #fff;
  border-radius: 8px;
}
.border-bottom-light {
  border-bottom: 1px solid #f1f5f9;
}
</style>
