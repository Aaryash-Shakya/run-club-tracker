import { Router } from "express";
import adminController from "../controller/admin.controller";
import { validateUserIdParams } from "../validations/user.validation";

const router = Router();

router.get("/users", adminController.listUsers);

router.patch("/users/:userId", validateUserIdParams, adminController.updateUserBio);

export default router;
