<template>
	<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
		<div class="text-center p-3 bg-[#1E2332] rounded-lg">
			<p class="text-sm text-white/60">Total Distance</p>
			<p class="text-lg font-semibold text-white">
				{{ (stats.totalDistance / 1000).toFixed(2) }} km
			</p>
		</div>
		<div class="text-center p-3 bg-[#1E2332] rounded-lg">
			<p class="text-sm text-white/60">Total Activities</p>
			<p class="text-lg font-semibold text-white">
				{{ stats.totalActivities }}
			</p>
		</div>
		<div class="text-center p-3 bg-[#1E2332] rounded-lg">
			<p class="text-sm text-white/60">Average Pace</p>
			<p class="text-lg font-semibold text-white">
				{{ paceUtils.formatPaceToString(stats.averagePace) }}
			</p>
		</div>
		<div class="text-center p-3 bg-[#1E2332] rounded-lg">
			<p class="text-sm text-white/60">Run : Walk Ratio</p>
			<div class="flex flex-col items-center">
				<!-- Ratio Bar with embedded numbers -->
				<div class="relative w-full max-w-52 h-6 bg-[#23232a] rounded-full overflow-hidden">
					<!-- Running portion (blue) -->
					<div
						class="absolute left-0 top-0 h-full bg-[#6366F1] rounded-l-full transition-all duration-300"
						:style="{
							width:
								(stats.totalDistance > 0
									? (stats.runningDistance / stats.totalDistance) * 100
									: 0) + '%',
						}"
					></div>
					<!-- Walking portion (orange) -->
					<div
						class="absolute right-0 top-0 h-full bg-[#FBBF24] rounded-r-full transition-all duration-300"
						:style="{
							width:
								(stats.totalDistance > 0
									? (stats.walkingDistance / stats.totalDistance) * 100
									: 0) + '%',
						}"
					></div>

					<!-- Running number (left side) -->
					<div
						class="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1"
					>
						<img
							src="@/assets/running-shoes.svg"
							alt="Running"
							class="w-3 h-3 filter brightness-0 invert"
						/>
						<span class="text-white text-xs font-bold drop-shadow-lg">
							{{ (stats.runningDistance / 1000).toFixed(1) }}
						</span>
					</div>

					<!-- Walking number (right side) -->
					<div
						class="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1"
					>
						<span class="text-gray-800 text-xs font-bold drop-shadow-lg">
							{{ (stats.walkingDistance / 1000).toFixed(1) }}
						</span>
						<img
							src="@/assets/walking-shoes.svg"
							alt="Walking"
							class="w-3 h-3 filter brightness-0"
						/>
					</div>
				</div>
			</div>
		</div>
		<div class="text-center p-3 bg-[#1E2332] rounded-lg">
			<p class="text-sm text-white/60">Total Moving Time</p>
			<p class="text-lg font-semibold text-white">
				{{ formatSecondsToHMS(stats.totalMovingTime) }}
			</p>
		</div>
		<div class="text-center p-3 bg-[#1E2332] rounded-lg">
			<p class="text-sm text-white/60">Invalid Activities</p>
			<p class="text-lg font-semibold text-red-400">
				{{ stats.invalidActivities }}
			</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { Stats } from '@/types/activity'
import paceUtils from '@/utils/pace.utils'
import { formatSecondsToHMS } from '@/utils/time.utils'

interface Props {
	stats: Stats
}

defineProps<Props>()
</script>
