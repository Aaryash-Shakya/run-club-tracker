<template>
	<div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
		<div class="bg-surface-light rounded-lg p-3 text-center">
			<p class="text-muted text-sm">Total Distance</p>
			<p class="text-lg font-semibold text-white">
				{{ (stats.totalDistance / 1000).toFixed(2) }} km
			</p>
		</div>
		<div class="bg-surface-light rounded-lg p-3 text-center">
			<p class="text-muted text-sm">Total Activities</p>
			<p class="text-lg font-semibold text-white">
				{{ stats.totalActivities }}
			</p>
		</div>
		<div class="bg-surface-light rounded-lg p-3 text-center">
			<p class="text-muted text-sm">Average Pace</p>
			<p class="text-lg font-semibold text-white">
				{{ paceUtils.formatPaceToString(stats.averagePace) }}
			</p>
		</div>
		<div class="bg-surface-light rounded-lg p-3 text-center">
			<p class="text-muted text-sm">Run : Walk Ratio</p>
			<div class="flex flex-col items-center">
				<!-- Ratio Bar with embedded numbers -->
				<div class="relative h-6 w-full max-w-52 overflow-hidden rounded-full">
					<!-- Running portion (blue) -->
					<div
						class="bg-accent-run absolute top-0 left-0 h-full rounded-l-full transition-all duration-300"
						:style="{
							width:
								(stats.totalDistance > 0
									? (stats.runningDistance / stats.totalDistance) * 100
									: 0) + '%',
						}"
					></div>
					<!-- Walking portion (orange) -->
					<div
						class="bg-accent-walk absolute top-0 right-0 h-full rounded-r-full transition-all duration-300"
						:style="{
							width:
								(stats.totalDistance > 0
									? (stats.walkingDistance / stats.totalDistance) * 100
									: 0) + '%',
						}"
					></div>

					<!-- Running number (left side) -->
					<div
						class="absolute top-1/2 left-2 flex -translate-y-1/2 transform items-center gap-1"
					>
						<img
							src="@/assets/running-shoes.svg"
							alt="Running"
							class="h-3 w-3 brightness-0 invert filter"
						/>
						<span class="text-xs font-bold text-white drop-shadow-lg">
							{{ (stats.runningDistance / 1000).toFixed(1) }}
						</span>
					</div>

					<!-- Walking number (right side) -->
					<div
						class="absolute top-1/2 right-2 flex -translate-y-1/2 transform items-center gap-1"
					>
						<span class="text-xs font-bold text-gray-800 drop-shadow-lg">
							{{ (stats.walkingDistance / 1000).toFixed(1) }}
						</span>
						<img
							src="@/assets/walking-shoes.svg"
							alt="Walking"
							class="h-3 w-3 brightness-0 filter"
						/>
					</div>
				</div>
			</div>
		</div>
		<div class="bg-surface-light rounded-lg p-3 text-center">
			<p class="text-muted text-sm">Total Moving Time</p>
			<p class="text-lg font-semibold text-white">
				{{ formatSecondsToHMS(stats.totalMovingTime) }}
			</p>
		</div>
		<div class="bg-surface-light rounded-lg p-3 text-center">
			<p class="text-muted text-sm">Invalid Activities</p>
			<p class="text-lg font-semibold text-red-400">
				{{ stats.invalidActivities }}
			</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { TStats } from '@/types/activity'
import paceUtils from '@/utils/pace.utils'
import { formatSecondsToHMS } from '@/utils/time.utils'

interface Props {
	stats: TStats
}

defineProps<Props>()
</script>
