<template>
  <q-dialog v-model="mapStore.showAlertDetail" position="standard">
    <q-card 
      class="alert-detail-card" 
      :class="$q.dark.isActive ? 'card-bg-dark text-white' : 'bg-white text-dark'"
      style="width: 550px; max-width: 95vw; border-radius: 16px; overflow: hidden;"
    >
      <!-- Header with status color -->
      <div 
        class="q-pa-md row items-center justify-between" 
        :style="`border-bottom: 4px solid ${alert?.colorHex || '#f44336'}; ${$q.dark.isActive ? 'background: #1a1f2e;' : 'background: #f8f9fa;'}`"
      >
        <div class="row items-center">
          <q-chip 
            dense 
            outline 
            :color="alert?.color || 'negative'" 
            class="text-weight-bold" 
            style="border-width: 2px;"
          >
            <q-icon name="error_outline" size="xs" class="q-mr-xs" />
            {{ alert?.level || 'BAHAYA' }}
          </q-chip>
        </div>
        
        <div class="column items-end q-mr-xl">
          <div class="text-h6 text-weight-bold q-mb-none" :class="$q.dark.isActive ? 'text-white' : 'text-dark'" style="line-height: 1.1;">Level {{ alert?.levelNum || 1 }}</div>
          <div class="text-caption text-weight-bold" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'" style="font-size: 11px;">Sangat Berat</div>
        </div>

        <q-btn 
          flat 
          round 
          dense 
          icon="close" 
          v-close-popup 
          class="absolute-top-right q-ma-sm" 
          :color="$q.dark.isActive ? 'white' : 'dark'" 
        />
      </div>

      <q-card-section class="q-pa-md scroll" style="max-height: 80vh;">
        <!-- LOKASI -->
        <div class="q-mb-lg">
          <div class="row items-center q-mb-sm">
            <q-icon name="location_on" size="18px" class="q-mr-sm" color="blue" />
            <div class="text-weight-bold letter-spacing-1 text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">{{ $t('alertDetail.location') }}</div>
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <q-card flat bordered class="q-pa-xs text-center" :class="$q.dark.isActive ? 'bg-grey-10 border-grey-9' : 'bg-grey-2 border-grey-3'">
                <div class="text-tiny text-grey-6 uppercase">{{ $t('alertDetail.province') }}</div>
                <div class="text-weight-bold" style="font-size: 11px;">DKI Jakarta</div>
              </q-card>
            </div>
            <div class="col-4">
              <q-card flat bordered class="q-pa-xs text-center" :class="$q.dark.isActive ? 'bg-grey-10 border-grey-9' : 'bg-grey-2 border-grey-3'">
                <div class="text-tiny text-grey-6 uppercase">{{ $t('alertDetail.city') }}</div>
                <div class="text-weight-bold" style="font-size: 11px;">Jakarta Timur</div>
              </q-card>
            </div>
            <div class="col-4">
              <q-card flat bordered class="q-pa-xs text-center" :class="$q.dark.isActive ? 'bg-grey-10 border-grey-9' : 'bg-grey-2 border-grey-3'">
                <div class="text-tiny text-grey-6 uppercase">{{ $t('alertDetail.district') }}</div>
                <div class="text-weight-bold" style="font-size: 11px;">Jatinegara</div>
              </q-card>
            </div>
          </div>
        </div>

        <!-- PERINGATAN DINI -->
        <div class="q-mb-lg">
          <div class="row items-center q-mb-sm">
            <q-icon name="wb_sunny" size="18px" class="q-mr-sm" color="yellow-8" />
            <div class="text-weight-bold letter-spacing-1 text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">{{ $t('alertDetail.earlyWarning') }}</div>
          </div>
          <div class="row q-gutter-sm">
            <q-chip 
              v-for="(tag, i) in alert?.tags" 
              :key="i"
              outline
              dense
              :color="$q.dark.isActive ? 'white' : 'primary'"
              class="q-px-md text-weight-bold"
              style="height: 32px;"
            >
              <q-icon :name="tag.icon" size="16px" class="q-mr-xs" />
              {{ tag.label }}
            </q-chip>
          </div>
        </div>

        <!-- WAKTU -->
        <div class="q-mb-lg">
          <div class="row items-center q-mb-sm">
            <q-icon name="schedule" size="18px" class="q-mr-sm" color="cyan-6" />
            <div class="text-weight-bold letter-spacing-1 text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">{{ $t('alertDetail.time') }}</div>
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-card flat bordered class="q-pa-xs" :class="$q.dark.isActive ? 'bg-grey-10 border-grey-9' : 'bg-grey-2 border-grey-3'">
                <div class="text-tiny text-grey-6 uppercase">{{ $t('alertDetail.validFrom') }}</div>
                <div class="text-weight-bold" style="font-size: 11px;">Sen, 9 Feb 2026, 06.00</div>
              </q-card>
            </div>
            <div class="col-6">
              <q-card flat bordered class="q-pa-xs" :class="$q.dark.isActive ? 'bg-grey-10 border-grey-9' : 'bg-grey-2 border-grey-3'">
                <div class="text-tiny text-grey-6 uppercase">{{ $t('alertDetail.validUntil') }}</div>
                <div class="text-weight-bold" style="font-size: 11px;">Sen, 9 Feb 2026, 18.00</div>
              </q-card>
            </div>
          </div>
        </div>

        <!-- DAMPAK -->
        <div class="q-mb-lg">
          <div class="row items-center q-mb-sm">
            <q-icon name="bolt" size="18px" class="q-mr-sm" color="amber-8" />
            <div class="text-weight-bold letter-spacing-1 text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">{{ $t('alertDetail.impact') }}</div>
          </div>
          <q-banner 
            rounded 
            dense
            class="text-weight-medium" 
            :class="$q.dark.isActive ? 'bg-orange-10 text-orange-2' : 'bg-orange-1 text-orange-10'"
            style="border: 1px solid rgba(255,165,0,0.2); font-size: 12px; line-height: 1.4;"
          >
            Terdapat genangan di beberapa titik, pohon tumbang, kemacetan semakin meluas.
          </q-banner>
        </div>

        <!-- RESPON -->
        <div class="q-mb-none">
          <div class="row items-center q-mb-sm">
            <q-icon name="check_circle" size="18px" class="q-mr-sm" color="green-6" />
            <div class="text-weight-bold letter-spacing-1 text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">{{ $t('alertDetail.response') }}</div>
          </div>
          <q-banner 
            rounded 
            dense
            class="text-weight-medium" 
            :class="$q.dark.isActive ? 'bg-blue-10 text-blue-2' : 'bg-blue-1 text-blue-10'"
            style="border: 1px solid rgba(0,0,255,0.1); font-size: 12px; line-height: 1.4;"
          >
            Peningkatan koordinasi dengan kelurahan dan stakeholder. Siaga logistik dan peralatan.
          </q-banner>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useMapStore } from 'src/stores/map'

const mapStore = useMapStore()
const alert = computed(() => mapStore.selectedAlert)
</script>

<style scoped>
.letter-spacing-1 {
  letter-spacing: 1.5px;
}
.border-grey-9 {
  border-color: #262626 !important;
}
.border-grey-3 {
  border-color: #e0e0e0 !important;
}
.text-tiny {
  font-size: 9px;
  line-height: 1.2;
}
.uppercase {
  text-transform: uppercase;
}
</style>
