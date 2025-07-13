<template>
  <div
    class="flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-semibold uppercase tracking-wider"
    :class="badgeClasses"
  >
    <div class="w-4 h-4 rounded-full flex items-center justify-center" :class="iconClasses">
      <div class="w-2 h-2 bg-current rounded-full"></div>
    </div>
    <span>{{ rankText }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  rank: number
  totalDistance: number
  targetDistance: number
}

const props = defineProps<Props>()

const progressPercentage = computed(() => {
  return Math.min((props.totalDistance / props.targetDistance) * 100, 100)
})

const rankText = computed(() => {
  if (progressPercentage.value >= 100) return 'Champion'
  if (progressPercentage.value >= 75) return 'Challenger'
  if (progressPercentage.value >= 50) return 'Master'
  if (progressPercentage.value >= 25) return 'Gold'
  return 'Bronze'
})

const badgeClasses = computed(() => {
  if (progressPercentage.value >= 100)
    return 'bg-gradient-to-br from-yellow-400 to-yellow-300 text-gray-900'
  if (progressPercentage.value >= 75) return 'bg-gradient-to-br from-red-500 to-red-600 text-white'
  if (progressPercentage.value >= 50)
    return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
  if (progressPercentage.value >= 25)
    return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
  return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
})

const iconClasses = computed(() => {
  if (progressPercentage.value >= 100) return 'bg-gray-900/20'
  return 'bg-white/20'
})
</script>
