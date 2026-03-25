import { Participant, IParticipant } from "../models/participant.model";

async function addParticipant(userId: string, challengeId: string): Promise<IParticipant> {
	const participant = new Participant({
		user: userId,
		challenge: challengeId,
	});
	return participant.save();
}

async function removeParticipant(userId: string, challengeId: string): Promise<IParticipant | null> {
	return Participant.findOneAndDelete({ user: userId, challenge: challengeId });
}

async function listParticipants(challengeId: string): Promise<IParticipant[]> {
	return Participant.find({ challenge: challengeId }).populate("user").lean();
}

export default {
	addParticipant,
	removeParticipant,
	listParticipants,
};
