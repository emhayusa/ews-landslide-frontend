<template>
  <q-page class="q-pa-lg">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="column">
        <div class="text-h4 text-weight-bold text-slate-800">Kelola Site</div>
        <div class="text-subtitle2 text-grey-6 mt-xs">Manajemen lokasi pengamatan dan pengelompokan stasiun</div>
      </div>
      <q-btn
        icon="add"
        label="Tambah Site"
        class="border-radius-md q-px-md text-capitalize text-white btn-gradient"
        unelevated
        @click="openAddDialog"
      />
    </div>

    <!-- Dialog Tambah/Edit Site -->
    <q-dialog v-model="showAddDialog" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 500px; max-width: 90vw;" class="border-radius-lg no-shadow">
        <q-card-section class="row items-center q-pa-lg border-bottom-light">
          <div class="text-h6 text-weight-bold flex items-center text-slate-900">
            <q-icon :name="isEdit ? 'edit' : 'add_location'" size="24px" class="q-mr-sm text-slate-900" style="font-weight: 800;" />
            {{ isEdit ? 'Edit Site' : 'Tambah Site Baru' }}
          </div>
          <q-space />
          <q-btn icon="close" flat dense v-close-popup color="grey-6" class="bordered-light q-pa-xs border-radius-md" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <!-- Nama Site -->
          <div class="form-group q-mb-lg">
            <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Nama Site</label>
            <q-input
              v-model="newSite.nama"
              placeholder="Masukkan nama site (contoh: Site Ungaran)"
              filled
              dense
              class="custom-input-filled"
            />
          </div>

          <!-- Lokasi -->
          <div class="form-group q-mb-lg">
            <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Lokasi / Wilayah</label>
            <q-input
              v-model="newSite.lokasi"
              placeholder="Kabupaten/Kecamatan"
              filled
              dense
              class="custom-input-filled"
            />
          </div>

          <!-- Keterangan -->
          <div class="form-group">
            <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Keterangan</label>
            <q-input
              v-model="newSite.keterangan"
              type="textarea"
              placeholder="Deskripsi tambahan tentang site ini"
              filled
              dense
              class="custom-input-filled"
              rows="3"
            />
          </div>
        </q-card-section>

        <q-separator color="grey-3" style="height: 1px;" />

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn no-caps flat label="Batal" color="slate-900" class="q-px-lg border-radius-md bordered-light text-weight-bold" v-close-popup />
          <q-btn no-caps :label="isEdit ? 'Simpan' : 'Tambah'" class="q-px-lg border-radius-md text-white btn-gradient text-weight-bold" unelevated @click="saveSite" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Table Section -->
    <q-card class="no-shadow border-radius-lg overflow-hidden position-relative">
      <q-card-section class="q-pa-none">
        <q-table
          flat
          :rows="rows"
          :columns="columns"
          row-key="id"
          class="user-table"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
          :loading="loading"
        >
          <template v-slot:body-cell-nama="props">
            <q-td :props="props">
              <div class="text-weight-bold text-slate-800">{{ props.row.nama }}</div>
              <div class="text-grey-5 text-caption">{{ props.row.lokasi || '-' }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-devices="props">
            <q-td :props="props">
              <div class="row q-gutter-x-md">
                <div class="column">
                  <span class="text-grey-6 text-caption uppercase text-weight-bold" style="font-size: 9px">Base</span>
                  <q-badge color="purple-1" text-color="purple-8" class="text-weight-bold">
                    {{ props.row.base_stations?.length || 0 }} Unit
                  </q-badge>
                </div>
                <div class="column">
                  <span class="text-grey-6 text-caption uppercase text-weight-bold" style="font-size: 9px">Rover</span>
                  <q-badge color="cyan-1" text-color="cyan-8" class="text-weight-bold">
                    {{ props.row.stations?.length || 0 }} Unit
                  </q-badge>
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="q-gutter-x-sm">
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="edit"
                color="orange-5"
                class="bg-orange-1"
                @click="openEditDialog(props.row)"
              />
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="delete"
                color="red-5"
                class="bg-red-1"
                @click="confirmDelete(props.row)"
              />
            </q-td>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useSiteStore } from 'src/stores/site';
import SiteService from 'src/services/SiteService';

const $q = useQuasar();
const siteStore = useSiteStore();

const showAddDialog = ref(false);
const isEdit = ref(false);
const editId = ref(null);

const newSite = reactive({
  nama: '',
  lokasi: '',
  keterangan: ''
});

const rows = computed(() => siteStore.sites);
const loading = computed(() => siteStore.loading);

onMounted(() => {
  siteStore.fetchSites().catch(() => {
    $q.notify({ type: 'negative', message: 'Gagal memuat data site' });
  });
});

const openAddDialog = () => {
  isEdit.value = false;
  editId.value = null;
  Object.assign(newSite, {
    nama: '',
    lokasi: '',
    keterangan: ''
  });
  showAddDialog.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(newSite, {
    nama: row.nama,
    lokasi: row.lokasi,
    keterangan: row.keterangan
  });
  showAddDialog.value = true;
};

const saveSite = async () => {
  if (!newSite.nama) {
    $q.notify({ type: 'negative', message: 'Nama Site wajib diisi' });
    return;
  }

  try {
    if (isEdit.value) {
      await SiteService.update(editId.value, newSite);
      $q.notify({ color: 'positive', message: 'Site berhasil diperbarui', position: 'top' });
    } else {
      await SiteService.create(newSite);
      $q.notify({ color: 'positive', message: 'Site baru telah ditambahkan', position: 'top' });
    }
    await siteStore.fetchSites();
    showAddDialog.value = false;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Gagal menyimpan site'
    });
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakan Anda yakin ingin menghapus site <strong>${row.nama}</strong>? Semua keterkaitan stasiun dengan site ini akan dilepas.`,
    html: true,
    cancel: { label: 'Batal', color: 'slate-800', flat: true, noCaps: true },
    ok: { label: 'Hapus Site', color: 'red-5', unelevated: true, noCaps: true },
    persistent: true
  }).onOk(async () => {
    try {
      await SiteService.delete(row.id);
      await siteStore.fetchSites();
      $q.notify({ color: 'positive', message: 'Site berhasil dihapus', position: 'top' });
    } catch {
      $q.notify({ type: 'negative', message: 'Gagal menghapus site' });
    }
  });
};

const columns = [
  { name: 'id', align: 'left', label: 'ID', field: 'id' },
  { name: 'nama', align: 'left', label: 'NAMA SITE', field: 'nama' },
  { name: 'devices', align: 'left', label: 'PERANGKAT TERHUBUNG', field: 'id' },
  { name: 'keterangan', align: 'left', label: 'KETERANGAN', field: 'keterangan' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' }
];
</script>

<style lang="scss" scoped>
.btn-gradient {
  background: linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%);
}

.text-slate-800 { color: #1e293b; }
.text-slate-900 { color: #0f172a; }

.user-table {
  background: white;
  
  :deep(th) {
    font-size: 10px;
    color: #64748b;
    font-weight: 700;
    padding: 16px 20px;
    border-bottom: 2px solid #f1f5f9;
    text-transform: uppercase;
  }
  
  :deep(td) {
    font-size: 13px;
    padding: 16px 20px;
    color: #475569;
  }
  
  :deep(tr:hover) {
    background: #f8fafc;
  }
}

.bg-orange-1 { background-color: #fff7ed; }
.bg-red-1 { background-color: #fef2f2; }
.bg-purple-1 { background-color: #f5f3ff; }
.bg-cyan-1 { background-color: #ecfeff; }

.border-radius-lg {
  border-radius: 20px;
}

.border-bottom-light {
  border-bottom: 1px solid #f1f5f9;
}

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
      color: #334155;
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
</style>
