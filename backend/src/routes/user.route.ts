import { Router } from "express";
import userController from "../controller/user.controller";
import { validateUserIdParams } from "../validations/user.validation";
import { validateActivityQuery } from "../middlewares/validation.middleware";
import activityController from "../controller/activity.controller";

const router = Router();

router.get("", userController.listAllUsers);

router.get(
	"/:userId/activities",
	validateUserIdParams,
	validateActivityQuery,
	activityController.fetchUserActivities
);

export default router;
