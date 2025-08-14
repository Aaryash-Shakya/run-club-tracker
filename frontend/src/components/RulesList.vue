<template>
	<div class="bg-surface mt-10 overflow-hidden rounded-xl shadow-lg">
		<!-- Header -->
		<div class="bg-soft p-4">
			<h1 class="text-3xl font-bold text-white">Rules</h1>
			<p class="mt-2 text-white/70">
				Follow these guidelines to ensure your activities are tracked properly
			</p>
		</div>

		<!-- Rules List -->
		<div class="flex flex-col gap-3 p-4">
			<div
				v-for="(rule, index) in runClubRules"
				:key="index"
				class="bg-surface-light border-soft rounded-lg border p-4 shadow"
			>
				<!-- Rule Header -->
				<div class="flex items-start gap-4">
					<div
						class="bg-accent-run mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
					>
						{{ index + 1 }}
					</div>
					<div class="flex-1">
						<h3 class="mb-2 text-xl font-semibold text-white">{{ rule.title }}</h3>
						<p class="text-muted-light leading-relaxed">{{ rule.description }}</p>

						<!-- Details Section -->
						<div v-if="rule.details" class="mt-4 space-y-2">
							<div
								v-for="(detail, detailIndex) in rule.details"
								:key="detailIndex"
								class="bg-soft flex items-center gap-3 rounded-lg p-3"
							>
								<!-- Activity Icon -->
								<div
									v-if="detail.activity === 'Run'"
									class="flex items-center gap-2"
								>
									<img
										src="@/assets/running-shoes.svg"
										alt="Running"
										class="h-5 w-5 opacity-70 brightness-0 invert filter"
									/>
									<span class="text-accent-run font-medium"
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
										class="h-5 w-5 opacity-70 brightness-0 invert filter"
									/>
									<span class="text-accent-walk font-medium"
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
		<div class="bg-soft p-4 text-center">
			<p class="text-muted text-sm">
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
			{ activity: 'Walk', requirement: 'at least 500 meters' },
		],
	},
]
</script>
