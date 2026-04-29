<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bold text-slate-900">Manajemen Station</div>
        <div class="text-caption text-grey-6 mt-xs">Kelola data stasiun pemantau, pairing Rover, dan status konektivitas.</div>
      </div>
      <q-btn unelevated color="blue-6" icon="add" label="Tambah Station" class="border-radius-md text-weight-bold" no-caps @click="openDialog()" />
    </div>

    <!-- Station Form Dialog -->
    <q-dialog v-model="showDialog" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 800px; max-width: 95vw;" class="border-radius-lg no-shadow overflow-hidden">
        <q-card-section class="row items-center q-pa-lg border-bottom-light">
          <div class="text-h6 text-weight-bold flex items-center text-slate-900">
            <q-icon name="sensors" size="24px" class="q-mr-sm text-slate-900" style="font-weight: 800;" />
            {{ isEdit ? 'Edit Data Station' : 'Registrasi Station Baru' }}
          </div>
          <q-space />
          <q-btn icon="close" flat dense v-close-popup color="grey-6" class="bordered-light q-pa-xs border-radius-md" />
        </q-card-section>

        <q-card-section class="q-pa-lg scroll" style="max-height: 70vh">
          <q-form @submit="saveStation">
            <!-- Informasi Perangkat -->
            <div class="text-caption text-weight-bold uppercase letter-spacing-1 text-blue-6 q-mb-md">Informasi Perangkat</div>
            <div class="row q-col-gutter-x-lg q-mb-lg">
              <div class="col-12 col-sm-6">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Station ID</label>
                <q-input v-model="form.station_id" filled dense placeholder="Contoh: ST-RV01" class="custom-input-filled" :rules="[val => !!val || 'ID wajib diisi']" />
              </div>
              <div class="col-12 col-sm-6">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Nama Station</label>
                <q-input v-model="form.name" filled dense placeholder="Contoh: BASE SEMARANG" class="custom-input-filled" :rules="[val => !!val || 'Nama wajib diisi']" />
              </div>
            </div>

            <div class="row q-col-gutter-x-lg q-mb-lg">
              <div class="col-12 col-sm-6">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Jenis Station</label>
                <q-select v-model="form.hardware_type" :options="['BASE', 'ROVER']" filled dense class="custom-input-filled" :rules="[val => !!val || 'Pilih jenis']" />
              </div>
              <div class="col-12 col-sm-6">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Status</label>
                <q-select v-model="form.status" :options="['ACTIVE', 'INACTIVE', 'MAINTENANCE']" filled dense class="custom-input-filled" />
              </div>
            </div>

            <div class="row q-mb-lg">
              <div class="col-12">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Deskripsi / Keterangan</label>
                <q-input v-model="form.description" filled dense type="textarea" rows="2" placeholder="Masukkan deskripsi station..." class="custom-input-filled" />
              </div>
            </div>

            <!-- Konfigurasi Network -->
            <div class="text-caption text-weight-bold uppercase letter-spacing-1 text-blue-6 q-mb-md q-mt-md">Konfigurasi Network</div>
            <div class="row q-col-gutter-x-lg q-mb-lg">
              <div class="col-12 col-sm-4">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Protokol</label>
                <q-select v-model="form.protocol" :options="['NTRIP', 'TCP/IP', 'MQTT']" filled dense class="custom-input-filled" />
              </div>
              <div class="col-12 col-sm-5">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">IP Address / Hostname</label>
                <q-input v-model="form.ip" filled dense placeholder="192.168.1.XXX" class="custom-input-filled" />
              </div>
              <div class="col-12 col-sm-3">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Port</label>
                <q-input v-model="form.port" filled dense type="number" placeholder="2101" class="custom-input-filled" />
              </div>
            </div>

            <!-- Instalasi & Lokasi -->
            <div class="text-caption text-weight-bold uppercase letter-spacing-1 text-blue-6 q-mb-md q-mt-md">Instalasi & Lokasi</div>
            <div class="row q-col-gutter-x-lg q-mb-lg">
              <div class="col-12 col-sm-6">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Tanggal Instalasi</label>
                <q-input v-model="form.install_date" filled dense type="date" class="custom-input-filled" />
              </div>
              <div class="col-12 col-sm-6">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Lokasi / Nama Area</label>
                <q-input v-model="form.location" filled dense placeholder="Contoh: Desa Lerep, Ungaran" class="custom-input-filled" />
              </div>
            </div>

            <div class="row q-col-gutter-x-lg q-mb-lg">
              <div class="col-12 col-sm-4">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Longitude (X)</label>
                <q-input v-model="form.lng" filled dense type="number" step="any" placeholder="110.XXXX" class="custom-input-filled" />
              </div>
              <div class="col-12 col-sm-4">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Latitude (Y)</label>
                <q-input v-model="form.lat" filled dense type="number" step="any" placeholder="-7.XXXX" class="custom-input-filled" />
              </div>
              <div class="col-12 col-sm-4">
                <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Height (Z)</label>
                <q-input v-model="form.height" filled dense type="number" step="any" placeholder="Meter" class="custom-input-filled" />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-separator color="grey-3" style="height: 1px;" />

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn no-caps flat label="Batal" color="slate-900" class="q-px-lg border-radius-md bordered-light text-weight-bold" v-close-popup />
          <q-btn no-caps :label="isEdit ? 'Simpan Perubahan' : 'Daftarkan Station'" class="q-px-lg border-radius-md text-white btn-gradient text-weight-bold" unelevated @click="saveStation" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Stats Row -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-3">
        <q-card class="no-shadow border-light border-radius-lg">
          <q-card-section class="q-pa-md">
            <div class="text-grey-5 text-weight-bold text-caption uppercase q-mb-xs">{{ stat.label }}</div>
            <div class="row items-center justify-between no-wrap">
               <div class="text-h5 text-weight-bolder text-slate-900">{{ stat.value }}</div>
               <q-avatar :color="stat.color + '-1'" :text-color="stat.color + '-6'" size="32px" square class="border-radius-sm">
                 <q-icon :name="stat.icon" size="20px" />
               </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Main Table Card -->
    <q-card class="no-shadow border-light border-radius-lg overflow-hidden">
      <q-card-section class="q-pa-none">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          hide-pagination
          :loading="loading"
          class="premium-management-table"
          :pagination="{ rowsPerPage: 0 }"
        >
          <!-- Custom Pairing Column -->
          <template v-slot:body-cell-pairing="props">
            <q-td :props="props">
               <div class="column">
                  <div class="row items-center no-wrap">
                    <q-badge :color="props.row.type === 'BASE' ? 'blue-6' : 'purple-5'" class="q-mr-sm mini-badge">{{ props.row.type }}</q-badge>
                    <span class="text-weight-bold text-slate-800">{{ props.row.name }}</span>
                  </div>
                  <div class="text-grey-5 text-caption q-mt-xs" style="font-size: 10px;">ID: {{ props.row.id }}</div>
               </div>
            </q-td>
          </template>

          <!-- Custom Status Column -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props" class="text-center">
              <q-badge
                :color="props.value === 'ACTIVE' ? 'green-1' : 'grey-2'"
                :text-color="props.value === 'ACTIVE' ? 'green-6' : 'grey-6'"
                class="status-pill text-bold"
              >
                <div class="pulse-dot q-mr-xs" v-if="props.value === 'ACTIVE'"></div>
                {{ props.value }}
              </q-badge>
            </q-td>
          </template>

          <!-- Custom Coordination/Location Column -->
          <template v-slot:body-cell-location="props">
            <q-td :props="props">
               <div class="text-slate-700 text-weight-medium">{{ props.row.location }}</div>
               <div class="text-grey-5" style="font-size: 10px;">{{ props.row.coordinates }}</div>
            </q-td>
          </template>

          <!-- Actions Column -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <div class="row justify-center q-gutter-x-sm no-wrap">
                <q-btn flat round dense color="blue-6" icon="settings_suggest" size="sm" @click="goToDetail(props.row)">
                   <q-tooltip>Konfigurasi Threshold</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="amber-7" icon="edit" size="sm" @click="openDialog(props.row)">
                   <q-tooltip>Edit Data</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="red-5" icon="delete_outline" size="sm" @click="confirmDelete(props.row)">
                   <q-tooltip>Hapus</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useStationStore } from 'src/stores/station';

const router = useRouter();
const $q = useQuasar();
const stationStore = useStationStore();

const showDialog = ref(false);
const isEdit = ref(false);
const editId = ref(null);

const initialForm = {
  station_id: '',
  name: '',
  hardware_type: 'ROVER',
  status: 'ACTIVE',
  description: '',
  location: '',
  lng: '',
  lat: '',
  // Mock fields for now as they are not in the current backend DTO
  merk: '',
  model: '',
  sn: '',
  protocol: 'NTRIP',
  ip: '',
  port: '2101',
  install_date: '',
  height: ''
};

const form = ref({ ...initialForm });

const rows = computed(() => stationStore.stations);
const loading = computed(() => stationStore.loading);

onMounted(() => {
  stationStore.fetchStations().catch(() => {
    $q.notify({ type: 'negative', message: 'Gagal memuat data stasiun' });
  });
});

const openDialog = (data = null) => {
  if (data) {
    isEdit.value = true;
    editId.value = data.id;
    form.value = { 
      ...initialForm, 
      station_id: data.station_id,
      name: data.name,
      hardware_type: data.hardware_type,
      status: data.status,
      description: data.description || '',
      location: data.location,
      lng: data.longitude,
      lat: data.latitude
    };
  } else {
    isEdit.value = false;
    editId.value = null;
    form.value = { ...initialForm };
  }
  showDialog.value = true;
};

const stats = computed(() => [
  { label: 'Total Station', value: stationStore.totalStations, icon: 'sensors', color: 'blue' },
  { label: 'Base Station', value: stationStore.baseStations, icon: 'satellite_alt', color: 'indigo' },
  { label: 'Rover Active', value: stationStore.activeRovers, icon: 'cell_tower', color: 'green' },
  { label: 'In Maintenance', value: stationStore.maintenanceStations, icon: 'handyman', color: 'orange' }
]);

const saveStation = async () => {
  try {
    const payload = {
      station_id: form.value.station_id,
      name: form.value.name,
      latitude: parseFloat(form.value.lat),
      longitude: parseFloat(form.value.lng),
      location: form.value.location,
      description: form.value.description,
      status: form.value.status.toUpperCase(),
      hardware_type: form.value.hardware_type.toUpperCase()
    };

    if (isEdit.value) {
      await stationStore.updateStation(editId.value, payload);
      $q.notify({ type: 'positive', message: 'Data station diperbarui', position: 'top' });
    } else {
      await stationStore.createStation(payload);
      $q.notify({ type: 'positive', message: 'Station baru berhasil didaftarkan', position: 'top' });
    }
    showDialog.value = false;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Gagal menyimpan data station'
    });
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus stasiun <strong>${row.name}</strong>? Tindakan ini tidak dapat dibatalkan.`,
    html: true,
    persistent: true,
    ok: { flat: true, label: 'Hapus', color: 'red-6', noCaps: true, class: 'text-weight-bold' },
    cancel: { flat: true, label: 'Batalkan', color: 'grey-7', noCaps: true }
  }).onOk(async () => {
    try {
      await stationStore.deleteStation(row.id);
      $q.notify({ type: 'positive', message: 'Station telah dihapus', icon: 'delete', position: 'top' });
    } catch {
      $q.notify({ type: 'negative', message: 'Gagal menghapus station' });
    }
  });
};

const columns = [
  { name: 'pairing', align: 'left', label: 'STATION INFO', field: 'name' },
  { name: 'location', align: 'left', label: 'LOKASI / KOORDINAT', field: 'location' },
  { name: 'lastActivity', align: 'left', label: 'AKTIVITAS TERAKHIR', field: 'lastActivity' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'actions', align: 'center', label: 'AKSI', field: 'actions' }
];

const goToDetail = (row) => {
  router.push(`/dashboard/station/${encodeURIComponent(row.name)}`);
};
</script>

<style lang="scss" scoped>
.border-light {
  border: 1px solid #f1f5f9;
}

.border-radius-lg { border-radius: 12px; }
.border-radius-md { border-radius: 8px; }
.border-radius-sm { border-radius: 6px; }

.border-dashed {
  border: 2px dashed #e2e8f0;
}

.hover-bg-grey-1:hover {
  background: #f8fafc;
}

.photo-upload-container {
  transition: all 0.2s ease;
  min-height: 120px;
}

.mini-badge {
  font-size: 8px;
  padding: 2px 4px;
  min-height: auto;
}

.status-pill {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 10px;
  display: inline-flex;
  align-items: center;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 1; }
  70% { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(0.9); opacity: 0; }
}

.premium-management-table {
  background: white;
  
  :deep(th) {
    font-size: 11px;
    color: #94a3b8;
    font-weight: 700;
    padding: 16px 16px;
    border-bottom: 2px solid #f8fafc;
  }
  
  :deep(td) {
    font-size: 13px;
    padding: 16px 16px;
    color: #475569;
  }

  :deep(tr:hover) {
    background: #f8fafc;
  }
}

.btn-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
}

.text-slate-800 { color: #1e293b; }
.text-slate-900 { color: #0f172a; }

.bordered-light {
  border: 1px solid #e2e8f0;
}

.custom-input-filled {
  :deep(.q-field__inner) {
    .q-field__control {
      background-color: #f1f5f9 !important;
      border-radius: 8px;
      min-height: 42px;
      &:before {
        border-bottom: none !important;
      }
      &:after {
        display: none;
      }
    }
    .q-field__native {
      color: #334141;
    }
    ::placeholder {
      color: #94a3b8;
      opacity: 1;
    }
  }
}

.block {
  display: block;
}

.letter-spacing-1 {
  letter-spacing: 0.05em;
}
</style>
