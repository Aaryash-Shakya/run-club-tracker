import { Router } from "express";
import activityController from "../controller/activity.controller";
import { validateActivityQuery } from "../middlewares/validation.middleware";

const router = Router();

// Single route for fetching activities with query parameters
// Usage: GET /activities?period=daily|weekly|monthly&date=yyyy-mm-dd (date is optional)
router.get("", validateActivityQuery, activityController.fetchActivities);
router.get("/july", activityController.fetchAllActivitiesOfJuly);

router.get("/recent", activityController.fetchRecentActivities);

export default router;
