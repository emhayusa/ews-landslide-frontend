<template>
  <q-layout view="lHh Lpr lFf" class="bg-slate-50">
    <!-- Sidebar Menu (Penuh sampai atas) -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="260"
      class="bg-white"
    >
      <div class="column full-height">
        <!-- Drawer Header: Logo Area -->
        <div class="q-pa-md flex items-center border-bottom-light" style="height: 64px;">
          <q-avatar square size="32px" class="q-mr-sm">
            <img src="~assets/ews_logo.png" />
          </q-avatar>
          <div class="column justify-center mt-xs">
            <div class="text-weight-bold text-primary" style="font-size: 15px; line-height: 1.1;">EWS Landslide</div>
            <div class="text-grey-5 uppercase text-weight-bold" style="font-size: 9px; letter-spacing: 0.2px;">Monitoring System</div>
          </div>
        </div>

        <!-- Menu List -->
        <q-list class="q-mt-md q-px-sm">
          <q-item
            v-for="item in menuItems"
            :key="item.title"
            clickable
            v-ripple
            :to="item.link"
            class="menu-item border-radius-md q-mb-xs"
            active-class="menu-active"
          >
            <q-item-section avatar min-width="40px" class="q-pr-sm">
              <!-- Using dual tone or multi-color logic based on menu title to mimic the image -->
              <div class="icon-container" :class="'icon-bg-' + item.colorClass">
                <q-icon :name="item.icon" size="20px" :class="'text-' + item.colorClass" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold" style="font-size: 13px;">{{ item.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Logout Section -->
        <q-list class="q-px-sm">
          <q-item
            clickable
            v-ripple
            @click="logout"
            class="menu-item border-radius-md"
          >
            <q-item-section avatar min-width="40px" class="q-pr-sm">
              <div class="icon-container-transparent">
                 <q-icon name="logout" size="20px" class="text-orange-9" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-slate-800" style="font-size: 13px;">Keluar</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-space />

        <!-- User Profile Section -->
        <div class="q-pa-md border-top-light" style="background-color: #fafbfd;" v-if="authStore.user">
          <div class="row items-center no-wrap">
            <q-avatar color="blue-6" text-color="white" size="36px" class="q-mr-md" rounded>
              <span class="text-weight-bold" style="font-size: 14px;">{{ authStore.user.full_name?.substring(0, 2).toUpperCase() || '??' }}</span>
            </q-avatar>
            <div class="column">
              <div class="text-weight-bold text-slate-900" style="font-size: 14px; line-height: 1.2;">{{ authStore.user.full_name }}</div>
              <div class="text-grey-6 text-capitalize" style="font-size: 11px;">{{ authStore.user.role }}</div>
            </div>
          </div>
        </div>
      </div>
    </q-drawer>

    <!-- Header Toolbar -->
    <q-header class="bg-white text-slate-800 border-bottom-light" height-hint="64">
      <q-toolbar class="q-px-lg" style="height: 64px">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm lt-md"
        />

        <div class="text-h6 text-weight-bolder text-slate-900 gt-xs" style="font-size: 16px;">
          <template v-if="$route.meta.title">
            <template v-if="$route.meta.title.includes(' / ')">
              <span class="text-weight-bold">{{ $route.meta.title.split(' / ')[0] }}</span>
              <span class="text-grey-5 q-mx-sm">/</span>
              <span class="text-blue-6">{{ $route.meta.title.split(' / ')[1] }}</span>
            </template>
            <template v-else>
              {{ $route.meta.title }}
            </template>
          </template>
          <template v-else>
            EWS Landslide Monitoring
          </template>
        </div>

        <q-space />

        <div class="flex items-center no-wrap">
          <div class="text-grey-6 text-weight-medium" style="font-size: 12px; letter-spacing: 0.3px;">
            {{ currentTime }}
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { date } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const leftDrawerOpen = ref(false);
const currentTime = ref('');

const menuItems = computed(() => {
  const baseMenu = [
    { title: 'Dashboard', icon: 'dashboard', colorClass: 'blue', link: '/dashboard' },
    { title: 'Manajemen User', icon: 'manage_accounts', colorClass: 'indigo', link: '/users', adminOnly: true },
    { title: 'Manajemen Site', icon: 'location_on', colorClass: 'cyan', link: '/sites', roles: ['admin', 'operator'] },
    { title: 'Manajemen Station', icon: 'sensors', colorClass: 'purple', link: '/stations', roles: ['admin', 'operator'] },
    { title: 'Profil', icon: 'person', colorClass: 'amber', link: '/profile' }
  ];

  return baseMenu.filter(item => {
    if (item.adminOnly && authStore.user?.role !== 'admin') return false;
    if (item.roles && !item.roles.includes(authStore.user?.role)) return false;
    return true;
  });
});

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function logout() {
  authStore.logout();
  router.push('/');
}

let timer;
const updateClock = () => {
  currentTime.value = date.formatDate(Date.now(), 'DD MMM YYYY, HH.mm.ss');
};

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style lang="scss">
.bg-slate-50 {
  background-color: #f1f5f9;
}

.text-slate-800 { color: #1e293b !important; }
.text-slate-900 { color: #0f172a !important; }

/* Custom Drawer Width Adjustments */
.q-drawer {
  background: white;
}

/* Border Helpers */
.border-bottom-light {
  border-bottom: 1px solid #e2e8f0;
}
.border-top-light {
  border-top: 1px solid #e2e8f0;
}

/* Menu Item Styles */
.menu-item {
  color: #475569;
  min-height: 44px;
  padding: 8px 16px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f8fafc;
  }
}

.menu-active {
  background-color: #f0f9ff !important;
  color: #0ea5e9 !important;
  
  .text-weight-bold {
    color: #0ea5e9 !important;
  }
}

.border-radius-md {
  border-radius: 8px;
}

/* Icon Customization */
.icon-container {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-container-transparent {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Subtle background for icons */
.icon-bg-blue { background: rgba(14, 165, 233, 0.1); }
.icon-bg-indigo { background: rgba(99, 102, 241, 0.1); }
.icon-bg-purple { background: rgba(168, 85, 247, 0.1); }
.icon-bg-cyan { background: rgba(6, 182, 212, 0.1); }
.icon-bg-amber { background: rgba(245, 158, 11, 0.1); }

/* Global Override for Header Header Shadow */
.q-header {
  box-shadow: none !important;
}
</style>

