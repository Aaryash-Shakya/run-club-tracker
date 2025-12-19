<template>
	<div class="my-10 px-4">
		<!-- Loading State -->
		<div v-if="isLoading" class="flex items-end justify-center gap-3 md:gap-6">
			<!-- 2nd Place Loading -->
			<div class="flex flex-col items-center">
				<div class="silver-rank-banner animate-pulse bg-gray-600/50">
					<div class="mb-2 h-6 w-20 rounded bg-gray-500/50"></div>
					<div class="h-4 w-16 rounded bg-gray-500/50"></div>
					<div class="silver-rank-banner-overlay"></div>
				</div>
				<div class="mt-2 text-center">
					<div class="mb-1 h-4 w-12 animate-pulse rounded bg-gray-500/30"></div>
					<div class="h-3 w-16 animate-pulse rounded bg-gray-500/30"></div>
				</div>
			</div>

			<!-- 1st Place Loading -->
			<div class="flex flex-col items-center">
				<div class="gold-rank-banner animate-pulse bg-gray-600/50">
					<div class="mb-2 h-6 w-24 rounded bg-gray-500/50"></div>
					<div class="h-4 w-20 rounded bg-gray-500/50"></div>
					<div class="gold-rank-banner-overlay"></div>
				</div>
				<div class="mt-2 text-center">
					<div class="mb-1 h-4 w-12 animate-pulse rounded bg-gray-500/30"></div>
					<div class="h-3 w-16 animate-pulse rounded bg-gray-500/30"></div>
				</div>
			</div>

			<!-- 3rd Place Loading -->
			<div class="flex flex-col items-center">
				<div class="bronze-rank-banner animate-pulse bg-gray-600/50">
					<div class="mb-2 h-6 w-16 rounded bg-gray-500/50"></div>
					<div class="h-4 w-14 rounded bg-gray-500/50"></div>
					<div class="bronze-rank-banner-overlay"></div>
				</div>
				<div class="mt-2 text-center">
					<div class="mb-1 h-4 w-12 animate-pulse rounded bg-gray-500/30"></div>
					<div class="h-3 w-16 animate-pulse rounded bg-gray-500/30"></div>
				</div>
			</div>
		</div>

		<!-- Actual Podium Data -->
		<div v-else-if="topThree.length > 0" class="flex items-end justify-center gap-3 md:gap-6">
			<!-- 2nd Place -->
			<div v-if="topThree[1]" class="flex flex-col items-center">
				<div class="silver-rank-banner">
					<LaurealFeatherWithPosition :position="2" />
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
					<LaurealFeatherWithPosition :position="1" />
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
					<LaurealFeatherWithPosition :position="3" />
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
	isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	isLoading: false,
})

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
