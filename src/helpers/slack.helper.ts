import paceUtils from "../utils/pace.utils";
import dateUtils from "../utils/date.utils";
import { TGroupedUserActivitiesWithStats } from "./activity.helper";
import { DateTime } from "luxon";

// Core function that generates the user activity list
async function generateActivityList(
	userActivitiesWithStats: TGroupedUserActivitiesWithStats[]
): Promise<string> {
	// The data should already be sorted by distance from calculateUserStatsAndSort
	const userLines = userActivitiesWithStats.map((userStats, index) => {
		const { user, stats } = userStats;
		const rank = index + 1;

		// Format name (First Name + Last Initial)
		const name = `${user.firstName} ${user.lastName.charAt(0)}.`;

		// Convert distance from meters to kilometers
		const distanceKm = (stats.totalDistance / 1000).toFixed(2);

		// Format pace (convert from decimal minutes to MM:SS format)
		const paceFormatted = paceUtils.formatPaceToString(stats.averagePace);

		return `${rank}. *${name}* — ${distanceKm} km | Pace: ${paceFormatted}`;
	});

	// add space between each user line
	return userLines.join("\n") + "\n\n";
}

// Function that creates daily update message
async function formatDailyUpdateMessage(
	userActivitiesWithStats: TGroupedUserActivitiesWithStats[]
): Promise<string> {
	const today = DateTime.now()
		.setZone("Asia/Kathmandu")
		.toLocaleString({ month: "long", day: "numeric" });

	const header = `:man-running: *Daily Run Update — ${today}* :spiral_calendar_pad:\n\n`;
	const activityList = await generateActivityList(userActivitiesWithStats);
	const footer =
		"Keep up the awesome work — see you all tomorrow night with more updates! :rocket:";

	return header + activityList + footer;
}

// Function that creates weekly update message
async function formatWeeklyUpdateMessage(
	userActivitiesWithStats: TGroupedUserActivitiesWithStats[]
): Promise<string> {
	const weekRange = dateUtils.formatWeekRange();

	const header = `:trophy: *Weekly Run Summary — ${weekRange}* :calendar:\n\n`;
	const activityList = await generateActivityList(userActivitiesWithStats);
	const footer = "Amazing week everyone! Let's keep the momentum going! :fire:";

	return header + activityList + footer;
}

export default {
	generateActivityList,
	formatDailyUpdateMessage,
	formatWeeklyUpdateMessage,
};
