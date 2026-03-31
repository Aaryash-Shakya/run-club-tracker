import { Request, Response, NextFunction } from "express";
import {
	adminUserListQuerySchema,
	updateUserBioSchema,
	createChallengeSchema,
	mongoIdParamSchema,
	addParticipantSchema,
	removeParticipantSchema,
} from "../validations/admin.validation";
import userRepository from "../repositories/user.repository";
import challengeRepository from "../repositories/challenge.repository";
import participantRepository from "../repositories/participant.repository";

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

async function createChallenge(req: Request, res: Response, next: NextFunction) {
	try {
		const data = createChallengeSchema.parse(req.body);
		const challenge = await challengeRepository.createChallenge(data);

		res.status(201).json({
			status: "OK",
			message: "Challenge created successfully",
			data: { challenge },
		});
	} catch (error) {
		next(error);
	}
}

async function listChallenges(req: Request, res: Response, next: NextFunction) {
	try {
		const challenges = await challengeRepository.listChallenges();

		res.json({
			status: "OK",
			message: "Challenges fetched successfully",
			data: { challenges, count: challenges.length },
		});
	} catch (error) {
		next(error);
	}
}

async function addParticipant(req: Request, res: Response, next: NextFunction) {
	try {
		const { challengeId } = mongoIdParamSchema.parse(req.params);
		const { userId } = addParticipantSchema.parse(req.body);

		const challenge = await challengeRepository.findChallengeById(challengeId);
		if (!challenge) {
			res.status(404).json({ status: "ERROR", message: "Challenge not found" });
			return;
		}

		const participant = await participantRepository.addParticipant(userId, challengeId);

		res.status(201).json({
			status: "OK",
			message: "Participant added successfully",
			data: { participant },
		});
	} catch (error) {
		if (error instanceof Error && "code" in error && (error as any).code === 11000) {
			res.status(409).json({
				status: "ERROR",
				message: "User is already a participant in this challenge",
			});
			return;
		}
		next(error);
	}
}

async function removeParticipant(req: Request, res: Response, next: NextFunction) {
	try {
		const { challengeId } = mongoIdParamSchema.parse(req.params);
		const { userId } = removeParticipantSchema.parse(req.body);

		const removed = await participantRepository.removeParticipant(userId, challengeId);

		if (!removed) {
			res.status(404).json({
				status: "ERROR",
				message: "Participant not found in this challenge",
			});
			return;
		}

		res.json({
			status: "OK",
			message: "Participant removed successfully",
		});
	} catch (error) {
		next(error);
	}
}

async function listParticipants(req: Request, res: Response, next: NextFunction) {
	try {
		const { challengeId } = mongoIdParamSchema.parse(req.params);

		const challenge = await challengeRepository.findChallengeById(challengeId);
		if (!challenge) {
			res.status(404).json({ status: "ERROR", message: "Challenge not found" });
			return;
		}

		const participants = await participantRepository.listParticipants(challengeId);

		res.json({
			status: "OK",
			message: "Participants fetched successfully",
			data: { participants, count: participants.length },
		});
	} catch (error) {
		next(error);
	}
}

export default {
	listUsers,
	updateUserBio,
	createChallenge,
	listChallenges,
	addParticipant,
	removeParticipant,
	listParticipants,
};
