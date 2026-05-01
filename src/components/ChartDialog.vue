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
            type="area"
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
import { ref, computed } from 'vue'
import { useStationStore } from 'src/stores/station'

const props = defineProps({
  modelValue: Boolean,
  stationId: String,
  stationName: String
})

const emit = defineEmits(['update:modelValue'])
const stationStore = useStationStore()
const timeRange = ref('1h')

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const station = computed(() => 
  stationStore.stations.find(s => s.station_id === props.stationId)
)

const series = computed(() => [{
  name: 'Deformation',
  data: station.value?.history || []
}])

const options = computed(() => ({
  chart: {
    id: 'deformation-chart',
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: 'linear',
      dynamicAnimation: {
        speed: 1000
      }
    },
    zoom: { enabled: false }
  },
  xaxis: {
    type: 'datetime',
    labels: {
      format: 'HH:mm:ss',
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
    title: {
      text: 'Offset (m)',
      style: { color: '#64748b', fontSize: '11px', fontWeight: 600 }
    },
    labels: {
      formatter: (val) => val.toFixed(3) + 'm',
      style: { colors: '#94a3b8', fontSize: '10px' }
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [50, 100]
    }
  },
  colors: ['#8b5cf6'], // Purple color from user image
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 4,
  },
  markers: {
    size: 4,
    colors: ['#8b5cf6'],
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: { size: 6 }
  },
  tooltip: {
    x: { format: 'HH:mm:ss' }
  }
}))
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
