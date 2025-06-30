import express from "express";
import mongoose from "mongoose";
import { config } from "./config";
import { CronJob } from "cron";
import stravaController from "./src/controller/strava.controller";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
	res.json({
		message: "Strava Club Activity Tracker API",
		status: "running",
		timestamp: new Date().toISOString(),
	});
});

app.get("/health", (req, res) => {
	res.json({
		status: "OK",
		timestamp: new Date().toISOString(),
		database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
	});
});

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
		"0 */2 * * *",
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
