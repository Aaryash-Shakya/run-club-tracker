<template>
	<div class="my-8 flex flex-col items-center justify-center gap-1">
		<!-- Alarm Clock Icon -->
		<div class="h-8 w-8 text-blue-400">
			<img
				src="../assets/alarm-clock.svg"
				alt="Alarm Clock"
				class="h-full w-full opacity-70 brightness-0 invert filter"
			/>
		</div>

		<!-- Phase Label -->
		<h2 class="text-muted text-base font-medium">{{ phaseLabel }}</h2>

		<!-- Countdown Display -->
		<div class="text-xl font-bold tracking-wider">
			{{ timeRemaining }}
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
	year: number
	month: number // 1-12
}>()

const timeRemaining = ref('')
const phaseLabel = ref('')
let intervalId: number | null = null

const formatTimeDiff = (diffMs: number): string => {
	if (diffMs <= 0) return '0d 0h 0m 0s'

	const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
	const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
	const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

	return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

const getMonthBoundaries = () => {
	// NPT = UTC+5:45
	const monthStr = String(props.month).padStart(2, '0')
	const year = props.year

	// Start of month in NPT
	const start = new Date(`${year}-${monthStr}-01T00:00:00+05:45`)

	// End of month: last day, 23:59:59 NPT
	const lastDay = new Date(year, props.month, 0).getDate()
	const end = new Date(`${year}-${monthStr}-${lastDay}T23:59:59+05:45`)

	return { start, end }
}

const calculateTimeRemaining = () => {
	const now = new Date()
	const { start, end } = getMonthBoundaries()

	if (now < start) {
		phaseLabel.value = 'Starts in'
		timeRemaining.value = formatTimeDiff(start.getTime() - now.getTime())
	} else if (now <= end) {
		phaseLabel.value = 'Ends in'
		timeRemaining.value = formatTimeDiff(end.getTime() - now.getTime())
	} else {
		phaseLabel.value = ''
		timeRemaining.value = 'Challenge Complete!'
	}
}

const startTimer = () => {
	if (intervalId) clearInterval(intervalId)
	calculateTimeRemaining()
	intervalId = window.setInterval(calculateTimeRemaining, 1000)
}

watch([() => props.year, () => props.month], () => {
	startTimer()
})

onMounted(() => {
	startTimer()
})

onUnmounted(() => {
	if (intervalId) {
		clearInterval(intervalId)
	}
})
</script>
