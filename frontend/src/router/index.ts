import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RunnersView from '../views/RunnersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'leaderboard',
      component: HomeView,
    },
    {
      path: '/runners',
      name: 'runners',
      component: RunnersView,
    },
  ],
})

export default router
