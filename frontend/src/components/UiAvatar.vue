<template>
	<div
		class="flex items-center justify-center rounded-full text-white font-normal"
		:style="avatarStyle"
	>
		{{ initials }}
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
	name: {
		type: String,
		required: true,
	},
	size: {
		type: Number,
		default: 48,
	},
})

const colors = [
	'#EF4444', // soft red
	'#F97316', // warm orange
	'#EAB308', // golden yellow
	'#22C55E', // fresh green
	'#10B981', // teal green
	'#14B8A6', // cyan teal
	'#0EA5E9', // sky blue
	'#3B82F6', // blue
	'#6366F1', // indigo
	'#8B5CF6', // violet
	'#A855F7', // purple
	'#D946EF', // fuchsia
	'#EC4899', // pink
	'#F43F5E', // rose
	'#6B7280', // gray (mid-tone)
]

const initials = computed(() => {
	return props.name.slice(0, 2).toUpperCase()
})

// Simple hash function to generate consistent color based on name
const hashString = (str: string): number => {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash = hash & hash // Convert to 32-bit integer
	}
	return Math.abs(hash)
}

const backgroundColor = computed(() => {
	const hash = hashString(props.name.toLowerCase())
	const colorIndex = hash % colors.length
	return colors[colorIndex]
})

const avatarStyle = computed(() => ({
	width: `${props.size}px`,
	height: `${props.size}px`,
	backgroundColor: backgroundColor.value,
	fontSize: `${props.size * 0.4}px`,
}))
</script>
