<template>
	<div class="container py-6">
		<div class="flex items-center justify-center">
			<div
				class="bg-surface flex w-fit items-center justify-center gap-2 rounded-xl p-2"
				style="box-shadow: 0 0 100px 50px #29304750"
			>
				<div
					class="period-toggle-button cursor-pointer transition-colors"
					:class="{ 'bg-soft': activityPeriod === 'daily' }"
					@click="setActivityPeriod('daily')"
				>
					Daily
				</div>
				<div
					class="period-toggle-button cursor-pointer transition-colors"
					:class="{ 'bg-soft': activityPeriod === 'weekly' }"
					@click="setActivityPeriod('weekly')"
				>
					Weekly
				</div>
				<div
					class="period-toggle-button cursor-pointer transition-colors"
					:class="{ 'bg-soft': activityPeriod === 'monthly' }"
					@click="setActivityPeriod('monthly')"
				>
					Monthly
				</div>
			</div>
		</div>

		<!-- Month Selector for Monthly View -->
		<div v-if="activityPeriod === 'monthly'" class="mt-4 flex items-center justify-center">
			<div class="bg-surface flex items-center gap-2 rounded-lg p-3">
				<button
					@click="previousMonth"
					class="hover:text-accent-run hover:bg-soft flex cursor-pointer items-center rounded p-1 px-1 text-2xl text-white transition-colors"
				>
					<VIcon name="md-keyboardarrowleft-round" />
				</button>
				<span class="min-w-[120px] text-center font-medium text-white">
					{{ getCurrentMonthName() }}
				</span>
				<button
					@click="nextMonth"
					class="hover:text-accent-run hover:bg-soft flex cursor-pointer items-center rounded p-1 px-1 text-2xl text-white transition-colors"
				>
					<VIcon name="md-keyboardarrowright-round" />
				</button>
			</div>
		</div>

		<LeaderboardTable ref="leaderboardTableRef" />
	</div>
</template>

<script lang="ts" setup>
import LeaderboardTable from '@/components/LeaderboardTable.vue'
import { ref } from 'vue'

type ActivityPeriod = 'daily' | 'weekly' | 'monthly'

// State
const activityPeriod = ref<ActivityPeriod>('monthly')
const leaderboardTableRef = ref<InstanceType<typeof LeaderboardTable>>()
const queryDate = ref<string>(new Date().toISOString().split('T')[0]) // Default to current date (2025-08-01 format)

// Function to change the activity period
const setActivityPeriod = (period: ActivityPeriod) => {
	activityPeriod.value = period
	// Update the LeaderboardTable's period and date
	if (leaderboardTableRef.value) {
		leaderboardTableRef.value.setActivityPeriod(period)
		if (period === 'monthly') {
			leaderboardTableRef.value.setQueryDate(queryDate.value)
		}
	}
}

// Function to get current month name
const getCurrentMonthName = (): string => {
	const date = new Date(queryDate.value)
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	]
	return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

// Function to go to previous month
const previousMonth = () => {
	const date = new Date(queryDate.value)
	date.setMonth(date.getMonth() - 1)
	queryDate.value = date.toISOString().split('T')[0]

	// Update the LeaderboardTable with new date
	if (leaderboardTableRef.value && activityPeriod.value === 'monthly') {
		leaderboardTableRef.value.setQueryDate(queryDate.value)
	}
}

// Function to go to next month
const nextMonth = () => {
	const date = new Date(queryDate.value)
	date.setMonth(date.getMonth() + 1)
	queryDate.value = date.toISOString().split('T')[0]

	// Update the LeaderboardTable with new date
	if (leaderboardTableRef.value && activityPeriod.value === 'monthly') {
		leaderboardTableRef.value.setQueryDate(queryDate.value)
	}
}
</script>
