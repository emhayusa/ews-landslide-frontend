<template>
  <q-dialog v-model="visible" transition-show="scale" transition-hide="scale">
    <q-card style="width: 900px; max-width: 95vw; height: 80vh; border-radius: 16px;" class="column no-wrap overflow-hidden">
      <!-- Fixed Header -->
      <q-card-section class="row items-center q-px-lg q-py-md shrink bg-white border-bottom-light">
        <div class="flex items-center">
          <q-icon name="insert_chart" color="primary" size="24px" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold text-slate-900">{{ stationName }}</div>
        </div>
        <q-space />
        <q-btn icon="close" flat round size="md" color="grey-7" @click="visible = false" />
      </q-card-section>

      <!-- Scrollable Content -->
      <q-card-section class="col scroll q-px-lg q-py-lg bg-grey-1">
        <div class="column q-gutter-y-lg">
          <!-- E (East) Chart -->
          <div class="chart-container shadow-sm">
            <div class="text-subtitle2 text-grey-7 q-mb-xs flex items-center q-px-sm q-pt-sm">
              <div class="dot bg-red-6 q-mr-sm"></div> E (m)
            </div>
            <apexchart
              type="scatter"
              height="200"
              :options="chartOptions('E', '#ef4444')"
              :series="seriesE"
            />
          </div>

          <!-- N (North) Chart -->
          <div class="chart-container shadow-sm">
            <div class="text-subtitle2 text-grey-7 q-mb-xs flex items-center q-px-sm q-pt-sm">
              <div class="dot bg-green-6 q-mr-sm"></div> N (m)
            </div>
            <apexchart
              type="scatter"
              height="200"
              :options="chartOptions('N', '#22c55e')"
              :series="seriesN"
            />
          </div>

          <!-- U (Up) Chart -->
          <div class="chart-container shadow-sm">
            <div class="text-subtitle2 text-grey-7 q-mb-xs flex items-center q-px-sm q-pt-sm">
              <div class="dot bg-blue-6 q-mr-sm"></div> U (m)
            </div>
            <apexchart
              type="scatter"
              height="200"
              :options="chartOptions('U', '#3b82f6')"
              :series="seriesU"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  stationName: String
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Mock Data Generator
const generateMockData = (baseValue, variance) => {
  const data = []
  const now = new Date().getTime()
  for (let i = 0; i < 40; i++) {
    const time = now - (40 - i) * 1000
    const value = baseValue + (Math.random() - 0.5) * variance
    data.push([time, value])
  }
  return data
}

const seriesE = ref([{ name: 'East', data: generateMockData(-0.012, 0.005) }])
const seriesN = ref([{ name: 'North', data: generateMockData(0.005, 0.004) }])
const seriesU = ref([{ name: 'Up', data: generateMockData(0.008, 0.006) }])

const chartOptions = (label, color) => ({
  chart: {
    toolbar: { show: false },
    animations: { enabled: false },
    zoom: { enabled: false }
  },
  xaxis: {
    type: 'datetime',
    labels: {
      format: 'HH:mm:ss TT',
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
      formatter: (val) => val.toFixed(5) + 'm',
      style: { colors: '#94a3b8', fontSize: '10px' }
    }
  },
  colors: [color],
  markers: {
    size: 4,
    strokeWidth: 0,
    hover: { size: 6 }
  },
  grid: {
    borderColor: '#f1f5f9',
    xaxis: { lines: { show: true } }
  },
  tooltip: {
    x: { format: 'HH:mm:ss' }
  }
})
</script>

<style scoped>
.chart-container {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 8px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.text-slate-900 { color: #0f172a; }
</style>
