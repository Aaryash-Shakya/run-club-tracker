import { Request, Response, NextFunction } from "express";
import { DateTime } from "luxon";
import activityRepository from "../repositories/activity.repository";
import activityHelper from "../helpers/activity.helper";

async function fetchMonthlyActivities(req: Request, res: Response, next: NextFunction) {
	try {
		const TIME_ZONE = "Asia/Kathmandu"; // Set your desired time zone
		const date = new Date();
		const nptDate = DateTime.fromJSDate(date).setZone(TIME_ZONE);

		// Start of month in Nepali time:
		const startOfMonthNPT = nptDate.startOf("month");

		// Start of next month in Nepali time:
		const startOfNextMonthNPT = startOfMonthNPT.plus({ months: 1 });

		// Convert to UTC JS Date for MongoDB:
		const startOfMonthUTC = startOfMonthNPT.toUTC().toJSDate();
		const startOfNextMonthUTC = startOfNextMonthNPT.toUTC().toJSDate();
		const activities = await activityRepository.listAllActivitiesInRange(
			startOfMonthUTC,
			startOfNextMonthUTC
		);
		const userGroupedActivities = activityHelper.groupActivitiesByUser(activities);
		const userActivitiesWithStats =
			activityHelper.calculateUserStatsAndSort(userGroupedActivities);
		res.json({
			status: "OK",
			message: "Activities fetched successfully",
			userActivitiesWithStats,
		});
	} catch (error) {
		next(error);
	}
}

async function fetchWeeklyActivities(req: Request, res: Response, next: NextFunction) {
	try {
		const TIME_ZONE = "Asia/Kathmandu";
		const date = new Date();
		const nptDate = DateTime.fromJSDate(date).setZone(TIME_ZONE);

		// Get day of week: Sunday = 7 for Luxon
		const weekday = nptDate.weekday; // 1 = Monday, 7 = Sunday

		// Calculate start of week (Sunday)
		const startOfWeekNPT = nptDate.minus({ days: weekday % 7 }).startOf("day");

		// Calculate end of week (Saturday)
		const endOfWeekNPT = startOfWeekNPT.plus({ days: 6 }).endOf("day");

		// Convert to UTC for MongoDB
		const startOfWeekUTC = startOfWeekNPT.toUTC().toJSDate();
		const endOfWeekUTC = endOfWeekNPT.toUTC().toJSDate();

		const activities = await activityRepository.listAllActivitiesInRange(
			startOfWeekUTC,
			endOfWeekUTC
		);
		const userGroupedActivities = activityHelper.groupActivitiesByUser(activities);
		const userActivitiesWithStats =
			activityHelper.calculateUserStatsAndSort(userGroupedActivities);

		res.json({
			status: "OK",
			message: "Weekly activities fetched successfully",
			startOfWeekUTC,
			endOfWeekUTC,
			userActivitiesWithStats,
		});
	} catch (error) {
		next(error);
	}
}

async function fetchDailyActivities(req: Request, res: Response, next: NextFunction) {
	try {
		const TIME_ZONE = "Asia/Kathmandu";
		const date = new Date(); // today
		const nptDate = DateTime.fromJSDate(date).setZone(TIME_ZONE);

		// Start of day in Nepali time:
		const startOfDayNPT = nptDate.startOf("day");

		// Start of next day in Nepali time:
		const startOfNextDayNPT = startOfDayNPT.plus({ days: 1 });

		// Convert to UTC JS Date for MongoDB:
		const startOfDayUTC = startOfDayNPT.toUTC().toJSDate();
		const startOfNextDayUTC = startOfNextDayNPT.toUTC().toJSDate();

		const activities = await activityRepository.listAllActivitiesInRange(
			startOfDayUTC,
			startOfNextDayUTC
		);
		const userGroupedActivities = activityHelper.groupActivitiesByUser(activities);
		const userActivitiesWithStats =
			activityHelper.calculateUserStatsAndSort(userGroupedActivities);

		res.json({
			status: "OK",
			message: "Activities for today fetched successfully",
			userActivitiesWithStats,
		});
	} catch (error) {
		next(error);
	}
}

export default {
	fetchMonthlyActivities,
	fetchWeeklyActivities,
	fetchDailyActivities,
};
