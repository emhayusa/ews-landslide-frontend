<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg">
      <!-- Left Column: Profile Card -->
      <div class="col-12 col-md-4">
        <q-card class="profile-card no-shadow border-radius-lg overflow-hidden text-center">
          <!-- Gradient Header -->
          <div class="profile-header-gradient"></div>
          
          <div class="flex flex-center" style="margin-top: -50px; position: relative; z-index: 2;">
            <div class="avatar-circle">
              <span class="avatar-text">{{ userInitials }}</span>
            </div>
          </div>

          <div class="text-center q-mt-md">
            <div class="text-h6 text-weight-bolder text-slate-900" style="font-size: 22px;">{{ authStore.user?.full_name || 'Loading...' }}</div>
            <q-badge class="role-badge q-mt-sm" :label="authStore.user?.role?.toUpperCase() || '...'" />
          </div>

          <div class="q-px-xl q-pt-lg q-pb-xl row q-col-gutter-sm">
            <div class="col-12">
              <div class="join-box">
                <div class="text-caption text-weight-bold uppercase letter-spacing-1 join-label">BERGABUNG</div>
                <div class="text-h6 text-weight-bolder text-slate-900 q-mt-xs">{{ joinedDate }}</div>
              </div>
            </div>
          </div>
        </q-card>
      </div>

      <!-- Right Column: Settings Form -->
      <div class="col-12 col-md-8 q-gutter-y-lg">
        <!-- Contact Information -->
        <q-card class="settings-card border-radius-lg no-shadow">
          <q-card-section class="q-pa-md row items-center border-bottom-light">
            <q-icon name="person" size="20px" class="q-mr-sm text-slate-800" />
            <div class="text-subtitle1 text-weight-bolder text-slate-800" style="font-size: 15px;">Informasi Kontak</div>
          </q-card-section>
          
          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-x-lg q-col-gutter-y-md">
              <div class="col-12 col-sm-12">
                <label class="text-weight-bold text-slate-800 block q-mb-sm" style="font-size: 13px;">Nama Lengkap</label>
                <q-input v-model="profileData.full_name" filled dense class="custom-input-filled" placeholder="Nama Lengkap" />
              </div>
              <div class="col-12 col-sm-6">
                <label class="text-weight-bold text-slate-800 block q-mb-sm" style="font-size: 13px;">Username</label>
                <q-input v-model="profileData.username" filled dense class="custom-input-filled" placeholder="Username" />
              </div>
              <div class="col-12 col-sm-6">
                <label class="text-weight-bold text-slate-800 block q-mb-sm" style="font-size: 13px;">Email Address</label>
                <q-input v-model="profileData.email" filled dense class="custom-input-filled" placeholder="Email" />
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md q-pt-none">
            <q-btn no-caps label="Simpan Profil" icon="save" class="q-px-lg text-white btn-gradient" style="border-radius: 8px; font-weight: 600;" unelevated @click="saveProfile" />
          </q-card-actions>
        </q-card>

        <!-- Password Settings -->
        <q-card class="settings-card border-radius-lg no-shadow">
          <q-card-section class="q-pa-md row items-center border-bottom-light">
            <q-icon name="lock" size="20px" class="q-mr-sm text-slate-800" />
            <div class="text-subtitle1 text-weight-bolder text-slate-800" style="font-size: 15px;">Ubah Password</div>
          </q-card-section>

          <q-card-section class="q-pa-md q-gutter-y-md">
            <div class="row q-col-gutter-x-lg q-col-gutter-y-md">
              <div class="col-12 col-sm-6">
                <label class="text-weight-bold text-slate-800 block q-mb-sm" style="font-size: 13px;">Password Baru</label>
                <q-input v-model="passwordForm.new" type="password" placeholder="Minimal 6 karakter" filled dense class="custom-input-filled" />
              </div>
              <div class="col-12 col-sm-6">
                <label class="text-weight-bold text-slate-800 block q-mb-sm" style="font-size: 13px;">Konfirmasi Password</label>
                <q-input v-model="passwordForm.confirm" type="password" placeholder="Ketik ulang password baru" filled dense class="custom-input-filled" />
              </div>
            </div>
          </q-card-section>

          <q-card-actions class="q-pa-md q-pt-none">
            <q-btn no-caps label="Update Password" icon="key" class="q-px-lg text-white btn-gradient-orange" style="border-radius: 8px; font-weight: 600;" unelevated @click="updatePassword" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, onMounted, computed, watch } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar, date } from 'quasar';
import UserService from 'src/services/UserService';

const $q = useQuasar();
const authStore = useAuthStore();

const profileData = reactive({
  username: '',
  email: '',
  full_name: ''
});

const passwordForm = reactive({
  new: '',
  confirm: ''
});

const userInitials = computed(() => {
  if (!authStore.user?.full_name) return '??';
  const names = authStore.user.full_name.trim().split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return names[0].substring(0, 2).toUpperCase();
});

const joinedDate = computed(() => {
  if (!authStore.user?.created_at) return '-';
  return date.formatDate(authStore.user.created_at, 'DD MMMM YYYY');
});

const syncProfileData = () => {
  if (authStore.user) {
    profileData.username = authStore.user.username || '';
    profileData.email = authStore.user.email || '';
    profileData.full_name = authStore.user.full_name || '';
  }
};

onMounted(async () => {
  await authStore.fetchMe();
  syncProfileData();
});

watch(() => authStore.user, syncProfileData, { deep: true });

const saveProfile = async () => {
  if (!profileData.full_name || !profileData.username || !profileData.email) {
    $q.notify({ type: 'negative', message: 'Semua field wajib diisi' });
    return;
  }

  try {
    const payload = {
      username: profileData.username,
      email: profileData.email,
      full_name: profileData.full_name,
      role: authStore.user.role
    };
    
    await UserService.update(authStore.user.id, payload);
    $q.notify({ type: 'positive', message: 'Profil berhasil diperbarui' });
    await authStore.fetchMe();
  } catch (error) {
    $q.notify({ 
      type: 'negative', 
      message: error.response?.data?.error || 'Gagal memperbarui profil' 
    });
  }
};

const updatePassword = async () => {
  if (!passwordForm.new || passwordForm.new.length < 6) {
    $q.notify({ type: 'negative', message: 'Password minimal 6 karakter' });
    return;
  }
  if (passwordForm.new !== passwordForm.confirm) {
    $q.notify({ type: 'negative', message: 'Konfirmasi password tidak cocok' });
    return;
  }

  try {
    await UserService.update(authStore.user.id, {
      ...authStore.user,
      password: passwordForm.new
    });
    $q.notify({ type: 'positive', message: 'Password berhasil diperbarui' });
    passwordForm.new = '';
    passwordForm.confirm = '';
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.error || 'Gagal update password' });
  }
};
</script>

<style lang="scss" scoped>
.btn-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
}
.btn-gradient-orange {
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
}
.text-slate-800 { color: #1e293b; }
.text-slate-700 { color: #334155; }
.bg-slate-50 { background-color: #f8fafc; }

.settings-card {
  background: white;
  border: 1px solid rgba(0,0,0,0.03);
}

.profile-card {
  background: white;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01) !important;
  border: 1px solid rgba(0,0,0,0.03);
}

.profile-header-gradient {
  height: 140px;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
}

.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px -1px rgba(0, 0, 0, 0.05);
}

.avatar-text {
  font-size: 34px;
  font-weight: 800;
  color: #0ea5e9;
  letter-spacing: -1px;
}

.role-badge {
  background-color: #f5f3ff !important;
  color: #8b5cf6 !important;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.join-box {
  background-color: #f1f5f9;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.join-label {
  color: #94a3b8;
  font-size: 11px;
}

.custom-input-filled {
  :deep(.q-field__inner) {
    .q-field__control {
      background-color: #f1f5f9 !important;
      border-radius: 8px;
      min-height: 42px;
      &:before { border-bottom: none !important; }
      &:after { display: none; }
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

.border-bottom-light { border-bottom: 1px solid #f1f5f9; }
.border-radius-md { border-radius: 12px; }
.border-radius-lg { border-radius: 16px; }

.block { display: block; }
.letter-spacing-1 { letter-spacing: 0.05em; }
.uppercase { text-transform: uppercase; }
</style>
