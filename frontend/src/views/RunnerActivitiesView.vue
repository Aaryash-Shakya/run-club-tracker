<template>
	<div class="container mx-auto py-6 px-2">
		<!-- Navigation -->
		<div class="mb-6">
			<button
				@click="$router.push('/')"
				class="flex items-center gap-2 px-4 py-2 cursor-pointer bg-[#282F45] hover:bg-[#323852] text-white rounded-lg transition-colors"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					></path>
				</svg>
				Back to Leaderboard
			</button>
		</div>

		<!-- Loading State -->
		<div v-if="loading" class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
			<span class="ml-3 text-white/70">Loading activities...</span>
		</div>

		<!-- Activity Data -->
		<div
			v-else-if="activityData"
			class="bg-[#181C2A] rounded-xl shadow-lg overflow-hidden px-2"
		>
			<!-- User Header -->
			<div class="py-4 px-2 border-b border-[#282F45]">
				<div class="flex items-center gap-4 mb-4">
					<UiAvatar
						:name="`${activityData.user.firstName} ${activityData.user.lastName}`"
						:size="50"
					/>
					<h2 class="text-2xl font-semibold text-white">
						{{ activityData.user.firstName }} {{ activityData.user.lastName }}
					</h2>

					<!-- Participation Status -->
					<span
						class="ml-auto px-3 py-1 rounded-full text-xs font-semibold"
						:class="
							PARTICIPANT_IDS.includes(activityData.user._id)
								? 'bg-green-500/20 text-green-400'
								: 'bg-red-500/20 text-red-400'
						"
					>
						{{
							PARTICIPANT_IDS.includes(activityData.user._id)
								? 'Participating'
								: 'Not Participating'
						}}
					</span>
				</div>
				<!-- Bio -->
				<div v-if="activityData.user.bio" class="w-full my-4">
					<p class="text-white/80 text-base border-l-2 ps-2 border-[#FFFFFF80]">
						{{ activityData.user.bio }}
					</p>
				</div>
				<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
					<div class="text-center p-3 bg-[#1E2332] rounded-lg">
						<p class="text-sm text-white/60">Total Distance</p>
						<p class="text-lg font-semibold text-white">
							{{ (activityData.stats.totalDistance / 1000).toFixed(2) }} km
						</p>
					</div>
					<div class="text-center p-3 bg-[#1E2332] rounded-lg">
						<p class="text-sm text-white/60">Total Activities</p>
						<p class="text-lg font-semibold text-white">
							{{ activityData.stats.totalActivities }}
						</p>
					</div>
					<div class="text-center p-3 bg-[#1E2332] rounded-lg">
						<p class="text-sm text-white/60">Average Pace</p>
						<p class="text-lg font-semibold text-white">
							{{ paceUtils.formatPaceToString(activityData.stats.averagePace) }}
						</p>
					</div>
					<div class="text-center p-3 bg-[#1E2332] rounded-lg">
						<p class="text-sm text-white/60">Running Distance</p>
						<p class="text-lg font-semibold text-white">
							{{ (activityData.stats.runningDistance / 1000).toFixed(2) }} km
						</p>
					</div>
					<div class="text-center p-3 bg-[#1E2332] rounded-lg">
						<p class="text-sm text-white/60">Total Moving Time</p>
						<p class="text-lg font-semibold text-white">
							{{ formatSecondsToHMS(activityData.stats.totalMovingTime) }}
						</p>
					</div>
					<div class="text-center p-3 bg-[#1E2332] rounded-lg">
						<p class="text-sm text-white/60">Invalid Activities</p>
						<p class="text-lg font-semibold text-red-400">
							{{ activityData.stats.invalidActivities }}
						</p>
					</div>
				</div>
			</div>

			<!-- Activities Cards -->
			<div v-if="activityData.activities.length > 0" class="space-y-4 py-4 px-2">
				<div
					v-for="activity in activityData.activities"
					:key="activity._id"
					class="bg-[#1E2332] hover:bg-[#282F4570] rounded-lg p-4 transition-colors"
				>
					<!-- Header with icon, name, status, and type -->
					<div class="flex items-start gap-3 mb-2">
						<!-- Activity Type Icon -->
						<span
							class="inline-flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 mt-1"
							:class="activity.type === 'Run' ? 'bg-[#6366F1]' : 'bg-[#FBBF24]'"
						>
							<!-- Run or Walk Icon -->
							<img
								v-if="activity.type === 'Run'"
								src="@/assets/running-shoes.svg"
								alt="Run Icon"
								class="w-6 h-6 filter brightness-0 invert opacity-70"
							/>
							<img
								v-if="activity.type === 'Walk'"
								src="@/assets/walking-shoes.svg"
								alt="Walk Icon"
								class="w-6 h-6 filter brightness-0 opacity-70"
							/>
						</span>

						<!-- Name and Date Container -->
						<div class="flex-1 min-w-0">
							<h3 class="text-white/90 font-medium text-lg">
								{{ activity.name }}
							</h3>
							<p class="text-white/50 text-sm">
								{{ formatDate(activity.activityDate) }}
							</p>
						</div>

						<!-- Status Badge -->
						<div class="flex items-center gap-2 flex-shrink-0">
							<span
								class="text-xs px-2 py-1 rounded font-medium"
								:class="
									activity.isValid
										? 'bg-green-500/20 text-green-400'
										: 'bg-red-500/20 text-red-400'
								"
							>
								{{ activity.isValid ? 'Valid' : 'Invalid' }}
							</span>
						</div>
					</div>

					<!-- Stats -->
					<div
						class="flex flex-wrap items-center justify-between mt-3 divide-x divide-white/20"
					>
						<!-- Distance -->
						<div class="text-center flex-1 px-2">
							<p class="text-xs text-white/60 mb-1">Distance</p>
							<p class="text-white font-semibold text-sm">
								{{ (activity.distance / 1000).toFixed(2) }} km
							</p>
						</div>
						<!-- Pace -->
						<div class="text-center flex-1 px-2">
							<p class="text-xs text-white/60 mb-1">Pace</p>
							<p class="text-white font-semibold text-sm">
								{{ paceUtils.formatPaceToString(activity.movingPace) }}
							</p>
						</div>
						<!-- Moving Time -->
						<div class="text-center flex-1 px-2">
							<p class="text-xs text-white/60 mb-1">Moving Time</p>
							<p class="text-white font-semibold text-sm">
								{{ formatSecondsToHMS(activity.movingTime) }}
							</p>
						</div>
						<!-- Elevation -->
						<div class="text-center flex-1 px-2">
							<p class="text-xs text-white/60 mb-1">Elev Gain</p>
							<p class="text-white font-semibold text-sm">
								{{ activity.totalElevationGain }} m
							</p>
						</div>
						<!-- Elapsed Time -->
						<div class="text-center flex-1 px-2">
							<p class="text-xs text-white/60 mb-1">Elapsed</p>
							<p class="text-white font-semibold text-sm">
								{{ formatSecondsToHMS(activity.elapsedTime) }}
							</p>
						</div>
					</div>

					<!-- Note if exists -->
					<div v-if="activity.note" class="mt-3 p-2 bg-[#282F45] rounded">
						<p class="text-xs text-white/60 mb-1">Note</p>
						<p class="text-white/70 text-sm">{{ activity.note }}</p>
					</div>
				</div>
			</div>
			<div v-else class="text-center py-8 text-white/60">
				No activities found for this user
			</div>
		</div>

		<!-- Empty State -->
		<div v-else class="text-center py-12">
			<p class="text-white/70 text-lg">No activity data available</p>
			<button
				@click="fetchUserActivityData"
				class="mt-4 px-6 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5855eb] transition-colors"
			>
				Refresh Data
			</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import type { UserActivitiesWithStats } from '@/types/activity'
import { useRoute } from 'vue-router'
import paceUtils from '@/utils/pace.utils'
import { formatSecondsToHMS } from '@/utils/time.utils'
import UiAvatar from '@/components/UiAvatar.vue'
import { PARTICIPANT_IDS } from '@/constants/participant.constants'

// Reactive state
const loading = ref<boolean>(false)
const activityData = ref<UserActivitiesWithStats | null>(null)

type ActivitiesResponse = {
	status: string
	message: string
	activities: UserActivitiesWithStats
}

const fetchUserActivityData = async () => {
	try {
		loading.value = true
		const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
		const today = new Date().toISOString().split('T')[0]
		const route = useRoute()
		const runnerId = route.params.runnerId as string
		const url = new URL(`${apiBaseUrl}/activities/users/${runnerId}`)
		url.searchParams.set('period', 'monthly')
		url.searchParams.set('date', today)
		const res = await fetch(url.toString(), { cache: 'default' })
		const response: ActivitiesResponse = await res.json()

		activityData.value = response.activities
	} catch (error) {
		console.error('Error fetching activityData data:', error)
		activityData.value = null
	} finally {
		loading.value = false
	}
}

const formatDate = (dateString: string): string => {
	const date = new Date(dateString)
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

// Fetch data on component mount
onMounted(() => {
	fetchUserActivityData()
})
</script>
