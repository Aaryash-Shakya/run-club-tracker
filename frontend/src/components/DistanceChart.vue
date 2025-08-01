<template>
	<div class="distance-chart">
		<!-- Chart Summary Stats -->
		<div
			v-if="chartData.distances.some((dist) => dist > 0)"
			class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5"
		>
			<div class="bg-surface-light rounded-lg p-2 text-center">
				<p class="text-muted mb-1 text-xs">Avg Distance</p>
				<p class="text-sm font-semibold text-white">{{ averageDistance.toFixed(1) }} km</p>
			</div>
			<div class="bg-surface-light rounded-lg p-2 text-center">
				<p class="text-muted mb-1 text-xs">Best Run</p>
				<p class="text-sm font-semibold text-white">{{ maxDistance.toFixed(1) }} km</p>
			</div>
			<div class="bg-surface-light rounded-lg p-2 text-center">
				<p class="text-muted mb-1 text-xs">Longest Day</p>
				<p class="text-sm font-semibold text-white">
					{{ longestDayDistance.toFixed(1) }} km
				</p>
			</div>
			<div class="bg-surface-light rounded-lg p-2 text-center">
				<p class="text-muted mb-1 text-xs">Longest Streak</p>
				<p class="text-sm font-semibold text-white">{{ longestStreak }} days</p>
			</div>
			<div class="bg-surface-light rounded-lg p-2 text-center">
				<p class="text-muted mb-1 text-xs">Best 7 Days</p>
				<p class="text-sm font-semibold text-white">{{ best7DayDistance.toFixed(1) }} km</p>
			</div>
		</div>

		<!-- Chart Container -->
		<div ref="chartContainer" class="h-[300px] w-full"></div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as echarts from 'echarts'
import type { TActivity } from '@/types/activity'

type EChartsOption = echarts.EChartsOption

interface Props {
	activities: TActivity[]
}

const props = defineProps<Props>()

const chartContainer = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// Process activities data for the chart
const chartData = computed(() => {
	if (!props.activities || props.activities.length === 0) {
		return { dates: [], distances: [] }
	}

	// Filter and sort activities by date (ascending)
	const filteredActivities = props.activities
		.filter((activity) => {
			const activityDate = new Date(activity.activityDate)
			const dateStr = activityDate.toISOString().split('T')[0]
			return dateStr >= '2025-08-01' && activity.isValid
		})
		.sort((a, b) => new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime())

	// Create a map of activity distances by date
	const activityMap = new Map<string, number>()
	filteredActivities.forEach((activity) => {
		const dateStr = new Date(activity.activityDate).toISOString().split('T')[0]
		const distance = parseFloat((activity.distance / 1000).toFixed(2))
		activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + distance)
	})

	// Generate full month range from July 1st to July 31st, 2025
	const dates: string[] = []
	const distances: number[] = []

	for (let day = 1; day <= 31; day++) {
		const date = new Date(2025, 7, day) // Month is 0-indexed, so 7 = August
		const dateStr = date.toISOString().split('T')[0]

		// Format date for display
		const displayDate = date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		})

		dates.push(displayDate)
		// Use the actual distance if there's an activity on this date, otherwise 0
		distances.push(activityMap.get(dateStr) || 0)
	}

	return { dates, distances }
})

// Computed statistics
const totalDistance = computed(() =>
	chartData.value.distances.filter((dist) => dist > 0).reduce((sum, dist) => sum + dist, 0),
)

const averageDistance = computed(() => {
	const nonZeroDistances = chartData.value.distances.filter((dist) => dist > 0)
	return nonZeroDistances.length > 0 ? totalDistance.value / nonZeroDistances.length : 0
})

const maxDistance = computed(() => {
	const nonZeroDistances = chartData.value.distances.filter((dist) => dist > 0)
	return nonZeroDistances.length > 0 ? Math.max(...nonZeroDistances) : 0
})

// Get filtered activities for additional calculations
const filteredActivities = computed(() => {
	if (!props.activities || props.activities.length === 0) {
		return []
	}

	return props.activities
		.filter((activity) => {
			const activityDate = new Date(activity.activityDate)
			const dateStr = activityDate.toISOString().split('T')[0]
			return dateStr >= '2025-08-01' && activity.isValid
		})
		.sort((a, b) => new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime())
})

// Longest distance in a single day (sum of all runs on the same day)
const longestDayDistance = computed(() => {
	const dailyDistances = new Map<string, number>()

	filteredActivities.value.forEach((activity) => {
		const dateStr = new Date(activity.activityDate).toISOString().split('T')[0]
		const distance = activity.distance / 1000
		dailyDistances.set(dateStr, (dailyDistances.get(dateStr) || 0) + distance)
	})

	return dailyDistances.size > 0 ? Math.max(...dailyDistances.values()) : 0
})

// Longest streak of consecutive days with runs
const longestStreak = computed(() => {
	if (filteredActivities.value.length === 0) return 0

	const uniqueDates = new Set(
		filteredActivities.value.map(
			(activity) => new Date(activity.activityDate).toISOString().split('T')[0],
		),
	)

	const sortedDates = Array.from(uniqueDates).sort()

	let maxStreak = 1
	let currentStreak = 1

	for (let i = 1; i < sortedDates.length; i++) {
		const prevDate = new Date(sortedDates[i - 1])
		const currentDate = new Date(sortedDates[i])
		const dayDifference = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)

		if (dayDifference === 1) {
			currentStreak++
			maxStreak = Math.max(maxStreak, currentStreak)
		} else {
			currentStreak = 1
		}
	}

	return maxStreak
})

// Best 7-day period (rolling window)
const best7DayDistance = computed(() => {
	if (filteredActivities.value.length === 0) return 0

	// Group activities by date and sum distances per day
	const dailyDistances = new Map<string, number>()
	filteredActivities.value.forEach((activity) => {
		const dateStr = new Date(activity.activityDate).toISOString().split('T')[0]
		const distance = activity.distance / 1000
		dailyDistances.set(dateStr, (dailyDistances.get(dateStr) || 0) + distance)
	})

	const sortedDates = Array.from(dailyDistances.keys()).sort()

	let maxDistance = 0

	// Check every possible 7-day window
	for (let i = 0; i < sortedDates.length; i++) {
		const startDate = new Date(sortedDates[i])
		const endDate = new Date(startDate)
		endDate.setDate(startDate.getDate() + 6)

		let windowDistance = 0

		// Sum all distances within this 7-day window
		for (const [dateStr, distance] of dailyDistances) {
			const date = new Date(dateStr)
			if (date >= startDate && date <= endDate) {
				windowDistance += distance
			}
		}

		maxDistance = Math.max(maxDistance, windowDistance)
	}

	return maxDistance
})

const initChart = () => {
	if (!chartContainer.value) return

	chart = echarts.init(chartContainer.value)
	updateChart()
}

const updateChart = () => {
	if (!chart) return

	const { dates, distances } = chartData.value

	// Check if there are any actual activities (non-zero distances)
	const hasActivities = distances.some((distance) => {
		return distance > 0
	})

	if (!hasActivities) {
		// Show empty state
		const option: EChartsOption = {
			title: {
				text: 'No activities yet.',
				left: 'center',
				top: 'middle',
				textStyle: {
					color: '#9ca3af',
					fontSize: 14,
				},
			},
		}
		chart.setOption(option)
		return
	}

	const option: EChartsOption = {
		grid: {
			top: 20,
			bottom: 20,
			left: 20,
			right: 20,
		},
		xAxis: {
			type: 'category',
			data: dates,
			axisLabel: {
				color: '#9ca3af',
				fontSize: 10,
				rotate: 45,
				interval: 'auto', // Let ECharts decide based on space available
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(255,255,255,0.2)',
				},
			},
			axisTick: {
				lineStyle: {
					color: 'rgba(255,255,255,0.2)',
				},
			},
		},
		yAxis: {
			type: 'value',
			name: 'Distance (km)',
			nameTextStyle: {
				color: '#9ca3af',
				fontSize: 11,
			},
			axisLabel: {
				color: '#9ca3af',
				fontSize: 11,
				formatter: (value: number) => value.toFixed(1),
			},
			axisLine: {
				lineStyle: {
					color: 'rgba(255,255,255,0.2)',
				},
			},
			splitLine: {
				lineStyle: {
					color: 'rgba(255,255,255,0.1)',
				},
			},
		},
		series: [
			{
				data: distances, // Use actual distances (including 0 for no activity days)
				type: 'line',
				smooth: false,
				lineStyle: {
					color: '#10b981',
					width: 2,
				},
				itemStyle: {
					color: '#10b981',
					borderWidth: 2,
					borderColor: '#ffffff',
				},
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{
								offset: 0,
								color: 'rgba(16, 185, 129, 0.3)',
							},
							{
								offset: 1,
								color: 'rgba(16, 185, 129, 0.05)',
							},
						],
					},
				},
				emphasis: {
					itemStyle: {
						color: '#059669',
						borderColor: '#ffffff',
						borderWidth: 3,
						shadowColor: 'rgba(16, 185, 129, 0.5)',
						shadowBlur: 10,
					},
				},
			},
		],
		tooltip: {
			trigger: 'axis',
			backgroundColor: 'rgba(0, 0, 0, 0.8)',
			borderColor: 'rgba(255, 255, 255, 0.2)',
			textStyle: {
				color: '#ffffff',
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			formatter: (params: any) => {
				const data = Array.isArray(params) ? params[0] : params
				if (data.value === 0) {
					return `<div>
						<div style="font-weight: bold; margin-bottom: 4px;">${data.name}</div>
						<div style="color: #9ca3af;">No activity</div>
					</div>`
				}
				return `<div>
					<div style="font-weight: bold; margin-bottom: 4px;">${data.name}</div>
					<div style="color: #10b981;">Distance: ${data.value} km</div>
				</div>`
			},
		},
	}

	chart.setOption(option)
}

// Watch for data changes
watch(
	() => props.activities,
	() => {
		if (chart) {
			updateChart()
		}
	},
	{ deep: true },
)

// Handle window resize
const handleResize = () => {
	if (chart) {
		chart.resize()
	}
}

onMounted(() => {
	initChart()
	window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
	if (chart) {
		chart.dispose()
	}
	window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.distance-chart {
	width: 100%;
}
</style>
