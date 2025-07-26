<template>
	<div class="bg-[#181C2A] rounded-xl shadow-lg px-2 overflow-hidden mt-5">
		<div class="flex items-center justify-end p-4">
			<label class="flex items-center gap-2 cursor-pointer text-white/70 text-sm">
				<input type="checkbox" v-model="showParticipantsOnly" class="accent-green-500" />
				Show Participants only
			</label>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full border-separate border-spacing-y-2">
				<thead>
					<tr class="bg-[#282F45] text-white text-sm">
						<th class="py-3 px-2 text-left font-medium rounded-l-lg">Rank</th>
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
					<tr
						v-for="(record, index) in filteredLeaderboard"
						:key="record.user._id"
						:class="[
							'bg-[#1E2332] hover:bg-[#282F4570] rounded-lg',
							{
								'opacity-40 cursor-not-allowed': !participantIds.includes(
									record.user._id,
								),
							},
						]"
					>
						<td
							class="py-2 px-2 text-white/60 font-semibold text-center rounded-l-lg"
						>
							{{ index + 1 }}
						</td>
						<td class="py-2 px-2 cursor-pointer">
							<div class="flex items-center gap-3">
								<img
									:src="getAvatarUrl(record.user.firstName)"
									:alt="record.user.firstName"
									class="w-10 h-10 rounded-full object-cover"
								/>
								<span class="text-white font-medium"
									>{{ record.user.firstName }} {{ record.user.lastName }}</span
								>
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
const participantIds = [
	'6863716cf8f61725ee9a4f98',
	'6862b7405f7a41fafa3bcbd3',
	'6862b7405f7a41fafa3bcbd1',
	'6862b7405f7a41fafa3bcbd5',
	'6862b7415f7a41fafa3bcbd9',
	'6868c2e581932e652aaea23d',
	'6862b7405f7a41fafa3bcbd7',
	'6863716cf8f61725ee9a4f96',
	'6863e71d3db934158bd2525f',
	'6863feb7e11bd2bd45e8dc13',
	'6863716cf8f61725ee9a4f94',
	'6862b7415f7a41fafa3bcbdb',
	'6862b7405f7a41fafa3bcbcd',
	'686584407f4fceb59b388235',
	'68647a05c9399ed6978e7bea',
	'6863feb7e11bd2bd45e8dc15',
	'6862b7415f7a41fafa3bcbdd',
	'68820ead33b122d23b0d61c6',
	'6862b7405f7a41fafa3bcbcf',
]

// Computed property to filter leaderboard based on participants
const filteredLeaderboard = computed(() => {
	if (showParticipantsOnly.value) {
		return leaderboard.value.filter((record) => participantIds.includes(record.user._id))
	}
	return leaderboard.value
})

// API call function
const fetchLeaderboardData = async () => {
	try {
		loading.value = true
		const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
		const today = new Date().toISOString().split('T')[0]
		const url = new URL(`${apiBaseUrl}/activities`)
		url.searchParams.set('period', activityPeriod.value)
		url.searchParams.set('date', today)
		const res = await fetch(url.toString())
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

/**
 * Generate avatar URL using a placeholder service
 */
const getAvatarUrl = (name: string): string => {
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=32`
}
</script>
