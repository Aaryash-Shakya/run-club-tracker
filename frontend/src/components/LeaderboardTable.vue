<template>
	<div class="bg-[#181C2A] rounded-xl shadow-lg px-2 overflow-hidden mt-5">
		<div class="flex items-center justify-end p-4">
			<label class="flex items-center gap-2 cursor-pointer text-white/70 text-sm">
				<input
					type="checkbox"
					v-model="showParticipantsOnly"
					class="accent-[#6366F1] h-4 w-4"
				/>
				Show Participants only
			</label>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full border-separate border-spacing-y-2">
				<thead>
					<tr class="bg-[#282F45] text-white text-sm">
						<th class="py-3 px-2 text-center font-medium rounded-l-lg">Rank</th>
						<th class="py-3 px-2 text-left font-medium">Runner</th>
						<th class="py-3 px-2 text-left font-medium">Distance</th>
						<th class="py-3 px-2 text-left font-medium">Run : Walk</th>
						<th class="py-3 px-2 text-left font-medium">Avg. Pace</th>
						<th class="py-3 px-2 text-left font-medium hidden md:table-cell">
							Activities
						</th>
						<th
							class="py-3 px-2 text-left font-medium rounded-r-lg hidden md:table-cell"
						>
							Duration
						</th>
					</tr>
				</thead>
				<tbody>
					<!-- Loading State -->
					<tr v-if="loading" class="bg-[#1E2332] rounded-lg">
						<td colspan="7" class="py-8 px-4 text-center">
							<div class="flex justify-center items-center">
								<div
									class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"
								></div>
								<span class="ml-3 text-white/70">Loading activities...</span>
							</div>
						</td>
					</tr>
					<!-- No activities message -->
					<tr
						v-else-if="filteredLeaderboard.length === 0"
						class="bg-[#1E2332] rounded-lg"
					>
						<td colspan="7" class="py-8 px-4 text-center">
							<div class="text-white/60 text-lg">No activities yet</div>
							<div class="text-white/40 text-sm mt-2">
								Lace up and log your first activity to claim your spot on the
								leaderboard!
							</div>
						</td>
					</tr>
					<!-- Leaderboard data -->
					<tr
						v-for="(record, index) in filteredLeaderboard"
						:key="record.user._id"
						:class="[
							'bg-[#1E2332] hover:bg-[#282F4570] rounded-lg cursor-pointer',
							{
								'opacity-40 cursor-not-allowed': !PARTICIPANT_IDS.includes(
									record.user._id,
								),
							},
						]"
						v-on:click="() => $router.push(`/runners/${record.user._id}/activities`)"
					>
						<td class="py-2 px-2 text-white/60 font-semibold text-center rounded-l-lg">
							{{ index + 1 }}
						</td>
						<td class="py-2 px-2 cursor-pointer">
							<div class="flex items-center gap-3">
								<UiAvatar
									:name="`${record.user.firstName} ${record.user.lastName}`"
									:size="40"
								/>
								<span class="hidden md:inline">
									{{ record.user.firstName }} {{ record.user.lastName }}
								</span>
								<span class="inline md:hidden">
									{{ record.user.firstName.split(' ')[0] }}
								</span>
							</div>
						</td>
						<td class="py-2 px-2">
							<div class="flex items-center gap-2">
								<div class="font-medium text-white/80">
									{{ (record.stats.totalDistance / 1000).toFixed(1) }} km
								</div>
							</div>
						</td>
						<td class="py-2 px-2">
							<div class="flex flex-col gap-2">
								<div class="flex items-center gap-3">
									<!-- Running Distance -->
									<div class="flex flex-col items-center gap-1">
										<img
											src="../assets/running-shoes.svg"
											alt="Running"
											class="w-4 h-4 filter brightness-0 invert opacity-70"
										/>
										<span class="text-xs text-white/60 font-medium">
											{{
												(
													(record.stats.runningDistance || 0) / 1000
												).toFixed(1)
											}}
										</span>
									</div>

									<!-- Separator -->
									<span class="text-white/40 text-sm">:</span>

									<!-- Walking Distance -->
									<div class="flex flex-col items-center gap-1">
										<img
											src="../assets/walking-shoes.svg"
											alt="Walking"
											class="w-4 h-4 filter brightness-0 invert opacity-70"
										/>
										<span class="text-xs text-white/60 font-medium">
											{{
												(
													(record.stats.walkingDistance || 0) / 1000
												).toFixed(1)
											}}
										</span>
									</div>
								</div>

								<!-- Ratio Bar -->
								<div class="flex flex-col gap-2 w-20">
									<div
										class="w-full h-2 bg-[#23232a] rounded-full overflow-hidden relative"
									>
										<!-- Running portion (blue) -->
										<div
											class="absolute left-0 top-0 h-full bg-[#6366F1] rounded-l-full"
											:style="{
												width:
													(record.stats.totalDistance > 0
														? ((record.stats.runningDistance || 0) /
																record.stats.totalDistance) *
															100
														: 0) + '%',
											}"
										></div>
										<!-- Walking portion (orange) -->
										<div
											class="absolute right-0 top-0 h-full bg-[#FBBF24] rounded-r-full"
											:style="{
												width:
													(record.stats.totalDistance > 0
														? ((record.stats.walkingDistance || 0) /
																record.stats.totalDistance) *
															100
														: 0) + '%',
											}"
										></div>
									</div>
								</div>
							</div>
						</td>
						<td class="py-2 px-2">
							<div class="flex items-center gap-2">
								<span class="text-white/60 font-medium">{{
									paceUtils.formatPaceToString(record.stats.averagePace)
								}}</span>
							</div>
						</td>
						<td class="p-2 hidden md:table-cell">
							<div class="flex items-center gap-2">
								<span class="text-white/60 font-medium">{{
									record.stats.totalActivities
								}}</span>
							</div>
						</td>
						<td class="p-2 rounded-r-lg hidden md:table-cell">
							<div class="flex items-center gap-2">
								<span class="text-white/60 font-medium">{{
									formatSecondsToHMS(record.stats.totalMovingTime)
								}}</span>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { UserActivitiesWithStats } from '@/types/activity'
import paceUtils from '@/utils/pace.utils'
import { formatSecondsToHMS } from '@/utils/time.utils'
import { ref, onMounted, watch, computed } from 'vue'
import UiAvatar from './UiAvatar.vue'
import { PARTICIPANT_IDS } from '@/constants/participant.constants'

interface Props {
	targetDistance?: number
}

type ActivitiesResponse = {
	status: string
	message: string
	userActivitiesWithStats: UserActivitiesWithStats[]
}

type ActivityPeriod = 'daily' | 'weekly' | 'monthly'

// Props
withDefaults(defineProps<Props>(), {
	targetDistance: 70000, // 70km in meters
})

// State
const activityPeriod = ref<ActivityPeriod>('monthly')
const leaderboard = ref<UserActivitiesWithStats[]>([])
const loading = ref(false)
const showParticipantsOnly = ref(false)

// Computed property to filter leaderboard based on participants
const filteredLeaderboard = computed(() => {
	if (showParticipantsOnly.value) {
		return leaderboard.value.filter((record) => PARTICIPANT_IDS.includes(record.user._id))
	}
	return leaderboard.value
})

// API call function
const fetchLeaderboardData = async () => {
	try {
		loading.value = true
		leaderboard.value = [] // Clear existing data when starting new fetch
		const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
		const today = new Date().toISOString().split('T')[0]
		const url = new URL(`${apiBaseUrl}/activities`)
		url.searchParams.set('period', activityPeriod.value)
		url.searchParams.set('date', today)
		const res = await fetch(url.toString(), { cache: 'default' })
		const response: ActivitiesResponse = await res.json()

		leaderboard.value = response.userActivitiesWithStats
	} catch (error) {
		console.error('Error fetching leaderboard data:', error)
		leaderboard.value = []
	} finally {
		loading.value = false
	}
}

// Watch for period changes and refetch data
watch(activityPeriod, () => {
	fetchLeaderboardData()
})

// Initial data fetch
onMounted(() => {
	fetchLeaderboardData()
})

// Expose activityPeriod for parent components to control
defineExpose({
	activityPeriod,
	setActivityPeriod: (period: ActivityPeriod) => {
		activityPeriod.value = period
	},
})
</script>
