<template>
	<div v-if="topThree.length > 0" class="my-10 px-4">
		<div class="flex items-end justify-center gap-4">
			<!-- 2nd Place -->
			<div v-if="topThree[1]" class="flex flex-col items-center">
				<div
					class="relative mb-2 flex h-24 w-24 items-center justify-center rounded-xl border-4 border-white shadow-lg"
					style="background-color: #a395ee"
				>
					<span class="px-2 text-center text-sm font-semibold text-white">
						{{ getDisplayName(topThree[1]) }}
					</span>
					<div
						class="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold"
						style="color: #a395ee"
					>
						2
					</div>
				</div>
				<div class="text-center">
					<div class="text-sm font-medium text-white">
						{{ (topThree[1].stats.totalDistance / 1000).toFixed(1) }}km
					</div>
					<div class="text-xs text-white/60">
						{{ topThree[1].stats.totalActivities }} activities
					</div>
				</div>
			</div>

			<!-- 1st Place -->
			<div v-if="topThree[0]" class="flex flex-col items-center">
				<div
					class="relative mb-2 flex h-32 w-32 items-center justify-center rounded-xl border-4 border-white bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-xl"
				>
					<span class="px-2 text-center text-base font-semibold text-white">
						{{ getDisplayName(topThree[0]) }}
					</span>
					<div
						class="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-yellow-600"
					>
						1
					</div>
					<!-- Crown -->
					<div
						class="absolute -top-6 left-1/2 -translate-x-1/2 transform text-2xl text-yellow-400"
					>
						👑
					</div>
				</div>
				<div class="text-center">
					<div class="text-base font-medium text-white">
						{{ (topThree[0].stats.totalDistance / 1000).toFixed(1) }}km
					</div>
					<div class="text-sm text-white/60">
						{{ topThree[0].stats.totalActivities }} activities
					</div>
				</div>
			</div>

			<!-- 3rd Place -->
			<div v-if="topThree[2]" class="flex flex-col items-center">
				<div
					class="relative mb-2 flex h-20 w-20 items-center justify-center rounded-xl border-4 border-white shadow-lg"
					style="background-color: #832ab4"
				>
					<span class="px-2 text-center text-xs font-semibold text-white">
						{{ getDisplayName(topThree[2]) }}
					</span>
					<div
						class="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold"
						style="color: #832ab4"
					>
						3
					</div>
				</div>
				<div class="text-center">
					<div class="text-sm font-medium text-white">
						{{ (topThree[2].stats.totalDistance / 1000).toFixed(1) }}km
					</div>
					<div class="text-xs text-white/60">
						{{ topThree[2].stats.totalActivities }} activities
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { TUserWithStats } from '@/types/activity'
import { computed } from 'vue'

interface Props {
	records: TUserWithStats[]
}

const props = defineProps<Props>()

// Get top 3 records
const topThree = computed(() => {
	return props.records
		.slice()
		.sort((a, b) => b.stats.totalDistance - a.stats.totalDistance)
		.slice(0, 3)
})

// Helper function to get display name (first name or first two words)
const getDisplayName = (record: TUserWithStats): string => {
	const fullName = `${record.user.firstName} ${record.user.lastName}`
	const words = fullName.split(' ')

	// If first name is long, just use first name
	if (words[0].length > 8) {
		return words[0].substring(0, 8) + '...'
	}

	// If we have both first and last name and combined length is reasonable
	if (words.length >= 2 && fullName.length <= 12) {
		return fullName
	}

	// Otherwise use first name only
	return words[0]
}
</script>
