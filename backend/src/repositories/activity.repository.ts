import { Activity } from "../models/activity.model";
import { TActivityWithUser } from "../types/activity";
import { PipelineStage, Types } from "mongoose";

async function listAllActivitiesInRange(
	startDate: Date,
	endDate: Date
): Promise<TActivityWithUser[]> {
	const pipeline: PipelineStage[] = [
		{
			$match: {
				createdAt: {
					$gte: startDate,
					$lt: endDate,
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

	const activities = await Activity.aggregate<TActivityWithUser>(pipeline);
	return activities;
}

async function listUserActivitiesInRange(
	userId: string,
	startDate: Date,
	endDate: Date
): Promise<TActivityWithUser[]> {
	const pipeline: PipelineStage[] = [
		{
			$match: {
				user: new Types.ObjectId(userId),
				createdAt: {
					$gte: startDate,
					$lt: endDate,
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

	const activities = await Activity.aggregate<TActivityWithUser>(pipeline);
	return activities;
}

export default {
	listAllActivitiesInRange,
	listUserActivitiesInRange,
};
