import axios from "axios";
import { Activity } from "../models/activity.model";
import { User } from "../models/user.model";
import stravaService from "./strava.service";
import paceUtilities from "../utilities/pace.utilities";

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

		// Fetch recent activities from Strava (last 30) - newest first
		const stravaActivities = await stravaService.fetchClubActivitiesFromStrava(1, 30);

		// Fetch recent activities from DB (last 30 for better coverage) - newest first
		const recentDbActivities = await Activity.find().sort({ createdAt: -1, _id: -1 }).limit(30).exec();

		let newActivities: StravaClubActivity[] = [];
		let matchCount = 0;

		// Process Strava activities in order (newest first)
		for (const stravaActivity of stravaActivities) {
			const matchFound = recentDbActivities.some(
				dbActivity =>
					stravaActivity.distance === dbActivity.distance &&
					stravaActivity.moving_time === dbActivity.movingTime &&
					stravaActivity.elapsed_time === dbActivity.elapsedTime &&
					stravaActivity.total_elevation_gain === dbActivity.totalElevationGain
			);

			if (matchFound) {
				// Record exists in DB - ignore it and increment match count
				matchCount++;
				console.log(`✅ Activity already exists in DB (match ${matchCount})`);

				// If we have enough consecutive matches, we can be confident older activities exist
				if (matchCount >= 3) {
					console.log(`🛑 Found ${matchCount} consecutive matches, stopping search`);
					break;
				}
			} else {
				// Record doesn't exist in DB - add to new activities
				newActivities.push(stravaActivity);
				console.log(`🆕 New activity found: "${stravaActivity.name}"`);

				// Reset match count when we find a new activity
				matchCount = 0;
			}
		}

		console.log(`🆕 Found ${newActivities.length} new activities to save`);
		return newActivities.reverse(); // Return oldest first for saving
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
		const activitiesToSave: {
			name: string;
			distance: number;
			movingTime: number;
			elapsedTime: number;
			totalElevationGain: number;
			movingPace: number;
			type: string;
			sportType: string;
			workoutType: number;
			activityDate: Date;
			isValid: boolean;
			note: string | null;
			user: string;
		}[] = [];

		for (const stravaActivity of newActivities) {
			// Create the key to find the user
			const userKey = `${stravaActivity.athlete.firstname}_${stravaActivity.athlete.lastname}`;
			const associatedUser = userMap[userKey];

			let isValid: boolean = true;
			let note: string | null = null;
			const pace = paceUtilities.getPaceFromTimeAndDistance(stravaActivity.moving_time, stravaActivity.distance);
			const paceString = paceUtilities.formatPaceToString(pace);
			if (associatedUser) {
				// Pace above 10 min/km is considered walking
				if (pace > 10 && stravaActivity.distance < 3000) {
					isValid = false;
					note = `Activity pace is ${paceString} min/km, which indicates walking. The distance covered is only ${stravaActivity.distance} meters, below the minimum 3 km required for a valid walk.`;
				}

				// Pace 10 min/km or below is considered running
				if (pace <= 10 && stravaActivity.distance < 1000) {
					isValid = false;
					note = `Activity pace is ${paceString} min/km, which indicates running. The distance covered is only ${stravaActivity.distance} meters, below the minimum 1 km required for a valid run.`;
				}

				// Format activity according to database schema
				const formattedActivity = {
					name: stravaActivity.name,
					distance: stravaActivity.distance,
					movingTime: stravaActivity.moving_time,
					elapsedTime: stravaActivity.elapsed_time,
					totalElevationGain: stravaActivity.total_elevation_gain,
					movingPace: pace, // Calculate moving pace in min per km
					type: stravaActivity.type,
					sportType: stravaActivity.sport_type,
					workoutType: stravaActivity.workout_type,
					activityDate: new Date(),
					isValid: isValid,
					note: note,
					user: String(associatedUser._id), // Reference to user's _id as string
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
					movingPace: pace,
					type: stravaActivity.type,
					sportType: stravaActivity.sport_type,
					workoutType: stravaActivity.workout_type,
					activityDate: new Date(),
					isValid: isValid,
					note: note,
					user: String(savedUser._id), // Reference to new user's _id as string
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

