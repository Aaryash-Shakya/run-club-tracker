<template>
	<div class="container py-6">
		<div class="flex items-center justify-center">
			<div
				class="p-2 bg-[#181C2A] rounded-xl flex items-center justify-center gap-2 w-fit"
				style="box-shadow: 0 0 100px 50px #29304750"
			>
				<div
					class="period-toggle-button cursor-pointer transition-colors"
					:class="{ 'bg-[#282F45]': activityPeriod === 'daily' }"
					@click="setActivityPeriod('daily')"
				>
					Daily
				</div>
				<div
					class="period-toggle-button cursor-pointer transition-colors"
					:class="{ 'bg-[#282F45]': activityPeriod === 'weekly' }"
					@click="setActivityPeriod('weekly')"
				>
					Weekly
				</div>
				<div
					class="period-toggle-button cursor-pointer transition-colors"
					:class="{ 'bg-[#282F45]': activityPeriod === 'monthly' }"
					@click="setActivityPeriod('monthly')"
				>
					Monthly
				</div>
			</div>
		</div>
		<CountDown />
		<LeaderboardTable ref="leaderboardTableRef" :target-distance="70000" />
	</div>
</template>

<script lang="ts" setup>
import CountDown from '@/components/CountDown.vue'
import LeaderboardTable from '@/components/LeaderboardTable.vue'
import { ref } from 'vue'

type ActivityPeriod = 'daily' | 'weekly' | 'monthly'

// State
const activityPeriod = ref<ActivityPeriod>('monthly')
const leaderboardTableRef = ref<InstanceType<typeof LeaderboardTable>>()

// Function to change the activity period
const setActivityPeriod = (period: ActivityPeriod) => {
	activityPeriod.value = period
	// Update the LeaderboardTable's period
	if (leaderboardTableRef.value) {
		leaderboardTableRef.value.setActivityPeriod(period)
	}
}
</script>
