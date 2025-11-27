import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/about', name: 'About', component: () => import('../views/About.vue') },
  { path: '/budget', name: 'Budget', component: () => import('../views/Budget.vue') },
  { path: '/theme', name: 'Theme', component: () => import('../views/Theme.vue') },
  { path: '/invite', name: 'Invite', component: () => import('../views/Invite.vue') },
  { path: '/track', name: 'Track', component: () => import('../views/Track.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
