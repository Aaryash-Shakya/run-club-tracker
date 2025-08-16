import mongoose, { Document, Schema } from "mongoose";

export interface IChallenge extends Document {
	name: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	targetKm: number;

	maxRunPace: number; // minute per km: the maximum pace (slowest) that still counts as "running"
	minWalkingDistance: number; // meters: minimum distance for a walk activity to be counted
	minRunningDistance: number; // meters: minimum distance for a running activity to be counted

	createdAt: Date;
	updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
	{
		name: { type: String, required: true },
		description: { type: String },
		startDate: { type: Date, required: true },
		endDate: { type: Date, required: true },
		targetKm: { type: Number, required: true },

		// Pace and distance thresholds:
		// Interpretation: an activity with an average pace <= maxRunPace qualifies as a "run".
		maxRunPace: {
			type: Number,
			required: true,
			default: 10,
		},

		// Minimum distance (in meters) for a walk to be considered valid.
		minWalkingDistance: {
			type: Number,
			required: true,
			default: 500,
			min: 0,
		},

		// Minimum distance (in meters) for a run to be considered valid.
		minRunningDistance: {
			type: Number,
			required: true,
			default: 500,
			min: 0,
		},
	},
	{ timestamps: true }
);

// virtual to populate Participant docs that reference this challenge
ChallengeSchema.virtual("participants", {
	ref: "Participant",
	localField: "_id",
	foreignField: "challenge",
	justOne: false,
});

// include virtuals when converting to JSON / objects
ChallengeSchema.set("toObject", { virtuals: true });
ChallengeSchema.set("toJSON", { virtuals: true });

// helpful index to quickly find currently active challenges
ChallengeSchema.index({ startDate: 1, endDate: 1 });

export const Challenge = mongoose.model<IChallenge>("Challenge", ChallengeSchema);
export default Challenge;
