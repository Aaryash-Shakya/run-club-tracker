import { Request, Response, NextFunction } from "express";
import activityRepository from "../repositories/activity.repository";
import activityHelper from "../helpers/activity.helper";
import dateUtils from "../utils/date.utils";

async function fetchMonthlyActivities(req: Request, res: Response, next: NextFunction) {
	try {
		const { startDate, endDate } = dateUtils.getDateRange("monthly");

		const activities = await activityRepository.listAllActivitiesInRange(startDate, endDate);
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
		const { startDate, endDate } = dateUtils.getDateRange("weekly");

		const activities = await activityRepository.listAllActivitiesInRange(startDate, endDate);
		const userGroupedActivities = activityHelper.groupActivitiesByUser(activities);
		const userActivitiesWithStats =
			activityHelper.calculateUserStatsAndSort(userGroupedActivities);

		res.json({
			status: "OK",
			message: "Weekly activities fetched successfully",
			userActivitiesWithStats,
		});
	} catch (error) {
		next(error);
	}
}

async function fetchDailyActivities(req: Request, res: Response, next: NextFunction) {
	try {
		const { startDate, endDate } = dateUtils.getDateRange("daily");

		const activities = await activityRepository.listAllActivitiesInRange(startDate, endDate);
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
