import { Request, Response, NextFunction } from "express";
import { adminUserListQuerySchema, updateUserBioSchema } from "../validations/admin.validation";
import userRepository from "../repositories/user.repository";

async function listUsers(req: Request, res: Response, next: NextFunction) {
	try {
		const query = adminUserListQuerySchema.parse(req.query);
		const result = await userRepository.searchUsers({
			search: query.search,
			cursor: query.cursor,
			limit: query.limit,
		});

		res.json({
			status: "OK",
			message: "Users fetched successfully",
			data: {
				users: result.users,
				nextCursor: result.nextCursor,
				count: result.users.length,
			},
		});
	} catch (error) {
		next(error);
	}
}

async function updateUserBio(req: Request, res: Response, next: NextFunction) {
	try {
		const { bio } = updateUserBioSchema.parse(req.body);
		const { userId } = req.params;

		const user = await userRepository.updateUserBio(userId, bio);

		if (!user) {
			res.status(404).json({
				status: "ERROR",
				message: "User not found",
			});
			return;
		}

		res.json({
			status: "OK",
			message: "User bio updated successfully",
			data: { user },
		});
	} catch (error) {
		next(error);
	}
}

export default {
	listUsers,
	updateUserBio,
};
