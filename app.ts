import express, { Application } from "express";
import mongoose from "mongoose";
import { config } from "./config";
import { CronJob } from "cron";
import stravaController from "./src/controller/strava.controller";
import router from "./src/routes/index.route"; // <-- import the router

const app: Application = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Routes
app.use("/api/", router); // <-- use the router

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

	app.listen(PORT, () => {
		console.log(`🚀 Server running on port ${PORT}`);
	});

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

	await stravaController.fetchAndStoreActivities();

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

