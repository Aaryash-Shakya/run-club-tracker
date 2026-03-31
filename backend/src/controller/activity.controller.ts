import { Request, Response, NextFunction } from "express";
import activityRepository from "../repositories/activity.repository";
import activityHelper from "../helpers/activity.helper";
import dateUtils from "../utils/date.utils";
import { ActivityQueryParams } from "../middlewares/validation.middleware";

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

async function fetchActivitiesByMonth(req: Request, res: Response, next: NextFunction) {
	try {
		const { year, month } = req.params;
		const yearNum = parseInt(year, 10);
		const monthNum = parseInt(month, 10);

		if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
			res.status(400).json({
				status: "ERROR",
				message: "Invalid year or month. Use /activities/visualization/YYYY/MM",
			});
			return;
		}

		// Create a date in the middle of the requested month
		const targetDate = new Date(`${year}-${month.padStart(2, "0")}-15`);
		const { startDate, endDate } = dateUtils.getDateRange("monthly", targetDate);

		const activities = await activityRepository.listAllActivitiesInRange(startDate, endDate);

		res.json({
			status: "OK",
			message: `Activities for ${year}-${month.padStart(2, "0")} fetched successfully`,
			activities,
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
	fetchActivitiesByMonth,
	fetchRecentActivities,
	fetchUserActivities,
};
