<template>
	<nav class="relative h-[150px] overflow-x-clip">
		<!-- Eclipse Background -->
		<div
			class="absolute top-0 -left-1/10 z-0 -translate-y-1/2"
			:style="{
				width: '120%',
				height: '250px',
				backgroundColor: '#000',
				borderRadius: '100%',
				boxShadow: 'inset 0px 0px 54px 10px #293047',
			}"
		></div>

		<!-- Static Orbital Ring -->
		<div
			class="absolute top-0 -left-1/10 z-0 -translate-y-1/2 border border-white/20"
			:style="{
				width: 'calc(120% + 40px)',
				height: '270px',
				borderRadius: '100%',
				left: 'calc(-10% - 20px)',
			}"
		></div>

		<!-- Simple Moon Animation -->
		<div
			class="absolute top-0 z-0 -translate-y-1/2"
			:style="{
				width: '100%',
				height: '270px',
			}"
		>
			<div ref="moon" class="absolute h-3 w-3 rounded-full bg-gray-300 shadow-lg"></div>
		</div>

		<div class="relative z-1 container my-5">
			<div class="flex w-full items-center justify-center gap-4 py-4">
				<!-- Navigation Links -->
				<router-link
					to="/"
					class="navbar-item"
					:class="[$route.name === 'leaderboard' ? 'navbar-item-selected' : '']"
				>
					Leaderboard
				</router-link>
				<router-link
					to="/runners"
					class="navbar-item"
					:class="[$route.path.startsWith('/runners') ? 'navbar-item-selected' : '']"
				>
					Runners
				</router-link>
				<router-link
					to="/visualization"
					class="navbar-item"
					:class="[$route.name === 'visualization' ? 'navbar-item-selected' : '']"
				>
					Visualization
				</router-link>
				<router-link
					to="/rules"
					class="navbar-item"
					:class="[$route.name === 'rules' ? 'navbar-item-selected' : '']"
				>
					Rules
				</router-link>
			</div>
		</div>
	</nav>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { onMounted, onBeforeUnmount, ref } from 'vue'

const $route = useRoute()

const moon = ref<HTMLElement | null>(null)
let animationFrame: number = 0
let startTime: number | null = null

const duration = 10000 // 10 seconds

function animate(timestamp: number) {
	if (!startTime) startTime = timestamp
	const elapsed = (timestamp - startTime) % duration
	const progress = elapsed / duration

	// Use percentage for x as well to go full width
	const x = progress * 100 // 0% to 100%

	// Create a single arc: starts at 70%, goes down to 100% at middle, back to 70%
	let y: number
	if (progress <= 0.5) {
		// First half: from 80% to 100%
		const halfProgress = progress * 2 // 0 to 1
		y = 80 + 20 * halfProgress // 80% to 100%
	} else {
		// Second half: from 100% back to 80%
		const halfProgress = (progress - 0.5) * 2 // 0 to 1
		y = 100 - 20 * halfProgress // 100% to 80%
	}

	if (moon.value) {
		moon.value.style.left = `${x}%`
		moon.value.style.top = `${y}%`
	}

	animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
	animationFrame = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
	if (animationFrame) {
		cancelAnimationFrame(animationFrame)
	}
})
</script>
