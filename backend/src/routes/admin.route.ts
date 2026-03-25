import { Router } from "express";
import adminController from "../controller/admin.controller";
import { validateUserIdParams } from "../validations/user.validation";

const router = Router();

// User management
router.get("/users", adminController.listUsers);
router.patch("/users/:userId", validateUserIdParams, adminController.updateUserBio);

// Challenge management
router.post("/challenges", adminController.createChallenge);
router.get("/challenges", adminController.listChallenges);

// Participant management
router.post("/challenges/:challengeId/participants", adminController.addParticipant);
router.delete("/challenges/:challengeId/participants", adminController.removeParticipant);
router.get("/challenges/:challengeId/participants", adminController.listParticipants);

export default router;
