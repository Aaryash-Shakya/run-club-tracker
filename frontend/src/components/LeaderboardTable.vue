<template>
  <div class="leaderboard-container">
    <h1 class="text-white text-2xl font-semibold mb-6 text-center">{{ title }}</h1>
    <div class="overflow-x-auto rounded-lg bg-dark-table">
      <table class="leaderboard-table">
        <thead>
          <tr class="bg-[#242328] text-[#7f7f81]">
            <th class="w-15 text-center">Place</th>
            <th class="min-w-[200px]">Player name</th>
            <th class="min-w-[100px] text-center">Distance</th>
            <th class="min-w-[100px] text-center">Avg. Pace</th>
            <th class="min-w-[100px] text-center">Moving Time</th>
            <th class="min-w-[120px] text-center">Rank</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in leaderboard" :key="record.user._id" class="player-row">
            <td class="w-15 text-center">
              <span class="rank-number">{{ index + 1 }}</span>
            </td>
            <td class="min-w-[200px]">
              <div class="player-info">
                <div class="player-avatar">
                  <img
                    :src="getAvatarUrl(record.user.firstName)"
                    :alt="record.user.firstName"
                    class="w-full h-full object-cover"
                  />
                </div>
                <span class="player-name">
                  {{ record.user.firstName }} {{ record.user.lastName }}
                </span>
              </div>
            </td>
            <td class="min-w-[100px] text-center">
              <span class="stat-value">
                {{ (record.stats.totalDistance / 1000).toFixed(2) }} km
              </span>
            </td>
            <td class="min-w-[100px] text-center">
              <span class="stat-value">
                {{ paceUtils.formatPaceToString(record.stats.averagePace) }}
              </span>
            </td>
            <td class="min-w-[100px] text-center">
              <span class="stat-value">
                {{ formatSecondsToHMS(record.stats.totalMovingTime) }}
              </span>
            </td>
            <td class="min-w-[120px] text-center">
              <RankBadge
                :rank="index + 1"
                :total-distance="record.stats.totalDistance"
                :target-distance="targetDistance"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import paceUtils from '@/utils/pace.utils'
import { formatSecondsToHMS } from '@/utils/time.utils'
import RankBadge from './RankBadge.vue'

interface Props {
  title: string
  leaderboard: UserActivitiesWithStats[]
  targetDistance?: number
}

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
  activityDate: string
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

withDefaults(defineProps<Props>(), {
  targetDistance: 70000, // 70km in meters
})

/**
 * Generate avatar URL using a placeholder service
 */
const getAvatarUrl = (name: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=32`
}
</script>
