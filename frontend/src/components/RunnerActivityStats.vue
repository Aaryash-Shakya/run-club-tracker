<template>
	<!-- Stats -->
	<div class="mt-3">
		<!-- Desktop/Large Screen Layout (flex with dividers) -->
		<div class="hidden md:flex flex-wrap items-center justify-between divide-x divide-white/20">
			<!-- Distance -->
			<div class="text-center flex-1 px-2">
				<p class="text-xs text-muted mb-1">Distance</p>
				<p class="text-white font-semibold text-sm">
					{{ (activity.distance / 1000).toFixed(2) }} km
				</p>
			</div>
			<!-- Pace -->
			<div class="text-center flex-1 px-2">
				<p class="text-xs text-muted mb-1">Pace</p>
				<p class="text-white font-semibold text-sm">
					{{ paceUtils.formatPaceToString(activity.movingPace) }}
				</p>
			</div>
			<!-- Moving Time -->
			<div class="text-center flex-1 px-2">
				<p class="text-xs text-muted mb-1">Moving Time</p>
				<p class="text-white font-semibold text-sm">
					{{ formatSecondsToHMS(activity.movingTime) }}
				</p>
			</div>
			<!-- Elevation -->
			<div class="text-center flex-1 px-2">
				<p class="text-xs text-muted mb-1">Elev Gain</p>
				<p class="text-white font-semibold text-sm">{{ activity.totalElevationGain }} m</p>
			</div>
			<!-- Elapsed Time -->
			<div class="text-center flex-1 px-2">
				<p class="text-xs text-muted mb-1">Elapsed</p>
				<p class="text-white font-semibold text-sm">
					{{ formatSecondsToHMS(activity.elapsedTime) }}
				</p>
			</div>
		</div>

		<!-- Mobile/Small Screen Layout (vertical list with dividers, no background) -->
		<div class="md:hidden flex divide-y divide-white/20 flex-col">
			<!-- Distance -->
			<div class="flex items-center justify-between py-2 px-1">
				<span class="text-xs text-muted">Distance</span>
				<span class="text-white font-semibold text-sm">
					{{ (activity.distance / 1000).toFixed(2) }} km
				</span>
			</div>
			<!-- Pace -->
			<div class="flex items-center justify-between py-2 px-1">
				<span class="text-xs text-muted">Pace</span>
				<span class="text-white font-semibold text-sm">
					{{ paceUtils.formatPaceToString(activity.movingPace) }}
				</span>
			</div>
			<!-- Moving Time -->
			<div class="flex items-center justify-between py-2 px-1">
				<span class="text-xs text-muted">Moving Time</span>
				<span class="text-white font-semibold text-sm">
					{{ formatSecondsToHMS(activity.movingTime) }}
				</span>
			</div>
			<!-- Elevation -->
			<div class="flex items-center justify-between py-2 px-1">
				<span class="text-xs text-muted">Elev Gain</span>
				<span class="text-white font-semibold text-sm">
					{{ activity.totalElevationGain }} m
				</span>
			</div>
			<!-- Elapsed Time -->
			<div class="flex items-center justify-between py-2 px-1">
				<span class="text-xs text-muted">Elapsed</span>
				<span class="text-white font-semibold text-sm">
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
