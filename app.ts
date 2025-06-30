import mongoose from "mongoose";
import { config } from "./config";
import { CronJob } from "cron";
import stravaController from "./src/controller/strava.controller";

async function connectDB() {
	console.log("🔄 Connecting to MongoDB...");
	await mongoose.connect(config.MONGODB_URI, {
		serverSelectionTimeoutMS: 5000,
		connectTimeoutMS: 10000,
	});
	console.log("✅ Connected to MongoDB");
}

async function main() {
	console.log("🚀 Starting application...");
	await connectDB();

	const job = new CronJob(
		"0 */2 * * *",
		async () => {
			console.log("⏰ Running scheduled fetchAndStoreActivities...");
			await stravaController.fetchAndStoreActivities();
		},
		null,
		true,
		"Asia/Kathmandu"
	);

	await stravaController.fetchAndStoreActivities()

	console.log("✨ Cron scheduled, app ready.");
}

main();

process.on("unhandledRejection", reason => {
	console.error("❌ Unhandled Rejection:", reason);
});

process.on("SIGINT", async () => {
	console.log("👋 Gracefully shutting down...");
	await mongoose.disconnect();
	process.exit(0);
});
