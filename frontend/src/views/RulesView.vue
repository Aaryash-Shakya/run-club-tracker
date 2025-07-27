<template>
	<div class="container mx-auto py-6 px-2">
		<div class="flex items-center justify-center">
			<div
				class="p-2 bg-[#181C2A] rounded-xl flex items-center justify-center gap-2 w-fit"
				style="box-shadow: 0 0 100px 50px #29304750"
			>
				<div
					class="period-toggle-button cursor-pointer transition-colors"
					:class="{ 'bg-[#282F45]': activeTab === 'rules' }"
					@click="setActiveTab('rules')"
				>
					Rules
				</div>
				<div
					class="period-toggle-button cursor-pointer transition-colors"
					:class="{ 'bg-[#282F45]': activeTab === 'reminders' }"
					@click="setActiveTab('reminders')"
				>
					Reminders
				</div>
			</div>
		</div>

		<!-- Rules Section -->
		<RulesList v-if="activeTab === 'rules'" />

		<!-- Reminders Section -->
		<RemindersList v-if="activeTab === 'reminders'" />
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import RulesList from '@/components/RulesList.vue'
import RemindersList from '@/components/RemindersList.vue'

type Tabs = 'rules' | 'reminders'

// State
const activeTab = ref<Tabs>('rules')

// Function to set the active tab
function setActiveTab(tab: Tabs) {
	activeTab.value = tab
}
</script>
