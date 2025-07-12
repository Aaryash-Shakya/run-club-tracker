import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import activityRoutes from "./activity.route";
import slackRoutes from "./slack.route";

const router = Router();

router.get("/", (req: Request, res: Response) => {
	res.json({
		message: "Strava Club Activity Tracker API",
		status: "running",
		timestamp: new Date().toISOString(),
	});
});

router.get("/health", (req: Request, res: Response) => {
	res.json({
		status: "OK",
		timestamp: new Date().toISOString(),
		database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
	});
});

router.use("/activities", activityRoutes);

router.use("/slack", slackRoutes);

export default router;

