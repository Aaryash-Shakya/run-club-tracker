import { Router } from "express";
import activityController from "../controller/activity.controller";
import { validateActivityQuery } from "../middleware/validation.middleware";
import { validateUserIdParams } from "../validations/user.validation";

const router = Router();

// Single route for fetching activities with query parameters
// Usage: GET /activities?period=daily|weekly|monthly&date=yyyy-mm-dd (date is optional)
router.get("", validateActivityQuery, activityController.fetchActivities);

router.get(
	"/users/:userId",
	validateUserIdParams,
	validateActivityQuery,
	activityController.fetchUserActivities
);

export default router;
