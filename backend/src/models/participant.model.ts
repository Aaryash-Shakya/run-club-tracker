import mongoose, { Document, Schema } from "mongoose";

export interface IParticipant extends Document {
	user: mongoose.Types.ObjectId;
	challenge: mongoose.Types.ObjectId;
	joinedAt: Date;
	role?: string;
}

const ParticipantSchema = new Schema<IParticipant>(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
		challenge: { type: Schema.Types.ObjectId, ref: "Challenge", required: true },
		joinedAt: { type: Date, default: Date.now },
		role: { type: String },
	},
	{ timestamps: true }
);

ParticipantSchema.index({ user: 1, challenge: 1 }, { unique: true });

export const Participant = mongoose.model<IParticipant>("Participant", ParticipantSchema);
