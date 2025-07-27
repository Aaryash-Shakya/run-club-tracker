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

		<!-- Ends In Text -->
		<h2 class="text-muted text-base font-medium">Ends in</h2>

		<!-- Countdown Display -->
		<div class="text-xl font-bold tracking-wider">
			{{ timeRemaining }}
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'

const timeRemaining = ref('')
let intervalId: number | null = null

const calculateTimeRemaining = () => {
	const now = new Date()
	const currentYear = now.getFullYear()
	const currentMonth = now.getMonth()

	// Get the last day of the current month
	const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)

	const timeDiff = endOfMonth.getTime() - now.getTime()

	if (timeDiff <= 0) {
		timeRemaining.value = '0d 0h 0m 0s'
		return
	}

	const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
	const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
	const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

	timeRemaining.value = `${days}d ${hours}h ${minutes}m ${seconds}s`
}

onMounted(() => {
	calculateTimeRemaining()
	intervalId = window.setInterval(calculateTimeRemaining, 1000)
})

onUnmounted(() => {
	if (intervalId) {
		clearInterval(intervalId)
	}
})
</script>
