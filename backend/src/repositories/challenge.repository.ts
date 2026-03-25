import { Types } from "mongoose";
import Challenge, { IChallenge } from "../models/challenge.model";

async function findChallenge(date: Date): Promise<IChallenge | null> {
	return Challenge.findOne({
		startDate: { $lte: date },
		endDate: { $gte: date },
	})
		.sort({ startDate: -1 })
		.lean()
		.exec();
}

interface CreateChallengeInput {
	name: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	targetKm: number;
	maxRunPace?: number;
	minWalkingDistance?: number;
	minRunningDistance?: number;
}

async function createChallenge(input: CreateChallengeInput): Promise<IChallenge> {
	const challenge = new Challenge(input);
	return challenge.save();
}

async function listChallenges(): Promise<IChallenge[]> {
	return Challenge.find({}).sort({ startDate: -1 }).lean();
}

async function findChallengeById(id: string): Promise<IChallenge | null> {
	if (!Types.ObjectId.isValid(id)) return null;
	return Challenge.findById(id).lean();
}

export default {
	findChallenge,
	createChallenge,
	listChallenges,
	findChallengeById,
};
