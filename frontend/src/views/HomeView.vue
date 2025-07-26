<template>
	<div class="container mx-auto">
		<div class="flex items-center justify-center">
			<div class="p-2 bg-[#181C2A] rounded-xl flex items-center justify-center gap-2 w-fit">
				<div class="period-toggle-button bg-[#282F45]">Daily</div>
				<div class="period-toggle-button">Weekly</div>
				<div class="period-toggle-button">Monthly</div>
			</div>
		</div>
		<CountDown />
		<LeaderboardTable :leaderboard="leaderboard" :target-distance="70000" />
	</div>
</template>

<script lang="ts" setup>
import CountDown from '@/components/CountDown.vue'
import LeaderboardTable from '@/components/LeaderboardTable.vue'
import { ref, onMounted } from 'vue'

type Activity = {
	_id: string
	name: string
	distance: number
	movingTime: number
	elapsedTime: number
	totalElevationGain: number
	movingPace: number
	type: string
	sportType: string
	workoutType: number
	activityDate: string // ISO string
	isValid: boolean
	note: string
	__v: number
	createdAt: string
	updatedAt: string
}

type User = {
	_id: string
	firstName: string
	lastName: string
	createdAt: string
	updatedAt: string
	__v: number
}

type Stats = {
	totalDistance: number
	totalMovingTime: number
	averagePace: number
	totalActivities: number
	invalidActivities: number
}

type UserActivitiesWithStats = {
	user: User
	activities: Activity[]
	stats: Stats
}

type ActivitiesResponse = {
	status: string
	message: string
	userActivitiesWithStats: UserActivitiesWithStats[]
}

const leaderboard = ref<UserActivitiesWithStats[]>([])

onMounted(async () => {
	try {
		const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
		const res = await fetch(`${apiBaseUrl}/activities?period=monthly&date=2025-07-25`)
		const response: ActivitiesResponse = await res.json()
		leaderboard.value = response.userActivitiesWithStats
	} catch {
		leaderboard.value = []
	}
})
</script>
