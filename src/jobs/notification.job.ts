import { CronJob } from "cron";
import notificationService from "../services/notification.service";

export function startNotificationJobs(): void {
	// Daily update every night at 9:00 PM Nepal time
	new CronJob(
		"0 21 * * *", // 9:00 PM every day
		async () => {
			try {
				console.log("⏰ Running daily notification job...");
				await notificationService.sendDailyUpdate();
			} catch (error) {
				console.error("❌ Daily notification job failed:", error);
			}
		},
		null,
		true,
		"Asia/Kathmandu"
	);

	// Last week's update every Sunday at 8:00 AM Nepal time
	new CronJob(
		"0 8 * * 0", // 8:00 AM every Sunday (0 = Sunday)
		async () => {
			try {
				console.log("⏰ Running weekly notification job...");
				await notificationService.sendWeeklyUpdate();
			} catch (error) {
				console.error("❌ Weekly notification job failed:", error);
			}
		},
		null,
		true,
		"Asia/Kathmandu"
	);

	console.log("⏰ Notification cron job scheduled.");
}
