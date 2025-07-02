import { DateTime } from "luxon";
import { Activity } from "../models/activity.model";
import { PipelineStage } from "mongoose";

const TIME_ZONE = "Asia/Kathmandu";

async function listAllActivitiesInAMonth(date: Date): Promise<any[]> {
	const nptDate = DateTime.fromJSDate(date).setZone(TIME_ZONE);

	// Start of month in Nepali time:
	const startOfMonthNPT = nptDate.startOf("month");

	// Start of next month in Nepali time:
	const startOfNextMonthNPT = startOfMonthNPT.plus({ months: 1 });

	// Convert to UTC JS Date for MongoDB:
	const startOfMonthUTC = startOfMonthNPT.toUTC().toJSDate();
	const startOfNextMonthUTC = startOfNextMonthNPT.toUTC().toJSDate();

	const pipeline: PipelineStage[] = [
		{
			$match: {
				createdAt: {
					$gte: startOfMonthUTC,
					$lt: startOfNextMonthUTC,
				},
			},
		},
		{
			$sort: { createdAt: -1, _id: -1 },
		},
		{
			$lookup: {
				from: "users",
				localField: "user",
				foreignField: "_id",
				as: "user",
			},
		},
		{
			$unwind: { path: "$user" },
		},
	];

	const activities = await Activity.aggregate(pipeline);
	return activities;
}

export default {
	listAllActivitiesInAMonth,
};
