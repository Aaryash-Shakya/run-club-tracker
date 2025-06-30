import activityService from "../services/activity.service";

async function fetchAndStoreActivities() {
	try {
		const newActivities = await activityService.findNewActivities();
		if (newActivities.length > 0) {
			await activityService.addNewActivitiesToDatabase(newActivities);
			console.log(`✅ Successfully added ${newActivities.length} new activities to the database.`);
		} else {
			console.log("ℹ️ No new activities found.");
		}
	} catch (error) {
		console.error("❌ Error fetching and storing activities:", error);
	}
}

export default {
	fetchAndStoreActivities,
};
