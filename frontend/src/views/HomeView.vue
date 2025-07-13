<template>
  <div class="leaderboard">
    <h1>July 70KM Leaderboard</h1>
    <v-table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Distance (km)</th>
          <th>Avg. Pace</th>
          <th>Moving Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in leaderboard" :key="record.user._id">
          <td>{{ record.user.firstName }} {{ record.user.lastName }}</td>
          <td>{{ (record.stats.totalDistance / 1000).toFixed(2) }} km</td>
          <td>{{ paceUtils.formatPaceToString(record.stats.averagePace) }} km/min</td>
          <td>
            {{ formatSecondsToHMS(record.stats.totalMovingTime) }}
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script lang="ts" setup>
import paceUtils from '@/utils/pace.utils'
import { formatSecondsToHMS } from '@/utils/time.utils'
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
    const res = await fetch(`${apiBaseUrl}/activities/monthly-activities`)
    const response: ActivitiesResponse = await res.json()
    leaderboard.value = response.userActivitiesWithStats
  } catch {
    leaderboard.value = []
  }
})
</script>

<style>
.leaderboard {
  max-width: 800px;
  margin: 40px auto;
  padding: 24px;
}
.leaderboard :deep(.v-table) {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  color: #eee;
}
th {
  background: #333333;
}
</style>
