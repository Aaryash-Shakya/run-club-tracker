<template>
	<div class="container py-6">
		<div class="flex items-center justify-center">
			<div
				class="p-2 bg-surface rounded-xl flex items-center justify-center gap-2 w-fit"
				style="box-shadow: 0 0 100px 50px #29304750"
			>
				<div
					class="period-toggle-button cursor-pointer transition-colors"
					:class="{ 'bg-soft': activeTab === 'rules' }"
					@click="setActiveTab('rules')"
				>
					Rules
				</div>
				<div
					class="period-toggle-button cursor-pointer transition-colors"
					:class="{ 'bg-soft': activeTab === 'reminders' }"
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
