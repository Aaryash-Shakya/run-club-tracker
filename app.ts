import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import { config } from "./config";
import { CronJob } from "cron";
import stravaController from "./src/controller/strava.controller";
import activityRepository from "./src/repositories/activity.repository";
import slackService from "./src/services/slack.service";

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
	res.json({
		message: "Strava Club Activity Tracker API",
		status: "running",
		timestamp: new Date().toISOString(),
	});
});

app.get("/health", (req: Request, res: Response) => {
	res.json({
		status: "OK",
		timestamp: new Date().toISOString(),
		database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
	});
});

app.get("/activities", async (req: Request, res: Response) => {
	try {
		const activities = await activityRepository.listAllActivitiesInAMonth(new Date());
		res.json({
			status: "OK",
			message: "Activities fetched successfully",
			activities,
		});
	} catch (error) {
		console.error("❌ Error fetching activities:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to fetch activities",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

app.post("/send-message", async (req: Request, res: Response): Promise<void> => {
	try {
		const { channelName, message } = req.body as { channelName?: string; message?: string };
		if (!channelName || !message) {
			res.status(400).json({
				status: "error",
				message: "Channel name and message are required",
			});
			return;
		}
		console.log(`📬 Sending message to channel: ${channelName}`);
		const result = await slackService.sendMessage(channelName, message);
		res.json({
			status: "OK",
			message: "Message sent successfully",
			result,
		});
	} catch (error) {
		console.error("❌ Error sending message:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to send message",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
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

