<template>
	<div class="container mx-auto px-4 py-8">
		<h1 class="mb-8 text-center text-3xl font-bold">Activity Visualization</h1>

		<div v-if="loading" class="flex h-64 items-center justify-center">
			<div class="text-lg">Loading activities...</div>
		</div>

		<div v-else-if="error" class="text-center text-red-500">
			<p>Error loading data: {{ error }}</p>
		</div>

		<div v-else class="space-y-8">
			<!-- Test Visualization Section -->
			<div class="rounded-lg bg-white p-6 shadow-md">
				<h2 class="mb-4 text-2xl font-semibold">Test Visualization</h2>

				<!-- Simple Bar Chart Representation -->
				<BarChartRace :data="activitiesArray" class="h-fit w-full" />

				<!-- Activities Summary -->
				<div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
					<div class="rounded-lg bg-gray-50 p-4 text-center">
						<div class="text-2xl font-bold text-blue-600">{{ activities.length }}</div>
						<div class="text-sm text-gray-600">Total Activities</div>
					</div>
					<div class="rounded-lg bg-gray-50 p-4 text-center">
						<div class="text-2xl font-bold text-green-600">
							{{ totalDistance.toFixed(1) }} km
						</div>
						<div class="text-sm text-gray-600">Total Distance</div>
					</div>
					<div class="rounded-lg bg-gray-50 p-4 text-center">
						<div class="text-2xl font-bold text-purple-600">{{ validActivities }}</div>
						<div class="text-sm text-gray-600">Valid Activities</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import type { TActivityWithUser } from '@/types/activity'
import BarChartRace from '@/components/BarChartRace.vue'

const activities = ref<TActivityWithUser[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchActivities = async () => {
	try {
		loading.value = true
		error.value = null

		const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
		const response = await fetch(`${apiBaseUrl}/activities/july`)

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data: {
			activities: TActivityWithUser[]
		} = await response.json()
		activities.value = data.activities
	} catch (err) {
		error.value = err instanceof Error ? err.message : 'An unknown error occurred'
		console.error('Error fetching activities:', err)
	} finally {
		loading.value = false
	}
}

const totalDistance = computed(() => {
	return activities.value.reduce((sum, activity) => {
		if (activity.isValid) {
			return sum + activity.distance / 1000
		}
		return sum
	}, 0)
})

const validActivities = computed(() => {
	return activities.value.filter((activity) => activity.isValid).length
})

// Function to convert UTC date to Nepal time and format as YYYY-MM-DD
const convertToNepalDate = (dateString: string) => {
	const utcDate = new Date(dateString)
	// Nepal is UTC+5:45
	const nepalTime = new Date(utcDate.getTime() + (5 * 60 + 45) * 60 * 1000)
	return nepalTime.toISOString().split('T')[0]
}

// Sorted activities by date (ascending)
const sortedActivities = computed(() => {
	return [...activities.value].sort(
		(a, b) => new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime(),
	)
})

// Create one array for all valid activities: [Distance, Name, Date]
const activitiesArray = computed(() => {
	const result: Array<[number, string, string]> = []

	sortedActivities.value.forEach((activity) => {
		// Only include valid activities
		if (activity.isValid) {
			const userName = `${activity.user.firstName} ${activity.user.lastName}`
			const distanceKm = activity.distance / 1000 // Convert to km
			const nepalDate = convertToNepalDate(activity.activityDate.toString())

			result.push([distanceKm, userName, nepalDate])
		}
	})

	console.log('Activities Array:', result)
	return result
})

onMounted(() => {
	fetchActivities()
})
</script>
