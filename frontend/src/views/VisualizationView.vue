<template>
	<div class="container mx-auto px-4 py-6">
		<!-- Month Selector -->
		<div class="flex items-center justify-center">
			<div class="bg-surface flex items-center gap-2 rounded-lg p-3">
				<button
					@click="previousMonth"
					class="hover:text-accent-run hover:bg-soft flex cursor-pointer items-center rounded p-1 px-1 text-2xl text-white transition-colors"
				>
					&lt;
				</button>
				<span class="min-w-[160px] text-center font-medium text-white">
					{{ monthLabel }}
				</span>
				<button
					@click="nextMonth"
					class="hover:text-accent-run hover:bg-soft flex cursor-pointer items-center rounded p-1 px-1 text-2xl text-white transition-colors"
				>
					&gt;
				</button>
			</div>
		</div>

		<!-- Countdown -->
		<ChallengeCountDown :year="selectedYear" :month="selectedMonth" />

		<div v-if="loading" class="flex h-64 items-center justify-center">
			<div class="text-lg">Loading activities...</div>
		</div>

		<div v-else-if="error" class="text-center text-red-500">
			<p>Error loading data: {{ error }}</p>
		</div>

		<div v-else class="space-y-8">
			<!-- Bar Chart Race Section -->
			<div class="bg-surface rounded-lg p-2 shadow-md">
				<BarChartRace :data="activitiesArray" class="h-fit w-full" />
			</div>

			<!-- Activities Summary -->
			<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div class="bg-surface rounded-lg p-4 text-center">
					<div class="text-2xl font-bold text-green-400">{{ activities.length }}</div>
					<div class="text-muted-light text-sm">Total Activities</div>
				</div>
				<div class="bg-surface rounded-lg p-4 text-center">
					<div class="text-2xl font-bold text-yellow-400">{{ validActivities }}</div>
					<div class="text-muted-light text-sm">Valid Activities</div>
				</div>
				<div class="bg-surface rounded-lg p-4 text-center">
					<div class="text-2xl font-bold text-blue-400">
						{{ totalDistance.toFixed(1) }} km
					</div>
					<div class="text-muted-light text-sm">Total Distance</div>
				</div>
				<div class="bg-surface rounded-lg p-4 text-center">
					<div class="text-2xl font-bold text-fuchsia-400">
						{{ formatSecondsToHMS(totalDuration) }}
					</div>
					<div class="text-muted-light text-sm">Total Duration</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { TActivityWithUser } from '@/types/activity'
import BarChartRace from '@/components/BarChartRace.vue'
import ChallengeCountDown from '@/components/ChallengeCountDown.vue'
import { formatSecondsToHMS } from '@/utils/time.utils'

const route = useRoute()
const router = useRouter()

const activities = ref<TActivityWithUser[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Parse year/month from route params, default to current date
const now = new Date()
const selectedYear = ref(
	route.params.year ? parseInt(route.params.year as string, 10) : now.getFullYear(),
)
const selectedMonth = ref(
	route.params.month ? parseInt(route.params.month as string, 10) : now.getMonth() + 1,
)

const monthNames = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
]

// Check if the selected month has started (in NPT)
const hasMonthStarted = computed(() => {
	const monthStr = String(selectedMonth.value).padStart(2, '0')
	const start = new Date(`${selectedYear.value}-${monthStr}-01T00:00:00+05:45`)
	return new Date() >= start
})

const monthLabel = computed(() => {
	return `${monthNames[selectedMonth.value - 1]} ${selectedYear.value}`
})

const previousMonth = () => {
	if (selectedMonth.value === 1) {
		selectedMonth.value = 12
		selectedYear.value--
	} else {
		selectedMonth.value--
	}
	updateRoute()
}

const nextMonth = () => {
	if (selectedMonth.value === 12) {
		selectedMonth.value = 1
		selectedYear.value++
	} else {
		selectedMonth.value++
	}
	updateRoute()
}

const updateRoute = () => {
	const monthStr = String(selectedMonth.value).padStart(2, '0')
	router.replace({
		name: 'visualization',
		params: { year: String(selectedYear.value), month: monthStr },
	})
}

const fetchActivities = async () => {
	if (!hasMonthStarted.value) {
		loading.value = false
		activities.value = []
		return
	}
	try {
		loading.value = true
		error.value = null

		const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
		const monthStr = String(selectedMonth.value).padStart(2, '0')
		const response = await fetch(
			`${apiBaseUrl}/activities/visualization/${selectedYear.value}/${monthStr}`,
		)

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

const totalDuration = computed(() => {
	return activities.value.reduce((sum, activity) => {
		if (activity.isValid) {
			return sum + activity.movingTime
		}
		return sum
	}, 0)
})

const validActivities = computed(() => {
	return activities.value.filter((activity) => activity.isValid).length
})

const generateDateIndex = (dateString: string, index: number) => {
	const dt = new Date(dateString)
	// Convert to Asia/Kathmandu timezone offset (+5:45)
	const kathmanduOffset = 5.75 * 60 // in minutes
	const utc = dt.getTime() + dt.getTimezoneOffset() * 60000
	const kathmanduTime = new Date(utc + kathmanduOffset * 60000)

	const year = kathmanduTime.getFullYear()
	const month = String(kathmanduTime.getMonth() + 1).padStart(2, '0')
	const day = String(kathmanduTime.getDate()).padStart(2, '0')
	const hour = String(kathmanduTime.getHours()).padStart(2, '0')
	const min = String(kathmanduTime.getMinutes()).padStart(2, '0')
	// Append index to guarantee uniqueness per activity
	return `${year}-${month}-${day} ${hour}:${min} #${String(index).padStart(4, '0')}`
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

	sortedActivities.value.forEach((activity, index) => {
		if (activity.isValid) {
			const userId = activity.user._id
			let userName = ''
			if (activity.user.firstName.split(' ').length > 1) {
				const formattedFirstName = activity.user.firstName.split(' ')[0]
				userName = `${formattedFirstName} ${activity.user.lastName}`
			} else {
				userName = `${activity.user.firstName} ${activity.user.lastName}`
			}
			const distanceKm = activity.distance / 1000
			const dateIndex = generateDateIndex(activity.activityDate.toString(), index)

			result.push([distanceKm, userId, userName, dateIndex])
		}
	})

	return result
})

// Re-fetch when year/month changes
watch([selectedYear, selectedMonth], () => {
	fetchActivities()
})

// Sync from route params when navigating directly
watch(
	() => route.params,
	(params) => {
		if (params.year && params.month) {
			const y = parseInt(params.year as string, 10)
			const m = parseInt(params.month as string, 10)
			if (y !== selectedYear.value || m !== selectedMonth.value) {
				selectedYear.value = y
				selectedMonth.value = m
			}
		}
	},
)

onMounted(() => {
	fetchActivities()
})
</script>
