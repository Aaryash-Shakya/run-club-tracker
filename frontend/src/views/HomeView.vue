<template>
  <div class="min-h-screen py-6">
    <LeaderboardTable
      title="July 70KM Leaderboard"
      :leaderboard="leaderboard"
      :target-distance="70000"
    />
  </div>
</template>

<script lang="ts" setup>
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
