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
			activities,
			userActivitiesWithStats,
		});
	} catch (error) {
		next(error);
	}
}

export default {
	fetchMonthlyActivities,
	fetchDailyActivities,
};
