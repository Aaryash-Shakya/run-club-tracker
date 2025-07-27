<template>
	<div class="container mx-auto py-6 px-2">
		<h1 class="text-3xl font-bold text-white mb-6 text-center">Runners</h1>

		<div class="mb-6 text-center">
			<p class="text-white/70 text-sm">
				Hand-crafted bios with a sprinkle of fun! Want to tweak one? Ping me on Slack!
			</p>
		</div>

		<!-- Loading State -->
		<div v-if="loading" class="flex justify-center items-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
			<span class="ml-3 text-white/70">Loading runners...</span>
		</div>

		<!-- Runners List -->
		<div v-else-if="runners.length > 0" class="space-y-4">
			<div
				v-for="runner in runners"
				:key="runner._id"
				class="bg-[#181C2A] rounded-xl shadow-lg p-6 hover:bg-[#1E2332] transition-colors cursor-pointer"
				@click="$router.push(`/runners/${runner._id}/activities`)"
			>
				<div class="flex items-center justify-between">
					<!-- Runner Info -->
					<div class="flex items-center gap-4">
						<UiAvatar :name="`${runner.firstName} ${runner.lastName}`" :size="50" />
						<div>
							<div class="flex items-center gap-2 mb-1">
								<h3 class="text-xl font-semibold text-white">
									{{ runner.firstName }} {{ runner.lastName }}
								</h3>
								<!-- Participation Status Tag -->
								<span
									v-if="!PARTICIPANT_IDS.includes(runner._id)"
									class="text-xs px-2 py-1 rounded font-medium bg-orange-500/20 text-orange-400"
								>
									Not Participating
								</span>
							</div>
							<p v-if="runner.bio" class="text-white/70 text-sm mt-1">
								{{ runner.bio }}
							</p>
							<p class="text-white/50 text-xs mt-1">
								Joined {{ formatDate(runner.createdAt) }}
							</p>
						</div>
					</div>

					<!-- Show Activities Button -->
					<button
						class="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5855eb] cursor-pointer transition-colors font-medium"
					>
						Show Activities
					</button>
				</div>
			</div>
		</div>

		<!-- Empty State -->
		<div v-else class="text-center py-12">
			<p class="text-white/70 text-lg">No runners found</p>
			<button
				@click="fetchRunners"
				class="mt-4 px-6 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5855eb] transition-colors"
			>
				Refresh
			</button>
		</div>

		<!-- Error State -->
		<div v-if="error" class="text-center py-12">
			<p class="text-red-400 text-lg mb-4">{{ error }}</p>
			<button
				@click="fetchRunners"
				class="px-6 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#5855eb] transition-colors"
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
import type { User } from '@/types/activity'

// Reactive state
const loading = ref<boolean>(false)
const runners = ref<User[]>([])
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
				users: User[]
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

// Format date helper
const formatDate = (dateString: string | Date): string => {
	const date = new Date(dateString)
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

// Fetch runners on component mount
onMounted(() => {
	fetchRunners()
})
</script>
