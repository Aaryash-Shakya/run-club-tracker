<template>
	<div class="container mx-auto px-4 py-6">
		<h1 class="mb-8 text-center text-3xl font-bold">Activity Visualization</h1>

		<div v-if="loading" class="flex h-64 items-center justify-center">
			<div class="text-lg">Loading activities...</div>
		</div>

		<div v-else-if="error" class="text-center text-red-500">
			<p>Error loading data: {{ error }}</p>
		</div>

		<div v-else class="space-y-8">
			<!-- Test Visualization Section -->
			<div class="bg-surface rounded-lg p-2 shadow-md">
				<!-- Simple Bar Chart Representation -->
				<BarChartRace :data="activitiesArray" class="h-fit w-full" />
			</div>

			<!-- Activities Summary -->
			<div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
				<div class="bg-surface rounded-lg p-4 text-center">
					<div class="text-2xl font-bold text-green-400">{{ activities.length }}</div>
					<div class="text-muted-light text-sm">Total Activities</div>
				</div>
				<div class="bg-surface rounded-lg p-4 text-center">
					<div class="text-2xl font-bold text-blue-400">
						{{ totalDistance.toFixed(1) }} km
					</div>
					<div class="text-muted-light text-sm">Total Distance</div>
				</div>
				<div class="bg-surface rounded-lg p-4 text-center">
					<div class="text-2xl font-bold text-yellow-400">{{ validActivities }}</div>
					<div class="text-muted-light text-sm">Valid Activities</div>
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

const generateDateIndex = (dateString: string) => {
	const dt = new Date(dateString)
	// Convert to Asia/Kathmandu timezone offset (+5:45)
	const kathmanduOffset = 5.75 * 60 // in minutes
	const utc = dt.getTime() + dt.getTimezoneOffset() * 60000
	const kathmanduTime = new Date(utc + kathmanduOffset * 60000)

	const hour = kathmanduTime.getHours()
	let suffix = ''
	if (hour >= 4 && hour < 12) {
		suffix = 'morning'
	} else if (hour >= 12 && hour < 20) {
		suffix = 'day'
	} else {
		suffix = 'night'
	}
	const year = kathmanduTime.getFullYear()
	const month = String(kathmanduTime.getMonth() + 1).padStart(2, '0')
	const day = String(kathmanduTime.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}-${suffix}`
}

// Sorted activities by date (ascending)
const sortedActivities = computed(() => {
	return [...activities.value].sort(
		(a, b) => new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime(),
	)
})

// Create one array for all valid activities: [Distance, Id, Name, Date]
const activitiesArray = computed(() => {
	const result: Array<[number, string, string, string]> = []

	sortedActivities.value.forEach((activity) => {
		// Only include valid activities
		if (activity.isValid) {
			const userId = activity.user._id
			let userName = ''
			if (activity.user.firstName.split(' ').length > 1) {
				const formattedFirstName = activity.user.firstName.split(' ')[0]
				userName = `${formattedFirstName} ${activity.user.lastName}.`
			} else {
				userName = `${activity.user.firstName} ${activity.user.lastName}`
			}
			const distanceKm = activity.distance / 1000 // Convert to km
			const dateIndex = generateDateIndex(activity.activityDate.toString())

			result.push([distanceKm, userId, userName, dateIndex])
		}
	})

	return result
})

onMounted(() => {
	fetchActivities()
})
</script>
