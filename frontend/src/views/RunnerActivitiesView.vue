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
			<div class="p-6 border-b border-[#282F45]">
				<div class="flex items-center gap-4 mb-4">
					<UiAvatar
						:name="`${activityData.user.firstName} ${activityData.user.lastName}`"
						:size="50"
					/>
					<h2 class="text-2xl font-semibold text-white">
						{{ activityData.user.firstName }} {{ activityData.user.lastName }}
					</h2>
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

			<!-- Activities Table -->
			<div
				v-if="activityData.activities.length > 0"
				class="bg-[#181C2A] rounded-xl shadow-lg overflow-hidden"
			>
				<div class="overflow-x-auto">
					<table class="w-full border-separate border-spacing-y-2">
						<thead>
							<tr class="bg-[#282F45] text-white text-sm">
								<th class="py-3 px-4 text-left font-medium rounded-l-lg">
									Activity
								</th>
								<th class="py-3 px-4 text-left font-medium">Distance</th>
								<th class="py-3 px-4 text-left font-medium">Elevation Gain</th>
								<th class="py-3 px-4 text-left font-medium">Type</th>
								<th class="py-3 px-4 text-left font-medium">Pace</th>
								<th class="py-3 px-4 text-left font-medium">Date</th>
								<th class="py-3 px-4 text-center font-medium rounded-r-lg">
									Status
								</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="activity in activityData.activities"
								:key="activity._id"
								class="bg-[#1E2332] hover:bg-[#282F4570] rounded-lg"
							>
								<td class="py-3 px-4 rounded-l-lg">
									<div class="text-white/80 font-medium truncate max-w-xs">
										{{ activity.name }}
									</div>
									<div
										v-if="activity.note"
										class="text-white/50 text-sm mt-1 max-w-xs"
									>
										{{ activity.note }}
									</div>
								</td>
								<td class="py-3 px-4">
									<span class="text-white/80 font-medium">
										{{ (activity.distance / 1000).toFixed(2) }} km
									</span>
								</td>
								<td class="py-3 px-4">
									<span class="text-white/80 font-medium">
										{{ activity.totalElevationGain }} m
									</span>
								</td>
								<td class="py-3 px-4">
									<span class="text-white/80 capitalize">{{
										activity.type
									}}</span>
								</td>
								<td class="py-3 px-4">
									<span class="text-white/60 font-medium">
										{{ paceUtils.formatPaceToString(activity.movingPace) }}
									</span>
								</td>
								<td class="py-3 px-4">
									<span class="text-white/60">
										{{ formatDate(activity.activityDate) }}
									</span>
								</td>
								<td class="py-3 px-4 text-center rounded-r-lg">
									<span
										class="text-xs px-2 py-1 rounded-full font-medium"
										:class="
											activity.isValid
												? 'bg-green-500/20 text-green-400'
												: 'bg-red-500/20 text-red-400'
										"
									>
										{{ activity.isValid ? 'Valid' : 'Invalid' }}
									</span>
								</td>
							</tr>
						</tbody>
					</table>
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
		console.log('activityData ==> ', activityData.value)
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
