<template>
	<!-- Top 3 Podium for Monthly View -->
	<TopThreePodium
		v-if="activityPeriod === 'monthly'"
		:records="filteredLeaderboard"
		:is-loading="loading"
	/>
	<div class="bg-surface mt-5 overflow-hidden rounded-xl px-2 shadow-lg">
		<div class="flex items-center justify-end p-4">
			<label class="flex cursor-pointer items-center gap-2 text-sm text-white/70">
				<input
					type="checkbox"
					v-model="showParticipantsOnly"
					class="accent-accent-run h-4 w-4"
				/>
				Show Participants only
			</label>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full border-separate border-spacing-y-2">
				<thead>
					<tr class="bg-soft text-sm text-white">
						<th class="rounded-l-lg px-2 py-3 text-center font-medium">Rank</th>
						<th class="px-2 py-3 text-left font-medium">Runner</th>
						<th class="px-2 py-3 text-left font-medium">Distance</th>
						<th class="px-2 py-3 text-left font-medium">Run : Walk</th>
						<th class="px-2 py-3 text-left font-medium">Avg. Pace</th>
						<th class="hidden px-2 py-3 text-left font-medium md:table-cell">
							Activities
						</th>
						<th
							class="hidden rounded-r-lg px-2 py-3 text-left font-medium md:table-cell"
						>
							Duration
						</th>
					</tr>
				</thead>
				<tbody>
					<!-- Loading State -->
					<tr v-if="loading" class="bg-surface-light rounded-lg">
						<td colspan="7" class="px-4 py-8 text-center">
							<div class="flex items-center justify-center">
								<div
									class="h-8 w-8 animate-spin rounded-full border-b-2 border-white"
								></div>
								<span class="ml-3 text-white/70">Loading activities...</span>
							</div>
						</td>
					</tr>
					<!-- No activities message -->
					<tr
						v-else-if="filteredLeaderboard.length === 0"
						class="bg-surface-light rounded-lg"
					>
						<td colspan="7" class="px-4 py-8 text-center">
							<div class="text-muted text-lg">No activities yet</div>
							<div class="mt-2 text-sm text-white/40">
								Lace up and log your first activity to claim your spot on the
								leaderboard!
							</div>
						</td>
					</tr>
					<!-- Leaderboard data -->
					<template
						v-for="({ user, stats, changes }, index) in filteredLeaderboard"
						:key="user._id"
					>
						<!-- Separator for first record under 100km -->
						<tr v-if="index === separatorIndex" class="bg-transparent">
							<td colspan="7" class="px-2 py-2">
								<div class="flex items-center gap-3">
									<div class="h-px flex-1 bg-white/20"></div>
									<span class="text-xs font-medium text-white/50"
										>Finish Line (100km)</span
									>
									<div class="h-px flex-1 bg-white/20"></div>
								</div>
							</td>
						</tr>

						<tr
							:class="[
								'bg-surface-light cursor-pointer rounded-lg hover:bg-[#282F4570]',
								{
									'cursor-not-allowed opacity-40': !PARTICIPANT_IDS.includes(
										user._id,
									),
								},
							]"
							v-on:click="() => $router.push(`/runners/${user._id}/activities`)"
						>
							<td class="text-muted rounded-l-lg px-2 py-2 text-center font-semibold">
								<div
									class="flex items-center justify-center gap-1"
									:title="`+${(changes.distanceAdded / 1000).toFixed(1)}km, +${changes.activitiesAdded} activities`"
								>
									<span>{{ index + 1 }}</span>
									<!-- Position change indicator -->
									<div
										v-if="activityPeriod === 'monthly'"
										class="flex w-5 items-center justify-center text-xs leading-none font-light text-shadow-white"
									>
										<span
											v-if="changes.positionChange === 'up'"
											class="text-green-500"
										>
											<UpArrow class="h-3 w-3" />{{ changes.positionDiff }}
										</span>
										<span
											v-else-if="changes.positionChange === 'down'"
											class="text-red-500"
										>
											{{ changes.positionDiff }}<DownArrow class="h-3 w-3" />
										</span>
										<!-- new activities but no change in position -->
										<span
											v-else-if="changes.distanceAdded > 0"
											class="text-lg text-yellow-300"
										>
											=
										</span>
									</div>
								</div>
							</td>
							<td class="px-2 py-2">
								<div class="flex items-center gap-3">
									<UiAvatar
										:name="`${user.firstName} ${user.lastName}`"
										:size="40"
									/>
									<span class="hidden md:inline">
										{{ user.firstName }} {{ user.lastName }}
									</span>
									<span class="inline md:hidden">
										{{ user.firstName.split(' ')[0] }}
									</span>
								</div>
							</td>
							<td class="px-2 py-2">
								<div class="flex items-center gap-2">
									<div
										class="font-normal"
										:class="{
											'text-white': stats.totalDistance >= TARGET_DISTANCE,
											'text-muted-light':
												stats.totalDistance < TARGET_DISTANCE,
										}"
									>
										{{ (stats.totalDistance / 1000).toFixed(1) }}
										<span
											class="relative -top-1 hidden text-xs font-light text-green-500 md:inline-block"
										>
											{{
												changes.distanceAdded
													? `+${Number((changes.distanceAdded / 1000).toFixed(1))}`
													: ''
											}}
										</span>
									</div>
								</div>
							</td>
							<td class="px-2 py-2">
								<div class="flex flex-col gap-2">
									<div class="flex items-center gap-3">
										<!-- Running Distance -->
										<div class="flex flex-col items-center gap-1">
											<img
												src="../assets/running-shoes.svg"
												alt="Running"
												class="h-4 w-4 opacity-70 brightness-0 invert filter"
											/>
											<span class="text-muted text-xs font-medium">
												{{
													((stats.runningDistance || 0) / 1000).toFixed(1)
												}}
											</span>
										</div>

										<!-- Separator -->
										<span class="text-sm text-white/40">:</span>

										<!-- Walking Distance -->
										<div class="flex flex-col items-center gap-1">
											<img
												src="../assets/walking-shoes.svg"
												alt="Walking"
												class="h-4 w-4 opacity-70 brightness-0 invert filter"
											/>
											<span class="text-muted text-xs font-medium">
												{{
													((stats.walkingDistance || 0) / 1000).toFixed(1)
												}}
											</span>
										</div>
									</div>

									<!-- Ratio Bar -->
									<div class="flex w-20 flex-col gap-2">
										<div
											class="relative h-2 w-full overflow-hidden rounded-full"
										>
											<!-- Running portion -->
											<div
												class="bg-accent-run absolute top-0 left-0 h-full rounded-l-full"
												:style="{
													width:
														(stats.totalDistance > 0
															? ((stats.runningDistance || 0) /
																	stats.totalDistance) *
																100
															: 0) + '%',
												}"
											></div>
											<!-- Walking portion -->
											<div
												class="bg-accent-walk absolute top-0 right-0 h-full rounded-r-full"
												:style="{
													width:
														(stats.totalDistance > 0
															? ((stats.walkingDistance || 0) /
																	stats.totalDistance) *
																100
															: 0) + '%',
												}"
											></div>
										</div>
									</div>
								</div>
							</td>
							<td class="px-2 py-2">
								<div class="flex items-center gap-2">
									<span class="text-muted font-medium">{{
										paceUtils.formatPaceToString(stats.averagePace)
									}}</span>
								</div>
							</td>
							<td class="hidden p-2 md:table-cell">
								<div class="flex items-center gap-2">
									<span class="text-muted font-medium">{{
										stats.totalActivities
									}}</span>
									<span
										class="relative -top-1 hidden text-xs font-light text-green-500 md:inline-block"
									>
										{{
											changes.activitiesAdded
												? `+${changes.activitiesAdded}`
												: ''
										}}
									</span>
								</div>
							</td>
							<td class="hidden rounded-r-lg p-2 md:table-cell">
								<div class="flex items-center gap-2">
									<span class="text-muted font-medium">{{
										formatSecondsToHMS(stats.totalMovingTime)
									}}</span>
								</div>
							</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script lang="ts" setup>
import type { TUserWithStats } from '@/types/activity'
import paceUtils from '@/utils/pace.utils'
import { formatSecondsToHMS } from '@/utils/time.utils'
import { ref, onMounted, watch, computed } from 'vue'
import UiAvatar from './UiAvatar.vue'
import TopThreePodium from './TopThreePodium.vue'
import { PARTICIPANT_IDS } from '@/constants/participant.constants'
import UpArrow from './icons/UpArrow.vue'
import DownArrow from './icons/DownArrow.vue'

const TARGET_DISTANCE = 100000

type ActivitiesResponse = {
	status: string
	message: string
	userActivitiesWithStats: TUserWithStats[]
}

type ActivityPeriod = 'daily' | 'weekly' | 'monthly'

type LeaderboardEntry = {
	userId: string
	distance: number
	activities: number
}

type PositionChange = 'up' | 'down' | 'neutral'

type LeaderboardWithPosition = TUserWithStats & {
	changes: {
		positionChange: PositionChange
		positionDiff: number
		distanceAdded: number
		activitiesAdded: number
	}
}

// State
const activityPeriod = ref<ActivityPeriod>('monthly')
const queryDate = ref<string>(new Date().toISOString().split('T')[0])
const leaderboard = ref<LeaderboardWithPosition[]>([])
const loading = ref(false)
const showParticipantsOnly = ref(false)

// Computed property to filter leaderboard based on participants
const filteredLeaderboard = computed(() => {
	if (showParticipantsOnly.value) {
		return leaderboard.value.filter((record) => PARTICIPANT_IDS.includes(record.user._id))
	}
	return leaderboard.value
})

// Computed property to find the index where separator should be placed (first record under 100km)
const separatorIndex = computed(() => {
	if (activityPeriod.value !== 'monthly') return -1

	const index = filteredLeaderboard.value.findIndex(
		(record) => record.stats.totalDistance < TARGET_DISTANCE,
	)
	// If the first record is under 100km, don't show separator
	return index === 0 ? -1 : index
})

// Function to fetch recent activities (last 24 hours)
const fetchRecentActivities = async (): Promise<TUserWithStats[]> => {
	try {
		const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
		const res = await fetch(`${apiBaseUrl}/activities/recent`, { cache: 'default' })
		const response: ActivitiesResponse = await res.json()
		return response.userActivitiesWithStats
	} catch (error) {
		console.error('Error fetching recent activities:', error)
		return []
	}
}

// Function to get changes from current leaderboard
const getCurrentLeaderboard = (records: TUserWithStats[]): LeaderboardEntry[] => {
	return records
		.map((record) => ({
			userId: record.user._id,
			distance: record.stats.totalDistance,
			activities: record.stats.totalActivities,
		}))
		.sort((a, b) => b.distance - a.distance)
}

// Function to calculate previous leaderboard by subtracting recent activities
const calculatePreviousLeaderboard = (
	currentData: LeaderboardEntry[],
	recentData: TUserWithStats[],
): LeaderboardEntry[] => {
	const recentMap = new Map<string, TUserWithStats>()
	recentData.forEach((record) => {
		recentMap.set(record.user._id, record)
	})

	return currentData
		.map((current) => {
			const recent = recentMap.get(current.userId)
			if (recent) {
				return {
					userId: current.userId,
					distance: current.distance - recent.stats.totalDistance,
					activities: current.activities - recent.stats.totalActivities,
				}
			}
			return current
		})
		.sort((a, b) => b.distance - a.distance)
}

// Function to check position changes
const checkPositionChanges = (
	currentLeaderboard: LeaderboardEntry[],
	previousLeaderboard: LeaderboardEntry[],
): Map<string, { change: PositionChange; diff: number }> => {
	const previousPositions = new Map<string, number>()
	previousLeaderboard.forEach((entry, index) => {
		previousPositions.set(entry.userId, index)
	})

	const positionChanges = new Map<string, { change: PositionChange; diff: number }>()

	currentLeaderboard.forEach((entry, currentIndex) => {
		const previousIndex = previousPositions.get(entry.userId)

		if (previousIndex !== undefined) {
			const diff = previousIndex - currentIndex
			let change: PositionChange = 'neutral'

			if (diff > 0) {
				change = 'up'
			} else if (diff < 0) {
				change = 'down'
			}

			positionChanges.set(entry.userId, { change, diff: Math.abs(diff) })
		} else {
			// New entry, consider as neutral
			positionChanges.set(entry.userId, { change: 'neutral', diff: 0 })
		}
	})

	return positionChanges
}

// API call function
const fetchLeaderboardData = async () => {
	try {
		loading.value = true
		leaderboard.value = [] // Clear existing data when starting new fetch
		const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

		let response: ActivitiesResponse

		const currentMonthDateString = new Date().toISOString().split('T')[0]

		const isThisMonth = queryDate.value.slice(0, 7) === currentMonthDateString.slice(0, 7)

		if (activityPeriod.value === 'monthly' && isThisMonth) {
			// For monthly period, fetch recent activities and calculate position changes
			const [currentRes, recentData] = await Promise.all([
				fetch(`${apiBaseUrl}/activities?period=monthly&date=${queryDate.value}`, {
					cache: 'default',
				}),
				fetchRecentActivities(),
			])

			response = await currentRes.json()
			const currentLeaderboard = getCurrentLeaderboard(response.userActivitiesWithStats)
			const previousLeaderboard = calculatePreviousLeaderboard(currentLeaderboard, recentData)
			const positionChanges = checkPositionChanges(currentLeaderboard, previousLeaderboard)

			// Create a map of recent activities for easy lookup
			const recentMap = new Map<string, TUserWithStats>()
			recentData.forEach((record) => {
				recentMap.set(record.user._id, record)
			})

			// Add position change information to leaderboard data
			leaderboard.value = response.userActivitiesWithStats.map((record) => {
				const recent = recentMap.get(record.user._id)
				const distanceAdded = recent ? recent.stats.totalDistance : 0
				const activitiesAdded = recent ? recent.stats.totalActivities : 0

				const changes = {
					positionChange: positionChanges.get(record.user._id)?.change || 'neutral',
					positionDiff: positionChanges.get(record.user._id)?.diff || 0,
					distanceAdded,
					activitiesAdded,
				}
				return {
					...record,
					changes,
				}
			})
		} else {
			// For daily and weekly periods, use existing logic
			const url = new URL(`${apiBaseUrl}/activities`)
			url.searchParams.set('period', activityPeriod.value)
			url.searchParams.set('date', queryDate.value)
			const res = await fetch(url.toString(), { cache: 'default' })
			response = await res.json()

			const noChange = {
				positionChange: 'neutral' as PositionChange,
				positionDiff: 0,
				distanceAdded: 0,
				activitiesAdded: 0,
			}
			leaderboard.value = response.userActivitiesWithStats.map((record) => ({
				...record,
				changes: noChange,
			}))
		}
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

// Watch for queryDate changes and refetch data
watch(queryDate, () => {
	fetchLeaderboardData()
})

// Initial data fetch
onMounted(() => {
	fetchLeaderboardData()
})

// Expose activityPeriod and queryDate for parent components to control
defineExpose({
	activityPeriod,
	setActivityPeriod: (period: ActivityPeriod) => {
		activityPeriod.value = period
	},
	setQueryDate: (date: string) => {
		queryDate.value = date
	},
})
</script>
