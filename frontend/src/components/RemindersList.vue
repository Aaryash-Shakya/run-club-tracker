<template>
	<div class="bg-surface rounded-xl shadow-lg overflow-hidden mt-10">
		<!-- Header -->
		<div class="bg-soft p-4">
			<h2 class="text-3xl font-bold text-white">Reminders</h2>
			<p class="text-white/70 mt-2">
				Tips and suggestions to enhance your running experience
			</p>
		</div>

		<!-- Reminders List -->
		<div class="p-4 flex flex-col gap-3">
			<div
				v-for="(recommendation, index) in runClubReminders"
				:key="index"
				class="bg-surface-light rounded-lg p-4 border border-soft shadow"
			>
				<!-- Recommendation Header -->
				<div class="flex items-start gap-4">
					<div
						class="bg-accent-walk text-gray-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg flex-shrink-0 mt-1"
					>
						{{ index + 1 }}
					</div>
					<div class="flex-1">
						<h3 class="text-xl font-semibold text-white mb-2">
							{{ recommendation.title }}
						</h3>
						<p class="text-muted-light leading-relaxed">
							{{ recommendation.description }}
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Reminders Footer -->
		<div class="bg-soft p-4 text-center">
			<p class="text-muted text-sm">
				Remember: The goal is to have fun and stay healthy! 🏃‍♂️💪
			</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
const runClubReminders = [
	{
		title: 'Privacy Tip',
		description: 'Strava lets you hide the start and end points so use it to protect privacy.',
	},
	{
		title: 'Warm-up & Cool-down',
		description:
			'Always do a proper warm-up before running and cool down with stretches afterward.',
	},
	{
		title: 'Listen to Your Body',
		description: 'Pay attention to your body and avoid pushing through pain or injury.',
	},
	{
		title: 'Fair Play',
		description:
			"It's all fun and games — no cheating. You are only cheating yourself. If anyone's caught cheating, we'll settle it the old-fashioned way — a dramatic debate at the office.",
	},
	{
		title: 'Proper Gear',
		description:
			"Just wear anything comfy — shoes that don't hurt and clothes you can move in!",
	},
	{
		title: 'Stay Hydrated',
		description: 'Stay hydrated and happy runnings!',
	},
]
</script>
