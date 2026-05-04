<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-slate-900">Manajemen Station</div>
        <div class="text-caption text-grey-6 mt-xs">Kelola data Base Station dan Rover (Station) pemantau.</div>
      </div>
      <q-btn 
        unelevated 
        color="blue-6" 
        icon="add" 
        :label="activeTab === 'base' ? 'Tambah Base Station' : 'Tambah Rover'" 
        class="border-radius-md text-weight-bold btn-gradient text-white" 
        no-caps 
        @click="openAddDialog" 
      />
    </div>

    <!-- Tabs Section -->
    <div class="q-mb-md">
      <q-tabs
        v-model="activeTab"
        dense
        class="custom-tabs text-slate-600"
        active-color="blue-6"
        indicator-color="transparent"
        align="left"
        no-caps
      >
        <q-tab name="base" label="Base Station" icon="satellite_alt" />
        <q-tab name="rover" label="Rover Station" icon="cell_tower" />
      </q-tabs>
      <q-separator />
    </div>

    <!-- Tab Panels -->
    <q-tab-panels v-model="activeTab" animated class="bg-transparent">
      <!-- PANEL BASE STATION -->
      <q-tab-panel name="base" class="q-pa-none">
        <q-card class="no-shadow border-light border-radius-lg overflow-hidden">
          <q-card-section class="q-pa-none">
            <q-table
              :rows="baseStations"
              :columns="baseColumns"
              row-key="id"
              flat
              hide-pagination
              :loading="loading"
              class="premium-management-table"
              :pagination="{ rowsPerPage: 0 }"
            >
              <template v-slot:body-cell-nama="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-slate-800">KODE: {{ props.row.kode }}</div>
                  <div class="text-grey-5 text-caption" style="font-size: 10px;">{{ props.row.nama }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-lokasi="props">
                <q-td :props="props">
                  <div class="text-slate-700 text-weight-medium">{{ props.row.lokasi }}</div>
                  <div class="text-grey-5" style="font-size: 10px;">{{ props.row.lat }}, {{ props.row.long }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="text-center">
                  <div class="row justify-center q-gutter-x-sm no-wrap">
                    <q-btn flat round dense color="amber-7" icon="edit" size="sm" @click="openEditDialog(props.row, 'base')" />
                    <q-btn flat round dense color="red-5" icon="delete_outline" size="sm" @click="confirmDelete(props.row, 'base')" />
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- PANEL ROVER STATION -->
      <q-tab-panel name="rover" class="q-pa-none">
        <q-card class="no-shadow border-light border-radius-lg overflow-hidden">
          <q-card-section class="q-pa-none">
            <q-table
              :rows="stations"
              :columns="roverColumns"
              row-key="id"
              flat
              hide-pagination
              :loading="loading"
              class="premium-management-table"
              :pagination="{ rowsPerPage: 0 }"
            >
              <template v-slot:body-cell-pairing="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-slate-800">{{ props.row.name }}</div>
                  <div class="text-grey-5 text-caption" style="font-size: 10px;">ID: {{ props.row.station_id }}</div>
                </q-td>
              </template>
              <template v-slot:body-cell-base="props">
                <q-td :props="props">
                  <q-badge v-if="props.row.base_station" color="indigo-1" text-color="indigo-7" class="text-weight-bold">
                    {{ props.row.base_station.kode }} : {{ props.row.base_station.nama }}
                  </q-badge>
                  <span v-else class="text-grey-4 italic">No Pairing</span>
                </q-td>
              </template>
              <template v-slot:body-cell-status="props">
                <q-td :props="props" class="text-center">
                  <q-badge
                    :color="props.value === 'ACTIVE' ? 'green-1' : 'grey-2'"
                    :text-color="props.value === 'ACTIVE' ? 'green-6' : 'grey-6'"
                    class="status-pill text-bold"
                  >
                    {{ props.value }}
                  </q-badge>
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="text-center">
                  <div class="row justify-center q-gutter-x-sm no-wrap">
                    <q-btn flat round dense color="blue-6" icon="settings_suggest" size="sm" @click="goToDetail(props.row)" />
                    <q-btn flat round dense color="amber-7" icon="edit" size="sm" @click="openEditDialog(props.row, 'rover')" />
                    <q-btn flat round dense color="red-5" icon="delete_outline" size="sm" @click="confirmDelete(props.row, 'rover')" />
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <!-- DIALOG BASE STATION -->
    <q-dialog v-model="showBaseDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw;" class="border-radius-lg no-shadow">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 text-weight-bold q-mb-md">{{ isEdit ? 'Edit Base Station' : 'Tambah Base Station' }}</div>
          <q-form @submit="saveBase">
            <q-input v-model="baseForm.kode" label="Kode Base" filled dense class="q-mb-md custom-input-filled" :rules="[val => !!val || 'Wajib diisi']" />
            <q-input v-model="baseForm.nama" label="Nama Base" filled dense class="q-mb-md custom-input-filled" :rules="[val => !!val || 'Wajib diisi']" />
            <q-input v-model="baseForm.lokasi" label="Lokasi" filled dense class="q-mb-md custom-input-filled" />
            <div class="row q-col-gutter-x-md">
              <q-input v-model.number="baseForm.lat" label="Latitude" filled dense class="col-6 q-mb-md custom-input-filled" type="number" step="any" />
              <q-input v-model.number="baseForm.long" label="Longitude" filled dense class="col-6 q-mb-md custom-input-filled" type="number" step="any" />
            </div>
            <q-select v-model="baseForm.site_id" :options="siteOptions" label="Site Access" filled dense emit-value map-options class="q-mb-md custom-input-filled" />
            
            <div class="row justify-end q-mt-md">
              <q-btn flat label="Batal" v-close-popup class="q-mr-sm" no-caps />
              <q-btn unelevated color="primary" :label="isEdit ? 'Simpan' : 'Tambah'" type="submit" no-caps class="btn-gradient" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- DIALOG ROVER STATION -->
    <q-dialog v-model="showRoverDialog" persistent>
      <q-card style="width: 700px; max-width: 95vw;" class="border-radius-lg no-shadow">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 text-weight-bold q-mb-md">{{ isEdit ? 'Edit Rover' : 'Tambah Rover Baru' }}</div>
          <q-form @submit="saveRover">
            <div class="row q-col-gutter-x-md">
              <q-input v-model="roverForm.station_id" label="Station ID" filled dense class="col-6 q-mb-md custom-input-filled" :rules="[val => !!val || 'Wajib diisi']" />
              <q-input v-model="roverForm.name" label="Nama Station" filled dense class="col-6 q-mb-md custom-input-filled" :rules="[val => !!val || 'Wajib diisi']" />
            </div>
            <div class="row q-col-gutter-x-md">
              <q-select v-model="roverForm.site_id" :options="siteOptions" label="Site Access" filled dense emit-value map-options class="col-6 q-mb-md custom-input-filled" />
              <q-select v-model="roverForm.base_station_id" :options="baseOptions" label="Pairing Base Station" filled dense emit-value map-options class="col-6 q-mb-md custom-input-filled" />
            </div>
            <div class="row q-col-gutter-x-md">
              <q-input v-model.number="roverForm.latitude" label="Latitude" filled dense class="col-4 q-mb-md custom-input-filled" type="number" step="any" />
              <q-input v-model.number="roverForm.longitude" label="Longitude" filled dense class="col-4 q-mb-md custom-input-filled" type="number" step="any" />
              <q-input v-model.number="roverForm.initial_distance" label="Initial Distance (m)" filled dense class="col-4 q-mb-md custom-input-filled" type="number" step="any" />
            </div>
            <q-input v-model="roverForm.url_streaming" label="URL Streaming Deformasi" filled dense class="q-mb-md custom-input-filled" placeholder="http://..." />
            <q-select v-model="roverForm.status" :options="['ACTIVE', 'INACTIVE', 'MAINTENANCE']" label="Status" filled dense class="q-mb-md custom-input-filled" />
            <q-input v-model="roverForm.location" label="Lokasi Detail" filled dense class="q-mb-md custom-input-filled" />

            <div class="row justify-end q-mt-md">
              <q-btn flat label="Batal" v-close-popup class="q-mr-sm" no-caps />
              <q-btn unelevated color="primary" :label="isEdit ? 'Simpan' : 'Tambah'" type="submit" no-caps class="btn-gradient" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useStationStore } from 'src/stores/station';
import { useSiteStore } from 'src/stores/site';

const router = useRouter();
const $q = useQuasar();
const stationStore = useStationStore();
const siteStore = useSiteStore();

const activeTab = ref('base');
const showBaseDialog = ref(false);
const showRoverDialog = ref(false);
const isEdit = ref(false);
const editId = ref(null);

// FORMS
const baseForm = reactive({
  kode: '', nama: '', lokasi: '', lat: 0, long: 0, site_id: null
});

const roverForm = reactive({
  station_id: '', name: '', status: 'ACTIVE', latitude: 0, longitude: 0, location: '',
  base_station_id: null, site_id: null, initial_distance: 0, url_streaming: ''
});

// DATA
const stations = computed(() => stationStore.stations);
const baseStations = computed(() => stationStore.baseStations);
const loading = computed(() => stationStore.loading);

const siteOptions = computed(() => 
  siteStore.sites.map(s => ({ label: s.nama, value: s.id }))
);

const baseOptions = computed(() => 
  stationStore.baseStations.map(b => ({ label: `${b.kode} : ${b.nama}`, value: b.id }))
);

onMounted(() => {
  fetchData();
});

const fetchData = () => {
  stationStore.fetchStations();
  stationStore.fetchBaseStations();
  siteStore.fetchSites();
};

const openAddDialog = () => {
  isEdit.value = false;
  editId.value = null;
  if (activeTab.value === 'base') {
    Object.assign(baseForm, { kode: '', nama: '', lokasi: '', lat: 0, long: 0, site_id: null });
    showBaseDialog.value = true;
  } else {
    Object.assign(roverForm, { 
      station_id: '', name: '', status: 'ACTIVE', latitude: 0, longitude: 0, location: '',
      base_station_id: null, site_id: null, initial_distance: 0, url_streaming: ''
    });
    showRoverDialog.value = true;
  }
};

const openEditDialog = (data, type) => {
  isEdit.value = true;
  editId.value = data.id;
  if (type === 'base') {
    Object.assign(baseForm, { ...data });
    showBaseDialog.value = true;
  } else {
    Object.assign(roverForm, { ...data });
    showRoverDialog.value = true;
  }
};

const saveBase = async () => {
  try {
    if (isEdit.value) {
      await stationStore.updateBaseStation(editId.value, baseForm);
      $q.notify({ type: 'positive', message: 'Base Station diperbarui' });
    } else {
      await stationStore.createBaseStation(baseForm);
      $q.notify({ type: 'positive', message: 'Base Station ditambahkan' });
    }
    showBaseDialog.value = false;
  } catch {
    $q.notify({ type: 'negative', message: 'Gagal menyimpan data' });
  }
};

const saveRover = async () => {
  try {
    const payload = { ...roverForm };
    if (isEdit.value) {
      await stationStore.updateStation(editId.value, payload);
      $q.notify({ type: 'positive', message: 'Rover diperbarui' });
    } else {
      await stationStore.createStation(payload);
      $q.notify({ type: 'positive', message: 'Rover ditambahkan' });
    }
    showRoverDialog.value = false;
  } catch {
    $q.notify({ type: 'negative', message: 'Gagal menyimpan data' });
  }
};

const confirmDelete = (row, type) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Hapus ${type === 'base' ? 'Base' : 'Rover'} <strong>${row.nama || row.name}</strong>?`,
    html: true,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      if (type === 'base') await stationStore.deleteBaseStation(row.id);
      else await stationStore.deleteStation(row.id);
      $q.notify({ type: 'positive', message: 'Data telah dihapus' });
    } catch {
      $q.notify({ type: 'negative', message: 'Gagal menghapus data' });
    }
  });
};

const baseColumns = [
  { name: 'nama', align: 'left', label: 'INFO BASE', field: 'nama' },
  { name: 'lokasi', align: 'left', label: 'LOKASI / KOORDINAT', field: 'lokasi' },
  { name: 'actions', align: 'center', label: 'AKSI', field: 'id' }
];

const roverColumns = [
  { name: 'pairing', align: 'left', label: 'INFO ROVER', field: 'name' },
  { name: 'base', align: 'left', label: 'PAIRING BASE', field: 'id' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'actions', align: 'center', label: 'AKSI', field: 'id' }
];

const goToDetail = (row) => {
  router.push(`/dashboard/station/${encodeURIComponent(row.name)}`);
};
</script>

<style lang="scss" scoped>
.border-light { border: 1px solid #f1f5f9; }
.border-radius-lg { border-radius: 12px; }
.premium-management-table {
  background: white;
  :deep(th) { font-size: 11px; color: #94a3b8; font-weight: 700; padding: 16px; border-bottom: 2px solid #f8fafc; }
  :deep(td) { font-size: 13px; padding: 16px; color: #475569; }
  :deep(tr:hover) { background: #f8fafc; }
}
.btn-gradient { background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); }
.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 10px; }
.custom-input-filled {
  :deep(.q-field__inner) {
    .q-field__control { background-color: #f1f5f9 !important; border-radius: 8px; min-height: 42px;
      &:before, &:after { display: none; }
    }
  }
}
.custom-tabs {
  :deep(.q-tab) {
    border-radius: 8px;
    margin-right: 8px;
    padding: 0 16px;
    min-height: 40px;
    transition: all 0.3s ease;
    
    .q-tab__content {
      padding: 8px 0;
    }
  }

  :deep(.q-tab--active) {
    background: white;
    color: #3b82f6 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}

.text-slate-600 { color: #475569; }
</style>
