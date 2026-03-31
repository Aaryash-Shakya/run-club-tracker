<template>
	<div class="container py-6">
		<h1 class="mb-6 text-center text-3xl font-bold text-white">Admin Panel</h1>

		<!-- API Key Auth -->
		<div v-if="!authenticated" class="mx-auto max-w-md">
			<div class="bg-surface rounded-xl p-6 shadow-lg">
				<label class="text-muted mb-2 block text-sm">Admin API Key</label>
				<input
					v-model="apiKey"
					type="password"
					placeholder="Enter admin API key"
					class="bg-soft border-white/20 focus:border-accent-run mb-4 w-full rounded-lg border px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30"
					@keyup.enter="authenticate"
				/>
				<button
					class="bg-accent-run hover:bg-accent-run-hover w-full rounded-lg px-4 py-3 font-medium text-white transition-colors"
					@click="authenticate"
				>
					Authenticate
				</button>
				<p v-if="authError" class="mt-3 text-center text-sm text-red-400">
					{{ authError }}
				</p>
			</div>
		</div>

		<!-- Admin Content -->
		<div v-else>
			<!-- Tab Navigation -->
			<div class="bg-surface mb-6 flex rounded-xl p-1 shadow-lg">
				<button
					v-for="tab in tabs"
					:key="tab"
					class="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
					:class="
						activeTab === tab
							? 'bg-accent-run text-white'
							: 'text-muted hover:text-white'
					"
					@click="activeTab = tab"
				>
					{{ tab }}
				</button>
			</div>

			<!-- Users Tab -->
			<div v-if="activeTab === 'Users'">
				<div class="bg-surface mb-6 rounded-xl p-6 shadow-lg">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-lg font-semibold text-white">All Users</h2>
						<div class="flex gap-3">
							<input
								v-model="userSearch"
								type="text"
								placeholder="Search by name..."
								class="bg-soft border-white/20 focus:border-accent-run rounded-lg border px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
								@keyup.enter="fetchAdminUsers"
							/>
							<button
								class="bg-accent-run hover:bg-accent-run-hover rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
								@click="fetchAdminUsers"
							>
								Search
							</button>
						</div>
					</div>
					<p
						v-if="userMessage"
						class="mb-4 text-sm"
						:class="userMessageIsError ? 'text-red-400' : 'text-green-400'"
					>
						{{ userMessage }}
					</p>
					<div v-if="usersLoading" class="text-muted py-4 text-center text-sm">
						Loading...
					</div>
					<div
						v-else-if="adminUsers.length === 0"
						class="text-muted py-4 text-center text-sm"
					>
						No users found
					</div>
					<div v-else class="space-y-2">
						<div
							v-for="user in adminUsers"
							:key="user._id"
							class="bg-soft rounded-lg px-4 py-3"
						>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white"
									>
										{{ user.firstName?.[0] }}{{ user.lastName?.[0] }}
									</div>
									<div>
										<p class="text-sm font-medium text-white">
											{{ user.firstName }} {{ user.lastName }}
										</p>
										<p class="text-muted text-xs">
											{{ user.bio || 'No bio' }}
										</p>
									</div>
								</div>
								<button
									v-if="editingBioUserId !== user._id"
									class="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20"
									@click="startEditBio(user)"
								>
									Edit Bio
								</button>
							</div>
							<div v-if="editingBioUserId === user._id" class="mt-3 flex gap-2">
								<input
									v-model="editingBioValue"
									type="text"
									placeholder="Enter bio..."
									class="bg-background border-white/20 focus:border-accent-run flex-1 rounded-lg border px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
									@keyup.enter="saveBio(user._id)"
								/>
								<button
									class="bg-accent-run hover:bg-accent-run-hover rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors"
									@click="saveBio(user._id)"
								>
									Save
								</button>
								<button
									class="rounded-lg bg-white/10 px-3 py-2 text-xs text-white transition-colors hover:bg-white/20"
									@click="cancelEditBio"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Challenges Tab -->
			<div v-if="activeTab === 'Challenges'">
				<!-- Create Challenge Form -->
				<div class="bg-surface mb-6 rounded-xl p-6 shadow-lg">
					<h2 class="mb-4 text-lg font-semibold text-white">Create Challenge</h2>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label class="text-muted mb-1 block text-xs">Name</label>
							<input
								v-model="challengeForm.name"
								type="text"
								placeholder="Challenge name"
								class="bg-soft border-white/20 focus:border-accent-run w-full rounded-lg border px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
							/>
						</div>
						<div>
							<label class="text-muted mb-1 block text-xs">Target (km)</label>
							<input
								v-model.number="challengeForm.targetKm"
								type="number"
								placeholder="100"
								class="bg-soft border-white/20 focus:border-accent-run w-full rounded-lg border px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
							/>
						</div>
						<div>
							<label class="text-muted mb-1 block text-xs">Start Date</label>
							<input
								v-model="challengeForm.startDate"
								type="date"
								class="bg-soft border-white/20 focus:border-accent-run w-full rounded-lg border px-3 py-2 text-sm text-white outline-none"
							/>
						</div>
						<div>
							<label class="text-muted mb-1 block text-xs">End Date</label>
							<input
								v-model="challengeForm.endDate"
								type="date"
								class="bg-soft border-white/20 focus:border-accent-run w-full rounded-lg border px-3 py-2 text-sm text-white outline-none"
							/>
						</div>
						<div class="md:col-span-2">
							<label class="text-muted mb-1 block text-xs">Description (optional)</label>
							<input
								v-model="challengeForm.description"
								type="text"
								placeholder="Description"
								class="bg-soft border-white/20 focus:border-accent-run w-full rounded-lg border px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
							/>
						</div>
					</div>
					<button
						class="bg-accent-run hover:bg-accent-run-hover mt-4 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors"
						:disabled="!challengeForm.name || !challengeForm.startDate || !challengeForm.endDate"
						:class="{ 'cursor-not-allowed opacity-50': !challengeForm.name || !challengeForm.startDate || !challengeForm.endDate }"
						@click="createChallenge"
					>
						Create Challenge
					</button>
					<p v-if="challengeMessage" class="mt-3 text-sm" :class="challengeMessageIsError ? 'text-red-400' : 'text-green-400'">
						{{ challengeMessage }}
					</p>
				</div>

				<!-- Challenge List -->
				<div class="bg-surface rounded-xl p-6 shadow-lg">
					<h2 class="mb-4 text-lg font-semibold text-white">All Challenges</h2>
					<div v-if="challengesLoading" class="text-muted py-4 text-center text-sm">Loading...</div>
					<div v-else-if="challenges.length === 0" class="text-muted py-4 text-center text-sm">
						No challenges found
					</div>
					<div v-else class="space-y-3">
						<div
							v-for="challenge in challenges"
							:key="challenge._id"
							class="bg-soft flex items-center justify-between rounded-lg p-4"
						>
							<div>
								<p class="font-medium text-white">{{ challenge.name }}</p>
								<p class="text-muted text-xs">
									{{ new Date(challenge.startDate).toLocaleDateString() }} —
									{{ new Date(challenge.endDate).toLocaleDateString() }}
									&middot; {{ challenge.targetKm }} km target
								</p>
							</div>
							<button
								class="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/20"
								@click="selectChallenge(challenge)"
							>
								Manage
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Participants Tab -->
			<div v-if="activeTab === 'Participants'">
				<!-- Challenge Selector -->
				<div class="bg-surface mb-6 rounded-xl p-6 shadow-lg">
					<h2 class="mb-4 text-lg font-semibold text-white">Select Challenge</h2>
					<select
						v-model="selectedChallengeId"
						class="bg-soft border-white/20 focus:border-accent-run w-full rounded-lg border px-3 py-2.5 text-sm text-white outline-none"
						@change="fetchParticipants"
					>
						<option value="" disabled>Choose a challenge...</option>
						<option
							v-for="challenge in challenges"
							:key="challenge._id"
							:value="challenge._id"
						>
							{{ challenge.name }}
						</option>
					</select>
				</div>

				<div v-if="selectedChallengeId">
					<!-- Add Participant -->
					<div class="bg-surface mb-6 rounded-xl p-6 shadow-lg">
						<h2 class="mb-4 text-lg font-semibold text-white">Add Participant</h2>
						<div class="flex gap-3">
							<select
								v-model="selectedUserId"
								class="bg-soft border-white/20 focus:border-accent-run flex-1 rounded-lg border px-3 py-2.5 text-sm text-white outline-none"
							>
								<option value="" disabled>Select a user...</option>
								<option
									v-for="user in availableUsers"
									:key="user._id"
									:value="user._id"
								>
									{{ user.firstName }} {{ user.lastName }}
								</option>
							</select>
							<button
								class="bg-accent-run hover:bg-accent-run-hover rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors"
								:disabled="!selectedUserId"
								:class="{ 'cursor-not-allowed opacity-50': !selectedUserId }"
								@click="addParticipant"
							>
								Add
							</button>
						</div>
						<p v-if="participantMessage" class="mt-3 text-sm" :class="participantMessageIsError ? 'text-red-400' : 'text-green-400'">
							{{ participantMessage }}
						</p>
					</div>

					<!-- Participant List -->
					<div class="bg-surface rounded-xl p-6 shadow-lg">
						<h2 class="mb-4 text-lg font-semibold text-white">
							Participants ({{ participants.length }})
						</h2>
						<div v-if="participantsLoading" class="text-muted py-4 text-center text-sm">Loading...</div>
						<div v-else-if="participants.length === 0" class="text-muted py-4 text-center text-sm">
							No participants yet
						</div>
						<div v-else class="space-y-2">
							<div
								v-for="participant in participants"
								:key="participant._id"
								class="bg-soft flex items-center justify-between rounded-lg px-4 py-3"
							>
								<div class="flex items-center gap-3">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white"
									>
										{{ participant.user.firstName?.[0] }}{{ participant.user.lastName?.[0] }}
									</div>
									<div>
										<p class="text-sm font-medium text-white">
											{{ participant.user.firstName }} {{ participant.user.lastName }}
										</p>
										<p class="text-muted text-xs">
											Joined {{ new Date(participant.joinedAt).toLocaleDateString() }}
										</p>
									</div>
								</div>
								<button
									class="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/30"
									@click="removeParticipant(participant.user._id)"
								>
									Remove
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { TChallenge, TParticipant, TUser } from '@/types/activity'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// Auth
const apiKey = ref('')
const authenticated = ref(false)
const authError = ref('')

// Tabs
const tabs = ['Users', 'Challenges', 'Participants'] as const
const activeTab = ref<(typeof tabs)[number]>('Challenges')

// Users
const adminUsers = ref<TUser[]>([])
const usersLoading = ref(false)
const userSearch = ref('')
const editingBioUserId = ref<string | null>(null)
const editingBioValue = ref('')
const userMessage = ref('')
const userMessageIsError = ref(false)

// Challenges
const challenges = ref<TChallenge[]>([])
const challengesLoading = ref(false)
const challengeForm = ref({
	name: '',
	description: '',
	startDate: '',
	endDate: '',
	targetKm: 0,
})
const challengeMessage = ref('')
const challengeMessageIsError = ref(false)

// Participants
const selectedChallengeId = ref('')
const participants = ref<TParticipant[]>([])
const participantsLoading = ref(false)
const allUsers = ref<TUser[]>([])
const selectedUserId = ref('')
const participantMessage = ref('')
const participantMessageIsError = ref(false)

const availableUsers = computed(() => {
	const participantUserIds = new Set(participants.value.map((p) => p.user._id))
	return allUsers.value.filter((u) => !participantUserIds.has(u._id))
})

function authHeaders() {
	return {
		Authorization: `Bearer ${apiKey.value}`,
		'Content-Type': 'application/json',
	}
}

async function fetchAdminUsers() {
	usersLoading.value = true
	try {
		const url = new URL(`${apiBaseUrl}/admin/users`)
		if (userSearch.value) url.searchParams.set('search', userSearch.value)
		url.searchParams.set('limit', '100')
		const res = await fetch(url.toString(), { headers: authHeaders() })
		const data = await res.json()
		adminUsers.value = data.data.users
	} catch {
		adminUsers.value = []
	} finally {
		usersLoading.value = false
	}
}

function startEditBio(user: TUser) {
	editingBioUserId.value = user._id
	editingBioValue.value = user.bio || ''
}

function cancelEditBio() {
	editingBioUserId.value = null
	editingBioValue.value = ''
}

async function saveBio(userId: string) {
	userMessage.value = ''
	try {
		const res = await fetch(`${apiBaseUrl}/admin/users/${userId}`, {
			method: 'PATCH',
			headers: authHeaders(),
			body: JSON.stringify({ bio: editingBioValue.value }),
		})
		const data = await res.json()
		if (!res.ok) {
			userMessage.value = data.message || 'Failed to update bio'
			userMessageIsError.value = true
			return
		}
		userMessage.value = 'Bio updated successfully'
		userMessageIsError.value = false
		editingBioUserId.value = null
		editingBioValue.value = ''
		fetchAdminUsers()
	} catch {
		userMessage.value = 'Failed to update bio'
		userMessageIsError.value = true
	}
}

async function authenticate() {
	authError.value = ''
	try {
		const res = await fetch(`${apiBaseUrl}/admin/challenges`, {
			headers: authHeaders(),
		})
		if (!res.ok) {
			authError.value = 'Invalid API key'
			return
		}
		authenticated.value = true
		const data = await res.json()
		challenges.value = data.data.challenges
		fetchUsers()
		fetchAdminUsers()
	} catch {
		authError.value = 'Failed to connect'
	}
}

async function fetchChallenges() {
	challengesLoading.value = true
	try {
		const res = await fetch(`${apiBaseUrl}/admin/challenges`, {
			headers: authHeaders(),
		})
		const data = await res.json()
		challenges.value = data.data.challenges
	} catch {
		challenges.value = []
	} finally {
		challengesLoading.value = false
	}
}

async function createChallenge() {
	challengeMessage.value = ''
	try {
		const res = await fetch(`${apiBaseUrl}/admin/challenges`, {
			method: 'POST',
			headers: authHeaders(),
			body: JSON.stringify(challengeForm.value),
		})
		const data = await res.json()
		if (!res.ok) {
			challengeMessage.value = data.message || 'Failed to create challenge'
			challengeMessageIsError.value = true
			return
		}
		challengeMessage.value = 'Challenge created successfully'
		challengeMessageIsError.value = false
		challengeForm.value = { name: '', description: '', startDate: '', endDate: '', targetKm: 0 }
		fetchChallenges()
	} catch {
		challengeMessage.value = 'Failed to create challenge'
		challengeMessageIsError.value = true
	}
}

function selectChallenge(challenge: TChallenge) {
	selectedChallengeId.value = challenge._id
	activeTab.value = 'Participants'
	fetchParticipants()
}

async function fetchUsers() {
	try {
		const res = await fetch(`${apiBaseUrl}/users`)
		const data = await res.json()
		allUsers.value = data.data.users
	} catch {
		allUsers.value = []
	}
}

async function fetchParticipants() {
	if (!selectedChallengeId.value) return
	participantsLoading.value = true
	participantMessage.value = ''
	try {
		const res = await fetch(
			`${apiBaseUrl}/admin/challenges/${selectedChallengeId.value}/participants`,
			{ headers: authHeaders() },
		)
		const data = await res.json()
		participants.value = data.data.participants
	} catch {
		participants.value = []
	} finally {
		participantsLoading.value = false
	}
}

async function addParticipant() {
	participantMessage.value = ''
	try {
		const res = await fetch(
			`${apiBaseUrl}/admin/challenges/${selectedChallengeId.value}/participants`,
			{
				method: 'POST',
				headers: authHeaders(),
				body: JSON.stringify({ userId: selectedUserId.value }),
			},
		)
		const data = await res.json()
		if (!res.ok) {
			participantMessage.value = data.message || 'Failed to add participant'
			participantMessageIsError.value = true
			return
		}
		participantMessage.value = 'Participant added'
		participantMessageIsError.value = false
		selectedUserId.value = ''
		fetchParticipants()
	} catch {
		participantMessage.value = 'Failed to add participant'
		participantMessageIsError.value = true
	}
}

async function removeParticipant(userId: string) {
	participantMessage.value = ''
	try {
		const res = await fetch(
			`${apiBaseUrl}/admin/challenges/${selectedChallengeId.value}/participants`,
			{
				method: 'DELETE',
				headers: authHeaders(),
				body: JSON.stringify({ userId }),
			},
		)
		if (!res.ok) {
			const data = await res.json()
			participantMessage.value = data.message || 'Failed to remove participant'
			participantMessageIsError.value = true
			return
		}
		participantMessage.value = 'Participant removed'
		participantMessageIsError.value = false
		fetchParticipants()
	} catch {
		participantMessage.value = 'Failed to remove participant'
		participantMessageIsError.value = true
	}
}
</script>
