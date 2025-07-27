<template>
	<!-- Stats -->
	<div class="mt-3">
		<!-- Desktop/Large Screen Layout (flex with dividers) -->
		<div class="hidden flex-wrap items-center justify-between divide-x divide-white/20 md:flex">
			<!-- Distance -->
			<div class="flex-1 px-2 text-center">
				<p class="text-muted mb-1 text-xs">Distance</p>
				<p class="text-sm font-semibold text-white">
					{{ (activity.distance / 1000).toFixed(2) }} km
				</p>
			</div>
			<!-- Pace -->
			<div class="flex-1 px-2 text-center">
				<p class="text-muted mb-1 text-xs">Pace</p>
				<p class="text-sm font-semibold text-white">
					{{ paceUtils.formatPaceToString(activity.movingPace) }}
				</p>
			</div>
			<!-- Moving Time -->
			<div class="flex-1 px-2 text-center">
				<p class="text-muted mb-1 text-xs">Moving Time</p>
				<p class="text-sm font-semibold text-white">
					{{ formatSecondsToHMS(activity.movingTime) }}
				</p>
			</div>
			<!-- Elevation -->
			<div class="flex-1 px-2 text-center">
				<p class="text-muted mb-1 text-xs">Elev Gain</p>
				<p class="text-sm font-semibold text-white">{{ activity.totalElevationGain }} m</p>
			</div>
			<!-- Elapsed Time -->
			<div class="flex-1 px-2 text-center">
				<p class="text-muted mb-1 text-xs">Elapsed</p>
				<p class="text-sm font-semibold text-white">
					{{ formatSecondsToHMS(activity.elapsedTime) }}
				</p>
			</div>
		</div>

		<!-- Mobile/Small Screen Layout (vertical list with dividers, no background) -->
		<div class="flex flex-col divide-y divide-white/20 md:hidden">
			<!-- Distance -->
			<div class="flex items-center justify-between px-1 py-2">
				<span class="text-muted text-xs">Distance</span>
				<span class="text-sm font-semibold text-white">
					{{ (activity.distance / 1000).toFixed(2) }} km
				</span>
			</div>
			<!-- Pace -->
			<div class="flex items-center justify-between px-1 py-2">
				<span class="text-muted text-xs">Pace</span>
				<span class="text-sm font-semibold text-white">
					{{ paceUtils.formatPaceToString(activity.movingPace) }}
				</span>
			</div>
			<!-- Moving Time -->
			<div class="flex items-center justify-between px-1 py-2">
				<span class="text-muted text-xs">Moving Time</span>
				<span class="text-sm font-semibold text-white">
					{{ formatSecondsToHMS(activity.movingTime) }}
				</span>
			</div>
			<!-- Elevation -->
			<div class="flex items-center justify-between px-1 py-2">
				<span class="text-muted text-xs">Elev Gain</span>
				<span class="text-sm font-semibold text-white">
					{{ activity.totalElevationGain }} m
				</span>
			</div>
			<!-- Elapsed Time -->
			<div class="flex items-center justify-between px-1 py-2">
				<span class="text-muted text-xs">Elapsed</span>
				<span class="text-sm font-semibold text-white">
					{{ formatSecondsToHMS(activity.elapsedTime) }}
				</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { Activity } from '@/types/activity'
import paceUtils from '@/utils/pace.utils'
import { formatSecondsToHMS } from '@/utils/time.utils'

interface Props {
	activity: Activity
}

defineProps<Props>()
</script>
