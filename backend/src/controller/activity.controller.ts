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
		const userActivitiesWithStats = activityHelper.calculateUserStatsAndSort(
			userGroupedActivities,
			false
		);

		// Generate appropriate message based on period
		const periodMessages = {
			daily: "Activities for the day fetched successfully",
			weekly: "Weekly activities fetched successfully",
			monthly: "Monthly activities fetched successfully",
		};

		res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
		res.json({
			status: "OK",
			message: periodMessages[period],
			userActivitiesWithStats,
		});
	} catch (error) {
		next(error);
	}
}

async function fetchRecentActivities(req: Request, res: Response, next: NextFunction) {
	try {
		const now = new Date();
		const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

		const activities = await activityRepository.listAllActivitiesInRange(
			twentyFourHoursAgo,
			now
		);
		const userGroupedActivities = activityHelper.groupActivitiesByUser(activities);
		const userActivitiesWithStats = activityHelper.calculateUserStatsAndSort(
			userGroupedActivities,
			false
		);

		res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
		res.json({
			status: "OK",
			message: "Recent activities fetched successfully",
			activities,
			userActivitiesWithStats,
		});
	} catch (error) {
		next(error);
	}
}

async function fetchUserActivities(req: Request, res: Response, next: NextFunction) {
	try {
		const userId = req.params.userId;
		const { period, date } = req.validatedQuery as ActivityQueryParams;

		const { startDate, endDate } = dateUtils.getDateRange(period, date);

		const activities = await activityRepository.listUserActivitiesInRange(
			userId,
			startDate,
			endDate
		);
		const userGroupedActivities = activityHelper.groupActivitiesByUser(activities);
		const activitiesWithStats = activityHelper.calculateUserStatsAndSort(userGroupedActivities);

		const periodMessages = {
			daily: "User activities for the day fetched successfully",
			weekly: "User weekly activities fetched successfully",
			monthly: "User monthly activities fetched successfully",
		};

		res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
		res.json({
			status: "OK",
			message: periodMessages[period],
			activities: activitiesWithStats[0],
		});
	} catch (error) {
		next(error);
	}
}

export default {
	fetchActivities,
	fetchRecentActivities,
	fetchUserActivities,
};
