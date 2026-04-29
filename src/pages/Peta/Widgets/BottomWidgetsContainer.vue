<template>
  <div class="bottom-widgets-wrapper absolute-bottom z-top full-width" style="pointer-events: none;">
    <!-- Main Content Area above the timeline -->
    <div class="flex justify-center items-end q-px-md relative-position no-margin q-pb-md" style="pointer-events: auto; margin-bottom: 12px;">
      
      <!-- Cards (Centered) -->
      <div class="flex no-wrap q-gutter-x-md">
        <!-- Card 1: Curah Hujan -->
        <q-card flat class="bg-widget text-white border-radius-lg widget-card">
          <q-card-section class="q-pa-md">
            <div class="row items-start justify-between q-mb-md">
              <div class="row items-center no-wrap">
                <q-icon name="cloud" size="sm" class="q-mr-sm text-grey-3" style="margin-top: -6px;" />
                <div style="line-height: 1.2;">
                  <div class="text-weight-bold text-body2">Curah</div>
                  <div class="text-weight-bold text-body2">Hujan MAX</div>
                </div>
              </div>
              <q-icon name="insights" size="xs" color="grey-3" />
            </div>
            
            <div class="text-h5 text-weight-bold q-mb-md" style="letter-spacing: 0.5px;">0.2 mm</div>
            
            <div class="text-weight-bold" style="color: #9eea1b; font-size: 11px; margin-bottom: 8px;">
              (Sumber data : AWS/ARG BMKG)
            </div>
          </q-card-section>
        </q-card>

        <!-- Card 2: Tinggi Status Muka Air -->
        <q-card flat class="bg-widget text-white border-radius-lg widget-card">
          <q-card-section class="q-pa-md">
            <div class="row items-start justify-between q-mb-sm">
              <div class="row items-center no-wrap">
                <q-icon name="water" size="sm" color="blue-4" class="q-mr-sm" style="margin-top: -6px;" />
                <div style="line-height: 1.2;">
                  <div class="text-weight-bold text-body2">Tinggi Status</div>
                  <div class="text-weight-bold text-body2">Muka Air Max</div>
                </div>
              </div>
              <q-icon name="insights" size="xs" color="grey-3" />
            </div>
            
            <div class="text-weight-bold q-mb-sm" style="font-size: 11px; margin-top: 14px;">P.A. Marina Ancol</div>
            
            <div class="row items-center no-wrap q-mt-xs">
              <q-chip dense class="q-ma-none text-white text-weight-bold q-mr-sm" style="background-color: #f27c38; border-radius: 6px;">Siaga 2</q-chip>
              <div class="text-subtitle1 text-weight-bold q-mr-sm">200 cm</div>
              <div class="text-grey-5" style="font-size: 11px;">Turun 0.00%</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Card 3: Kecepatan Angin -->
        <q-card flat class="bg-widget text-white border-radius-lg widget-card">
          <q-card-section class="q-pa-md">
            <div class="row items-start justify-between q-mb-xl">
              <div class="row items-center no-wrap">
                <q-icon name="air" size="sm" color="light-blue-3" class="q-mr-sm" style="margin-top: -6px;" />
                <div style="line-height: 1.2;">
                  <div class="text-weight-bold text-body2">Kecepatan</div>
                  <div class="text-weight-bold text-body2">Angin Max</div>
                </div>
              </div>
            </div>
            
            <div class="text-h5 text-weight-bold q-mt-md" style="letter-spacing: 0.5px;">4.669 m/s</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Arrow Down Button -->
      <!-- <q-btn 
        color="primary" 
        icon="arrow_downward" 
        class="bg-blue-6 absolute-right q-mr-md"
        style="border-radius: 8px; margin-bottom: 2px;"
        flat dense square
      /> -->
    </div>

    <!-- Timeline Bar -->
    <div class="timeline-bar bg-dark text-white full-width flex no-wrap items-center no-margin" style="height: 36px; pointer-events: auto;">
      <div v-for="(time, idx) in times" :key="idx" class="time-block col flex flex-center text-caption text-grey-4">
        {{ time }}
      </div>
      <div class="time-block active-time col flex flex-center text-caption bg-blue-6 text-white text-weight-bold">
        09:50
      </div>
    </div>
  </div>
</template>

<script setup>
const times = [
  '08:05', '08:15', '08:25', '08:35', '08:45', '08:55',
  '09:05', '09:15', '09:25', '09:35', '09:45'
]
</script>

<style scoped>
.bg-widget {
  background-color: #121826;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.widget-card {
  width: 260px;
  height: 150px;
}
.border-radius-lg {
  border-radius: 12px;
}
.timeline-bar {
  background-color: #1a1f2e;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.time-block {
  height: 100%;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11px;
}
.time-block:last-child {
  border-right: none;
}
.active-time {
  box-shadow: inset 0 -3px 0 0 #a9c2fb; /* optional underline accent */
}
</style>
