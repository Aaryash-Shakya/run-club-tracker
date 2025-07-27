import { Request, Response, NextFunction } from "express";
import userRepository from "../repositories/user.repository";

async function listAllUsers(req: Request, res: Response, next: NextFunction) {
	try {
		const users = await userRepository.listAllUsers();

		res.setHeader("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
		res.json({
			status: "OK",
			message: "Users fetched successfully",
			data: {
				users,
				count: users.length,
			},
		});
	} catch (error) {
		next(error);
	}
}

export default {
	listAllUsers,
};
