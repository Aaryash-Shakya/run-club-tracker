import express, { Application } from "express";
import mongoose from "mongoose";
import { config } from "./config";
import { startStravaJob } from "./src/jobs/strava.job"; // <-- import the job
import router from "./src/routes/index.route";

const app: Application = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Routes
app.use("/api/", router);

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

	startStravaJob(); // <-- start the job here

	console.log("✨ Cron scheduled, app ready.");
}

main();

process.on("unhandledRejection", (reason) => {
	console.error("❌ Unhandled Rejection:", reason);
});

process.on("SIGINT", async () => {
	console.log("👋 Gracefully shutting down...");
	await mongoose.disconnect();
	process.exit(0);
});
