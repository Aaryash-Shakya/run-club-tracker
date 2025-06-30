import { Schema, model, Document, Types } from "mongoose";

export interface IActivity extends Document {
	name: string;
	distance: number;
	movingTime: number;
	elapsedTime: number;
	totalElevationGain: number;
	type: string;
	sportType: string;
	workoutType: number;
	activityDate: Date;
	isValid: boolean;
	user: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
	{
		name: { type: String, required: true },
		distance: { type: Number, required: true },
		movingTime: { type: Number, required: true },
		elapsedTime: { type: Number, required: true },
		totalElevationGain: { type: Number, required: true },
		type: { type: String, required: true },
		sportType: { type: String, required: true },
		workoutType: { type: Number, required: false, default: -1 },
		activityDate: { type: Date, required: true },
		isValid: { type: Boolean, default: true },
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	},
	{
		timestamps: true,
		collection: "activities",
	}
);

export const Activity = model<IActivity>("Activity", ActivitySchema);
