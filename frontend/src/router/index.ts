import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RunnersView from '../views/RunnersView.vue'
import RulesView from '@/views/RulesView.vue'

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
    {
      path: '/rules',
      name: 'rules',
      component: RulesView,
    },
  ],
})

export default router
