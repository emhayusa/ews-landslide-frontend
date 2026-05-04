const routes = [
  {
    path: '/',
    component: () => import('pages/Auth/LoginPage.vue'),
  },
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Dashboard/DashboardPage.vue'), meta: { title: 'EWS Landslide Monitoring' } },
      {
        path: 'station/:id',
        component: () => import('pages/Dashboard/StationDetailPage.vue'),
        meta: { title: 'Dashboard / Konfigurasi Threshold Bahaya Parameter Sensor' }
      }
    ]
  },
  {
    path: '/users',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Users/UserManagementPage.vue'), meta: { title: 'Manajemen User', role: 'admin' } }
    ]
  },
  {
    path: '/stations',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Stations/StationManagementPage.vue'), meta: { title: 'Manajemen Station', roles: ['admin', 'operator'] } }
    ]
  },
  {
    path: '/sites',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Sites/SiteManagementPage.vue'), meta: { title: 'Manajemen Site', role: ['admin', 'operator'] } }
    ]
  },
  {
    path: '/profile',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Profile/ProfilePage.vue'), meta: { title: 'Profil' } }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
