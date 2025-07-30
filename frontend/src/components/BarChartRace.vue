<template>
	<div class="bar-chart-race">
		<div ref="chartContainer" class="h-[600px] w-full"></div>
		<div class="mt-4 flex justify-center space-x-4">
			<button
				@click="togglePlay"
				class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
			>
				{{ isPlaying ? 'Pause' : 'Play' }}
			</button>
			<button
				@click="resetAnimation"
				class="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
			>
				Reset
			</button>
		</div>
		<div class="mt-2 text-center text-sm text-gray-600">
			{{ currentDate }} ({{ currentIndex + 1 }} / {{ uniqueDates.length }})
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as echarts from 'echarts'

interface Props {
	data: Array<[number, string, string]> // [distance, name, date]
}

const props = defineProps<Props>()

const chartContainer = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let animationTimer: number | null = null

const isPlaying = ref(false)
const currentIndex = ref(0)
const updateFrequency = 1500 // milliseconds between updates
const barWidthAnimationDuration = 2000 // slower width changes
const sortAnimationDuration = 500 // faster horizontal/sorting changes

// Generate consistent colors for users
const userColors: Record<string, string> = {}
const colorPalette = [
	'#5470c6',
	'#91cc75',
	'#fac858',
	'#ee6666',
	'#73c0de',
	'#3ba272',
	'#fc8452',
	'#9a60b4',
	'#ea7ccc',
	'#ff9f7f',
	'#ffdb5c',
	'#37a2da',
	'#32c5e9',
	'#67e0e3',
	'#9fe6b8',
	'#ffcc5c',
	'#ff6e76',
	'#ff9f7f',
	'#ffb347',
	'#87ceeb',
]

const getUserColor = (name: string): string => {
	if (!userColors[name]) {
		const colorIndex = Object.keys(userColors).length % colorPalette.length
		userColors[name] = colorPalette[colorIndex]
	}
	return userColors[name]
}

// Process data to get unique dates and cumulative distances
const processedData = computed(() => {
	const dateMap = new Map<string, Map<string, number>>()

	// Group activities by date and accumulate distances for each user
	props.data.forEach(([distance, name, date]) => {
		if (!dateMap.has(date)) {
			dateMap.set(date, new Map())
		}
		const userMap = dateMap.get(date)!
		userMap.set(name, (userMap.get(name) || 0) + distance)
	})

	// Create cumulative data for each date
	const sortedDates = Array.from(dateMap.keys()).sort()
	const cumulativeData = new Map<string, number>()

	return sortedDates.map((date) => {
		const dayData = dateMap.get(date)!

		// Add current day's distances to cumulative totals
		dayData.forEach((distance, name) => {
			cumulativeData.set(name, (cumulativeData.get(name) || 0) + distance)
		})

		// Convert to array and sort by distance, show all users
		const sortedUsers = Array.from(cumulativeData.entries()).sort((a, b) => b[1] - a[1])

		return {
			date,
			users: sortedUsers,
		}
	})
})

const uniqueDates = computed(() => processedData.value.map((d) => d.date))
const currentDate = computed(() => uniqueDates.value[currentIndex.value] || '')

const initChart = () => {
	if (!chartContainer.value) return

	chart = echarts.init(chartContainer.value)
	updateChart()
}

const updateChart = () => {
	if (!chart || processedData.value.length === 0) return

	const currentData = processedData.value[currentIndex.value]
	if (!currentData) return

	const maxValue = Math.max(...currentData.users.map(([, distance]) => distance), 1)

	const option = {
		grid: {
			top: 50,
			bottom: 60,
			left: 180,
			right: 100,
		},
		xAxis: {
			type: 'value',
			max: maxValue * 1.1,
			axisLabel: {
				formatter: (value: number) => Number(value.toFixed(1)) + ' km',
				fontSize: 12,
				fontWeight: 'normal',
			},
			splitLine: {
				show: true,
				lineStyle: {
					color: '#f0f0f0',
				},
			},
		},
		yAxis: {
			type: 'category',
			data: currentData.users.map(([name]) => name),
			inverse: true,
			axisLabel: {
				show: true,
				fontSize: 14,
				color: '#333',
				fontWeight: 'normal',
			},
			axisLine: {
				show: true,
			},
			axisTick: {
				show: true,
			},
			animationDuration: 300,
			animationDurationUpdate: sortAnimationDuration,
		},
		series: [
			{
				type: 'bar',
				realtimeSort: true,
				data: currentData.users.map(([name, distance]) => ({
					value: distance,
					itemStyle: {
						color: getUserColor(name),
						borderRadius: [0, 8, 8, 0],
					},
				})),
				label: {
					show: true,
					position: 'right',
					formatter: (params: { value: number }) => params.value.toFixed(1) + ' km',
					fontSize: 12,
					fontWeight: 'normal',
					color: '#333',
				},
				animationDuration: 0,
				animationDurationUpdate: barWidthAnimationDuration, // slower width changes
				animationEasing: 'linear' as const,
				animationEasingUpdate: 'cubicOut' as const, // smoother width animation
				// Separate animation for sorting/positioning
				universalTransition: {
					enabled: true,
					delay: () => 0,
					duration: sortAnimationDuration, // faster position changes
				},
			},
		],
		graphic: {
			elements: [
				{
					type: 'text',
					right: 80,
					bottom: 60,
					style: {
						text: currentData.date,
						font: 'bold 32px monospace',
						fill: 'rgba(0, 0, 0, 0.3)',
					},
					z: 100,
				},
			],
		},
		animationDuration: 0,
		animationDurationUpdate: sortAnimationDuration, // faster for positioning changes
		animationEasing: 'linear' as const,
		animationEasingUpdate: 'cubicOut' as const, // smoother transitions
	}

	chart.setOption(option)
}

const togglePlay = () => {
	if (isPlaying.value) {
		pauseAnimation()
	} else {
		startAnimation()
	}
}

const startAnimation = () => {
	if (currentIndex.value >= processedData.value.length - 1) {
		currentIndex.value = 0
	}

	isPlaying.value = true

	// Start animation loop
	const animate = () => {
		if (!isPlaying.value) return

		currentIndex.value++
		if (currentIndex.value >= processedData.value.length) {
			pauseAnimation()
			currentIndex.value = processedData.value.length - 1
			return
		}

		animationTimer = window.setTimeout(animate, updateFrequency)
	}

	animate()
}

const pauseAnimation = () => {
	isPlaying.value = false
	if (animationTimer) {
		clearTimeout(animationTimer)
		animationTimer = null
	}
}

const resetAnimation = () => {
	pauseAnimation()
	currentIndex.value = 0
}

// Watch for data changes
watch(
	() => props.data,
	() => {
		if (chart) {
			// Reset to beginning when data changes
			currentIndex.value = 0
			updateChart()
		}
	},
	{ deep: true },
)

// Watch for current index changes
watch(currentIndex, () => {
	updateChart()
})

onMounted(() => {
	initChart()
})

onBeforeUnmount(() => {
	pauseAnimation()
	if (chart) {
		chart.dispose()
	}
})
</script>

<style scoped>
.bar-chart-race {
	width: 100%;
}
</style>
