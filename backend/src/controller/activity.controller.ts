import { Request, Response, NextFunction } from "express";
import activityRepository from "../repositories/activity.repository";
import activityHelper from "../helpers/activity.helper";
import dateUtils from "../utils/date.utils";
import { ActivityQueryParams } from "../middleware/validation.middleware";

async function fetchActivities(req: Request, res: Response, next: NextFunction) {
	try {
		// Get validated query parameters from middleware
		const { period, date } = req.validatedQuery as ActivityQueryParams;

		// Get date range based on period and optional date
		const { startDate, endDate } = dateUtils.getDateRange(period, date);

		const activities = await activityRepository.listAllActivitiesInRange(startDate, endDate);
		const userGroupedActivities = activityHelper.groupActivitiesByUser(activities);
		const userActivitiesWithStats =
			activityHelper.calculateUserStatsAndSort(userGroupedActivities);

		// Generate appropriate message based on period
		const periodMessages = {
			daily: "Activities for the day fetched successfully",
			weekly: "Weekly activities fetched successfully",
			monthly: "Monthly activities fetched successfully",
		};

		res.json({
			status: "OK",
			message: periodMessages[period],
			userActivitiesWithStats,
		});
	} catch (error) {
		next(error);
	}
}

export default {
	fetchActivities,
};
