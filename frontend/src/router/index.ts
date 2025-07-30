import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RunnersView from '../views/RunnersView.vue'
import RulesView from '@/views/RulesView.vue'
import RunnerActivitiesView from '@/views/RunnerActivitiesView.vue'
import VisualizationView from '@/views/VisualizationView.vue'

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
			path: '/runners/:runnerId/activities',
			name: 'runner-activities',
			component: RunnerActivitiesView,
		},
		{
			path: '/rules',
			name: 'rules',
			component: RulesView,
		},
		{
			path: '/visualization',
			name: 'visualization',
			component: VisualizationView,
		},
	],
})

export default router
