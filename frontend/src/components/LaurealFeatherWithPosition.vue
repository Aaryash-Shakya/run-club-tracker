<template>
	<div class="relative z-3 inline-block" :style="{ width: size + 'px', height: size + 'px' }">
		<!-- Laurel Wreath SVG -->
		<LaurealFeather :fill="color" :width="size" :height="size" />

		<!-- Position Number -->
		<div
			class="absolute inset-0 flex items-center justify-center font-bold"
			:style="{
				color: color,
				fontSize: size * 0.25 + 'px',
			}"
		>
			{{ getPositionNumber(position)
			}}<sup :style="{ fontSize: size * 0.17 + 'px' }">{{ getPositionSuffix(position) }}</sup>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import LaurealFeather from './icons/LaurealFeather.vue'

interface Props {
	position: 1 | 2 | 3
	color?: string
}

const { position, color = '#ffffff' } = defineProps<Props>()

// Reactive screen size detection
const isDesktop = ref(false)

const updateScreenSize = () => {
	isDesktop.value = window.innerWidth >= 768 // md breakpoint is 768px
}

onMounted(() => {
	updateScreenSize()
	window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
	window.removeEventListener('resize', updateScreenSize)
})

const getBannerWidth = (pos: 1 | 2 | 3, isDesktop: boolean = false): number => {
	if (isDesktop) {
		// Desktop breakpoint (md:) widths
		switch (pos) {
			case 1:
				return 168 // md:w-42 = 168px (gold)
			case 2:
				return 128 // md:w-32 = 128px (silver)
			case 3:
				return 112 // md:w-28 = 112px (bronze)
			default:
				return 112
		}
	} else {
		// Mobile widths
		switch (pos) {
			case 1:
				return 128 // w-32 = 128px (gold)
			case 2:
				return 112 // w-28 = 112px (silver)
			case 3:
				return 96 // w-24 = 96px (bronze)
			default:
				return 96
		}
	}
}

const getPositionNumber = (pos: 1 | 2 | 3): string => {
	return pos.toString()
}

const getPositionSuffix = (pos: 1 | 2 | 3): string => {
	switch (pos) {
		case 1:
			return 'st'
		case 2:
			return 'nd'
		case 3:
			return 'rd'
		default:
			return 'st'
	}
}

const size = computed(() => {
	// Get banner width based on position and screen size, then calculate laurel size as 80% of banner width
	const bannerWidth = getBannerWidth(position, isDesktop.value)
	return Math.floor(bannerWidth * 0.8)
})
</script>
