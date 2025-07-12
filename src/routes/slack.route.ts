import { Router } from "express";
import activityController from "../controller/activity.controller";
import slackController from "../controller/slack.controller";

const router = Router();

router.post("/send-message", slackController.sendMessageToSlack);

router.post("/update-message", slackController.updateMessage);

export default router;

