import { TActivityWithUser } from "../types/activity";
import { TGroupedUserActivities, TUser } from "../types/user";

interface UserStats {
	totalDistance: number;
	totalMovingTime: number;
	averagePace: number;
	totalActivities: number;
	invalidActivities: number;
	runningDistance: number;
	walkingDistance: number;
}

export interface TGroupedUserActivitiesWithStats extends TGroupedUserActivities {
	stats: UserStats;
}

export interface TUserWithStats extends TUser {
	stats: UserStats;
}

function groupActivitiesByUser(activities: TActivityWithUser[]): TGroupedUserActivities[] {
	const userActivitiesMap = activities.reduce(
		(acc, activity) => {
			const userId = activity.user._id.toString();

			if (!acc[userId]) {
				acc[userId] = {
					user: {
						_id: activity.user._id.toString(),
						firstName: activity.user.firstName,
						lastName: activity.user.lastName,
						bio: activity.user.bio,
						createdAt: activity.user.createdAt,
						updatedAt: activity.user.updatedAt,
						__v: activity.user.__v,
					},
					activities: [],
				};
			}

			const { user, ...activityWithoutUser } = activity;
			acc[userId].activities.push(activityWithoutUser);

			return acc;
		},
		{} as Record<string, TGroupedUserActivities>
	);

	return Object.values(userActivitiesMap);
}

function calculateUserStatsAndSort(
	userGroupedActivities: TGroupedUserActivities[],
	includeActivities: boolean = true
): TGroupedUserActivitiesWithStats[] | TUserWithStats[] {
	const userActivitiesWithStats = userGroupedActivities.map((userGroup) => {
		const { activities } = userGroup;

		// Filter valid and invalid activities
		const validActivities = activities.filter((activity) => activity.isValid === true);
		const invalidActivities = activities.filter((activity) => activity.isValid !== true);

		// Calculate total distance and total moving time (only for valid activities)
		const totalDistance = validActivities.reduce((sum, activity) => sum + activity.distance, 0);
		const totalMovingTime = validActivities.reduce(
			(sum, activity) => sum + activity.movingTime,
			0
		);
		const runningDistance = validActivities.reduce((sum, activity) => {
			if (activity.movingPace < 10) {
				return sum + activity.distance;
			}
			return sum;
		}, 0);

		// Calculate average pace (weighted by distance, only for valid activities)
		let totalWeightedPace = 0;
		let totalDistanceForPace = 0;

		validActivities.forEach((activity) => {
			if (activity.movingPace && activity.distance > 0) {
				totalWeightedPace += activity.movingPace * activity.distance;
				totalDistanceForPace += activity.distance;
			}
		});

		const averagePace = totalDistanceForPace > 0 ? totalWeightedPace / totalDistanceForPace : 0;

		const stats: UserStats = {
			totalDistance,
			totalMovingTime,
			averagePace,
			totalActivities: validActivities.length,
			invalidActivities: invalidActivities.length,
			runningDistance,
			walkingDistance: totalDistance - runningDistance,
		};

		if (includeActivities) {
			return {
				...userGroup,
				stats,
			};
		}
		return {
			user: userGroup.user,
			stats,
		};
	});

	// Sort by descending total distance
	return userActivitiesWithStats.sort((a, b) => b.stats.totalDistance - a.stats.totalDistance);
}

export default {
	groupActivitiesByUser,
	calculateUserStatsAndSort,
};
