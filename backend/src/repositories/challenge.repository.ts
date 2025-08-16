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

export default {
	findChallenge,
};
