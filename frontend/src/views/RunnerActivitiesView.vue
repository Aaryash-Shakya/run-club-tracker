<template>
	<div class="container py-6">
		<!-- Navigation -->
		<div class="mb-6">
			<button
				@click="$router.push('/')"
				class="bg-soft flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors hover:bg-[#323852]"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
		<div v-if="loading" class="flex items-center justify-center py-12">
			<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
			<span class="ml-3 text-white/70">Loading activities...</span>
		</div>

		<!-- Activity Data -->
		<div v-else-if="activityData" class="bg-surface overflow-hidden rounded-xl px-2 shadow-lg">
			<!-- User Header -->
			<div class="border-soft border-b px-2 py-4">
				<div class="mb-4 flex items-center gap-4">
					<UiAvatar
						:name="`${activityData.user.firstName} ${activityData.user.lastName}`"
						:size="50"
					/>
					<h2 class="text-2xl font-semibold text-white">
						{{ activityData.user.firstName }} {{ activityData.user.lastName }}
					</h2>

					<!-- Participation Status -->
					<span
						class="ml-auto rounded-full px-3 py-1 text-xs font-semibold"
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
				<div v-if="activityData.user.bio" class="my-4 w-full">
					<p class="text-muted-light border-muted-light border-l-2 ps-2 text-base">
						{{ activityData.user.bio }}
					</p>
				</div>
				<RunnerHeaderStats :stats="activityData.stats" />
			</div>

			<!-- Activities Cards -->
			<div v-if="activityData.activities.length > 0" class="space-y-4 px-2 py-4">
				<div
					v-for="activity in activityData.activities"
					:key="activity._id"
					class="bg-surface-light rounded-lg p-4 transition-colors hover:bg-[#282F4570]"
				>
					<!-- Header with icon, name, status, and type -->
					<div class="mb-2 flex items-start gap-3">
						<!-- Activity Type Icon -->
						<span
							class="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
							:class="activity.type === 'Run' ? 'bg-accent-run' : 'bg-accent-walk'"
						>
							<!-- Run or Walk Icon -->
							<img
								v-if="activity.type === 'Run'"
								src="@/assets/running-shoes.svg"
								alt="Run Icon"
								class="h-6 w-6 opacity-70 brightness-0 invert filter"
							/>
							<img
								v-if="activity.type === 'Walk'"
								src="@/assets/walking-shoes.svg"
								alt="Walk Icon"
								class="h-6 w-6 opacity-70 brightness-0 filter"
							/>
						</span>

						<!-- Name and Date Container -->
						<div class="min-w-0 flex-1">
							<h3 class="text-lg font-medium text-white/90">
								{{ activity.name }}
							</h3>
							<p class="text-sm text-white/50">
								{{ formatDate(activity.activityDate) }}
							</p>
						</div>

						<!-- Status Badge -->
						<div class="flex flex-shrink-0 items-center gap-2">
							<span
								class="rounded px-2 py-1 text-xs font-medium"
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
					<RunnerActivityStats :activity="activity" />

					<!-- Note if exists -->
					<div v-if="activity.note" class="bg-soft mt-3 rounded p-2">
						<p class="text-muted mb-1 text-xs">Note</p>
						<p class="text-sm text-white/70">{{ activity.note }}</p>
					</div>
				</div>
			</div>
			<div v-else class="text-muted py-8 text-center">No activities found for this user</div>
		</div>

		<!-- Empty State -->
		<div v-else class="py-12 text-center">
			<p class="text-lg text-white/70">No activity data available</p>
			<button
				@click="fetchUserActivityData"
				class="bg-accent-run hover:bg-accent-run-hover mt-4 rounded-lg px-6 py-2 text-white transition-colors"
			>
				Refresh Data
			</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import type { TUserActivitiesWithStats } from '@/types/activity'
import { useRoute } from 'vue-router'
import UiAvatar from '@/components/UiAvatar.vue'
import RunnerActivityStats from '@/components/RunnerActivityStats.vue'
import RunnerHeaderStats from '@/components/RunnerHeaderStats.vue'
import { PARTICIPANT_IDS } from '@/constants/participant.constants'

// Reactive state
const loading = ref<boolean>(false)
const activityData = ref<TUserActivitiesWithStats | null>(null)

type ActivitiesResponse = {
	status: string
	message: string
	activities: TUserActivitiesWithStats
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
