<template>
	<div class="relative inline-block" :style="{ width: size + 'px', height: size + 'px' }">
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
import LaurealFeather from './icons/LaurealFeather.vue'

interface Props {
	position: 1 | 2 | 3
	size?: number
	color?: string
}

const { position, size, color } = withDefaults(defineProps<Props>(), {
	size: 60,
	color: '#ffffff',
})

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
</script>
