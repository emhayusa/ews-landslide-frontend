<template>
  <q-layout>
    <q-page-container>
      <q-page class="login-page flex flex-center">
        <q-card class="login-card no-shadow border-radius-lg">
          <q-card-section class="text-center q-pa-xl">
            <!-- Logo Section -->
            <div class="logo-container q-mb-md">
              <q-avatar size="100px" square class="logo-avatar">
                <img src="~assets/ews_logo.png" alt="EWS Logo" />
              </q-avatar>
            </div>

            <!-- Title Section -->
            <div class="text-h4 text-weight-bold text-primary-gradient q-mb-xs">
              EWS Landslide
            </div>
            <div class="text-subtitle2 text-muted-flat q-mb-lg">
              Early Warning System - Landslide Monitoring
            </div>

            <q-separator class="q-mb-xl opacity-20" />

            <!-- Form Section -->
            <q-form @submit="onLogin" class="q-gutter-md">
              <div class="form-group">
                <label class="text-weight-medium text-slate-700 q-mb-xs block text-left">Username</label>
                <q-input
                  v-model="username"
                  placeholder=""
                  filled
                  dense
                  class="custom-input"
                  color="primary"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" size="20px" color="blue-grey-4" />
                  </template>
                </q-input>
              </div>

              <div class="form-group q-mt-md">
                <label class="text-weight-medium text-slate-700 q-mb-xs block text-left">Password</label>
                <q-input
                  v-model="password"
                  type="password"
                  placeholder=""
                  filled
                  dense
                  class="custom-input"
                  color="primary"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" size="20px" color="blue-grey-4" />
                  </template>
                </q-input>
              </div>

              <div class="q-mt-xl">
                <q-btn
                  label="Masuk"
                  icon-right="arrow_forward"
                  type="submit"
                  class="full-width btn-login-gradient text-capitalize"
                  unelevated
                  padding="12px"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const loading = ref(false);

const onLogin = async () => {
  if (!username.value || !password.value) {
    $q.notify({
      type: 'negative',
      message: 'Username and password are required',
      position: 'top'
    });
    return;
  }

  loading.value = true;
  try {
    const success = await authStore.login(username.value, password.value);
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Login Berhasil',
        position: 'top'
      });
      router.push('/dashboard');
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Login Gagal. Periksa kembali kredensial Anda.',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  background-color: #f8fafc;
}

.login-card {
  width: 100%;
  max-width: 440px;
  border-radius: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
}

.text-primary-gradient {
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-muted-flat {
  color: #94a3b8;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.text-slate-700 {
  color: #334155;
  font-size: 0.875rem;
}

.block {
  display: block;
}

.custom-input {
  :deep(.q-field__inner) {
    .q-field__control {
      background-color: #f1f5f9 !important;
      border-radius: 12px;
      &:before {
        border-bottom: none !important;
      }
      &:after {
        display: none;
      }
    }
  }
}

.btn-login-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: white;
  border-radius: 14px;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  }
}

.logo-avatar {
  background: white;
  padding: 12px;
  border-radius: 18px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

.opacity-20 {
  opacity: 0.2;
}
</style>
