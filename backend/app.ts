import express, { Application } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "./config";
import { startStravaJob } from "./src/jobs/strava.job";
import router from "./src/routes/index.route";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler";

const app: Application = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Routes
app.use("/api/", router);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

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

	try {
		await connectDB();

		const server = app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
		});

		// Handle server errors
		server.on("error", (error: Error) => {
			console.error("❌ Server error:", error);
			process.exit(1);
		});

		startStravaJob();
		console.log("✨ Cron scheduled, app ready.");
	} catch (error) {
		console.error("❌ Failed to start application:", error);
		process.exit(1);
	}
}

main();

// Enhanced error handlers
process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
	console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
	process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
	console.error("❌ Uncaught Exception:", error);
	process.exit(1);
});

process.on("SIGTERM", async () => {
	console.log("👋 SIGTERM received, shutting down gracefully...");
	await mongoose.disconnect();
	process.exit(0);
});

process.on("SIGINT", async () => {
	console.log("👋 Gracefully shutting down...");
	await mongoose.disconnect();
	process.exit(0);
});
