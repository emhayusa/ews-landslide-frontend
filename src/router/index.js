import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import AuthService from 'src/services/AuthService'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to, from, next) => {
    const token = localStorage.getItem('token')
    
    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        
        // If authenticated and trying to access login page (/), redirect to dashboard
        if (to.path === '/') {
          await AuthService.validateToken()
          return next('/dashboard')
        }

        // RBAC Check
        if (to.meta.role && to.meta.role !== user.role) {
          return next('/dashboard') // Or some error page
        }

        next()
      } catch {
        // Token is invalid or expired
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (to.path !== '/') return next('/')
        next()
      }
    } else {
      if (to.path !== '/') {
        return next('/')
      }
      next()
    }
  })

  return Router
})
