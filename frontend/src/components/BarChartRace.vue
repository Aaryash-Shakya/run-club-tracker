<template>
	<div class="bar-chart-race">
		<div ref="chartContainer" class="h-[700px] w-full"></div>
		<div class="mt-4 space-y-4">
			<!-- Controls -->
			<div class="flex justify-center space-x-4">
				<button
					@click="togglePlay"
					class="text-muted rounded bg-blue-500 px-4 py-2 font-bold hover:bg-blue-700"
				>
					{{ isPlaying ? 'Pause' : 'Play' }}
				</button>
				<button
					@click="resetAnimation"
					class="text-muted rounded bg-gray-500 px-4 py-2 font-bold hover:bg-gray-700"
				>
					Reset
				</button>
			</div>

			<!-- Settings -->
			<div class="flex flex-col items-center space-y-3">
				<!-- Participants Only Toggle -->
				<div class="flex items-center space-x-3">
					<label class="flex cursor-pointer items-center space-x-2">
						<input
							type="checkbox"
							v-model="participantsOnly"
							class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						<span class="text-sm font-medium text-gray-700">Participants Only</span>
					</label>
				</div>

				<!-- Speed Control -->
				<div class="flex items-center space-x-3">
					<span class="text-sm font-medium text-gray-700">Speed:</span>
					<span class="text-xs text-gray-500">Fast</span>
					<input
						type="range"
						v-model="speedControl"
						min="500"
						max="3000"
						step="100"
						class="slider h-2 w-32 cursor-pointer appearance-none rounded-lg bg-gray-200"
					/>
					<span class="text-xs text-gray-500">Slow</span>
					<span class="w-12 text-xs text-gray-600">{{ speedControl }}ms</span>
				</div>
			</div>

			<!-- Highlight User Section -->
			<div class="flex flex-col items-center space-y-3">
				<div class="flex items-center space-x-3">
					<span class="text-sm font-medium text-gray-700">Highlight User:</span>
					<select
						v-model="highlightedUserId"
						class="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					>
						<option value="">None</option>
						<option v-for="user in availableUsers" :key="user.id" :value="user.id">
							{{ user.name }} ({{ user.id.slice(-4) }})
						</option>
					</select>
				</div>
			</div>
		</div>
		<div class="mt-2 text-center text-sm text-gray-600">
			{{ currentDate }} ({{ currentIndex + 1 }} / {{ uniqueDates.length }})
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { PARTICIPANT_IDS } from '@/constants/participant.constants'

interface Props {
	data: Array<[number, string, string, string]> // [distance, id, name, date]
}

const props = defineProps<Props>()

const chartContainer = ref<HTMLElement>()
let chart: echarts.ECharts | null = null
let animationTimer: number | null = null

const isPlaying = ref(false)
const currentIndex = ref(0)
const participantsOnly = ref(true)
const speedControl = ref(2000) // Default speed in milliseconds
const highlightedUserId = ref('') // ID of the user to highlight

const updateFrequency = computed(() => speedControl.value) // Use reactive speed
const barWidthAnimationDuration = 2500 // slower width changes
const sortAnimationDuration = 500 // faster horizontal/sorting changes

// Generate consistent colors for users
const userColors: Record<string, string> = {}
const baseColors = [
	'#a4d88a', // muted green
	'#f7d372', // light gold
	'#f18888', // light red
	'#92d4e9', // soft cyan
	'#5ab98a', // dusty teal
	'#fca67e', // peach
	'#b58cc6', // lavender
	'#f0a7d1', // pink
	'#ffc1a6', // light coral
	'#ffe58a', // pastel yellow
	'#6fc2e5', // calm sky
	'#63d6f1', // aqua blue
	'#90f1f3', // icy blue
	'#b4f1d0', // mint
	'#ffe799', // cream yellow
	'#ff9999', // soft pink red
	'#ffc1a6', // coral (again)
	'#ffcc80', // light orange
	'#b0e0ff', // baby blue
]
// const baseColors = [
// 	'#3c6464', // deeper slate green
// 	'#4a4f6a', // muted indigo
// 	'#556243', // earthy olive
// 	'#62587a', // warm violet gray
// 	'#666666', // balanced gray
// 	'#617d67', // medium jungle green
// 	'#7a5f86', // mauve-gray
// 	'#74808d', // soft steel blue
// 	'#8395a4', // cloudy sky
// 	'#866c6c', // dusty rose
// 	'#999999', // light neutral gray
// 	'#90a5b8', // overcast blue
// 	'#a3a3a3', // silver
// 	'#aaaaaa', // light ash
// 	'#b0b0b0', // platinum
// 	'#b3bed2', // pale denim
// 	'#bcbcbc', // light fog
// 	'#c5c5c5', // soft frost
// 	'#d0d0d0', // pale silver
// ]

const highlightedColor = '#FFD700' // Gold (strong highlight)

const getUserColor = (name: string, userId?: string): string | echarts.LinearGradientObject => {
	const highlightGradient: echarts.LinearGradientObject = {
		type: 'linear',
		x: 0,
		y: 0,
		x2: 1,
		y2: 0,
		colorStops: [
			{
				offset: 0,
				color: '#FFD700', // gold
			},
			{
				offset: 1,
				color: '#8B5CF6', // purple
			},
		],
	}

	// Check if this user should be highlighted
	if (highlightedUserId.value && userId && userId === highlightedUserId.value) {
		return highlightGradient
	}

	if (!userColors[name]) {
		const colorIndex = Object.keys(userColors).length % baseColors.length
		userColors[name] = baseColors[colorIndex]
	}
	return userColors[name]
}

// Get list of available users for the dropdown
const availableUsers = computed(() => {
	const userMap = new Map<string, string>() // id -> name mapping

	props.data.forEach(([, id, name]) => {
		userMap.set(id, name)
	})

	return Array.from(userMap.entries())
		.map(([id, name]) => ({
			id,
			name,
		}))
		.sort((a, b) => a.name.localeCompare(b.name))
})

// Create a mapping from user names to IDs for the current data
const userNameToId = computed(() => {
	const mapping = new Map<string, string>()
	props.data.forEach(([, id, name]) => {
		mapping.set(name, id)
	})
	return mapping
})

// Process data to get unique dates and cumulative distances
const processedData = computed(() => {
	const dateMap = new Map<string, Map<string, number>>()

	// Filter data based on participants only toggle
	const filteredData = participantsOnly.value
		? props.data.filter(([, id]) => {
				// Check if the user ID matches any participant ID
				return PARTICIPANT_IDS.some((participantId) => participantId === id)
			})
		: props.data

	// Group activities by date and accumulate distances for each user
	filteredData.forEach(([distance, , name, date]) => {
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
			top: 40,
			bottom: 40,
			left: 80,
			right: 80,
		},
		xAxis: {
			type: 'value',
			max: maxValue * 1.1,
			axisLabel: {
				formatter: (value: number) => Number(value.toFixed(2)) + ' km',
				fontSize: 12,
				fontWeight: 'normal',
			},
			splitLine: {
				show: true,
				lineStyle: {
					color: 'rgba(255,255,255,0.2)',
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
				color: '#e1e1e1',
				fontWeight: 'normal',
				formatter: (value: string) => {
					// Highlight the name if this user is selected
					const userId = userNameToId.value.get(value)
					return highlightedUserId.value && userId === highlightedUserId.value
						? `{highlight|${value}}`
						: value
				},
				rich: {
					highlight: {
						color: highlightedColor,
						fontWeight: 'bold',
					},
				},
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
				data: currentData.users.map(([name, distance]) => {
					const userId = userNameToId.value.get(name)
					const isHighlighted =
						highlightedUserId.value && userId === highlightedUserId.value
					return {
						value: distance,
						itemStyle: {
							color: getUserColor(name, userId),
							borderRadius: [0, 8, 8, 0],
							borderWidth: isHighlighted ? 2 : 0,
							borderColor: isHighlighted ? '#e1e1e1' : undefined,
						},
					}
				}),
				label: {
					show: true,
					position: 'right',
					formatter: (params: { value: number }) => params.value.toFixed(2) + ' km',
					fontSize: 12,
					fontWeight: 'normal',
					color: '#e1e1e1',
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
				// Add goal lines
				markLine: {
					silent: true,
					data: [
						{
							xAxis: 70,
							lineStyle: {
								color: '#22c55e', // green-500
								width: 2,
								type: 'dashed',
							},
							label: {
								position: 'end',
								formatter: '70km Goal',
								color: '#22c55e',
								fontSize: 12,
								fontWeight: 'bold',
							},
						},
						{
							xAxis: 140,
							lineStyle: {
								color: '#f59e0b', // amber-500
								width: 2,
								type: 'dashed',
							},
							label: {
								position: 'end',
								formatter: '140km Legend',
								color: '#f59e0b',
								fontSize: 12,
								fontWeight: 'bold',
							},
						},
					],
				},
			},
		],
		graphic: {
			elements: [
				{
					type: 'text',
					right: 80,
					bottom: 80,
					style: {
						text: currentData.date.slice(0, 10),
						font: 'bold 28px monospace',
						fill: 'rgba(255, 255, 255, 0.6)',
					},
					z: 100,
				},
				{
					type: 'text',
					right: 80,
					bottom: 60,
					style: {
						text: currentData.date.slice(11),
						font: 'bold 18px monospace',
						fill: 'rgba(255, 255, 255, 0.6)',
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

		animationTimer = window.setTimeout(animate, updateFrequency.value)
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

// Watch for participants only toggle
watch(participantsOnly, () => {
	if (chart) {
		// Reset animation when filter changes
		pauseAnimation()
		currentIndex.value = 0
		updateChart()
	}
})

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

/* Custom slider styling */
.slider {
	appearance: none;
	-webkit-appearance: none;
	background: linear-gradient(to right, #3b82f6 0%, #6b7280 100%);
	outline: none;
	opacity: 0.7;
	transition: opacity 0.2s;
}

.slider:hover {
	opacity: 1;
}

.slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	background: #3b82f6;
	cursor: pointer;
	border: 2px solid #ffffff;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
	width: 18px;
	height: 18px;
	border-radius: 50%;
	background: #3b82f6;
	cursor: pointer;
	border: 2px solid #ffffff;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
