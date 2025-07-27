<template>
	<div class="container py-6">
		<h1 class="mb-6 text-center text-3xl font-bold text-white">Runners</h1>

		<div class="mb-6 text-center">
			<p class="text-sm text-white/70">
				Hand-crafted bios with a sprinkle of fun! Want to tweak one? Ping me on Slack!
			</p>
		</div>

		<!-- Loading State -->
		<div v-if="loading" class="flex items-center justify-center py-12">
			<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
			<span class="ml-3 text-white/70">Loading runners...</span>
		</div>

		<!-- Runners List -->
		<div v-else-if="runners.length > 0" class="space-y-4">
			<div
				v-for="runner in runners"
				:key="runner._id"
				class="bg-surface hover:bg-surface-light cursor-pointer rounded-xl p-6 shadow-lg transition-colors"
				@click="$router.push(`/runners/${runner._id}/activities`)"
			>
				<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<!-- Runner Info -->
					<div class="flex items-center gap-4">
						<UiAvatar :name="`${runner.firstName} ${runner.lastName}`" :size="50" />
						<div>
							<div class="mb-1 flex items-center gap-2">
								<h3 class="text-xl font-semibold text-white">
									{{ runner.firstName }} {{ runner.lastName }}
								</h3>
								<!-- Participation Status Tag -->
								<span
									v-if="!PARTICIPANT_IDS.includes(runner._id)"
									class="rounded bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-400"
								>
									Not Participating
								</span>
							</div>
							<p v-if="runner.bio" class="mt-1 text-base text-white/70">
								{{ runner.bio }}
							</p>
						</div>
					</div>

					<!-- Show Activities Button -->
					<button
						class="hover:bg-accent-run w-full cursor-pointer rounded-lg bg-[#4F51B6] px-4 py-2 text-sm font-normal whitespace-nowrap text-white transition-colors md:w-auto"
					>
						Show Activities
					</button>
				</div>
			</div>
		</div>

		<!-- Empty State -->
		<div v-else class="py-12 text-center">
			<p class="text-lg text-white/70">No runners found</p>
			<button
				@click="fetchRunners"
				class="bg-accent-run hover:bg-accent-run-hover mt-4 rounded-lg px-6 py-2 text-white transition-colors"
			>
				Refresh
			</button>
		</div>

		<!-- Error State -->
		<div v-if="error" class="py-12 text-center">
			<p class="mb-4 text-lg text-red-400">{{ error }}</p>
			<button
				@click="fetchRunners"
				class="bg-accent-run hover:bg-accent-run-hover rounded-lg px-6 py-2 text-white transition-colors"
			>
				Try Again
			</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import UiAvatar from '@/components/UiAvatar.vue'
import { PARTICIPANT_IDS } from '@/constants/participant.constants'
import type { TUser } from '@/types/activity'

// Reactive state
const loading = ref<boolean>(false)
const runners = ref<TUser[]>([])
const error = ref<string | null>(null)

// Fetch runners from API
const fetchRunners = async () => {
	try {
		loading.value = true
		error.value = null

		const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
		const response = await fetch(`${apiBaseUrl}/users`)

		if (!response.ok) {
			throw new Error(`Failed to fetch runners: ${response.statusText}`)
		}

		const responseData: {
			status: number
			message: string
			data: {
				users: TUser[]
				count: number
			}
		} = await response.json()
		runners.value = responseData.data.users
	} catch (err) {
		console.error('Error fetching runners:', err)
		error.value = err instanceof Error ? err.message : 'Failed to fetch runners'
		runners.value = []
	} finally {
		loading.value = false
	}
}

// Fetch runners on component mount
onMounted(() => {
	fetchRunners()
})
</script>
