import axios from "axios";
import { Activity } from "../models/activity.model";
import { User } from "../models/user.model";
import stravaService from "./strava.service";

// Strava API response type for club activities
export type StravaClubActivity = {
	resource_state: number;
	athlete: {
		resource_state: number;
		firstname: string;
		lastname: string;
	};
	name: string;
	distance: number;
	moving_time: number;
	elapsed_time: number;
	total_elevation_gain: number;
	type: string;
	sport_type: string;
	workout_type: number;
};

async function getLastActivityFromDB() {
	try {
		const lastActivity = await Activity.findOne()
			.sort({ createdAt: -1, _id: -1 }) // Sort by activity date descending (most recent first), id is tie breaker
			.exec();

		return lastActivity;
	} catch (error) {
		console.error("❌ Error fetching last activity from database:", error);
		throw error;
	}
}

async function findNewActivities(): Promise<StravaClubActivity[]> {
	try {
		console.log("🔍 Looking for new activities...");

		// Get the last activity from our database
		const lastActivity = await getLastActivityFromDB();

		// Fetch activities from Strava
		const stravaActivities = await stravaService.fetchClubActivitiesFromStrava();

		let newActivities: StravaClubActivity[] = [];

		if (lastActivity) {
			// Find the index of the last activity in the fetched Strava activities
			const lastIndex = stravaActivities.findIndex(
				(activity: any) =>
					activity.name === lastActivity.name &&
					activity.distance === lastActivity.distance &&
					activity.moving_time === lastActivity.movingTime &&
					activity.elapsed_time === lastActivity.elapsedTime
			);

			// All activities before (and not including) lastIndex are new
			if (lastIndex > 0) {
				newActivities = stravaActivities.slice(0, lastIndex);
			} else if (lastIndex === -1) {
				// If not found, assume all are new
				newActivities = stravaActivities;
			}
		} else {
			// If no last activity, all are new
			newActivities = stravaActivities;
		}

		console.log(`🆕 Found ${newActivities.length} new activities`);

		// Return new activities in oldest-first order
		return newActivities.reverse();
	} catch (error) {
		console.error("❌ Error finding new activities:", error);
		throw error;
	}
}

async function addNewActivitiesToDatabase(newActivities: StravaClubActivity[]) {
	try {
		console.log("📥 Adding new activities to database...");

		// 1. Get all users from the database
		const users = await User.find({}).exec();
		console.log(`👥 Found ${users.length} users in database`);

		// 2. Convert users array into object with firstName_lastName as key
		const userMap: { [key: string]: any } = {};
		users.forEach(user => {
			const key = `${user.firstName}_${user.lastName}`;
			userMap[key] = user;
		});

		// 3. Loop over newActivities and format them for database
		const activitiesToSave = [];

		for (const stravaActivity of newActivities) {
			// Create the key to find the user
			const userKey = `${stravaActivity.athlete.firstname}_${stravaActivity.athlete.lastname}`;
			const associatedUser = userMap[userKey];

			if (associatedUser) {
				// Format activity according to database schema
				const formattedActivity = {
					name: stravaActivity.name,
					distance: stravaActivity.distance,
					movingTime: stravaActivity.moving_time,
					elapsedTime: stravaActivity.elapsed_time,
					totalElevationGain: stravaActivity.total_elevation_gain,
					type: stravaActivity.type,
					sportType: stravaActivity.sport_type,
					workoutType: stravaActivity.workout_type,
					activityDate: new Date(),
					isValid: true,
					user: associatedUser._id, // Reference to user's _id
				};

				activitiesToSave.push(formattedActivity);
				console.log(`✅ Mapped activity "${stravaActivity.name}" to user ${userKey}`);
			} else {
				// Create new user if not found
				console.log(`👤 Creating new user: ${userKey}`);

				const newUser = new User({
					firstName: stravaActivity.athlete.firstname,
					lastName: stravaActivity.athlete.lastname,
				});

				const savedUser = await newUser.save();
				console.log(`✅ Created new user: ${savedUser.firstName} ${savedUser.lastName}`);

				// Add the new user to userMap for future activities in this batch
				userMap[userKey] = savedUser;

				// Format activity with new user's ID
				const formattedActivity = {
					name: stravaActivity.name,
					distance: stravaActivity.distance,
					movingTime: stravaActivity.moving_time,
					elapsedTime: stravaActivity.elapsed_time,
					totalElevationGain: stravaActivity.total_elevation_gain,
					type: stravaActivity.type,
					sportType: stravaActivity.sport_type,
					workoutType: stravaActivity.workout_type,
					activityDate: new Date(),
					isValid: true,
					user: savedUser._id, // Reference to new user's _id
				};

				activitiesToSave.push(formattedActivity);
				console.log(`✅ Mapped activity "${stravaActivity.name}" to new user ${userKey}`);
			}
		}

		// 4. Bulk insert all activities to database
		if (activitiesToSave.length > 0) {
			const savedActivities = await Activity.insertMany(activitiesToSave);
			console.log(`🎉 Successfully saved ${savedActivities.length} new activities to database`);
			return savedActivities;
		} else {
			console.log("⏭️ No activities to save");
			return [];
		}
	} catch (error) {
		console.error("❌ Error adding new activities to database:", error);
		throw error;
	}
}

export default {
	findNewActivities,
	addNewActivitiesToDatabase,
};
