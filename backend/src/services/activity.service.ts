import { Activity } from "../models/activity.model";
import { IUser, User } from "../models/user.model";
import stravaService from "./strava.service";
import paceUtils from "../utils/pace.utils";
import challengeRepository from "../repositories/challenge.repository";

// Strava API response type for club activities
export type StravaClubActivity = {
	id: number;
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
	start_date: string;
};

async function findNewActivities(pagesToFetch: number = 1): Promise<StravaClubActivity[]> {
	try {
		console.log(`🔍 Looking for new activities (fetching ${pagesToFetch} pages)...`);

		let stravaActivities: StravaClubActivity[] = [];
		for (let i = 1; i <= pagesToFetch; i++) {
			const activities = await stravaService.fetchClubActivitiesFromStrava(i, 50);
			stravaActivities = [...stravaActivities, ...activities];
			if (activities.length === 0) break;
		}

		// Fetch recent activities from DB (last 50 for better coverage) - newest first
		const recentDbActivities = await Activity.find()
			.sort({ createdAt: -1, _id: -1 })
			.limit(50)
			.populate("user", "firstName lastName")
			.exec();

		const newActivities: StravaClubActivity[] = [];

		for (const stravaActivity of stravaActivities) {
			const hash = generateActivityHash(stravaActivity);

			const matchFound = recentDbActivities.some((dbActivity) => {
				// 1. Try matching by activityHash (most accurate)
				if (dbActivity.activityHash === hash) {
					return true;
				}

				// 2. Fallback to fuzzy match for legacy activities without hash
				if (!dbActivity.activityHash) {
					return (
						stravaActivity.distance === dbActivity.distance &&
						stravaActivity.moving_time === dbActivity.movingTime &&
						stravaActivity.elapsed_time === dbActivity.elapsedTime &&
						stravaActivity.total_elevation_gain === dbActivity.totalElevationGain
					);
				}

				return false;
			});

			if (!matchFound) {
				// Record doesn't exist in DB - add to new activities
				newActivities.push(stravaActivity);
				console.log(`🆕 New activity found: "${stravaActivity.name}"`);
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
		const userMap: { [key: string]: IUser } = {};
		users.forEach((user) => {
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
			isValid: boolean;
			note: string | null;
			user: string;
			activityHash: string;
		}[] = [];

		for (const stravaActivity of newActivities) {
			// Create the key to find the user
			const userKey = `${stravaActivity.athlete.firstname}_${stravaActivity.athlete.lastname}`;
			let associatedUser = userMap[userKey];

			// Create new user if not found
			if (!associatedUser) {
				console.log(`👤 Creating new user: ${userKey}`);

				const newUser = new User({
					firstName: stravaActivity.athlete.firstname,
					lastName: stravaActivity.athlete.lastname,
				});

				associatedUser = await newUser.save();
				console.log(
					`✅ Created new user: ${associatedUser.firstName} ${associatedUser.lastName}`
				);

				// Add the new user to userMap for future activities in this batch
				userMap[userKey] = associatedUser;
			}

			// Validate activity and create formatted object
			let isValid: boolean = true;
			let note: string | null = null;
			const pace = paceUtils.getPaceFromTimeAndDistance(
				stravaActivity.moving_time,
				stravaActivity.distance
			);
			const paceString = paceUtils.formatPaceToString(pace);

			// fetch challenge threshold
			const challenge = await challengeRepository.findChallenge(new Date());
			const MAX_RUN_PACE = challenge?.maxRunPace ?? 9.5;
			const MIN_WALKING_DISTANCE = challenge?.minWalkingDistance ?? 100;
			const MIN_RUNNING_DISTANCE = challenge?.minRunningDistance ?? 100;

			if (pace > MAX_RUN_PACE && stravaActivity.distance < MIN_WALKING_DISTANCE) {
				isValid = false;
				note = `Activity pace is ${paceString} min/km, which indicates walking. The distance covered is only ${stravaActivity.distance} meters, below the minimum 500 meters required for a valid walk.`;
			}

			if (pace <= MAX_RUN_PACE && stravaActivity.distance < MIN_RUNNING_DISTANCE) {
				isValid = false;
				note = `Activity pace is ${paceString} min/km, which indicates running. The distance covered is only ${stravaActivity.distance} meters, below the minimum 500 meters required for a valid run.`;
			}

			// Format activity according to database schema
			const formattedActivity = {
				activityHash: generateActivityHash(stravaActivity),
				name: stravaActivity.name,
				distance: stravaActivity.distance,
				movingTime: stravaActivity.moving_time,
				elapsedTime: stravaActivity.elapsed_time,
				totalElevationGain: stravaActivity.total_elevation_gain,
				movingPace: pace,
				type: stravaActivity.type,
				sportType: stravaActivity.sport_type,
				workoutType: stravaActivity.workout_type,
				activityDate: new Date(), // Club API has no date, but hash prevents duplicates
				isValid: isValid,
				note: note,
				user: String(associatedUser._id),
			};

			activitiesToSave.push(formattedActivity);
			console.log(`✅ Mapped activity "${stravaActivity.name}" to user ${userKey}`);
		}

		// 4. Bulk insert all activities to database
		if (activitiesToSave.length > 0) {
			const savedActivities = await Activity.insertMany(activitiesToSave);
			console.log(
				`🎉 Successfully saved ${savedActivities.length} new activities to database`
			);
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

function generateActivityHash(activity: StravaClubActivity): string {
	const components = [
		activity.athlete.firstname.toLowerCase(),
		activity.athlete.lastname.toLowerCase(),
		activity.distance,
		activity.moving_time,
		activity.elapsed_time,
		activity.total_elevation_gain,
		activity.type,
	];
	return components.join("_").replace(/\s+/g, "");
}

export default {
	findNewActivities,
	addNewActivitiesToDatabase,
	generateActivityHash,
};
