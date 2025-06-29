import { Schema, model, Document, Types } from "mongoose";

export interface IActivity extends Document {
	name: string;
	distance: number;
	moving_time: number;
	elapsed_time: number;
	total_elevation_gain: number;
	type: string;
	sport_type: string;
	workout_type: number;
	user_id: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
	{
		name: { type: String, required: true },
		distance: { type: Number, required: true },
		moving_time: { type: Number, required: true },
		elapsed_time: { type: Number, required: true },
		total_elevation_gain: { type: Number, required: true },
		type: { type: String, required: true },
		sport_type: { type: String, required: true },
		workout_type: { type: Number, required: true },
		user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
	},
	{
		timestamps: true,
		collection: "activities",
	}
);

export const Activity = model<IActivity>("Activity", ActivitySchema);
