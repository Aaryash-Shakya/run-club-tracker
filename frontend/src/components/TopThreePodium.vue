<template>
	<div v-if="topThree.length > 0" class="my-10 px-4">
		<div class="flex items-end justify-center gap-3 md:gap-6">
			<!-- 2nd Place -->
			<div v-if="topThree[1]" class="flex flex-col items-center">
				<div class="silver-rank-banner">
					<LaurealFeatherWithPosition :position="2" :size="80" />
					<span class="px-2 text-center text-sm font-semibold">
						{{ getDisplayName(topThree[1]) }}
					</span>
					<div class="silver-rank-banner-overlay"></div>
				</div>
				<div class="text-center">
					<div class="text-sm font-medium">
						{{ (topThree[1].stats.totalDistance / 1000).toFixed(1) }}km
					</div>
					<div class="text-xs">{{ topThree[1].stats.totalActivities }} activities</div>
				</div>
			</div>

			<!-- 1st Place -->
			<div v-if="topThree[0]" class="flex flex-col items-center">
				<div class="gold-rank-banner">
					<LaurealFeatherWithPosition :position="1" :size="90" />
					<span class="px-2 text-center text-base font-semibold">
						{{ getDisplayName(topThree[0]) }}
					</span>
					<div class="gold-rank-banner-overlay"></div>
				</div>
				<div class="text-center">
					<div class="text-sm font-medium">
						{{ (topThree[0].stats.totalDistance / 1000).toFixed(1) }}km
					</div>
					<div class="text-xs">{{ topThree[0].stats.totalActivities }} activities</div>
				</div>
			</div>

			<!-- 3rd Place -->
			<div v-if="topThree[2]" class="flex flex-col items-center">
				<div class="bronze-rank-banner">
					<LaurealFeatherWithPosition :position="3" :size="70" />
					<span class="px-2 text-center text-xs font-semibold">
						{{ getDisplayName(topThree[2]) }}
					</span>
					<div class="bronze-rank-banner-overlay"></div>
				</div>
				<div class="text-center">
					<div class="text-sm font-medium">
						{{ (topThree[2].stats.totalDistance / 1000).toFixed(1) }}km
					</div>
					<div class="text-xs">{{ topThree[2].stats.totalActivities }} activities</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { TUserWithStats } from '@/types/activity'
import { computed } from 'vue'
import LaurealFeatherWithPosition from './LaurealFeatherWithPosition.vue'

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
