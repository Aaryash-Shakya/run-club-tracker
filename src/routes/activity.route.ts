import { Router } from "express";
import activityController from "../controller/activity.controller";

const router = Router();

router.get("/monthly-activities", activityController.fetchMonthlyActivities);

router.get("/daily-activities", activityController.fetchDailyActivities);

export default router;
