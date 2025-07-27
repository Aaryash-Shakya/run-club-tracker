<template>
	<div class="bg-[#181C2A] rounded-xl shadow-lg overflow-hidden mt-10">
		<!-- Header -->
		<div class="bg-[#282F45] p-4">
			<h1 class="text-3xl font-bold text-white">Rules</h1>
			<p class="text-white/70 mt-2">
				Follow these guidelines to ensure your activities are tracked properly
			</p>
		</div>

		<!-- Rules List -->
		<div class="p-4 flex flex-col gap-3">
			<div
				v-for="(rule, index) in runClubRules"
				:key="index"
				class="bg-[#1E2332] rounded-lg p-4 border border-[#23232a]"
			>
				<!-- Rule Header -->
				<div class="flex items-start gap-4">
					<div
						class="bg-[#6366F1] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg flex-shrink-0 mt-1"
					>
						{{ index + 1 }}
					</div>
					<div class="flex-1">
						<h3 class="text-xl font-semibold text-white mb-2">{{ rule.title }}</h3>
						<p class="text-white/80 leading-relaxed">{{ rule.description }}</p>

						<!-- Details Section -->
						<div v-if="rule.details" class="mt-4 space-y-2">
							<div
								v-for="(detail, detailIndex) in rule.details"
								:key="detailIndex"
								class="bg-[#282F45] rounded-lg p-3 flex items-center gap-3"
							>
								<!-- Activity Icon -->
								<div
									v-if="detail.activity === 'Run'"
									class="flex items-center gap-2"
								>
									<img
										src="@/assets/running-shoes.svg"
										alt="Running"
										class="w-5 h-5 filter brightness-0 invert opacity-70"
									/>
									<span class="text-[#6366F1] font-medium"
										>{{ detail.activity }}:</span
									>
								</div>
								<div
									v-else-if="detail.activity === 'Walk'"
									class="flex items-center gap-2"
								>
									<img
										src="@/assets/walking-shoes.svg"
										alt="Walking"
										class="w-5 h-5 filter brightness-0 invert opacity-70"
									/>
									<span class="text-[#FBBF24] font-medium"
										>{{ detail.activity }}:</span
									>
								</div>
								<span class="text-white/70">{{ detail.requirement }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="bg-[#282F45] p-4 text-center">
			<p class="text-white/60 text-sm">
				Questions? Contact the maintainer or ask in the Strava club discussions or the Slack
				channel.
			</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
const runClubRules = [
	{
		title: 'Use Strava',
		description:
			"All activities must be recorded via Strava. If you're using another app, let the maintainer know. Also, make sure you're part of our Strava club: 👉 strava.com/clubs/arbyte",
	},
	{
		title: 'Visible Map',
		description: 'The activity must include a visible GPS map when posted.',
	},
	{
		title: 'Activity Types',
		description:
			"Any activity that involves walking or running is allowed — including hikes, treks, or just a good ol' stroll!",
	},
	{
		title: 'Labeling by Pace',
		description:
			'Activities are auto-labeled based on moving pace, not what Strava tags them as.',
		details: [
			{ activity: 'Run', requirement: 'pace ≤ 10:00 min/km' },
			{ activity: 'Walk', requirement: 'pace > 10:00 min/km' },
		],
	},
	{
		title: 'Minimum Distances',
		description: 'Minimum required distances for activities.',
		details: [
			{ activity: 'Run', requirement: 'at least 500 meters' },
			{ activity: 'Walk', requirement: 'at least 3 km' },
		],
	},
]
</script>
