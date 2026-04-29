<template>
  <q-page class="q-pa-lg">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="column">
        <div class="text-h4 text-weight-bold text-slate-800">Kelola User</div>
        <div class="text-subtitle2 text-grey-6 mt-xs">Tambah User baru atau edit dan hapus User lama</div>
      </div>
      <q-btn
        icon="add"
        label="Tambah User"
        class="border-radius-md q-px-md text-capitalize text-white btn-gradient"
        unelevated
        @click="openAddDialog"
      />
    </div>

    <!-- Dialog Tambah User -->
    <q-dialog v-model="showAddDialog" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 550px; max-width: 90vw;" class="border-radius-lg no-shadow">
        <q-card-section class="row items-center q-pa-lg border-bottom-light">
          <div class="text-h6 text-weight-bold flex items-center text-slate-900">
            <q-icon :name="isEdit ? 'edit' : 'add'" size="24px" class="q-mr-sm text-slate-900" style="font-weight: 800;" />
            {{ isEdit ? 'Edit User' : 'Tambah User Baru' }}
          </div>
          <q-space />
          <q-btn icon="close" flat dense v-close-popup color="grey-6" class="bordered-light q-pa-xs border-radius-md" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <!-- Nama Lengkap -->
          <div class="form-group q-mb-lg">
            <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Nama Lengkap</label>
            <q-input
              v-model="newUser.nama"
              placeholder="Masukkan nama lengkap user"
              filled
              dense
              class="custom-input-filled"
            />
          </div>

          <!-- row untuk Username & Email -->
          <div class="row q-col-gutter-x-lg q-mb-lg">
            <div class="col-12 col-sm-6">
              <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Username</label>
              <q-input
                v-model="newUser.username"
                placeholder="contoh: budi1703"
                filled
                dense
                class="custom-input-filled"
              />
            </div>
            <div class="col-12 col-sm-6">
              <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Email</label>
              <q-input
                v-model="newUser.email"
                placeholder="email user"
                filled
                dense
                class="custom-input-filled"
              />
            </div>
          </div>

          <!-- row untuk Password & Role -->
          <div class="row q-col-gutter-x-lg q-mb-lg">
            <div class="col-12 col-sm-6">
              <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Password</label>
              <q-input
                v-model="newUser.password"
                type="password"
                :placeholder="isEdit ? 'Kosongkan jika tidak diubah' : 'Masukkan password'"
                filled
                dense
                class="custom-input-filled"
              />
            </div>
            <div class="col-12 col-sm-6">
              <label class="text-slate-800 block q-mb-sm" style="font-size: 14px">Role</label>
              <q-select
                v-model="newUser.role"
                :options="['admin', 'operator']"
                filled
                dense
                class="custom-input-filled text-capitalize"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator color="grey-3" style="height: 1px;" />

        <q-card-actions align="right" class="q-pa-lg">
          <q-btn no-caps flat label="Batal" color="slate-900" class="q-px-lg border-radius-md bordered-light text-weight-bold" v-close-popup />
          <q-btn no-caps :label="isEdit ? 'Simpan' : 'Tambah'" class="q-px-lg border-radius-md text-white btn-gradient text-weight-bold" unelevated @click="saveUser" />
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
          row-key="username"
          class="user-table"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
          :loading="loading"
        >
          <!-- ... (keep existing template slots) ... -->
          <template v-slot:body-cell-nama="props">
            <q-td :props="props">
              <div class="row items-center no-wrap">
                <q-avatar size="32px" :color="props.row.avatarColor" text-color="white" class="q-mr-md" rounded>
                  <span class="text-weight-bold" style="font-size: 11px;">{{ props.row.initials }}</span>
                </q-avatar>
                <div class="text-weight-bold text-slate-800">{{ props.row.nama }}</div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-username="props">
            <q-td :props="props">
              <q-badge color="grey-2" text-color="grey-8" class="q-pa-xs border-radius-sm">
                <code class="text-weight-medium">{{ props.value }}</code>
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-role="props">
            <q-td :props="props">
              <q-badge
                :color="props.value === 'admin' ? 'purple-1' : 'cyan-1'"
                :text-color="props.value === 'admin' ? 'purple-8' : 'cyan-8'"
                class="q-px-md q-py-xs text-weight-bold uppercase"
                rounded
              >
                {{ props.value }}
              </q-badge>
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
                :color="props.row.role === 'admin' ? 'grey-4' : 'red-5'"
                :class="props.row.role === 'admin' ? 'bg-grey-1' : 'bg-red-1'"
                :disable="props.row.role === 'admin'"
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
import { useUserStore } from 'src/stores/user';

const $q = useQuasar();
const userStore = useUserStore();

const showAddDialog = ref(false);
const isEdit = ref(false);
const editUsername = ref(null);

const newUser = reactive({
  nama: '',
  username: '',
  email: '',
  password: '',
  role: 'operator'
});

const rows = computed(() => userStore.users);
const loading = computed(() => userStore.loading);

onMounted(() => {
  userStore.fetchUsers().catch(() => {
    $q.notify({ type: 'negative', message: 'Gagal memuat data user' });
  });
});

const openAddDialog = () => {
  isEdit.value = false;
  editUsername.value = null;
  Object.assign(newUser, {
    nama: '',
    username: '',
    email: '',
    password: '',
    role: 'operator'
  });
  showAddDialog.value = true;
};

const openEditDialog = (row) => {
  isEdit.value = true;
  editUsername.value = row.username;
  Object.assign(newUser, {
    nama: row.nama,
    username: row.username,
    email: row.email,
    password: '', // Leave empty for no change
    role: row.role.toLowerCase()
  });
  showAddDialog.value = true;
};

const saveUser = async () => {
  if (!newUser.username || !newUser.email || (!isEdit.value && !newUser.password)) {
    $q.notify({ type: 'negative', message: 'Semua field wajib diisi' });
    return;
  }

  try {
    const payload = {
      full_name: newUser.nama,
      username: newUser.username,
      email: newUser.email,
      password: newUser.password || undefined,
      role: newUser.role.toLowerCase()
    };

    if (isEdit.value) {
      await userStore.updateUser(editUsername.value, payload);
      $q.notify({ color: 'positive', message: 'User berhasil diperbarui', position: 'top' });
    } else {
      await userStore.createUser(payload);
      $q.notify({ color: 'positive', message: 'User baru telah ditambahkan', position: 'top' });
    }
    showAddDialog.value = false;
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Gagal menyimpan user'
    });
  }
};

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakan Anda yakin ingin menghapus user <strong>${row.nama}</strong>?`,
    html: true,
    cancel: { label: 'Batal', color: 'slate-800', flat: true, noCaps: true },
    ok: { label: 'Hapus User', color: 'red-5', unelevated: true, noCaps: true },
    persistent: true
  }).onOk(async () => {
    try {
      await userStore.deleteUser(row.username);
      $q.notify({ color: 'positive', message: 'User berhasil dihapus', position: 'top' });
    } catch {
      $q.notify({ type: 'negative', message: 'Gagal menghapus user' });
    }
  });
};

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA', field: 'nama' },
  { name: 'username', align: 'left', label: 'USERNAME', field: 'username' },
  { name: 'email', align: 'left', label: 'EMAIL', field: 'email' },
  { name: 'role', align: 'center', label: 'ROLE', field: 'role' },
  { name: 'dibuat', align: 'left', label: 'DIBUAT', field: 'dibuat' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' }
];
</script>

<style lang="scss" scoped>
.btn-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
}

.text-slate-800 { color: #1e293b; }

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

.border-radius-sm {
  border-radius: 4px;
}

.bg-orange-1 { background-color: #fff7ed; }
.bg-grey-1 { background-color: #f8fafc; }
.bg-purple-1 { background-color: #f5f3ff; }
.bg-cyan-1 { background-color: #ecfeff; }
.bg-red-1 { background-color: #fef2f2; }

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
