<template>
  <div class="bg-[#18181c] rounded-xl shadow-lg p-0 overflow-hidden">
    <h1 class="text-white text-2xl font-semibold mb-4 text-center pt-6">{{ title }}</h1>
    <div class="overflow-x-auto">
      <table class="w-full border-separate border-spacing-0">
        <thead>
          <tr class="bg-[#23232a] text-[#7f7f81] text-sm">
            <th class="py-3 px-2 text-left font-medium">Rank</th>
            <th class="py-3 px-2 text-left font-medium">Runner</th>
            <th class="py-3 px-2 text-left font-medium">Distance (km)</th>
            <th class="py-3 px-2 text-left font-medium">Avg. Pace (km/min)</th>
            <th class="py-3 px-2 text-left font-medium">Activities</th>
            <th class="py-3 px-2 text-left font-medium">Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(record, index) in leaderboard"
            :key="record.user._id"
            class="border-b border-[#23232a] hover:bg-[#23232a] transition"
          >
            <td class="py-2 px-2 text-[#bdbdbd] font-semibold text-center">{{ index + 1 }}</td>
            <td class="py-2 px-2">
              <div class="flex items-center gap-3">
                <img
                  :src="getAvatarUrl(record.user.firstName)"
                  :alt="record.user.firstName"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <span class="text-white font-medium"
                  >{{ record.user.firstName }} {{ record.user.lastName }}</span
                >
              </div>
            </td>
            <td class="py-2 px-2">
              <div class="flex items-center gap-2">
                <span
                  class="font-medium w-12"
                  :class="{
                    'text-green-500': record.stats.totalDistance / 1000 > 70,
                    'text-[#bdbdbd]': record.stats.totalDistance / 1000 <= 70,
                  }"
                >
                  {{ (record.stats.totalDistance / 1000).toFixed(2) }}
                </span>
                <div
                  class="flex-1 h-1 bg-[#23232a] rounded ml-2 mr-2 min-w-[60px] max-w-[100px] relative"
                >
                  <div
                    class="absolute left-0 top-0 h-1 rounded bg-green-500"
                    :style="{
                      width:
                        Math.min(100, Math.round((record.stats.totalDistance / 70000) * 100)) + '%',
                    }"
                  ></div>
                </div>
              </div>
            </td>
            <td class="py-2 px-2">
              <div class="flex items-center gap-2">
                <span class="text-[#bdbdbd] font-medium">{{
                  paceUtils.formatPaceToString(record.stats.averagePace)
                }}</span>
              </div>
            </td>
            <td class="p-2">
              <div class="flex items-center gap-2">
                <span class="text-[#bdbdbd] font-medium">{{ record.stats.totalActivities }}</span>
              </div>
            </td>
            <td class="p-2">
              <div class="flex items-center gap-2">
                <span class="text-[#bdbdbd] font-medium">{{
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
import paceUtils from '@/utils/pace.utils'
import { formatSecondsToHMS } from '@/utils/time.utils'

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
