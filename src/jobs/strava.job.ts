import { CronJob } from "cron";
import stravaController from "../controller/strava.controller";

export function startStravaJob() {
    new CronJob(
        "*/30 * * * *",
        async () => {
            console.log("⏰ Running scheduled fetchAndStoreActivities...");
            await stravaController.fetchAndStoreActivities();
        },
        null,
        true,
        "Asia/Kathmandu"
    );

    console.log("✨ Strava cron job scheduled.");
}
