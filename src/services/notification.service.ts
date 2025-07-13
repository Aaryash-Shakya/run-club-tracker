import activityRepository from "../repositories/activity.repository";
import activityHelper from "../helpers/activity.helper";
import slackHelper from "../helpers/slack.helper";
import slackService from "./slack.service";
import dateUtils from "../utils/date.utils";

async function sendDailyUpdate(): Promise<void> {
	try {
		console.log("📱 Sending daily update...");

		const { startDate, endDate } = dateUtils.getDateRange("daily");

		const activities = await activityRepository.listAllActivitiesInRange(startDate, endDate);
		if (activities.length === 0) {
			await slackService.sendMessage(
				"No runs today! :eyes: Lace up and let's fix that tomorrow! :man-running: :dash:"
			);
			return;
		}
		const userGroupedActivities = activityHelper.groupActivitiesByUser(activities);
		const userActivitiesWithStats =
			activityHelper.calculateUserStatsAndSort(userGroupedActivities);

		// Format message using slack helper
		const message = await slackHelper.formatDailyUpdateMessage(userActivitiesWithStats);

		// Send to Slack
		await slackService.sendMessage(message);

		console.log("✅ Daily update sent successfully");
	} catch (error) {
		console.error("❌ Error sending daily update:", error);
		throw error;
	}
}

async function sendWeeklyUpdate(): Promise<void> {
	try {
		console.log("📊 Sending weekly update...");

		const { startDate, endDate } = dateUtils.getDateRange("weekly");

		const activities = await activityRepository.listAllActivitiesInRange(startDate, endDate);

		if (activities.length === 0) {
			await slackService.sendMessage(
				"No runs logged this week… :cry:\nYour leaderboard misses you — lace up and make me happy again! :man_running::blue_heart:"
			);
			return;
		}

		const userGroupedActivities = activityHelper.groupActivitiesByUser(activities);
		const userActivitiesWithStats =
			activityHelper.calculateUserStatsAndSort(userGroupedActivities);

		// Format message using slack helper
		const message = await slackHelper.formatWeeklyUpdateMessage(userActivitiesWithStats);

		// Send to Slack
		await slackService.sendMessage(message);

		console.log("✅ Weekly update sent successfully");
	} catch (error) {
		console.error("❌ Error sending weekly update:", error);
		throw error;
	}
}

export default {
	sendDailyUpdate,
	sendWeeklyUpdate,
};
